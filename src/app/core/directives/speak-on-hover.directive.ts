import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { TextToSpeechService } from '../services/text-to-speech.service';

@Directive({
  selector: '[appSpeakOnHover]',
  standalone: true
})
export class SpeakOnHoverDirective implements OnInit {
  @Input() appSpeakOnHover: string = '';
  @Input() speakLang: string = 'es-ES';
  @Input() speakAutoRead: boolean = false; // Si true, lee el texto del elemento automáticamente

  private elementText: string = '';

  constructor(
    private ttsService: TextToSpeechService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // Hacer el elemento focusable para navegación con teclado si no lo es
    const element = this.el.nativeElement as HTMLElement;
    if (!element.hasAttribute('tabindex') && !this.isNativelyFocusable(element)) {
      element.setAttribute('tabindex', '0');
    }
    
    // Agregar rol para lectores de pantalla
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'text');
    }
  }

  private isNativelyFocusable(element: HTMLElement): boolean {
    const focusableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableElements.includes(element.tagName);
  }

  private getTextToSpeak(): string {
    // Si hay texto específico, usarlo
    if (this.appSpeakOnHover) {
      return this.appSpeakOnHover;
    }
    
    // Si speakAutoRead está activo, leer el contenido del elemento
    if (this.speakAutoRead) {
      return this.getElementText();
    }
    
    return '';
  }

  private getElementText(): string {
    const element = this.el.nativeElement as HTMLElement;
    
    // Obtener texto limpio del elemento
    let text = element.innerText || element.textContent || '';
    
    // Limpiar espacios extras
    text = text.replace(/\s+/g, ' ').trim();
    
    // Si es un input, leer el placeholder o label
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const input = element as HTMLInputElement;
      text = input.value || input.placeholder || '';
      
      // Buscar label asociado
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        text = `${label.textContent}: ${text}`;
      }
    }
    
    // Si es un botón, incluir el tipo
    if (element.tagName === 'BUTTON') {
      text = `Botón: ${text}`;
    }
    
    // Si es un enlace
    if (element.tagName === 'A') {
      text = `Enlace: ${text}`;
    }
    
    return text;
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
    // Lectura cuando el elemento recibe foco (navegación con teclado)
    const text = this.getTextToSpeak();
    if (text) {
      this.ttsService.speak(text, this.speakLang);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Cancelar lectura al salir (opcional, para no interrumpir)
    // this.ttsService.cancel();
  }
}
