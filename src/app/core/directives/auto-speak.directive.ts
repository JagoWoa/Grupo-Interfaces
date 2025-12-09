import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { TextToSpeechService } from '../services/text-to-speech.service';

/**
 * Directiva para lectura automática de texto.
 * Se aplica a cualquier elemento y lee su contenido al hacer hover o focus.
 * Ideal para accesibilidad de personas con discapacidad visual.
 * 
 * Uso: <div appAutoSpeak>Texto que se leerá automáticamente</div>
 *      <button appAutoSpeak>Botón que se leerá al pasar el cursor</button>
 */
@Directive({
  selector: '[appAutoSpeak]',
  standalone: true
})
export class AutoSpeakDirective implements OnInit {
  @Input() speakPrefix: string = ''; // Prefijo opcional (ej: "Botón:", "Enlace:")
  @Input() speakLang: string = 'es-ES';

  constructor(
    private ttsService: TextToSpeechService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    const element = this.el.nativeElement as HTMLElement;
    
    // Hacer elementos focusables para navegación con teclado
    if (!element.hasAttribute('tabindex') && !this.isNativelyFocusable(element)) {
      element.setAttribute('tabindex', '0');
    }
    
    // Agregar atributo aria para lectores de pantalla
    element.setAttribute('aria-live', 'polite');
  }

  private isNativelyFocusable(element: HTMLElement): boolean {
    const focusableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableElements.includes(element.tagName);
  }

  private getTextToSpeak(): string {
    const element = this.el.nativeElement as HTMLElement;
    let text = '';
    
    // Obtener texto según tipo de elemento
    switch (element.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
        const input = element as HTMLInputElement;
        const label = this.findLabel(input);
        const value = input.value || input.placeholder || 'vacío';
        text = label ? `${label}: ${value}` : value;
        break;
        
      case 'SELECT':
        const select = element as HTMLSelectElement;
        const selectLabel = this.findLabel(select);
        const selectedOption = select.options[select.selectedIndex]?.text || 'sin selección';
        text = selectLabel ? `${selectLabel}: ${selectedOption}` : selectedOption;
        break;
        
      case 'BUTTON':
        text = `Botón: ${element.innerText || element.textContent || ''}`;
        break;
        
      case 'A':
        text = `Enlace: ${element.innerText || element.textContent || ''}`;
        break;
        
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
        text = `Título: ${element.innerText || element.textContent || ''}`;
        break;
        
      case 'IMG':
        const img = element as HTMLImageElement;
        text = `Imagen: ${img.alt || 'sin descripción'}`;
        break;
        
      default:
        text = element.innerText || element.textContent || '';
    }
    
    // Limpiar espacios extras
    text = text.replace(/\s+/g, ' ').trim();
    
    // Agregar prefijo si existe
    if (this.speakPrefix && text) {
      text = `${this.speakPrefix} ${text}`;
    }
    
    return text;
  }

  private findLabel(input: HTMLInputElement | HTMLSelectElement): string {
    // Buscar label por for
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent?.trim() || '';
    }
    
    // Buscar label padre
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.replace(input.value, '').trim() || '';
    }
    
    // Buscar aria-label
    return input.getAttribute('aria-label') || input.getAttribute('placeholder') || '';
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const text = this.getTextToSpeak();
    if (text) {
      this.ttsService.speak(text, this.speakLang);
    }
  }

  @HostListener('focus')
  onFocus(): void {
    const text = this.getTextToSpeak();
    if (text) {
      this.ttsService.speak(text, this.speakLang);
    }
  }
}
