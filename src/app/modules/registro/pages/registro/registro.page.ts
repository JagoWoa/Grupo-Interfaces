import { Component } from '@angular/core';
import { RegistroFormComponent } from '../../components/registro-form/registro-form.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RegistroFormComponent],
  template: `
    <div class="container mx-auto">
      <app-registro-form></app-registro-form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class RegistroPage {}
