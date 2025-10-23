import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, Message } from '..//../../../core/services/chat.service';
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
  isChatOpen = false;
  isLoading = false;
  messageForm: FormGroup;
  hasUnreadMessages = false;
  unreadCount = 0;
  isDoctorTyping = false;
  
  private messagesSub!: Subscription;
  private chatStateSub!: Subscription;
  private loadingSub!: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    // Suscribirse a los mensajes
    this.messagesSub = this.chatService.messages$
      .subscribe(messages => {
        const previousCount = this.messages.length;
        this.messages = messages;
        
        // Scroll automático si hay nuevos mensajes
        if (messages.length > previousCount) {
          this.shouldScrollToBottom = true;
        }
        
        // Calcular mensajes no leídos
        this.updateUnreadCount();
      });

    // Suscribirse al estado del chat
    this.chatStateSub = this.chatService.isChatOpen$
      .subscribe(isOpen => {
        this.isChatOpen = isOpen;
        if (isOpen) {
          this.shouldScrollToBottom = true;
          this.hasUnreadMessages = false;
          this.unreadCount = 0;
        }
      });

    // Suscribirse al estado de carga
    this.loadingSub = this.chatService.isLoading$
      .subscribe(loading => {
        this.isLoading = loading;
      });
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
        await this.chatService.sendMessage(messageText);
        this.messageForm.reset();
        this.shouldScrollToBottom = true;
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    }
  }

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  private updateUnreadCount(): void {
    if (!this.isChatOpen) {
      const unreadMessages = this.messages.filter(
        m => m.sender === 'doctor' && !m.read
      );
      this.unreadCount = unreadMessages.length;
      this.hasUnreadMessages = this.unreadCount > 0;
    }
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
    if (this.chatStateSub) {
      this.chatStateSub.unsubscribe();
    }
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }
}
