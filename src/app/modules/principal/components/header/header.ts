import { Component, LOCALE_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html'
})
export class Header {
  public targetLang: string = 'en'; // Idioma por defecto al que cambiar
  public currentLang: string = 'es'; // Idioma actual
  searchQuery: string = '';
  selectedLanguage: string = 'es';
  currentPage: string = 'Inicio';
  isAccessibilityMenuOpen: boolean = false;
  
  languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) public locale: string
  ) { }
  
  ngOnInit(): void {
    // Obtenemos el idioma actual del LOCALE_ID inyectado
    this.currentLang = this.locale;
    
    // Determinamos a qué idioma debe cambiar el botón
    this.targetLang = this.currentLang === 'es' ? 'en' : 'es';
  }

  // Función que se llamará al hacer clic en el botón
  public toggleLanguage(): void {
    // Obtenemos la ruta actual sin el prefijo de idioma
    const currentPath = this.document.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(es|en)/, '');
    
    // Redirigimos a la misma ruta pero con el nuevo idioma
    this.document.location.href = `/${this.targetLang}${pathWithoutLang}`;
  }

  accessibilityOptions = [
    { id: 'highContrast', label: 'Alto Contraste', icon: 'fas fa-adjust' },
    { id: 'largeText', label: 'Texto Grande', icon: 'fas fa-text-height' },
    { id: 'screenReader', label: 'Lector de Pantalla', icon: 'fas fa-volume-up' }
  ];

  isLogging() {
    return false;
  }
}