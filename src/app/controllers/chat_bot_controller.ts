import { supabase } from "../DataBase/SupaBase/SupaBaseConnectionDB";

export interface ChatBotUsageResponse {
    permitido: boolean;
    mensaje?: string;
    respuestas_usadas?: number;
    restantes?: number;
    bloqueado_hasta: string;
}

export interface ChatBotUsageRecord {
    session_id: string;
    respuestas_usadas: number;
    bloqueado_hasta: string;
    created_at?: string;
    updated_at?: string;
}

export async function ChatBotUsage(sessionId: string, userId: number) : Promise<ChatBotUsageResponse | null> {
    
    const { data, error } = await supabase.rpc('controlar_uso_chatbot', {
        p_session_id: sessionId,
        p_usuario_id: userId === 0 ? null : userId
    });

    if (error) {
        console.error(error);
        return null;
    }

    // // console.log("Respuesta del RPC:", data);
    return data;
}

export async function readChatBotUsage(sessionId: string): Promise<ChatBotUsageRecord | null> {
    const { data, error } = await supabase
        .from('chatbot_usage')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (error) {
        console.error('Error al leer el uso del chatbot:', error);
        return null;
    }

    return data;
}

export async function unlockChatBotUsage(sessionId: string): Promise<ChatBotUsageResponse | null> {
    const { data, error } = await supabase.rpc('controlar_uso_chatbot', {
        p_session_id: sessionId
    });

    if (error) {
        console.error(error);
        return null;
    }

    // console.log("Respuesta del RPC:", data);
    return data;
}
