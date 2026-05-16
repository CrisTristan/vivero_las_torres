import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore: side-effect import of CSS module without type declarations
// import '@n8n/chat/style.css'; //esta linea se movio a styles.css
import { createChat } from '@n8n/chat';
import { saveUserChatHistory, getUserChatHistory, deleteUserChatHistory } from '../../DataBase/userChatHistory';
import { environment } from '../../../environments/environment';
import { ChatBotUsage, readChatBotUsage, unlockChatBotUsage } from '../../controllers/chat_bot_controller';

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
  private ImageUpload: File;  //Esta es la imagen que el usuario sube
  private sessionId: string | null;
  private chatMessagesObserver?: MutationObserver;
  private sendButtonObserver?: MutationObserver; // Observer para vigilar cambios en el botón de envío
  private limitWarningElement?: HTMLElement; // Elemento para mostrar la advertencia de límite
  private textareaKeydownHandler?: (e: KeyboardEvent) => void; // Handler para interceptar Enter en textarea
  private historyImageUrls: string[] = [];
  private historyAttached = false;
  private historyItemId = 0;

  private formDataImage: FormData;
  private commonNamesPlants = signal<string[]>([]); //deberia ser una signal
  private bestMatchesPlants = signal<string[]>([]);
  private userMessages = signal<UserChatHistoryDB[]>([]);
  private botMessages = signal<UserChatHistoryDB[]>([]);
  readonly historyItems = signal<ChatHistoryViewItem[]>([]);
  // private botMessagesCounter = signal(0);
  private predictionsCounter = signal(0);
  public lockSendPictureButton = signal(false); // Nueva señal para controlar el estado del botón de enviar imagen

  constructor() {
    this.ImageUpload = new File([], ''); // Inicializar con un archivo vacío
    this.sessionId = '';
    this.formDataImage = new FormData();

    // effect(() => {
    //   const botMessages = this.botMessagesCounter();
    //   // Log para monitorear cambios en el contador de mensajes del bot
    //   console.log('Bot Messages Counter:', this.botMessagesCounter());
    //   if (this.botMessagesCounter() > 2) {
    //     this.disableSendButton();
    //     this.renderLimitWarning();
    //   }
    // });

    // effect(() => {
    //   const predictions = this.predictionsCounter();
    //   // Log para monitorear cambios en el contador de predicciones
    //   console.log('Predictions Counter:', this.predictionsCounter());
    //   if (this.predictionsCounter() > 2) {
    //     this.lockSendPictureButton.set(true);
    //     this.renderLimitWarning();
    //   }
    // });

  }

  async ngOnInit() {

    //Obtener la sessionId del localStorage
    this.sessionId = localStorage.getItem('n8n-chat/sessionId');
    console.log('Session ID:', this.sessionId);
    
    //llamar a la función de supabase para verificar el uso del chatbot cada vez que se carga el componente
    if (this.sessionId) {
      const currentChatBotSession = await readChatBotUsage(this.sessionId);

      //verificar si la fecha de hoy es mayor a la fecha de bloqueo del chatbot, si es así desbloquear el chatbot
      if (currentChatBotSession && currentChatBotSession.bloqueado_hasta) {
        const bloqueadoHasta = new Date(currentChatBotSession.bloqueado_hasta);
        const hoy = new Date();
        if (hoy >= bloqueadoHasta) {
          await unlockChatBotUsage(this.sessionId);
          //Eliminar todos los mensajes del chat para evitar que el usuario vea mensajes antiguos después de desbloquear el chatbot
          deleteUserChatHistory(this.sessionId || '').then(() => {
            console.log('Historial de chat borrado de IndexedDB');
            this.userMessages.set([]);
            this.botMessages.set([]);
            this.historyItems.set([]);
            this.revokeHistoryImageUrls();
            // Limpiar los mensajes del DOM del chat
            this.clearChatMessages();
            // Reiniciar contadores y ocultar advertencia
            // this.botMessagesCounter.set(0);
            this.predictionsCounter.set(0);
            this.lockSendPictureButton.set(false);
            this.unlockSendMessageButton();
            this.hideLimitWarning();
          }).catch(error => {
            console.error('Error al borrar el historial de chat:', error);
          });
          
        } else {
          this.disableSendButton();
          this.renderLimitWarning();
        }
      }
      // Cargar el historial de chat del usuario desde IndexedDB y renderizarlo en el chat
      this.renderHistoryAfterSecondBotMessage();
    }
  }

  ngAfterViewInit() {
    this.chatInstance = createChat({
      webhookUrl: environment.n8nWebhookUrl,
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
      initialMessages: ['Hola! 👋', '¡Hola! Soy Ana, tu asistente botánica. Me encanta todo lo relacionado con las plantas. Si tienes alguna pregunta sobre plantas, flores o botánica, ¡estaré encantada de ayudarte!'],
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
    //Este codigo hacer que el boton de subir imagen se renderice despues del segundo mensaje del bot.
    setTimeout(() => {
      // const chatContainer = document.querySelector('.chat-inputs');
      // if (chatContainer) {
      //   const uploadBtn = document.createElement('button');
      //   uploadBtn.textContent = '📎 Imagen';
      //   uploadBtn.className = 'custom-upload-btn bg-green-50 p-1 mx-2rounded';
      //   uploadBtn.onclick = () => this.handleFileUpload();
      //   chatContainer.appendChild(uploadBtn);
      //   this.renderButtonDeleteChatHistory(); //Comentado para evitar renderizar el boton de borrar historial.
      //   const chatContainerMessages = document.querySelector('.chat-body');
      //   if (chatContainerMessages) {
      //     chatContainerMessages.scrollTop = chatContainerMessages.scrollHeight;
      //   }
      // }
      this.initChatMessagesObserver();
    }, 1000);

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
          this.predictionsCounter.update(count => count + 1);
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
        // this.botMessagesCounter.update(count => count + 1);
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
    //Validar que el boton este activo
    if (this.lockSendPictureButton()) {
      alert('Has alcanzado el límite de imágenes del bot. Por favor, espera o borra el historial de chat para continuar.');
      return;
    }

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
      const res = fetch(environment.n8nWebhookUrl, {
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
              if (topPlantsMatches.length === 0) {
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
            // alert('✅ Imagen procesada exitosamente');
            this.handleRenderImage(this.ImageUpload);
            this.renderNamePlantBestMatching(this.bestMatchesPlants());
            //guardar la imagen y bestMatchesPlants en el localStorage {imagne: urlImage, bestMatchesPlants: this.bestMatchesPlants()}
            this.saveImageAndBestMatchesToLocalStorage(this.bestMatchesPlants());
            //hacer scroll hacia abajo para ver la nueva respuesta del chat
            const chatContainer = document.querySelector('.chat-body');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          });
        } else if (response.status === 500) {  //el servidor de la request devuelve 404 pero el servidor de n8n devuelve 500
          console.error('Recurso no encontrado (404) de la url');
          return response.json().then(data => {
            console.log('Respuesta del servidor:', data);
            alert('❌ La imagen Proporcionada no es una planta o flor.');
          });
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

  renderNamePlantBestMatching(namePlantsBestMatching: string[], options?: { insertAfter?: HTMLElement | null; scroll?: boolean }) {
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

  renderUserMessageOnDom(message: string, options?: { insertAfter?: HTMLElement | null; scroll?: boolean }) {
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

  renderBotMessageOnDom(message: string, options?: { insertAfter?: HTMLElement | null; scroll?: boolean }) {
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

  filterCommonPlantNames(commonPlantNames: string[]): string[] {
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
          // Limpiar los mensajes del DOM del chat
          this.clearChatMessages();
          // Reiniciar contadores y ocultar advertencia
          // this.botMessagesCounter.set(0);
          this.predictionsCounter.set(0);
          this.lockSendPictureButton.set(false);
          this.unlockSendMessageButton();
          this.hideLimitWarning();
        }).catch(error => {
          console.error('Error al borrar el historial de chat:', error);
        });
      };
      chatContainer.appendChild(deleteHistoryBtn);
    }
  }

  private clearChatMessages() {
    const chatMessagesList = document.querySelector('.chat-messages-list');
    if (!chatMessagesList) {
      console.warn('Chat messages list no encontrado');
      return;
    }

    // Obtener todos los mensajes del chat (excepto los mensajes iniciales del bot)
    const allMessages = chatMessagesList.querySelectorAll('.chat-message');
    let counter: number = 0;
    // Eliminar cada mensaje del DOM
    allMessages.forEach((message) => {
      if (counter > 1) {
        // Saltar los primeros 2 mensajes del bot
        message.remove();
      }

      counter++;
    });

    console.log(`Se eliminaron ${allMessages.length} mensajes del chat`);
  }

  renderLimitWarning() {
    const chatContainer = document.querySelector('.chat-header');
    if (!chatContainer) {
      return;
    }

    // Si la advertencia ya existe, no crearla nuevamente
    if (this.limitWarningElement) {
      this.limitWarningElement.style.display = 'block';
      return;
    }

    // Crear el contenedor de la advertencia
    this.limitWarningElement = document.createElement('div');
    this.limitWarningElement.className = 'limit-warning-container';
    this.limitWarningElement.style.cssText = `
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 0.375rem;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #92400e;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    `;

    // Crear el icono
    const iconSpan = document.createElement('span');
    iconSpan.textContent = '⚠️';
    iconSpan.style.fontSize = '1.25rem';

    // Crear el texto
    const textSpan = document.createElement('span');
    textSpan.textContent = 'Has alcanzado el límite de mensajes. Espera 1 dia para enviar más mensajes.';

    this.limitWarningElement.appendChild(iconSpan);
    this.limitWarningElement.appendChild(textSpan);

    // Agregar la advertencia al final del contenedor .chat-heading
    chatContainer.appendChild(this.limitWarningElement);
  }

  hideLimitWarning() {
    if (this.limitWarningElement) {
      this.limitWarningElement.style.display = 'none';
    }
    // Restaurar el textarea
    this.unlockTextarea();
  }

  private unlockTextarea() {
    const textarea = document.querySelector('textarea[data-test-id="chat-input"]') as HTMLTextAreaElement;

    if (textarea) {
      textarea.removeAttribute('readonly');
      textarea.style.opacity = '1';
      textarea.style.cursor = 'text';
    }
  }

  private unlockSendMessageButton() {
    const sendButton = document.querySelector('.chat-input-send-button') as HTMLButtonElement;

    if (!sendButton) {
      console.warn('Botón de envío no encontrado para desbloquear');
      return;
    }

    // Habilitar el botón
    sendButton.disabled = false;
    sendButton.removeAttribute('disabled');

    // Restaurar estilos visuales
    sendButton.style.opacity = '1';
    sendButton.style.cursor = 'pointer';
    sendButton.classList.remove('button-blocked');

    // Desconectar el observer que mantenía el botón deshabilitado
    if (this.sendButtonObserver) {
      this.sendButtonObserver.disconnect();
      this.sendButtonObserver = undefined;
    }

    // Desbloquear el textarea
    this.unlockTextarea();

    console.log('Botón de envío desbloqueado correctamente');
  }

  private initChatMessagesObserver() {
    const chatMessagesList = document.querySelector('.chat-messages-list');
    if (!chatMessagesList) {
      return;
    }

    const processedNodes = new WeakSet<HTMLElement>(); // Para evitar procesar el mismo nodo dos veces

    this.chatMessagesObserver = new MutationObserver((mutations) => {
      if (mutations.length === 0) {
        return;
      }

      // console.log('Nuevo mensaje detectado');
      //obtener los nuevos elementos que se han agregado a la lista de mensajes del chat
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(async node => {
          if (node instanceof HTMLElement && !processedNodes.has(node)) {
            processedNodes.add(node);

            if (node.classList.contains('chat-message-from-user') && node.parentElement === chatMessagesList) {
              // Aquí puedes agregar lógica para manejar el nuevo mensaje, por ejemplo:
              // - Verificar si el mensaje contiene una imagen y renderizarla
              // - Verificar si el mensaje contiene texto con el nombre de la planta y renderizarlo
              const markdownContainer = node.querySelector('.chat-message-markdown');
              if (!markdownContainer) {
                return;
              }
              if (node.classList.contains('chat-message-prediction') && node.classList.length === 3) {
                // Si el mensaje contiene una predicción de planta (exactamente 3 clases), incrementar el contador
                console.log('incrementando contador de predicciones', {
                  classes: node.className,
                  textContent: node.textContent?.substring(0, 50),
                  hasMarkdownContainer: !!markdownContainer
                });
                this.predictionsCounter.update(count => count + 1);

                return;
              }
              const paragraphs = Array.from(markdownContainer.querySelectorAll('p'));
              const messageText = paragraphs.map((p) => p.textContent?.trim() ?? '').filter(Boolean).join('\n');
              // console.log('Nuevo mensaje agregado por el usuario:', messageText);
              this.userMessages.update(current => [...current, { userId: this.sessionId || '', image: new File([], ''), bestMatchesPlants: [], message: messageText, typeUser: 'user', createdAt: new Date() }]);
              saveUserChatHistory(this.sessionId || '', new File([], ''), [], messageText, 'user');

            } else if (
              node.classList.contains('chat-message') &&
              node.classList.contains('chat-message-from-bot') &&
              node.classList.length === 2 &&
              node.parentElement === chatMessagesList
            ) { //solo escuchar si tiene exactamente esas dos clases y es hijo directo
              const markdownContainer = node.querySelector('.chat-message-markdown');
              if (!markdownContainer) {
                return;
              }

              const paragraphs = Array.from(markdownContainer.querySelectorAll('p'));
              const messageText = paragraphs.map((p) => p.textContent?.trim() ?? '').filter(Boolean).join('\n');
              // console.log('Nuevo mensaje agregado por el bot:', messageText);
              this.botMessages.update(current => [...current, { userId: this.sessionId || '', image: new File([], ''), bestMatchesPlants: [], message: messageText, typeUser: 'bot', createdAt: new Date() }]);
              saveUserChatHistory(this.sessionId || '', new File([], ''), [], messageText, 'bot');

              // Incrementar el contador de mensajes del bot
              // this.botMessagesCounter.update(count => count + 1);

              console.log("Session ID al guardar mensaje del bot:", this.sessionId);
              //Llamar a la función de supabase para registrar el uso del bot cada vez que se agrega un nuevo mensaje del bot
              const response = await ChatBotUsage(this.sessionId || '');

              // Verificar si el usuario ha alcanzado el límite de mensajes permitidos
              if (!response?.permitido) {
                this.disableSendButton();
                this.renderLimitWarning();
              }
            }
          }
        });
      });
    });

    this.chatMessagesObserver.observe(chatMessagesList, {
      childList: true,
      subtree: true,
    });
  }

  private disableSendButton() {
    // Buscar el botón de envío en el chat de n8n y deshabilitarlo
    const sendButton = document.querySelector('.chat-input-send-button') as HTMLButtonElement;

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.setAttribute('disabled', 'disabled');
      console.log('Botón de envío deshabilitado:', sendButton);

      // Agregar event listener para detectar intentos de click
      this.addBlockClickListener(sendButton);

      // Crear un observer para mantener el botón deshabilitado incluso si el chat intenta habilitarlo
      this.keepSendButtonDisabled(sendButton);
    } else {
      console.warn('Botón de envío no encontrado');
      // Reintentar después de 500ms
      setTimeout(() => {
        const retryButton = document.querySelector('.chat-input-send-button') as HTMLButtonElement;
        if (retryButton) {
          retryButton.disabled = true;
          retryButton.setAttribute('disabled', 'disabled');
          console.log('Botón de envío deshabilitado en reintento:', retryButton);
          this.addBlockClickListener(retryButton);
          this.keepSendButtonDisabled(retryButton);
        }
      }, 500);
    }

    // Bloquear también el envío por Enter en el textarea
    this.blockTextarea();
  }

  private blockTextarea() {
    const textarea = document.querySelector('textarea[data-test-id="chat-input"]') as HTMLTextAreaElement;

    if (!textarea) {
      console.warn('Textarea de chat no encontrado');
      // Reintentar después de 500ms
      setTimeout(() => {
        this.blockTextarea();
      }, 500);
      return;
    }

    // Hacer el textarea readonly para prevenir cualquier entrada
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.opacity = '0.6';
    textarea.style.cursor = 'not-allowed';
  }

  private addBlockClickListener(sendButton: HTMLButtonElement) {
    // Usar capture phase para interceptar clics antes que otros listeners
    const blockClickHandler = (e: Event) => {
      if (sendButton.disabled || sendButton.hasAttribute('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        alert('Has alcanzado el límite de mensajes del bot. Por favor, espera o borra el historial de chat para continuar.');
      }
    };

    // Agregar listeners múltiples para asegurar que se capture el evento
    sendButton.addEventListener('click', blockClickHandler, true);
    // sendButton.addEventListener('mousedown', blockClickHandler, true);
    // sendButton.addEventListener('pointerdownoi', blockClickHandler, true);

    console.log('Block click listener agregado al botón');
  }

  private keepSendButtonDisabled(sendButton: HTMLButtonElement) {
    // Desconectar observer anterior si existe
    if (this.sendButtonObserver) {
      this.sendButtonObserver.disconnect();
    }

    // Crear observer para vigilar cambios en los atributos del botón
    this.sendButtonObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          // Si el chat intentó habilitar el botón, deshabilitarlo de nuevo
          if (!sendButton.disabled || !sendButton.hasAttribute('disabled')) {
            sendButton.disabled = true;
            sendButton.setAttribute('disabled', 'disabled');
            console.log('Botón re-deshabilitado (el chat intentó habilitarlo)');
          }
        }
      });
    });

    this.sendButtonObserver.observe(sendButton, {
      attributes: true,
      attributeFilter: ['disabled']
    });
  }

  ngOnDestroy() {
    if (this.chatInstance) {
      //verificar si
      // this.chatInstance.destroy?.();
    }
    this.chatMessagesObserver?.disconnect();
    this.sendButtonObserver?.disconnect();

    // Limpiar handler del textarea
    if (this.textareaKeydownHandler) {
      const textarea = document.querySelector('textarea[data-test-id="chat-input"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.removeEventListener('keydown', this.textareaKeydownHandler);
      }
    }

    this.revokeHistoryImageUrls();
  }
}
