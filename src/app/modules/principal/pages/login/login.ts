import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  needsEmailVerification: boolean = false;
  rememberMe: boolean = false;
  
  // Validaciones en tiempo real
  emailError: string = '';
  emailValid: boolean = false;
  passwordError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    this.errorMessage = '';
    this.needsEmailVerification = false;
    this.isLoading = true;
    
    // Validación básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.isLoading = false;
      return;
    }

    // Autenticación con Supabase Auth
    try {
      console.log('🔐 Login - Intentando autenticar:', this.email);
      
      const result = await this.authService.login(this.email, this.password);
      
      console.log('📊 Login - Resultado:', result);
      
      if (result.success) {
        console.log('✅ Login exitoso, redirigiendo a dashboard...');
        // Redirigir siempre al Dashboard después del login exitoso
        this.router.navigate(['/dashboard']);
      } else {
        console.error('❌ Login falló:', result.error);
        // Mostrar error y verificar si necesita validación de email
        this.errorMessage = result.error || 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        this.needsEmailVerification = result.needsEmailVerification || false;
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
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
        this.errorMessage = ''; // Limpiar error
        alert('Email de verificación reenviado. Por favor, revisa tu bandeja de entrada.');
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

  /**
   * Validación de email en tiempo real
   */
  validateEmail() {
    this.emailError = '';
    this.emailValid = false;

    if (!this.email) {
      this.emailError = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Por favor, ingresa un correo válido (ejemplo: usuario@correo.com)';
      return;
    }

    this.emailValid = true;
  }

  /**
   * Validación de contraseña en tiempo real
   */
  validatePassword() {
    this.passwordError = '';

    if (!this.password) {
      this.passwordError = 'Por favor, ingresa tu contraseña';
      return;
    }

    if (this.password.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
  }
}
