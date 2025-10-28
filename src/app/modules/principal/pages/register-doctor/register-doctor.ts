import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-doctor',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './register-doctor.html',
})
export class RegisterDoctor {
  // Datos del formulario
  nombre: string = '';
  apellidos: string = '';
  nombre_completo: string = '';
  titulo: string = '';
  especialidad: string = '';
  numero_licencia: string = '';
  anos_experiencia: number | null = null;
  email: string = '';
  telefono: string = '';
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

  // Errores de validación individuales
  fieldErrors: {
    nombre?: string;
    apellidos?: string;
    titulo?: string;
    especialidad?: string;
    numero_licencia?: string;
    anos_experiencia?: string;
    email?: string;
    telefono?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  } = {};

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    // Limpiar mensajes previos
    this.errorMessage = '';
    this.successMessage = '';
    this.showEmailVerificationMessage = false;
    this.fieldErrors = {};
    
    // Validar todos los campos ANTES de activar isLoading
    const validationErrors = this.validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      this.fieldErrors = validationErrors;
      // Mostrar el primer error en el mensaje general
      const firstError = Object.values(validationErrors)[0];
      this.errorMessage = firstError;
      // NO activar isLoading si hay errores de validación
      return;
    }
    
    // Si pasó todas las validaciones, activar loading
    this.isLoading = true;

    // Componer nombre completo desde nombre y apellidos
    this.nombre_completo = `${this.nombre} ${this.apellidos}`.trim();

    // Registro de doctor con Supabase Auth
    try {
      const result = await this.authService.registerDoctor({
        email: this.email,
        password: this.password,
        nombre_completo: this.nombre_completo,
        titulo: this.titulo,
        especialidad: this.especialidad,
        telefono: this.telefono,
        numero_licencia: this.numero_licencia,
        anos_experiencia: this.anos_experiencia || undefined
      });
      
      if (result.success) {
        if (result.needsEmailVerification) {
          this.showEmailVerificationMessage = true;
          this.successMessage = '¡Registro exitoso! Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión.';
        } else {
          this.successMessage = '¡Registro exitoso! Has iniciado sesión automáticamente. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/home']).then(() => {
              console.log('✅ Navegación completada');
            });
          }, 2000);
        }
      } else {
        this.errorMessage = result.error || 'Error al registrar el doctor. Por favor, intenta de nuevo.';
      }
    } catch (error) {
      console.error('Error en registro de doctor:', error);
      this.errorMessage = 'Error al registrar el doctor. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validar todos los campos del formulario
   */
  private validateForm(): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    // Validar nombre
    if (!this.nombre || this.nombre.trim() === '') {
      errors['nombre'] = 'El nombre es obligatorio';
    }

    // Validar apellidos
    if (!this.apellidos || this.apellidos.trim() === '') {
      errors['apellidos'] = 'Los apellidos son obligatorios';
    }

    // Validar título
    if (!this.titulo || this.titulo.trim() === '') {
      errors['titulo'] = 'El título es obligatorio';
    }

    // Validar especialidad
    if (!this.especialidad || this.especialidad.trim() === '') {
      errors['especialidad'] = 'La especialidad es obligatoria';
    }

    // Validar número de licencia (opcional pero si se ingresa debe ser válido)
    if (this.numero_licencia && this.numero_licencia.trim().length < 5) {
      errors['numero_licencia'] = 'El número de licencia debe tener al menos 5 caracteres';
    }

    // Validar años de experiencia (opcional pero si se ingresa debe ser >= 0)
    if (this.anos_experiencia !== null && this.anos_experiencia < 0) {
      errors['anos_experiencia'] = 'Los años de experiencia no pueden ser negativos';
    }

    // Validar email
    if (!this.email || this.email.trim() === '') {
      errors['email'] = 'El correo electrónico es obligatorio';
    } else if (!this.email.includes('@') || !this.email.includes('.')) {
      errors['email'] = 'Por favor, ingresa un correo electrónico válido';
    }

    // Validar teléfono
    if (!this.telefono || this.telefono.trim() === '') {
      errors['telefono'] = 'El teléfono es obligatorio';
    } else if (this.telefono.includes('@')) {
      errors['telefono'] = 'El teléfono no puede ser un correo electrónico';
    } else {
      const digitosEnTelefono = this.telefono.replace(/[^0-9]/g, '');
      if (digitosEnTelefono.length < 10) {
        errors['telefono'] = 'El teléfono debe contener al menos 10 dígitos';
      }
    }

    // Validar longitud máxima del teléfono
    if (this.telefono && this.telefono.length > 20) {
      errors['telefono'] = 'El teléfono es demasiado largo';
    }

    // Validar contraseña
    if (!this.password || this.password.trim() === '') {
      errors['password'] = 'La contraseña es obligatoria';
    } else if (this.password.length < 6) {
      errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!this.confirmPassword || this.confirmPassword.trim() === '') {
      errors['confirmPassword'] = 'Debes confirmar la contraseña';
    } else if (this.password !== this.confirmPassword) {
      errors['confirmPassword'] = 'Las contraseñas no coinciden';
    }

    // Validar términos
    if (!this.acceptTerms) {
      errors['terms'] = 'Debes aceptar los términos y condiciones';
    }

    return errors;
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

  /**
   * Filtrar solo números, espacios, paréntesis, guiones y el símbolo +
   */
  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    
    // Permitir solo: números, espacios, paréntesis, guiones y +
    const filtered = input.value.replace(/[^0-9\s\+\-\(\)]/g, '');
    
    if (input.value !== filtered) {
      this.telefono = filtered;
      // Restaurar posición del cursor
      setTimeout(() => {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }, 0);
    }
  }
}
