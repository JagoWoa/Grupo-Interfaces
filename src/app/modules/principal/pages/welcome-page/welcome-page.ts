import { Component } from '@angular/core';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { Sidebar }  from '../../components/sidebar/sidebar';
@Component({
  selector: 'app-welcome-page',
  imports: [Header, Footer, Sidebar],
  templateUrl: './welcome-page.html',
})
export class WelcomePage {

}
