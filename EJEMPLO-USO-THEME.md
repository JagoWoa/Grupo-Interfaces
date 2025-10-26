// EJEMPLO: Cómo usar el ThemeService en cualquier componente

import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-ejemplo',
  template: `
    <div>
      <p>Modo actual: {{ isDarkMode ? 'Oscuro' : 'Claro' }}</p>
      <button (click)="cambiarTema()">Cambiar Tema</button>
    </div>
  `
})
export class EjemploComponent implements OnInit {
  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de tema
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  cambiarTema(): void {
    this.themeService.toggleTheme();
  }
}
