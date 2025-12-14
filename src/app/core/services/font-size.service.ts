import { Injectable, Inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Servicio para gestionar el tamaño del texto en toda la aplicación
 * Permite cambiar el tamaño del texto para mejorar la accesibilidad
 */
@Injectable({
  providedIn: 'root'
})
export class FontSizeService {
  // Tamaños disponibles (en porcentaje relativo al tamaño base)
  public readonly sizes = {
    small: 0.875,    // 87.5% (14px si base es 16px)
    normal: 1,       // 100% (16px)
    large: 1.125,    // 112.5% (18px)
    xlarge: 1.25,   // 125% (20px)
    xxlarge: 1.5    // 150% (24px)
  };

  // Tamaño actual (signal para reactividad)
  private currentSize = signal<number>(this.sizes.normal);
  public currentSize$ = this.currentSize;

  // Nombre del tamaño actual para mostrar en la UI
  public currentSizeName = signal<string>('normal');

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initFontSize();
  }

  /**
   * Inicializar el tamaño del texto desde localStorage
   */
  private initFontSize(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedSize = localStorage.getItem('fontSize');
      if (savedSize) {
        const size = parseFloat(savedSize);
        this.currentSize.set(size);
        this.updateSizeName(size);
        this.applyFontSize(size);
      } else {
        // Tamaño por defecto
        this.applyFontSize(this.sizes.normal);
      }
    }
  }

  /**
   * Aplicar el tamaño del texto al documento
   */
  private applyFontSize(size: number): void {
    const root = this.document.documentElement;
    root.style.setProperty('--font-size-multiplier', size.toString());
    
    // También aplicar como clase para mayor compatibilidad
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge', 'font-size-xxlarge');
    
    if (size === this.sizes.small) {
      root.classList.add('font-size-small');
    } else if (size === this.sizes.normal) {
      root.classList.add('font-size-normal');
    } else if (size === this.sizes.large) {
      root.classList.add('font-size-large');
    } else if (size === this.sizes.xlarge) {
      root.classList.add('font-size-xlarge');
    } else if (size === this.sizes.xxlarge) {
      root.classList.add('font-size-xxlarge');
    }
  }

  /**
   * Actualizar el nombre del tamaño actual
   */
  private updateSizeName(size: number): void {
    if (size === this.sizes.small) {
      this.currentSizeName.set('small');
    } else if (size === this.sizes.normal) {
      this.currentSizeName.set('normal');
    } else if (size === this.sizes.large) {
      this.currentSizeName.set('large');
    } else if (size === this.sizes.xlarge) {
      this.currentSizeName.set('xlarge');
    } else if (size === this.sizes.xxlarge) {
      this.currentSizeName.set('xxlarge');
    }
  }

  /**
   * Establecer el tamaño del texto
   */
  setFontSize(sizeName: keyof typeof this.sizes): void {
    const size = this.sizes[sizeName];
    this.currentSize.set(size);
    this.currentSizeName.set(sizeName);
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('fontSize', size.toString());
    }
    
    this.applyFontSize(size);
  }

  /**
   * Aumentar el tamaño del texto
   */
  increaseFontSize(): void {
    const current = this.currentSize();
    const sizeNames: (keyof typeof this.sizes)[] = ['small', 'normal', 'large', 'xlarge', 'xxlarge'];
    const currentIndex = sizeNames.findIndex(name => this.sizes[name] === current);
    
    if (currentIndex < sizeNames.length - 1) {
      this.setFontSize(sizeNames[currentIndex + 1]);
    }
  }

  /**
   * Disminuir el tamaño del texto
   */
  decreaseFontSize(): void {
    const current = this.currentSize();
    const sizeNames: (keyof typeof this.sizes)[] = ['small', 'normal', 'large', 'xlarge', 'xxlarge'];
    const currentIndex = sizeNames.findIndex(name => this.sizes[name] === current);
    
    if (currentIndex > 0) {
      this.setFontSize(sizeNames[currentIndex - 1]);
    }
  }

  /**
   * Obtener el tamaño actual
   */
  getCurrentSize(): number {
    return this.currentSize();
  }

  /**
   * Obtener el nombre del tamaño actual
   */
  getCurrentSizeName(): string {
    return this.currentSizeName();
  }

  /**
   * Resetear al tamaño normal
   */
  resetFontSize(): void {
    this.setFontSize('normal');
  }
}

