import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { ChatService } from '..//../../../core/services/chat.service';
import { SignosVitalesService, SignosVitales } from '..//../../../core/services/signos-vitales.service';
import { Chat } from '../../components/chat/chat';
@Component({
  selector: 'app-usuarioAnciano',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer, Chat],
  templateUrl: './usuarioAnciano.html',
})
export class UsuarioAnciano implements OnInit{
  chatExpanded = false;

 
  // Estado de signos vitales y formulario
  signos: SignosVitales | null = null;
  isEditing = false;
  form: { presion_arterial: string; frecuencia_cardiaca: string; temperatura: string; peso: string } = {
    presion_arterial: '',
    frecuencia_cardiaca: '',
    temperatura: '',
    peso: ''
  };
  constructor(private chatService: ChatService, private signosVitalesService: SignosVitalesService) {}

  ngOnInit(): void {
    this.obtenerSignosVitales();
  }

  toggleChat(): void {
    this.chatExpanded = !this.chatExpanded;
    this.chatService.toggleChat();
  }

  obtenerSignosVitales(): void {
    this.signosVitalesService.getSignosVitales().then(response => {
      if (response.success && response.data) {
        console.log('Signos vitales obtenidos:', response.data);
        this.signos = response.data;
        this.isEditing = false;
        // popular formulario con valores actuales por si desea editar
        this.form.presion_arterial = response.data.presion_arterial || '';
        this.form.frecuencia_cardiaca = response.data.frecuencia_cardiaca || '';
        this.form.temperatura = response.data.temperatura || '';
        this.form.peso = response.data.peso || '';
      } else {
        console.warn('No se encontraron signos vitales o error:', response.error);
        this.signos = null;
        // activar edición para permitir ingreso de datos
        this.isEditing = true;
        this.form = { presion_arterial: '', frecuencia_cardiaca: '', temperatura: '', peso: '' };
      }
    });
  }

  editarSignos(): void {
    this.isEditing = true;
    if (this.signos) {
      this.form.presion_arterial = this.signos.presion_arterial || '';
      this.form.frecuencia_cardiaca = this.signos.frecuencia_cardiaca || '';
      this.form.temperatura = this.signos.temperatura || '';
      this.form.peso = this.signos.peso || '';
    }
  }

  cancelarEditar(): void {
    this.isEditing = false;
    if (this.signos) {
      this.form.presion_arterial = this.signos.presion_arterial || '';
      this.form.frecuencia_cardiaca = this.signos.frecuencia_cardiaca || '';
      this.form.temperatura = this.signos.temperatura || '';
      this.form.peso = this.signos.peso || '';
    } else {
      this.form = { presion_arterial: '', frecuencia_cardiaca: '', temperatura: '', peso: '' };
    }
  }

  async guardarSignos(): Promise<void> {
    // validación mínima
    if (!this.form.presion_arterial && !this.form.frecuencia_cardiaca && !this.form.temperatura && !this.form.peso) {
      console.warn('Formulario vacío: no se guardará nada');
      return;
    }

    const payload = {
      presion_arterial: this.form.presion_arterial,
      frecuencia_cardiaca: this.form.frecuencia_cardiaca,
      temperatura: this.form.temperatura,
      peso: this.form.peso
    };

    const resp = await this.signosVitalesService.guardarSignosVitales(payload as any);
    if (resp.success) {
      await this.obtenerSignosVitales();
      this.isEditing = false;
    } else {
      console.error('Error al guardar signos vitales:', resp.error);
    }
  }
}
