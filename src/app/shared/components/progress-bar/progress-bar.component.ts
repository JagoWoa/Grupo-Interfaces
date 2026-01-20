import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container" *ngIf="visible">
      <div class="progress-backdrop" (click)="allowClose ? close() : null"></div>
      <div class="progress-modal">
        <!-- Botón cerrar -->
        <button *ngIf="allowClose || isComplete" class="close-btn" (click)="close()" title="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="progress-content">
          <div class="progress-icon" [class.success]="isComplete">
            <i class="fa-solid" [ngClass]="currentIconClass"></i>
          </div>
          <h3 class="progress-title">{{ isComplete ? successMessage : message }}</h3>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" [class.complete]="isComplete" [style.width.%]="displayProgress">
              <div class="progress-glow" *ngIf="!isComplete"></div>
            </div>
          </div>
          <p class="progress-percentage">{{ displayProgress | number:'1.0-0' }}%</p>
          <p class="progress-hint" *ngIf="hint">{{ hint }}</p>
          
          <!-- Botón cerrar cuando completo -->
          <button *ngIf="isComplete" class="btn-close-complete" (click)="close()">
            <i class="fa-solid fa-check"></i> Aceptar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .progress-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
    
    .progress-modal {
      position: relative;
      background: white;
      border-radius: 20px;
      padding: 40px 50px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      min-width: 350px;
      max-width: 90%;
      animation: slideIn 0.3s ease-out;
    }
    
    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 32px;
      height: 32px;
      border: none;
      background: #f3f4f6;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #e5e7eb;
      transform: scale(1.1);
    }
    
    .close-btn i {
      font-size: 14px;
      color: #6b7280;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .progress-content {
      text-align: center;
    }
    
    .progress-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #004b98 0%, #0066cc 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: pulse 2s ease-in-out infinite;
      transition: all 0.3s;
    }
    
    .progress-icon.success {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      animation: none;
    }
    
    .progress-icon i {
      font-size: 28px;
      color: white;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .progress-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    
    .progress-bar-wrapper {
      width: 100%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #004b98 0%, #0066cc 50%, #3b82f6 100%);
      border-radius: 10px;
      transition: width 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .progress-bar.complete {
      background: linear-gradient(90deg, #059669 0%, #10b981 100%);
    }
    
    .progress-glow {
      position: absolute;
      top: 0;
      left: -50%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: glow 1.5s linear infinite;
    }
    
    @keyframes glow {
      0% { left: -50%; }
      100% { left: 150%; }
    }
    
    .progress-percentage {
      font-size: 1.5rem;
      font-weight: 700;
      color: #004b98;
      margin-bottom: 8px;
    }
    
    .progress-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 16px;
    }
    
    .btn-close-complete {
      margin-top: 16px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .btn-close-complete:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    
    /* Dark mode */
    :host-context(.dark) .progress-modal {
      background: #1f2937;
    }
    
    :host-context(.dark) .progress-title {
      color: #f9fafb;
    }
    
    :host-context(.dark) .progress-bar-wrapper {
      background: #374151;
    }
    
    :host-context(.dark) .progress-hint {
      color: #9ca3af;
    }
    
    :host-context(.dark) .close-btn {
      background: #374151;
    }
    
    :host-context(.dark) .close-btn:hover {
      background: #4b5563;
    }
    
    :host-context(.dark) .close-btn i {
      color: #9ca3af;
    }
  `]
})
export class ProgressBarComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() progress: number = 0;
  @Input() message: string = 'Procesando...';
  @Input() successMessage: string = '¡Completado!';
  @Input() hint: string = '';
  @Input() type: 'save' | 'load' | 'upload' | 'sync' = 'save';
  @Input() allowClose: boolean = false;
  @Input() autoCloseDelay: number = 2000; // ms para cerrar automáticamente después de completar
  
  @Output() closed = new EventEmitter<void>();
  
  isComplete: boolean = false;
  displayProgress: number = 0;
  
  private autoCloseTimeout: any;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress']) {
      this.displayProgress = Math.min(100, Math.max(0, this.progress));
      
      if (this.displayProgress >= 100 && !this.isComplete) {
        this.isComplete = true;
        
        // Auto cerrar después del delay
        if (this.autoCloseDelay > 0) {
          this.autoCloseTimeout = setTimeout(() => {
            this.close();
          }, this.autoCloseDelay);
        }
      } else if (this.displayProgress < 100) {
        this.isComplete = false;
      }
    }
    
    if (changes['visible'] && !changes['visible'].currentValue) {
      // Reset cuando se oculta
      this.isComplete = false;
      this.displayProgress = 0;
      if (this.autoCloseTimeout) {
        clearTimeout(this.autoCloseTimeout);
      }
    }
  }
  
  get currentIconClass(): string {
    if (this.isComplete) {
      return 'fa-check';
    }
    switch (this.type) {
      case 'save': return 'fa-floppy-disk fa-beat';
      case 'load': return 'fa-spinner fa-spin';
      case 'upload': return 'fa-cloud-arrow-up fa-beat';
      case 'sync': return 'fa-arrows-rotate fa-spin';
      default: return 'fa-spinner fa-spin';
    }
  }
  
  close(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
    this.closed.emit();
  }
}
