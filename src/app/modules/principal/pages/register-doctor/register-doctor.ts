import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

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

  constructor(private router: Router) {}

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

    // Aquí iría la lógica de registro con Supabase
    console.log('Registro:', {
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento
    });
    
    // Simulación de registro exitoso (reemplazar con llamada real a Supabase)
    // this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
