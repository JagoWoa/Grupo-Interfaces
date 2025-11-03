import { Directive, HostListener, Input } from '@angular/core';
import { TextToSpeechService } from '../services/text-to-speech.service';

@Directive({
  selector: '[appSpeakOnHover]',
  standalone: true
})
export class SpeakOnHoverDirective {
  @Input() appSpeakOnHover: string = '';
  @Input() speakLang: string = 'es-ES';

  constructor(private ttsService: TextToSpeechService) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.appSpeakOnHover) {
      this.ttsService.speak(this.appSpeakOnHover, this.speakLang);
    }
  }
}
