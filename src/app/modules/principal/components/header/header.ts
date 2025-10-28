import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html'
})
export class Header implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedLanguage: string = 'es';
  currentPage: string = 'Inicio';
  isAccessibilityMenuOpen: boolean = false;
  isAuthenticated: boolean = false;
  userName: string = '';
  userRole: string = '';
  unreadMessages: number = 0;
  private authSubscription?: Subscription;
  private messagesSubscription?: Subscription;
  
  languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  accessibilityOptions = [
    { id: 'highContrast', label: 'Alto Contraste', icon: 'fas fa-adjust' },
    { id: 'largeText', label: 'Texto Grande', icon: 'fas fa-text-height' },
    { id: 'screenReader', label: 'Lector de Pantalla', icon: 'fas fa-volume-up' }
  ];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.nombre_completo;
        this.userRole = user.rol === 'doctor' ? 'Doctor' : 'Paciente';
        console.log('🔄 Header - Usuario:', this.userName, 'Rol:', this.userRole);
      } else {
        this.userName = '';
        this.userRole = '';
      }
    });

    // Suscribirse a mensajes no leídos
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.unreadMessages = messages.filter(m => !m.leido && m.emisor_tipo !== this.getUserEmitterType()).length;
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.authSubscription?.unsubscribe();
    this.messagesSubscription?.unsubscribe();
  }

  isLogging(){
    return this.isAuthenticated;
  }

  logout() {
    this.authService.logout();
  }

  toggleChat() {
    // Navegar a la página de chat
    this.router.navigate(['/chat']);
  }

  private getUserEmitterType(): 'doctor' | 'adulto_mayor' {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'doctor' ? 'doctor' : 'adulto_mayor';
  }
}