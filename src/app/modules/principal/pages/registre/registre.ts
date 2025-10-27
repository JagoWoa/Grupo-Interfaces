import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-registre',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './registre.html'
})
export class Registre {
  // Datos del formulario
  nombre: string = '';
  apellidos: string = '';
  nombre_completo: string = '';
  email: string = '';
  telefono: string = '';
  fechaNacimiento: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  // Estados
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  acceptTerms: boolean = false;
  isLoading: boolean = false;
  showEmailVerificationMessage: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.showEmailVerificationMessage = false;
    this.isLoading = true;
  
    // Validaciones
    if (!this.nombre || !this.apellidos || !this.email || !this.telefono || 
        !this.fechaNacimiento || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.isLoading = false;
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      this.isLoading = false;
      return;
    }

    if (this.telefono.length > 15) {
      this.errorMessage = 'El teléfono es demasiado largo. Formato: +593 0000000000';
      this.isLoading = false;
      return;
    }

    if (this.telefono.length < 10) {
      this.errorMessage = 'El teléfono es demasiado corto. Incluye el código de país';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      this.isLoading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.isLoading = false;
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      this.isLoading = false;
      return;
    }

    // Componer nombre completo desde nombre y apellidos
    this.nombre_completo = `${this.nombre} ${this.apellidos}`.trim();

    // Registro con Supabase Auth
    try {
      const result = await this.authService.register({
        email: this.email,
        password: this.password,
        nombre_completo: this.nombre_completo,
        telefono: this.telefono,
        fecha_nacimiento: this.fechaNacimiento,
        rol: 'adulto_mayor'
      });
      
      if (result.success) {
        if (result.needsEmailVerification) {
          // Si necesita verificación, mostrar mensaje
          this.showEmailVerificationMessage = true;
          this.successMessage = '¡Registro exitoso! Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión.';
        } else {
          // Si NO necesita verificación, redirigir al home directamente
          this.successMessage = '¡Registro exitoso! Has iniciado sesión automáticamente. Redirigiendo...';
          console.log('🚀 Redirigiendo al home...');
          // Dar tiempo para que se actualice el estado de autenticación
          setTimeout(() => {
            this.router.navigate(['/home']).then(() => {
              console.log('✅ Navegación completada');
            });
          }, 2000);
        }
      } else {
        this.errorMessage = result.error || 'Error al registrar el usuario. Por favor, intenta de nuevo.';
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.errorMessage = 'Error al registrar el usuario. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Reenviar email de verificación
   */
  async resendVerificationEmail() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const result = await this.authService.resendVerificationEmail(this.email);
      
      if (result.success) {
        this.successMessage = 'Email de verificación reenviado. Por favor, revisa tu bandeja de entrada.';
      } else {
        this.errorMessage = result.error || 'Error al reenviar el email';
      }
    } catch (error) {
      console.error('Error al reenviar email:', error);
      this.errorMessage = 'Error al reenviar el email de verificación';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
