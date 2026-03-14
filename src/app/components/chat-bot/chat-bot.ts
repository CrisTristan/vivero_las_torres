import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { saveUserChatHistory, getUserChatHistory, deleteUserChatHistory } from '../../DataBase/userChatHistory';

interface UserChatHistoryDB {
  userId: string; // ID del usuario (puede ser un UUID o cualquier identificador único)
  image: File; // Archivo de imagen
  bestMatchesPlants: string[]; // Array de nombres de plantas,
  message: string | null; // Mensaje de texto del usuario, puede ser null si no se guarda el mensaje,
  typeUser: 'user' | 'bot'; // Tipo de mensaje, puede ser 'user' o 'bot',
  createdAt: Date; // Fecha de creación del registro,
}

interface ChatHistoryViewItem {
  id: string;
  typeUser: 'user' | 'bot';
  kind: 'image' | 'prediction' | 'message';
  message?: string;
  imageUrl?: string;
  bestMatches?: string[];
  createdAt: Date;
}

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('historyContainer', { static: true })
  private historyContainerRef?: ElementRef<HTMLDivElement>;

  private chatInstance: any;
  private ImageUpload : File;  //Esta es la imagen que el usuario sube
  private sessionId: string | null;
  private chatMessagesObserver?: MutationObserver;
  private historyImageUrls: string[] = [];
  private historyAttached = false;
  private historyItemId = 0;

  private formDataImage: FormData;
  private commonNamesPlants = signal<string[]>([]); //deberia ser una signal
  private bestMatchesPlants = signal<string[]>([]);
  private userMessages = signal<UserChatHistoryDB[]>([]);
  private botMessages = signal<UserChatHistoryDB[]>([]);
  readonly historyItems = signal<ChatHistoryViewItem[]>([]);

  constructor() {
    this.ImageUpload = new File([], ''); // Inicializar con un archivo vacío
    this.sessionId= '';
    this.formDataImage = new FormData();
  }

  ngOnInit() {

    //Obtener la sessionId del localStorage
    this.sessionId = localStorage.getItem('n8n-chat/sessionId');
    console.log('Session ID:', this.sessionId);

    this.chatInstance = createChat({
      webhookUrl: 'http://localhost:5678/webhook/1c2039e9-b841-43af-a7c6-b6e0b66920de/chat',
      webhookConfig: {
        method: 'POST',
        headers: {},
      },
      target: '#n8n-chat',
      mode: 'fullscreen',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      loadPreviousSession: true,
      metadata: {
        // image: this.ImageUpload,
      },
      showWelcomeScreen: false,
      defaultLanguage: 'en',
      initialMessages: ['Hola! 👋', 'Mi nombre es Ana, ¿Como puedo ayudarte hoy?'],
      i18n: {
        en: {
          title: 'Hola! 👋',
          subtitle: 'Inicia un chat. Estamos aquí para ayudarte 24/7.',
          footer: '',
          getStarted: 'Nueva Conversación',
          inputPlaceholder: 'Escribe tu pregunta..',
          closeButtonTooltip: 'Cerrar chat',
        },
      },
      enableStreaming: false,
    });

    // Esperar a que el chat se renderice
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-inputs');
      if (chatContainer) {
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = '📎 Imagen';
        uploadBtn.className = 'custom-upload-btn bg-green-50 p-1 mx-2rounded';
        uploadBtn.onclick = () => this.handleFileUpload();
        chatContainer.appendChild(uploadBtn);
        this.renderButtonDeleteChatHistory();
        const chatContainerMessages = document.querySelector('.chat-body');
        if (chatContainerMessages) {
        chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
        }
      }
      this.initChatMessagesObserver();
    }, 1000);

    this.renderHistoryAfterSecondBotMessage();
    //Hacer scroll hacia abajo hasta el final del chat para ver el historial de chat del usuario
    setTimeout(() => {
      
    }, 3000);
  }

  ngAfterViewInit() {
    this.attachHistoryContainerAfterSecondBotMessage();
  }

  private async renderHistoryAfterSecondBotMessage() {
    try {
      const history = await getUserChatHistory(this.sessionId || '');
      this.historyItems.set(this.buildHistoryItems(history));
      this.attachHistoryContainerAfterSecondBotMessage();
    } catch (error) {
      console.error('Error al obtener el historial de chat del usuario:', error);
    }
  }

  private buildHistoryItems(history: UserChatHistoryDB[]): ChatHistoryViewItem[] {
    this.revokeHistoryImageUrls();
    const items: ChatHistoryViewItem[] = [];

    history.forEach((entry, index) => {
      if (entry.typeUser === 'user') {
        if (entry.image && entry.image.size > 0) {
          const imageUrl = URL.createObjectURL(entry.image);
          this.historyImageUrls.push(imageUrl);
          items.push({
            id: this.createHistoryItemId(index, 'image'),
            typeUser: 'user',
            kind: 'image',
            imageUrl,
            createdAt: entry.createdAt,
          });
        }
        if (entry.bestMatchesPlants.length > 0) {
          items.push({
            id: this.createHistoryItemId(index, 'prediction'),
            typeUser: 'user',
            kind: 'prediction',
            bestMatches: entry.bestMatchesPlants,
            createdAt: entry.createdAt,
          });
          return;
        }
        if (entry.message) {
          items.push({
            id: this.createHistoryItemId(index, 'message'),
            typeUser: 'user',
            kind: 'message',
            message: entry.message,
            createdAt: entry.createdAt,
          });
        }
      } else if (entry.typeUser === 'bot' && entry.message) {
        items.push({
          id: this.createHistoryItemId(index, 'message'),
          typeUser: 'bot',
          kind: 'message',
          message: entry.message,
          createdAt: entry.createdAt,
        });
      }
    });

    return items;
  }

  private createHistoryItemId(index: number, kind: ChatHistoryViewItem['kind']): string {
    const nextId = this.historyItemId++;
    return `${index}-${kind}-${nextId}`;
  }

  private revokeHistoryImageUrls() {
    this.historyImageUrls.forEach((url) => URL.revokeObjectURL(url));
    this.historyImageUrls = [];
  }

  private waitForSecondBotMessage(timeoutMs: number): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let observer: MutationObserver | null = null;

      const cleanup = () => {
        observer?.disconnect();
        observer = null;
      };

      const getSecondBotMessage = (list: Element) => {
        const botMessages = list.querySelectorAll('.chat-message.chat-message-from-bot');
        return (botMessages.length >= 2 ? (botMessages[1] as HTMLElement) : null);
      };

      const tryAttachObserver = () => {
        const chatMessagesList = document.querySelector('.chat-messages-list');
        if (!chatMessagesList) {
          return;
        }

        const existing = getSecondBotMessage(chatMessagesList);
        if (existing) {
          cleanup();
          resolve(existing);
          return;
        }

        if (!observer) {
          observer = new MutationObserver(() => {
            const second = getSecondBotMessage(chatMessagesList);
            if (second) {
              cleanup();
              resolve(second);
            }
          });
          observer.observe(chatMessagesList, { childList: true, subtree: true });
        }
      };

      const tick = () => {
        if (Date.now() - startedAt >= timeoutMs) {
          cleanup();
          resolve(null);
          return;
        }
        tryAttachObserver();
        setTimeout(tick, 100);
      };

      tick();
    });
  }

  private async attachHistoryContainerAfterSecondBotMessage() {
    if (this.historyAttached) {
      return;
    }

    const container = this.historyContainerRef?.nativeElement;
    if (!container) {
      return;
    }

    const anchor = await this.waitForSecondBotMessage(3000);
    const list = document.querySelector('.chat-messages-list');
    if (!list) {
      return;
    }

    if (anchor && anchor.parentElement === list) {
      list.insertBefore(container, anchor.nextSibling);
    } else {
      list.appendChild(container);
    }

    this.historyAttached = true;
  }

  handleFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg'; //solo debe aceptar archivos .png y .jpg
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      // Crear un nuevo FormData cada vez que se selecciona un archivo
      this.formDataImage = new FormData();
      this.formDataImage.append('action', 'sendMessage');
      this.formDataImage.append('sessionId', this.sessionId || '');
      this.formDataImage.append('chatInput', 'Analiza esta planta');
      this.formDataImage.append('imagen', file); //El navegador cambia el nombre a files automaticamente, No se por qué ocurre ese cambio

      // this.handleRenderImage(file);
      this.ImageUpload = file;
      //Imprimir el archivo como un url encodeado
      //console.log(encodeURIComponent(file.name));
      console.log('Imagen guardada:', this.ImageUpload);
      // Para ver el contenido de FormData, usa esto:
      console.log('FormData contenido:');
      for (let pair of this.formDataImage.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      this.handleImagePostFetch(this.sessionId, encodeURIComponent(this.ImageUpload.name));
    };
    input.click();
  }

  handleImagePostFetch(sessionId: string | null, urlImage?: string) {
    console.log("FormData to send:", this.formDataImage);
    try {
      const res = fetch('http://localhost:5678/webhook/1c2039e9-b841-43af-a7c6-b6e0b66920de/chat', {
        method: 'POST',
        // NO incluir Content-Type header cuando envías FormData
        // El navegador lo establece automáticamente con el boundary correcto
        // body: this.formDataImage, // Enviar FormData directamente, sin JSON.stringify
        body: this.formDataImage,
      });
      res.then(response => {
        // Manejar diferentes códigos de estado HTTP
        if (response.status === 200) {
          //reiniciar commonNamesPlants
          this.commonNamesPlants.set([]);
          // const commonNamesPlants: {[key: string]: string[]} = {};
          console.log('Solicitud exitosa (200)');
          return response.json().then(data => {
            // console.log('Success:', data);
            const top10Matches = data.body.results;
            for (let index = 0; index < top10Matches.length; index++) {
              const element = top10Matches[index];
              const topPlantsMatches = element.species.commonNames;
              if(topPlantsMatches.length === 0){
                continue; //saltar si no hay nombres comunes
              }
              console.log(`Match ${index + 1}:`, topPlantsMatches);
              //actualizar commonNamesPlants solo si el arreglo de topPlantMatches es mayor del que ya se encuentra en commonNamesPlants
              // if(topPlantsMatches.length >= (this.commonNamesPlants()?.length || 0)){
                // this.commonNamesPlants.set(topPlantsMatches);
                this.commonNamesPlants.update(current => [...current, ...topPlantsMatches]);
              // };
              // console.log(this.commonNamesPlants());
            }
            // Filtrar nombres comunes duplicados
            this.bestMatchesPlants.set(this.filterCommonPlantNames(this.commonNamesPlants()));
            console.log('La planta es probable que sea:', this.commonNamesPlants());
            // Aquí puedes agregar lógica adicional para manejar la respuesta exitosa
            alert('✅ Imagen procesada exitosamente');
            this.handleRenderImage(this.ImageUpload);
            this.renderNamePlantBestMatching(this.bestMatchesPlants());
            //guardar la imagen y bestMatchesPlants en el localStorage {imagne: urlImage, bestMatchesPlants: this.bestMatchesPlants()}
            this.saveImageAndBestMatchesToLocalStorage(this.bestMatchesPlants());
            //hacer scroll hacia abajo para ver la nueva respuesta del chat
            const chatContainerMessages = document.querySelector('.chat-messages-list');
            if (chatContainerMessages) {
              chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
            }
          });
        } else if (response.status === 500) {  //el servidor de la request devuelve 404 pero el servidor de n8n devuelve 500
          console.error('Recurso no encontrado (404) de la url');
          alert('❌ La imagen Proporcionada no es de una planta o no se ha podido procesar.');
          throw new Error('Endpoint no encontrado (404)');
        } else {
          console.warn(`Estado HTTP inesperado: ${response.status}`);
          return response.json().then(data => {
            console.log('Respuesta del servidor:', data);
            alert(`⚠️ Estado: ${response.status}`);
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('❌ Error al enviar la imagen: ' + error.message);
      });
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
      alert('❌ Error de conexión: ' + error);
    }
  }
  
  handleRenderImage(file: File, options?: { insertAfter?: HTMLElement | null; scroll?: boolean }) {
    //lógica para renderizar imagen en el chat
    const chatContainerMessages = document.querySelector('.chat-messages-list');
    if (chatContainerMessages) {
      //Creamos el contenedor de mensaje de usuario
      const userMessageContainer = document.createElement('div');
      userMessageContainer.className = 'chat-message chat-message-from-user chat-message-image';
      chatContainerMessages.appendChild(userMessageContainer);

      //Contenedor de la Imagen
      const messageContainer = document.createElement('div');
      messageContainer.className = 'chat-message-markdown';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '200px';
      img.style.margin = '10px 0';
      messageContainer.appendChild(img);
      userMessageContainer.appendChild(messageContainer);
      const inserted = this.insertMessageAfter(chatContainerMessages, userMessageContainer, options?.insertAfter);
      if (options?.scroll !== false) {
        chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
      }
      return inserted;

    }
    return null;
  }

  renderNamePlantBestMatching(namePlantsBestMatching: string[], options?: { insertAfter?: HTMLElement | null; scroll?: boolean }){
    const chatContainerMessages = document.querySelector('.chat-messages-list');
    if (chatContainerMessages) {
      //Creamos el contenedor de mensaje de usuario
      const userMessageContainer = document.createElement('div');
      userMessageContainer.className = 'chat-message chat-message-from-user chat-message-prediction';
      chatContainerMessages.appendChild(userMessageContainer);

      //Contenedor de la Imagen
      const messageContainer = document.createElement('div');
      messageContainer.className = 'chat-message-markdown';
      const p = document.createElement('p');
      p.textContent = `La planta es probable que sea: ${namePlantsBestMatching.join(', ')}`;
      messageContainer.appendChild(p);
      userMessageContainer.appendChild(messageContainer);
      const inserted = this.insertMessageAfter(chatContainerMessages, userMessageContainer, options?.insertAfter);
      if (options?.scroll !== false) {
        chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
      }
      return inserted;
    }
    return null;
  }

  renderUserMessageOnDom(message: string, options?: { insertAfter?: HTMLElement | null; scroll?: boolean }){
     const chatContainerMessages = document.querySelector('.chat-messages-list');
    if (chatContainerMessages) {
      //Creamos el contenedor de mensaje de usuario
      const userMessageContainer = document.createElement('div');
      userMessageContainer.className = 'chat-message chat-message-from-user chat-message-prediction';
      chatContainerMessages.appendChild(userMessageContainer);

      //Contenedor de la Imagen
      const messageContainer = document.createElement('div');
      messageContainer.className = 'chat-message-markdown';
      const p = document.createElement('p');
      p.textContent = `${message}`;
      messageContainer.appendChild(p);
      userMessageContainer.appendChild(messageContainer);
      const inserted = this.insertMessageAfter(chatContainerMessages, userMessageContainer, options?.insertAfter);
      if (options?.scroll !== false) {
        chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
      }
      return inserted;
    }

    return null;
  }

  renderBotMessageOnDom(message: string, options?: { insertAfter?: HTMLElement | null; scroll?: boolean }){
     const chatContainerMessages = document.querySelector('.chat-messages-list');
    if (chatContainerMessages) {
      //Creamos el contenedor de mensaje de bot
      const userMessageContainer = document.createElement('div');
      userMessageContainer.className = 'chat-message chat-message-from-bot chat-message-prediction';
      chatContainerMessages.appendChild(userMessageContainer);

      //Contenedor de la Imagen
      const messageContainer = document.createElement('div');
      messageContainer.className = 'chat-message-markdown';
      const p = document.createElement('p');
      p.textContent = `${message}`;
      messageContainer.appendChild(p);
      userMessageContainer.appendChild(messageContainer);
      const inserted = this.insertMessageAfter(chatContainerMessages, userMessageContainer, options?.insertAfter);
      if (options?.scroll !== false) {
        chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
      }
      return inserted;
    }

    return null;
  }

  private insertMessageAfter(
    chatContainer: Element,
    messageElement: HTMLElement,
    insertAfter?: HTMLElement | null,
  ): HTMLElement {
    if (insertAfter && insertAfter.parentElement === chatContainer) {
      chatContainer.insertBefore(messageElement, insertAfter.nextSibling);
      return messageElement;
    }

    chatContainer.appendChild(messageElement);
    return messageElement;
  }

  filterCommonPlantNames(commonPlantNames : string[]): string[]{
    const seen = new Set<string>();
    const uniqueNames: string[] = [];
    for (const name of commonPlantNames) {
      if (!seen.has(name)) {
        seen.add(name);
        uniqueNames.push(name);
      }
    }
    return uniqueNames;
  }

  saveImageAndBestMatchesToLocalStorage(bestMatchesPlants: string[]) {
    saveUserChatHistory(this.sessionId || '', this.ImageUpload, bestMatchesPlants, "", "user").then(() => {
      console.log('Historial de chat guardado en IndexedDB');
    }).catch(error => {
      console.error('Error al guardar el historial de chat:', error);
    });
  }

  renderButtonDeleteChatHistory() {
    const chatContainer = document.querySelector('.chat-heading');
    if (chatContainer) {
      const deleteHistoryBtn = document.createElement('button');
      deleteHistoryBtn.textContent = '🗑️ Borrar Historial';
      deleteHistoryBtn.className = 'custom-delete-history-btn bg-red-500 p-2 rounded';
      deleteHistoryBtn.onclick = () => {
        //Lógica para borrar el historial de chat del usuario
        const shouldDelete = confirm('Esta seguro que desea borrar el historial de chat? Esta acción no se puede deshacer.');
        if (!shouldDelete) {
          return;
        }
        //Borrar el historial de chat del localStorage
        deleteUserChatHistory(this.sessionId || '').then(() => {
          console.log('Historial de chat borrado de IndexedDB');
          this.userMessages.set([]);
          this.botMessages.set([]);
          this.historyItems.set([]);
          this.revokeHistoryImageUrls();
        }).catch(error => {
          console.error('Error al borrar el historial de chat:', error);
        });
      };
      chatContainer.appendChild(deleteHistoryBtn);
    }
  }

  private initChatMessagesObserver() {
    const chatMessagesList = document.querySelector('.chat-messages-list');
    if (!chatMessagesList) {
      return;
    }

    this.chatMessagesObserver = new MutationObserver((mutations) => {
      if (mutations.length === 0) {
        return;
      }

      // console.log('Nuevo mensaje detectado');
      //obtener los nuevos elementos que se han agregado a la lista de mensajes del chat
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement && node.classList.contains('chat-message-from-user')) {
            // Aquí puedes agregar lógica para manejar el nuevo mensaje, por ejemplo:
            // - Verificar si el mensaje contiene una imagen y renderizarla
            // - Verificar si el mensaje contiene texto con el nombre de la planta y renderizarlo
            const markdownContainer = node.querySelector('.chat-message-markdown');
            if (!markdownContainer) {
              return;
            }
            if(node.classList.contains('chat-message-image') || node.classList.contains('chat-message-prediction')){
              // Si el mensaje contiene una imagen, no guardar el mensaje de texto en el historial de chat, solo guardar la imagen y los bestMatchesPlants
              // console.log('Nuevo mensaje de imagen detectado, no se guardará el mensaje de texto en el historial de chat');
              return;
            }
            const paragraphs = Array.from(markdownContainer.querySelectorAll('p'));
            const messageText = paragraphs.map((p) => p.textContent?.trim() ?? '').filter(Boolean).join('\n');
            console.log('Nuevo mensaje agregado por el usuario:', messageText);
            this.userMessages.update(current => [...current, {userId: this.sessionId || '', image: new File([], ''), bestMatchesPlants: [], message: messageText, typeUser: 'user', createdAt: new Date()}]);
            saveUserChatHistory(this.sessionId || '', new File([], ''), [], messageText, 'user');
          } else if (
            node instanceof HTMLElement &&
            node.classList.contains('chat-message') &&
            node.classList.contains('chat-message-from-bot') &&
            node.classList.length === 2
          ) { //solo escuchar si tiene exactamente esas dos clases
            const markdownContainer = node.querySelector('.chat-message-markdown');
            if (!markdownContainer) {
              return;
            }

            const paragraphs = Array.from(markdownContainer.querySelectorAll('p'));
            const messageText = paragraphs.map((p) => p.textContent?.trim() ?? '').filter(Boolean).join('\n');
            console.log('Nuevo mensaje agregado por el bot:', messageText);
            this.botMessages.update(current => [...current, {userId: this.sessionId || '', image: new File([], ''), bestMatchesPlants: [], message: messageText, typeUser: 'bot', createdAt: new Date()}]);
            saveUserChatHistory(this.sessionId || '', new File([], ''), [], messageText, 'bot');
          }
        });
      });
    });

    this.chatMessagesObserver.observe(chatMessagesList, {
      childList: true,
      subtree: true,
    });
  }

  private renderUserChatMessages(){
    for (const message of this.userMessages()) {
      // Lógica para renderizar los mensajes de usuario en el chat
      this.renderUserMessageOnDom(message.message || '');
    }
  }

  ngOnDestroy() {
    if (this.chatInstance) {
      //verificar si
      // this.chatInstance.destroy?.();
    }
    this.chatMessagesObserver?.disconnect();
    this.revokeHistoryImageUrls();
  }
}
