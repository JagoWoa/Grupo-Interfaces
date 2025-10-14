import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Mensaje } from '../interfaces/mensaje';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesSubject = new Subject<Mensaje>();
  private channel?: RealtimeChannel;

  constructor(private supabase: SupabaseService) {}

  // Obtener conversación entre dos usuarios
  async obtenerConversacion(usuarioId1: string, usuarioId2: string): Promise<Mensaje[]> {
    const { data, error } = await this.supabase.client
      .from('mensajes')
      .select(`
        *,
        emisor:usuarios!mensajes_emisor_id_fkey(nombre, rol),
        receptor:usuarios!mensajes_receptor_id_fkey(nombre, rol)
      `)
      .or(`and(emisor_id.eq.${usuarioId1},receptor_id.eq.${usuarioId2}),and(emisor_id.eq.${usuarioId2},receptor_id.eq.${usuarioId1})`)
      .order('fecha', { ascending: true });

    if (error) throw error;
    return data as Mensaje[];
  }

  // Obtener lista de conversaciones del usuario
  async obtenerConversaciones(usuarioId: string): Promise<any[]> {
    const { data, error } = await this.supabase.client
      .from('mensajes')
      .select(`
        *,
        emisor:usuarios!mensajes_emisor_id_fkey(id, nombre, rol),
        receptor:usuarios!mensajes_receptor_id_fkey(id, nombre, rol)
      `)
      .or(`emisor_id.eq.${usuarioId},receptor_id.eq.${usuarioId}`)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Agrupar por contacto
    const conversaciones = new Map();
    data?.forEach((mensaje: any) => {
      const contacto = mensaje.emisor_id === usuarioId ? mensaje.receptor : mensaje.emisor;
      if (!conversaciones.has(contacto.id)) {
        conversaciones.set(contacto.id, {
          usuario: contacto,
          ultimo_mensaje: mensaje,
          no_leidos: 0
        });
      }
      if (!mensaje.leido && mensaje.receptor_id === usuarioId) {
        conversaciones.get(contacto.id).no_leidos++;
      }
    });

    return Array.from(conversaciones.values());
  }

  // Enviar mensaje
  async enviarMensaje(mensaje: Omit<Mensaje, 'id' | 'fecha' | 'created_at'>): Promise<Mensaje> {
    const { data, error } = await this.supabase.client
      .from('mensajes')
      .insert([{ ...mensaje, fecha: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data as Mensaje;
  }

  // Suscribirse a mensajes en tiempo real
  suscribirMensajes(usuarioId: string): Observable<Mensaje> {
    this.channel = this.supabase.client
      .channel('mensajes-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `receptor_id=eq.${usuarioId}`
        },
        (payload) => {
          this.mensajesSubject.next(payload.new as Mensaje);
        }
      )
      .subscribe();

    return this.mensajesSubject.asObservable();
  }

  // Desuscribirse
  desuscribir() {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
    }
  }

  // Marcar mensaje como leído
  async marcarComoLeido(mensajeId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('mensajes')
      .update({ leido: true })
      .eq('id', mensajeId);

    if (error) throw error;
  }

  // Marcar todos los mensajes de una conversación como leídos
  async marcarConversacionLeida(usuarioId: string, contactoId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('mensajes')
      .update({ leido: true })
      .eq('emisor_id', contactoId)
      .eq('receptor_id', usuarioId)
      .eq('leido', false);

    if (error) throw error;
  }
}
