//Aqui se van a escuchar los eventos de las notificaciones de stock, para luego mostrar una alerta al usuario
import { Observable, Subject } from 'rxjs';
import { supabase } from "../DataBase/SupaBase/SupaBaseConnectionDB";
import { ProductData } from "../types/product.type";
import { environment } from "../../environments/environment";

export interface RealtimeBroadcast{
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  type: 'broadcast';
  meta: {
    id: string;
  };
  payload: {
    id: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    schema: string;
    table: string;
    record: ProductData;
    old_record: ProductData | null;
  };
}

const stockNotificationsSubject = new Subject<RealtimeBroadcast>();
let isSubscribed = false;

export function listenToStockNotifications(): Observable<RealtimeBroadcast> {
  // Evitar múltiples suscripciones al channel
  if (!isSubscribed) {
    isSubscribed = true;
    const channel = supabase.channel('stock_notifications', { config: { private: true } });
    
    channel
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        try {
          const typedPayload = payload as RealtimeBroadcast;
          //console.log('Nuevo cambio en stock:', typedPayload);
          stockNotificationsSubject.next(typedPayload);
        } catch (error) {
          console.error('Error procesando notificación de stock:', error);
          stockNotificationsSubject.error(error);
        }
      })
      .subscribe();
    
    console.log('Suscrito a notificaciones de stock');
  }

  return stockNotificationsSubject.asObservable();
}