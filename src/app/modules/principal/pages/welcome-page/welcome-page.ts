import { Component } from '@angular/core';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { Sidebar }  from '../../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-welcome-page',
  imports: [Header, Footer, CommonModule, RouterLink, Sidebar],
  templateUrl: './welcome-page.html',
})
export class WelcomePage {

}
