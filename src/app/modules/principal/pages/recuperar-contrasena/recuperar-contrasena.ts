import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './recuperar-contrasena.html',
  styleUrls: ['./recuperar-contrasena.css']
})
export class RecuperarContrasena {
  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private supabase: SupabaseService) {}

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
      // Verificar existencia en la tabla usuarios (incluye pacientes y doctores)
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('id, email, rol')
        .ilike('email', email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        this.errorMessage = 'No existe un usuario registrado con ese correo.';
        return;
      }

      // Usar el flujo seguro de Supabase: enviar email para restablecer
      const res = await this.auth.resetPassword(email);
      if (!res.success) {
        this.errorMessage = res.error || 'No se pudo enviar el correo de recuperación.';
        return;
      }

      this.successMessage = 'Hemos enviado un correo para restablecer tu contraseña.';
    } catch (err: any) {
      this.errorMessage = err.message || 'Ocurrió un error al procesar la solicitud.';
    } finally {
      this.isLoading = false;
    }
  }
}
