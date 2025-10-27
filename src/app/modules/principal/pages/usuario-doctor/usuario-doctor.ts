import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { ChatService } from '..//../../../core/services/chat.service';

@Component({
  selector: 'app-usuario-doctor',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './usuario-doctor.html',
})
export class UsuarioDoctor {
  // Lista de pacientes
  pacientes = [
    { id: 1, nombre: 'Usuario 1', ultimaConsulta: 'Hoy' },
    { id: 2, nombre: 'Usuario 2', ultimaConsulta: 'Ayer' },
    { id: 3, nombre: 'Usuario 3', ultimaConsulta: 'Hace 2 días' }
  ];

  pacienteSeleccionado: any = null;
  busqueda: string = '';

  // Signos vitales
  presionArterial: string = '';
  frecuenciaCardiaca: number = 0;
  temperatura: number = 0;
  peso: number = 0;

  seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    // Aquí cargarías los signos vitales del paciente desde tu servicio
    this.cargarSignosVitales(paciente.id);
  }

  cargarSignosVitales(pacienteId: number) {
    // Simulación - aquí deberías llamar a tu servicio para obtener los datos reales
    this.presionArterial = '120/80';
    this.frecuenciaCardiaca = 72;
    this.temperatura = 36.5;
    this.peso = 70;
  }

  actualizarSignosVitales() {
    if (!this.pacienteSeleccionado) {
      alert('Por favor selecciona un paciente primero');
      return;
    }

    console.log('Actualizando signos vitales:', {
      pacienteId: this.pacienteSeleccionado.id,
      presionArterial: this.presionArterial,
      frecuenciaCardiaca: this.frecuenciaCardiaca,
      temperatura: this.temperatura,
      peso: this.peso
    });

    // Aquí llamarías a tu servicio para guardar los datos
    alert('Signos vitales actualizados correctamente');
  }

  get pacientesFiltrados() {
    if (!this.busqueda) {
      return this.pacientes;
    }
    return this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
}
