import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
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
  isChatOpen: boolean = false; // ✅ Cambiado de toggleChat a isChatOpen
  private authSubscription?: Subscription;
  private messagesSubscription?: Subscription;
  isDarkMode: boolean = false;


  languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  accessibilityOptions = [
    { id: 'highContrast', label: 'Alto Contraste', icon: 'fas fa-adjust' },
    { id: 'largeText', label: 'Texto Grande', icon: 'fas fa-text-height' },
    { id: 'screenReader', label: 'Lector de Pantalla', icon: 'fas fa-volume-up' }
  ];

  constructor(private authService: AuthService, private themeService: ThemeService, private chatService: ChatService) { }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    // Aquí puedes emitir un evento o llamar al servicio de chat
    if (this.isChatOpen) {
      this.chatService.openChat();
    } else {
      this.chatService.closeChat();
    }
  }

  botonCambio(): void {
    this.themeService.toggleTheme();
    console.log('🌗 Header - Modo oscuro:', this.isDarkMode);
  }

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
    // Suscribirse al estado del tema
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  getUserEmitterType(): 'doctor' | 'adulto_mayor' | null {
    const role = "doctor";
    if (role === 'doctor') return 'doctor';
    if (role === 'adulto_mayor') return 'adulto_mayor';
    return null;
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.authSubscription?.unsubscribe();
    this.messagesSubscription?.unsubscribe();
  }

  isLogging() {
    return this.isAuthenticated;
  }

  logout() {
    this.authService.logout();
  }

}