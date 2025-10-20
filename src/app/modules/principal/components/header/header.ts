import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html'
})
export class Header {
  searchQuery: string = '';
  selectedLanguage: string = 'es';
  currentPage: string = 'Inicio';
  isAccessibilityMenuOpen: boolean = false;
  
  languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  accessibilityOptions = [
    { id: 'highContrast', label: 'Alto Contraste', icon: 'fas fa-adjust' },
    { id: 'largeText', label: 'Texto Grande', icon: 'fas fa-text-height' },
    { id: 'screenReader', label: 'Lector de Pantalla', icon: 'fas fa-volume-up' }
  ];

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // Implementar lógica de búsqueda
    }
  }

  changeLanguage(langCode: string) {
    this.selectedLanguage = langCode;
    console.log('Idioma cambiado a:', langCode);
    // Implementar cambio de idioma
  }

  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
  }

  toggleAccessibilityOption(optionId: string) {
    console.log('Opción de accesibilidad:', optionId);
    // Implementar lógica de accesibilidad
  }

  getSelectedLanguageFlag(): string {
    return this.languages.find(l => l.code === this.selectedLanguage)?.flag || '🇪🇸';
  }

  getSelectedLanguageCode(): string {
    return this.languages.find(l => l.code === this.selectedLanguage)?.code.toUpperCase() || 'ES';
  }
}
