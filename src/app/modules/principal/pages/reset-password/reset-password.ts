import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  isValidToken = false;
  isCheckingToken = true;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Supabase maneja automáticamente el token de la URL
    // Verificamos si hay una sesión de recuperación activa
    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      
      if (session) {
        this.isValidToken = true;
        console.log('✅ Sesión de recuperación válida');
      } else {
        // Intentar escuchar eventos de autenticación
        this.supabase.client.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event);
          if (event === 'PASSWORD_RECOVERY') {
            this.isValidToken = true;
            this.cdr.detectChanges();
          }
        });
        
        // Dar tiempo para que se procese el token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session: newSession } } = await this.supabase.client.auth.getSession();
        if (newSession) {
          this.isValidToken = true;
        }
      }
    } catch (error) {
      console.error('Error verificando token:', error);
    } finally {
      this.isCheckingToken = false;
      this.cdr.detectChanges();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePasswords(): boolean {
    if (!this.newPassword) {
      this.errorMessage = 'Ingresa tu nueva contraseña.';
      return false;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      return false;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return false;
    }
    return true;
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validatePasswords()) {
      return;
    }

    this.isLoading = true;
    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: this.newPassword
      });

      if (error) throw error;

      this.successMessage = '¡Contraseña actualizada exitosamente! Serás redirigido al login...';
      
      // Cerrar sesión y redirigir al login después de 3 segundos
      setTimeout(async () => {
        await this.supabase.client.auth.signOut();
        this.router.navigate(['/login']);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      this.errorMessage = err.message || 'Ocurrió un error al actualizar la contraseña.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
