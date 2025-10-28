import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos-uso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminos-uso.html',
  styleUrl: './terminos-uso.css'
})
export class TerminosUsoComponent {
  fechaActualizacion = 'Octubre 2025';

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/']);
  }
}
