import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FontSizeService } from '../../../../core/services/font-size.service';

interface SearchItem {
  title: string;
  subtitle?: string;
  icon: string;
  route?: string;
  action?: () => void;
  category: 'navigation' | 'patients' | 'help';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SpeakOnHoverDirective, TranslatePipe, FormsModule],
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
  isSearchOpen: boolean = false;
  isAuthenticated: boolean = false;
  userName: string = '';
  userRole: string = '';
  unreadMessages: number = 0;
  isChatOpen: boolean = false;
  private authSubscription?: Subscription;
  private messagesSubscription?: Subscription;
  isDarkMode: boolean = false;
  currentFontSize: string = 'normal';
  
  // Búsqueda
  searchResults: SearchItem[] = [];
  allSearchItems: SearchItem[] = [];
  selectedResultIndex: number = 0;


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
    private themeService: ThemeService, 
    private chatService: ChatService, 
    private ttsService: TextToSpeechService, 
    private languageService: LanguageService,
    private fontSizeService: FontSizeService,
    private router: Router
  ) { }

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

    // Ctrl + K para abrir búsqueda
    if (event.ctrlKey && (event.key === 'K' || event.key === 'k')) {
      event.preventDefault();
      this.toggleSearch();
      console.log('⌨️ Atajo de teclado activado: Ctrl + K (Búsqueda)');
    }

    // Ctrl + Shift + V para activar/desactivar lectura por voz (accesibilidad)
    if (event.ctrlKey && event.shiftKey && (event.key === 'V' || event.key === 'v')) {
      event.preventDefault();
      this.toggleSpeakOnHover();
      // Anunciar estado aunque esté desactivado para confirmar acción
      const wasEnabled = this.ttsService.isEnabled();
      const message = wasEnabled ? 'Lectura por voz activada' : 'Lectura por voz desactivada';
      // Forzar anuncio temporal
      if (wasEnabled) {
        this.ttsService.speak(message);
      }
      console.log('⌨️ Atajo de teclado activado: Ctrl + Shift + V (Lectura por Voz)');
    }

    // Navegación con flechas en búsqueda
    if (this.isSearchOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedResultIndex = Math.min(this.selectedResultIndex + 1, this.searchResults.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, 0);
      } else if (event.key === 'Enter' && this.searchResults.length > 0) {
        event.preventDefault();
        this.selectSearchResult(this.searchResults[this.selectedResultIndex]);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.closeSearch();
      }
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

  /**
   * Cambiar el tamaño del texto
   */
  setFontSize(size: 'small' | 'normal' | 'large' | 'xlarge' | 'xxlarge'): void {
    this.fontSizeService.setFontSize(size);
    this.currentFontSize = this.fontSizeService.getCurrentSizeName();
  }

  /**
   * Obtener el tamaño actual del texto
   */
  getCurrentFontSize(): string {
    return this.fontSizeService.getCurrentSizeName();
  }

  /**
   * Aumentar el tamaño del texto
   */
  increaseFontSize(): void {
    this.fontSizeService.increaseFontSize();
    this.currentFontSize = this.fontSizeService.getCurrentSizeName();
  }

  /**
   * Disminuir el tamaño del texto
   */
  decreaseFontSize(): void {
    this.fontSizeService.decreaseFontSize();
    this.currentFontSize = this.fontSizeService.getCurrentSizeName();
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

    // Inicializar tamaño de texto actual
    this.currentFontSize = this.fontSizeService.getCurrentSizeName();
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

  // Métodos de búsqueda
  initializeSearchItems(): void {
    const isDoctor = this.userRole === 'Doctor';
    const isPatient = this.userRole === 'Paciente';
    
    this.allSearchItems = [];

    // Navegación común para todos los usuarios autenticados
    if (this.isAuthenticated) {
      this.allSearchItems.push(
        {
          title: this.languageService.translate('HEADER.DASHBOARD'),
          icon: 'fa-solid fa-chart-line',
          route: '/dashboard',
          category: 'navigation'
        },
        {
          title: this.languageService.translate('HEADER.PROFILE'),
          icon: 'fa-solid fa-user',
          route: '/perfil',
          category: 'navigation'
        }
      );

      // Opciones específicas para Pacientes
      if (isPatient) {
        this.allSearchItems.push(
          {
            title: this.languageService.translate('HEADER.HEALTH'),
            subtitle: this.languageService.translate('PATIENT.VITAL_SIGNS'),
            icon: 'fa-solid fa-heart-pulse',
            route: '/usuario',
            category: 'navigation'
          },
          {
            title: this.languageService.translate('SEARCH.CHAT'),
            subtitle: this.languageService.translate('CHAT.TITLE_DOCTOR'),
            icon: 'fa-solid fa-comments',
            action: () => this.toggleChat(),
            category: 'navigation'
          }
        );
      }

      // Opciones específicas para Doctores
      if (isDoctor) {
        this.allSearchItems.push(
          {
            title: this.languageService.translate('SEARCH.CHAT'),
            subtitle: this.languageService.translate('CHAT.TITLE_PATIENT'),
            icon: 'fa-solid fa-comments',
            action: () => this.toggleChat(),
            category: 'navigation'
          }
        );
      }
    } else {
      // Opciones para usuarios NO autenticados
      this.allSearchItems.push(
        {
          title: this.languageService.translate('AUTH.HOME'),
          icon: 'fa-solid fa-house',
          route: '/inicio',
          category: 'navigation'
        },
        {
          title: this.languageService.translate('AUTH.LOGIN'),
          icon: 'fa-solid fa-right-to-bracket',
          route: '/login',
          category: 'navigation'
        },
        {
          title: this.languageService.translate('AUTH.REGISTER'),
          icon: 'fa-solid fa-user-plus',
          route: '/register',
          category: 'navigation'
        }
      );
    }

    // Ayuda (para todos)
    this.allSearchItems.push(
      {
        title: this.languageService.translate('SEARCH.HELP_CHANGE_LANGUAGE'),
        subtitle: this.languageService.translate('SHORTCUTS.LANGUAGE_SHORTCUT'),
        icon: 'fa-solid fa-language',
        action: () => this.changeLanguage(),
        category: 'help'
      },
      {
        title: this.languageService.translate('SEARCH.HELP_CHANGE_THEME'),
        subtitle: this.languageService.translate('SHORTCUTS.THEME_SHORTCUT'),
        icon: 'fa-solid fa-palette',
        action: () => this.botonCambio(),
        category: 'help'
      }
    );

    // Ayuda adicional para usuarios autenticados
    if (this.isAuthenticated) {
      if (isDoctor) {
        this.allSearchItems.push({
          title: this.languageService.translate('SEARCH.HELP_ADD_REMINDER'),
          subtitle: this.languageService.translate('DOCTOR.ADD_REMINDER'),
          icon: 'fa-solid fa-bell',
          route: '/doctor',
          category: 'help'
        });
      } else if (isPatient) {
        this.allSearchItems.push({
          title: this.languageService.translate('SEARCH.HELP_ADD_REMINDER'),
          subtitle: this.languageService.translate('PATIENT.REMINDERS'),
          icon: 'fa-solid fa-bell',
          route: '/usuario',
          category: 'help'
        });
      }
    }
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchQuery = '';
      this.initializeSearchItems();
      this.performSearch();
      // Focus en el input después de un pequeño delay
      setTimeout(() => {
        const searchInput = document.querySelector('#search-input') as HTMLInputElement;
        searchInput?.focus();
      }, 100);
    }
  }

  closeSearch(): void {
    this.isSearchOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedResultIndex = 0;
  }

  performSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      // Mostrar accesos rápidos cuando no hay búsqueda
      this.searchResults = this.allSearchItems.filter(item => item.category === 'navigation').slice(0, 5);
    } else {
      // Filtrar por título y subtítulo
      this.searchResults = this.allSearchItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.subtitle?.toLowerCase().includes(query)
      );
    }
    
    this.selectedResultIndex = 0;
  }

  selectSearchResult(item: SearchItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      item.action();
    }
    this.closeSearch();
  }

  getCategoryResults(category: 'navigation' | 'patients' | 'help'): SearchItem[] {
    return this.searchResults.filter(item => item.category === category);
  }

}