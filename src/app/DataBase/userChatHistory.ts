//Solo se guardara el userId, la imagen y el bestMatchesPlants, no se guardara la sessionId 
// ni el chatInput porque no son necesarios para mostrar el historial de chat 
// del usuario, ademas de que no aportan valor para mostrar el historial de 
// chat del usuario, se guardara un array de objetos con la estructura 
// {userId: string, image: File, bestMatchesPlants: string[]}, cada vez que el 
// usuario suba una imagen se guardara un nuevo objeto en el array, y se podra obtener 
// todo el historial de chat del usuario basado en su ID, se utilizara IndexedDB para 
// almacenar los datos de manera persistente en el navegador del usuario, y se 
// creara una función para guardar el historial de chat del usuario y otra función para 
// obtener todo el historial de chat del usuario basado en su ID.

import {openDB, DBSchema, IDBPDatabase} from 'idb';

//Definir la estructura de la base de datos
interface UserChatHistoryDB extends DBSchema {
  chatHistory: {
    key: number; // ID autoincremental
    value: {
      userId: string; // ID del usuario (puede ser un UUID o cualquier identificador único)
      image: File; // Archivo de imagen
      bestMatchesPlants: string[]; // Array de nombres de plantas,
      message: string | null; // Mensaje de texto del usuario, puede ser null si no se guarda el mensaje,
      typeUser: 'user' | 'bot'; // Tipo de mensaje, puede ser 'user' o 'bot',
      createdAt: Date; // Fecha de creación del registro,
    };
    indexes: { 'userId': string }; // Definir el índice por userId
  };
}

async function initDB(): Promise<IDBPDatabase<UserChatHistoryDB>> {
  return await openDB<UserChatHistoryDB>('UserChatHistoryDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('chatHistory')) {
        const store = db.createObjectStore('chatHistory', {keyPath: 'id', autoIncrement: true});
        store.createIndex('userId', 'userId', {unique: false}); // Crear índice por userId
      }
    },
  });
}

//3. Función para guardar el historial de chat del usuario
export async function saveUserChatHistory(userId: string, image: File, bestMatchesPlants: string[], message: string | null, typeUser: 'user' | 'bot'): Promise<void> {
  const db = await initDB();
  await db.add('chatHistory', {userId, image, bestMatchesPlants, message, typeUser, createdAt: new Date()});
}

//4. Función para obtener todo el historial de chat de un usuario badaso en su ID
export async function getUserChatHistory(userId: string): Promise<Array<{userId: string; image: File; bestMatchesPlants: string[]; createdAt: Date; message: string | null; typeUser: 'user' | 'bot'}>> {
  const db = await initDB();
  return await db.getAllFromIndex('chatHistory', 'userId', userId);
}

//5. Función para borrar el historial de chat de un usuario basado en su ID
export async function deleteUserChatHistory(userId: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('chatHistory', 'readwrite');
  const store = tx.objectStore('chatHistory');
  const index = store.index('userId');
  const keys = await index.getAllKeys(userId);
  for (const key of keys) {
    await store.delete(key);
  }
  await tx.done;
}