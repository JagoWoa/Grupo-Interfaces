import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer, TranslatePipe, SpeakOnHoverDirective],
  templateUrl: './politica-privacidad.html',
  styleUrls: ['./politica-privacidad.css']
})
export class PoliticaPrivacidad {
  lastUpdated = '8 de diciembre de 2024';
}
