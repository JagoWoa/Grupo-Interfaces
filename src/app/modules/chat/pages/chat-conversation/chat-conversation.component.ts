import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../../services/chat.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { Mensaje } from '../../../../interfaces/mensaje';
import { Usuario } from '../../../../interfaces/usuario';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss'
})
export class ChatConversationComponent implements OnInit, OnDestroy {
  mensajes: Mensaje[] = [];
  contacto?: Usuario;
  nuevoMensaje = '';
  usuarioActualId: string = '';
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const { data } = await this.supabase.auth.getUser();
    this.usuarioActualId = data.user?.id || '';

    const contactoId = this.route.snapshot.paramMap.get('userId');
    if (contactoId) {
      await this.cargarConversacion(contactoId);
      await this.marcarComoLeido(contactoId);
      this.suscribirNuevosMensajes();
    }
  }

  async cargarConversacion(contactoId: string) {
    try {
      this.mensajes = await this.chatService.obtenerConversacion(this.usuarioActualId, contactoId);
      if (this.mensajes.length > 0) {
        this.contacto = this.mensajes[0].emisor_id === contactoId 
          ? this.mensajes[0].emisor as any
          : this.mensajes[0].receptor as any;
      }
    } catch (error) {
      console.error('Error al cargar conversación:', error);
    } finally {
      this.cargando = false;
    }
  }

  async marcarComoLeido(contactoId: string) {
    await this.chatService.marcarConversacionLeida(this.usuarioActualId, contactoId);
  }

  suscribirNuevosMensajes() {
    this.chatService.suscribirMensajes(this.usuarioActualId).subscribe((mensaje) => {
      this.mensajes.push(mensaje);
    });
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.contacto) return;

    const mensaje = {
      emisor_id: this.usuarioActualId,
      receptor_id: this.contacto.id,
      contenido: this.nuevoMensaje,
      tipo: 'texto' as const,
      leido: false
    };

    try {
      const enviado = await this.chatService.enviarMensaje(mensaje);
      this.mensajes.push(enviado);
      this.nuevoMensaje = '';
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }

  ngOnDestroy() {
    this.chatService.desuscribir();
  }
}
