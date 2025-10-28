import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ChatService, Message, Conversation } from '..//../../../core/services/chat.service';
import { AuthService } from '..//../../../core/services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat.html',
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: Message[] = [];
  conversacionActual: Conversation | null = null;
  isChatOpen = false;
  isLoading = false;
  messageForm: FormGroup;
  userRole: 'doctor' | 'adulto_mayor' | null = null;
  userId: string | null = null;
  unreadCount = 0;
  
  private messagesSub!: Subscription;
  private conversacionSub!: Subscription;
  private chatStateSub!: Subscription;
  private loadingSub!: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      
      // Obtener usuario actual
      const user = await this.authService.getCurrentUser();
      if (!user) {
        console.warn('⚠️ Chat - Usuario no autenticado, esperando autenticación...');
        this.isLoading = false;
        return;
      }

      this.userId = user.id;
      this.userRole = user.rol as 'doctor' | 'adulto_mayor';
      
      console.log('👤 Chat inicializado para:', {
        userId: this.userId,
        userRole: this.userRole,
        userName: user.nombre_completo
      });

      // Inicializar chat con el usuario actual
      await this.chatService.inicializarChat(this.userId, this.userRole);
      console.log('✅ Chat service inicializado');

      // Suscribirse a los mensajes
      this.messagesSub = this.chatService.messages$
        .subscribe(messages => {
          const previousCount = this.messages.length;
          this.messages = messages;
          
          // Calcular mensajes no leídos
          this.unreadCount = messages.filter(m => !m.leido && m.emisor_tipo !== this.userRole).length;
          
          console.log(`📨 Mensajes actualizados: ${messages.length} mensajes (${this.unreadCount} no leídos)`);
          
          // Scroll automático si hay nuevos mensajes
          if (messages.length > previousCount) {
            this.shouldScrollToBottom = true;
          }
          
          this.cdr.detectChanges();
        });

      // Suscribirse a conversación actual
      this.conversacionSub = this.chatService.currentConversation$
        .subscribe(conversacion => {
          this.conversacionActual = conversacion;
          console.log('💬 Conversación actual:', conversacion);
          this.cdr.detectChanges();
        });

      // Suscribirse al estado del chat
      this.chatStateSub = this.chatService.isChatOpen$
        .subscribe(isOpen => {
          this.isChatOpen = isOpen;
          if (isOpen) {
            this.shouldScrollToBottom = true;
          }
          this.cdr.detectChanges();
        });

      // Suscribirse al estado de carga
      this.loadingSub = this.chatService.isLoading$
        .subscribe(loading => {
          this.isLoading = loading;
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('❌ Error inicializando chat:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.valid && !this.isLoading) {
      const messageText = this.messageForm.get('message')?.value;
      
      try {
        await this.chatService.enviarMensaje(messageText);
        this.messageForm.reset();
        this.shouldScrollToBottom = true;
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
      }
    }
  }

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  toggleChatWindow(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.shouldScrollToBottom = true;
      // Marcar mensajes como leídos al abrir
      this.chatService.marcarMensajesComoLeidos();
    }
    this.cdr.detectChanges();
  }

  esMiMensaje(mensaje: Message): boolean {
    return mensaje.emisor_tipo === this.userRole;
  }

  getNombreDoctor(): string {
    if (this.conversacionActual?.doctor_titulo) {
      return `${this.conversacionActual.doctor_titulo} ${this.conversacionActual.doctor_nombre}`;
    }
    return this.conversacionActual?.doctor_nombre || 'Dr. García';
  }

  getEspecialidadDoctor(): string {
    return this.conversacionActual?.doctor_especialidad || 'Medicina General';
  }

  formatearHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  ngOnDestroy() {
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
    if (this.conversacionSub) {
      this.conversacionSub.unsubscribe();
    }
    if (this.chatStateSub) {
      this.chatStateSub.unsubscribe();
    }
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }
}
