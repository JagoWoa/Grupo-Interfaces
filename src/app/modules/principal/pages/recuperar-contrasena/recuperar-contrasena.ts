import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer, TranslatePipe, SpeakOnHoverDirective],
  templateUrl: './recuperar-contrasena.html',
  styleUrls: ['./recuperar-contrasena.css']
})
export class RecuperarContrasena {
  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.email.trim().toLowerCase();
    if (!email) {
      this.errorMessage = 'Ingresa tu correo electrónico registrado.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Formato de correo inválido.';
      return;
    }

    this.isLoading = true;
    try {
      // Enviar solicitud de recuperación directamente a Supabase Auth
      // Por seguridad, Supabase no revela si el email existe o no
      // Si el email existe, se envía el correo; si no, simplemente no pasa nada
      const res = await this.auth.resetPassword(email);

      if (!res.success) {
        this.errorMessage = res.error || 'No se pudo enviar el correo de recuperación.';
        return;
      }

      // Mensaje genérico por seguridad (no revelar si el email existe)
      this.successMessage = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';
    } catch (err: any) {
      this.errorMessage = err.message || 'Ocurrió un error al procesar la solicitud.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
