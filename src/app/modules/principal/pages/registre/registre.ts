import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-registre',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './registre.html'
})
export class Registre {
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

    // Lógica de registro con Supabase: signUp en Auth y luego crear perfil en tabla adulto_mayor
    (async () => {
      try {
        // 1) signUp
        const { data: signData, error: signError } = await this.supabaseService.client.auth.signUp({
          email: this.email,
          password: this.password
        });

        if (signError) {
          this.errorMessage = signError.message || 'Error al registrar la cuenta';
          return;
        }

        // signUp puede requerir confirmación por email; en algunos casos user será null
        const user = signData?.user ?? (await this.supabaseService.client.auth.getUser()).data?.user;

        if (!user) {
          // Registro iniciado; pedir confirmación por email
          this.errorMessage = 'Registro iniciado. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.';
          return;
        }

        // 2) Insertar perfil en la tabla `adulto_mayor` con el esquema existente
        //    CREATE TABLE adulto_mayor (
        //      id VARCHAR PRIMARY KEY,
        //      doctor_id VARCHAR REFERENCES doctor(id) ON DELETE SET NULL,
        //      nombre_completo VARCHAR NOT NULL,
        //      email VARCHAR UNIQUE NOT NULL,
        //      password VARCHAR NOT NULL,
        //      telefono VARCHAR
        //    );
        const perfil = {
          id: user.id,
          doctor_id: null,
          nombre_completo: `${this.nombre} ${this.apellidos}`.trim(),
          email: this.email,
          password: this.password, // Nota: almacenar contraseñas en texto no es recomendado.
          telefono: this.telefono
        } as any;

        const { error: insertError } = await this.supabaseService.client
          .from('adulto_mayor')
          .insert([perfil]);

        if (insertError) {
          // Si falla la inserción, informar y (opcional) eliminar el usuario creado en Auth si es necesario
          console.error('Error insertando perfil adulto_mayor:', insertError);
          // Mostrar mensaje más claro si es restricción de unicidad de email u otra policy RLS
          this.errorMessage = insertError.message || 'Cuenta creada en Auth pero no se pudo crear el perfil. Contacta al administrador.';
          return;
        }

        // Éxito: redirigir a login o a otra página
        this.router.navigate(['/login']);
      } catch (err: any) {
        console.error('Error en registro:', err);
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
