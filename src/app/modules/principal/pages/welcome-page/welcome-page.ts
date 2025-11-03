import { Component } from '@angular/core';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-welcome-page',
  imports: [Header, Footer, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './welcome-page.html',
  styleUrls: ['./welcome-page.css'],
})
export class WelcomePage {

}
