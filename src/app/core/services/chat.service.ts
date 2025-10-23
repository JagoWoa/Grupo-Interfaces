import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
  senderName: string;
  userId?: string;
  doctorId?: string;
  conversationId?: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  doctorId: string;
  userName: string;
  doctorName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Message[] = [];
  private currentConversationId: string | null = null;
  private currentUserId: string = 'user-1'; // Temporal - debería venir del servicio de autenticación
  private currentDoctorId: string = 'doctor-1'; // Temporal
  
  public messages$ = new BehaviorSubject<Message[]>(this.messages);
  public isChatOpen$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {
    this.initializeChat();
  }

  /**
   * Inicializa el chat y carga mensajes existentes
   */
  private async initializeChat(): Promise<void> {
    try {
      this.isLoading$.next(true);
      
      // Obtener o crear conversación
      const conversation = await this.getOrCreateConversation();
      if (conversation) {
        this.currentConversationId = conversation.id;
        
        // Cargar mensajes existentes
        await this.loadMessages();
        
        // Suscribirse a nuevos mensajes en tiempo real
        this.subscribeToMessages();
      }
    } catch (error) {
      console.error('Error al inicializar el chat:', error);
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * Obtiene una conversación existente o crea una nueva
   */
  private async getOrCreateConversation(): Promise<Conversation | null> {
    try {
      const supabase = this.supabaseService.client;
      
      // Buscar conversación existente
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', this.currentUserId)
        .eq('doctor_id', this.currentDoctorId)
        .eq('active', true)
        .single();

      if (existing && !fetchError) {
        return {
          id: existing.id,
          userId: existing.user_id,
          doctorId: existing.doctor_id,
          userName: existing.user_name,
          doctorName: existing.doctor_name,
          lastMessage: existing.last_message,
          lastMessageTime: existing.last_message_time ? new Date(existing.last_message_time) : undefined,
          active: existing.active
        };
      }

      // Crear nueva conversación si no existe
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: this.currentUserId,
          doctor_id: this.currentDoctorId,
          user_name: 'María González',
          doctor_name: 'Dr. Carlos García',
          active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        id: newConversation.id,
        userId: newConversation.user_id,
        doctorId: newConversation.doctor_id,
        userName: newConversation.user_name,
        doctorName: newConversation.doctor_name,
        active: newConversation.active
      };
    } catch (error) {
      console.error('Error al obtener/crear conversación:', error);
      return null;
    }
  }

  /**
   * Carga mensajes desde Supabase
   */
  private async loadMessages(): Promise<void> {
    if (!this.currentConversationId) return;

    try {
      const supabase = this.supabaseService.client;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', this.currentConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.messages = data.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_type as 'user' | 'doctor',
        timestamp: new Date(msg.created_at),
        senderName: msg.sender_name,
        userId: msg.user_id,
        doctorId: msg.doctor_id,
        conversationId: msg.conversation_id,
        read: msg.read
      }));

      this.messages$.next(this.messages);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }

  /**
   * Se suscribe a nuevos mensajes en tiempo real
   */
  private subscribeToMessages(): void {
    if (!this.currentConversationId) return;

    const supabase = this.supabaseService.client;
    
    supabase
      .channel(`messages:${this.currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${this.currentConversationId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          const message: Message = {
            id: newMsg['id'],
            text: newMsg['text'],
            sender: newMsg['sender_type'] as 'user' | 'doctor',
            timestamp: new Date(newMsg['created_at']),
            senderName: newMsg['sender_name'],
            userId: newMsg['user_id'],
            doctorId: newMsg['doctor_id'],
            conversationId: newMsg['conversation_id'],
            read: newMsg['read']
          };

          // Solo agregar si el mensaje no existe ya (evitar duplicados)
          if (!this.messages.find(m => m.id === message.id)) {
            this.messages = [...this.messages, message];
            this.messages$.next(this.messages);
          }
        }
      )
      .subscribe();
  }

  /**
   * Envía un mensaje a Supabase
   */
  async sendMessage(text: string, sender: 'user' | 'doctor' = 'user'): Promise<void> {
    if (!this.currentConversationId || !text.trim()) return;

    try {
      const supabase = this.supabaseService.client;
      const senderName = sender === 'user' ? 'María González' : 'Dr. Carlos García';

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: this.currentConversationId,
          text: text.trim(),
          sender_type: sender,
          sender_name: senderName,
          user_id: sender === 'user' ? this.currentUserId : null,
          doctor_id: sender === 'doctor' ? this.currentDoctorId : null,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar última mensaje en la conversación
      await supabase
        .from('conversations')
        .update({
          last_message: text.trim(),
          last_message_time: new Date().toISOString()
        })
        .eq('id', this.currentConversationId);

      // El mensaje se agregará automáticamente vía suscripción en tiempo real
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Marca mensajes como leídos
   */
  async markMessagesAsRead(): Promise<void> {
    if (!this.currentConversationId) return;

    try {
      const supabase = this.supabaseService.client;
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', this.currentConversationId)
        .eq('sender_type', 'doctor')
        .eq('read', false);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  }

  /**
   * Alterna el estado del chat
   */
  toggleChat(): void {
    const newState = !this.isChatOpen$.value;
    this.isChatOpen$.next(newState);
    
    if (newState) {
      this.markMessagesAsRead();
    }
  }

  /**
   * Cierra el chat
   */
  closeChat(): void {
    this.isChatOpen$.next(false);
  }

  /**
   * Abre el chat
   */
  openChat(): void {
    this.isChatOpen$.next(true);
    this.markMessagesAsRead();
  }
}