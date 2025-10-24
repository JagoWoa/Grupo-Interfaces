import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-register-doctor',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './register-doctor.html',
})
export class RegisterDoctor {
  // Datos del formulario
  nombre: string = '';
  apellidos: string = '';
  email: string = '';
  telefono: string = '';
  fechaNacimiento: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  // Estados
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  acceptTerms: boolean = false;

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  onSubmit() {
    this.errorMessage = '';
      
  
    // Validaciones
    if (!this.nombre || !this.apellidos || !this.email || !this.telefono || 
        !this.fechaNacimiento || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return;
    }

    // Lógica de registro con Supabase: signUp en Auth y luego crear perfil en tabla `doctor`
    (async () => {
      try {
        const { data: signData, error: signError } = await this.supabaseService.client.auth.signUp({
          email: this.email,
          password: this.password
        });

        if (signError) {
          this.errorMessage = signError.message || 'Error al registrar la cuenta';
          return;
        }

        const user = signData?.user ?? (await this.supabaseService.client.auth.getUser()).data?.user;

        if (!user) {
          this.errorMessage = 'Registro iniciado. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.';
          return;
        }

        const perfil = {
          id: user.id,
          nombre: this.nombre,
          apellidos: this.apellidos,
          email: this.email,
          telefono: this.telefono,
          fecha_nacimiento: this.fechaNacimiento
        } as any;

        const { error: insertError } = await this.supabaseService.client
          .from('doctor')
          .insert([perfil]);

        if (insertError) {
          console.error('Error insertando perfil doctor:', insertError);
          this.errorMessage = 'Cuenta creada en Auth pero no se pudo crear el perfil (doctor). Contacta al administrador.';
          return;
        }

        this.router.navigate(['/login']);
      } catch (err: any) {
        console.error('Error en registro doctor:', err);
        this.errorMessage = err?.message || 'Error inesperado al registrar';
      }
    })();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
