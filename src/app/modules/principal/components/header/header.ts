import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SpeakOnHoverDirective, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedLanguage: string = 'es';
  currentPage: string = 'Inicio';
  isAccessibilityMenuOpen: boolean = false;
  isAccessibilityDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
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

  constructor(private authService: AuthService, private themeService: ThemeService, private chatService: ChatService, private ttsService: TextToSpeechService, private languageService: LanguageService) { }

  // ⌨️ Atajo de teclado: Ctrl + Shift + T para cambiar el tema
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl + Shift + Z para cambiar el tema
    if (event.ctrlKey && event.shiftKey && (event.key === 'Z' || event.key === 'z')) {
      event.preventDefault();
      this.botonCambio();
      console.log('⌨️ Atajo de teclado activado: Ctrl + Shift + Z (Tema)');
    }
    
    // Ctrl + Shift + L para cambiar el idioma
    if (event.ctrlKey && event.shiftKey && (event.key === 'L' || event.key === 'l')) {
      event.preventDefault();
      this.changeLanguage();
      console.log('⌨️ Atajo de teclado activado: Ctrl + Shift + L (Idioma)');
    }
  }

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

  toggleAccessibilityDropdown(): void {
    this.isAccessibilityDropdownOpen = !this.isAccessibilityDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isAccessibilityDropdownOpen = false;
  }

  changeLanguage(): void {
    const currentLang = this.languageService.getCurrentLanguage();
    const newLang = currentLang === 'es' ? 'en' : 'es';
    this.languageService.setLanguage(newLang);
    
    // Actualizar idioma del TTS
    const ttsLang = newLang === 'es' ? 'es-ES' : 'en-US';
    this.ttsService.setLanguage(ttsLang);
    
    console.log('🌐 Idioma cambiado a:', newLang);
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  toggleSpeakOnHover(): void {
    this.ttsService.toggle();
    console.log('🔊 Lectura por voz:', this.ttsService.isEnabled() ? 'activada' : 'desactivada');
  }

  isSpeakOnHoverEnabled(): boolean {
    return this.ttsService.isEnabled();
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