import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './terminos-condiciones.html',
  styleUrls: ['./terminos-condiciones.css']
})
export class TerminosCondiciones {
  lastUpdated = '8 de diciembre de 2024';
}
