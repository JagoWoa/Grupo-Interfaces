import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Message {
  id: string;
  conversacion_id: string;
  emisor_tipo: 'doctor' | 'adulto_mayor';
  contenido: string;
  creado_en: string;
  leido: boolean;
}

export interface Conversation {
  id: string;
  doctor_id: string;
  adulto_mayor_id: string;
  creada_en: string;
  ultima_actividad: string;
  activo: boolean;
  // Datos adicionales para mostrar
  doctor_nombre?: string;
  paciente_nombre?: string;
  doctor_titulo?: string;
  doctor_especialidad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Message[] = [];
  private currentConversationId: string | null = null;
  private currentUserId: string | null = null;
  private currentUserRole: 'doctor' | 'adulto_mayor' | null = null;
  
  public messages$ = new BehaviorSubject<Message[]>(this.messages);
  public conversations$ = new BehaviorSubject<Conversation[]>([]);
  public currentConversation$ = new BehaviorSubject<Conversation | null>(null);
  public isChatOpen$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  private subscription: any = null;

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Inicializa el chat con el usuario actual
   */
  async inicializarChat(userId: string, userRole: 'doctor' | 'adulto_mayor'): Promise<void> {
    this.currentUserId = userId;
    this.currentUserRole = userRole;
    
    if (userRole === 'doctor') {
      await this.cargarConversacionesDoctor();
    } else {
      await this.cargarConversacionPaciente();
    }
  }

  /**
   * Cargar conversaciones del doctor
   */
  async cargarConversacionesDoctor(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      this.isLoading$.next(true);
      const supabase = this.supabaseService.client;

      const { data, error } = await supabase
        .from('conversacion')
        .select(`
          *,
          paciente:usuarios!conversacion_adulto_mayor_id_fkey(id, nombre_completo, email, telefono)
        `)
        .eq('doctor_id', this.currentUserId)
        .eq('activo', true)
        .order('ultima_actividad', { ascending: false });

      if (error) throw error;

      const conversaciones: Conversation[] = (data || []).map(conv => ({
        ...conv,
        paciente_nombre: conv.paciente?.nombre_completo
      }));

      console.log(`📋 Conversaciones del doctor cargadas: ${conversaciones.length}`);
      this.conversations$.next(conversaciones);
      
      // Seleccionar automáticamente la primera conversación si existe
      if (conversaciones.length > 0) {
        console.log('🔄 Seleccionando primera conversación automáticamente');
        await this.seleccionarConversacion(conversaciones[0].id);
      }
    } catch (error) {
      console.error('Error cargando conversaciones del doctor:', error);
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * Cargar conversación del paciente con su doctor
   */
  async cargarConversacionPaciente(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      this.isLoading$.next(true);
      const supabase = this.supabaseService.client;

      console.log('🔍 Buscando conversación para paciente:', this.currentUserId);

      // Primero obtener la conversación básica
      const { data: conversacionData, error: convError } = await supabase
        .from('conversacion')
        .select(`
          *,
          doctor:usuarios!conversacion_doctor_id_fkey(id, nombre_completo, email)
        `)
        .eq('adulto_mayor_id', this.currentUserId)
        .eq('activo', true)
        .maybeSingle();

      if (convError && convError.code !== 'PGRST116') {
        console.error('❌ Error en query:', convError);
        throw convError;
      }

      if (conversacionData) {
        console.log('✅ Conversación encontrada:', conversacionData);
        
        // Intentar obtener información adicional del doctor desde v_doctores_completo
        let doctorInfo = null;
        if (conversacionData.doctor_id) {
          const { data: doctorData } = await supabase
            .from('v_doctores_completo')
            .select('titulo, especialidad')
            .eq('id', conversacionData.doctor_id)
            .maybeSingle();
          
          doctorInfo = doctorData;
          console.log('📋 Info del doctor:', doctorInfo);
        }

        const conversacion: Conversation = {
          ...conversacionData,
          doctor_nombre: conversacionData.doctor?.nombre_completo,
          doctor_titulo: doctorInfo?.titulo || 'Dr.',
          doctor_especialidad: doctorInfo?.especialidad || 'Medicina General'
        };
        
        this.conversations$.next([conversacion]);
        await this.seleccionarConversacion(conversacion.id);
      } else {
        console.log('⚠️ No se encontró conversación para este paciente');
      }
    } catch (error) {
      console.error('Error cargando conversación del paciente:', error);
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * Seleccionar una conversación y cargar sus mensajes
   */
  async seleccionarConversacion(conversacionId: string): Promise<void> {
    try {
      console.log('🔍 Seleccionando conversación:', conversacionId);
      
      // Cancelar suscripción anterior si existe
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.currentConversationId = conversacionId;
      
      // Buscar la conversación en la lista
      const conversaciones = this.conversations$.value;
      console.log('📋 Conversaciones disponibles:', conversaciones.length);
      const conversacion = conversaciones.find(c => c.id === conversacionId);
      
      if (conversacion) {
        console.log('✅ Conversación encontrada y establecida:', conversacion);
        this.currentConversation$.next(conversacion);
      } else {
        console.warn('⚠️ No se encontró la conversación en la lista');
      }

      // Cargar mensajes
      await this.cargarMensajes();
      
      // Suscribirse a nuevos mensajes
      this.suscribirseAMensajes();
      
      // Marcar como leídos
      await this.marcarMensajesComoLeidos();
    } catch (error) {
      console.error('❌ Error seleccionando conversación:', error);
    }
  }

  /**
   * Cargar mensajes de la conversación actual
   */
  private async cargarMensajes(): Promise<void> {
    if (!this.currentConversationId) {
      console.warn('⚠️ No hay conversación actual para cargar mensajes');
      return;
    }

    try {
      console.log('📨 Cargando mensajes para conversación:', this.currentConversationId);
      const supabase = this.supabaseService.client;
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('conversacion_id', this.currentConversationId)
        .order('creado_en', { ascending: true });

      if (error) {
        console.error('❌ Error en query de mensajes:', error);
        throw error;
      }

      this.messages = data || [];
      console.log(`✅ Mensajes cargados: ${this.messages.length}`);
      this.messages$.next(this.messages);
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
    }
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  private suscribirseAMensajes(): void {
    if (!this.currentConversationId) return;

    const supabase = this.supabaseService.client;
    
    this.subscription = supabase
      .channel(`mensajes:${this.currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${this.currentConversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Solo agregar si no existe
          if (!this.messages.find(m => m.id === newMsg.id)) {
            this.messages = [...this.messages, newMsg];
            this.messages$.next(this.messages);
            
            // Si el mensaje es del otro usuario, marcarlo como leído después de un breve delay
            if (this.isChatOpen$.value && newMsg.emisor_tipo !== this.currentUserRole) {
              setTimeout(() => this.marcarMensajesComoLeidos(), 500);
            }
          }
        }
      )
      .subscribe();
  }

  /**
   * Enviar un mensaje
   */
  async enviarMensaje(texto: string): Promise<void> {
    if (!this.currentConversationId || !texto.trim() || !this.currentUserRole) return;

    try {
      const supabase = this.supabaseService.client;

      const { data, error } = await supabase
        .from('mensajes')
        .insert({
          conversacion_id: this.currentConversationId,
          emisor_tipo: this.currentUserRole,
          contenido: texto.trim(),
          leido: false
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar última actividad
      await supabase
        .from('conversacion')
        .update({ ultima_actividad: new Date().toISOString() })
        .eq('id', this.currentConversationId);

      // El mensaje se agregará automáticamente vía suscripción en tiempo real
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarMensajesComoLeidos(): Promise<void> {
    if (!this.currentConversationId || !this.currentUserRole) return;

    try {
      const supabase = this.supabaseService.client;
      
      // Marcar como leídos los mensajes del otro usuario
      const emisorTipo = this.currentUserRole === 'doctor' ? 'adulto_mayor' : 'doctor';
      
      await supabase
        .from('mensajes')
        .update({ leido: true })
        .eq('conversacion_id', this.currentConversationId)
        .eq('emisor_tipo', emisorTipo)
        .eq('leido', false);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  /**
   * Abrir/cerrar chat
   */
  toggleChat(): void {
    const newState = !this.isChatOpen$.value;
    this.isChatOpen$.next(newState);
    
    if (newState && this.currentConversationId) {
      this.marcarMensajesComoLeidos();
    }
  }

  closeChat(): void {
    this.isChatOpen$.next(false);
  }

  openChat(): void {
    this.isChatOpen$.next(true);
    if (this.currentConversationId) {
      this.marcarMensajesComoLeidos();
    }
  }

  /**
   * Limpiar estado al cerrar sesión
   */
  limpiarEstado(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.messages = [];
    this.messages$.next([]);
    this.conversations$.next([]);
    this.currentConversation$.next(null);
    this.currentConversationId = null;
    this.currentUserId = null;
    this.currentUserRole = null;
    this.isChatOpen$.next(false);
  }
}