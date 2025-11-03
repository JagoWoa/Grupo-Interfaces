import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private enabled = signal(false);
  private currentLang = signal<string>('es-ES');

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  speak(text: string, lang?: string): void {
    if (!this.synth || !this.enabled()) return;
    
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || this.currentLang();
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = this.voices.find(v => v.lang === utterance.lang);
    if (voice) utterance.voice = voice;

    this.synth.speak(utterance);
  }

  setLanguage(lang: string): void {
    this.currentLang.set(lang);
  }

  toggle(): void {
    this.enabled.update(v => !v);
  }

  isEnabled(): boolean {
    return this.enabled();
  }

  cancel(): void {
    this.synth.cancel();
  }
}
