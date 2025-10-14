import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../../../services/chat.service';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnInit {
  conversaciones: any[] = [];
  cargando = true;
  usuarioActualId: string = '';

  constructor(
    private chatService: ChatService,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Obtener usuario actual
    const { data } = await this.supabase.auth.getUser();
    this.usuarioActualId = data.user?.id || '';

    await this.cargarConversaciones();
    this.suscribirNuevosMensajes();
  }

  async cargarConversaciones() {
    try {
      this.conversaciones = await this.chatService.obtenerConversaciones(this.usuarioActualId);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      this.cargando = false;
    }
  }

  suscribirNuevosMensajes() {
    this.chatService.suscribirMensajes(this.usuarioActualId).subscribe(() => {
      this.cargarConversaciones();
    });
  }

  abrirConversacion(usuarioId: string) {
    this.router.navigate(['/chat/conversacion', usuarioId]);
  }

  ngOnDestroy() {
    this.chatService.desuscribir();
  }
}
