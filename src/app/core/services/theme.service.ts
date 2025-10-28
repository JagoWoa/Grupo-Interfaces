import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode');
      const isDark = savedTheme === 'true';
      this.darkModeSubject.next(isDark);
      this.applyTheme(isDark);
    }
  }

  toggleTheme(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('darkMode', newValue.toString());
    }
    
    this.applyTheme(newValue);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
