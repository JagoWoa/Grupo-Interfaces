import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './login.html'
})
export class Login {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    
    // Validación básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    // Aquí iría la lógica de autenticación con Supabase
    console.log('Login attempt:', { email: this.email, password: this.password });
    
    // Simulación de login exitoso (reemplazar con llamada real a Supabase)
    // this.router.navigate(['/home']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
