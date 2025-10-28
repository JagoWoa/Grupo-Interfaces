import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';
import { ChatService } from '..//../../../core/services/chat.service';
import { SupabaseService } from '..//../../../core/services/supabase.service';
@Component({
  selector: 'app-usuario-doctor',
  imports: [CommonModule, FormsModule, Header, Footer, Sidebar, Chat],
  templateUrl: './usuario-doctor.html',
})
export class UsuarioDoctor implements OnInit {

  constructor(private chatService: ChatService, private SupabaseService: SupabaseService) {}
  pacientes: any[] = [];

  async ngOnInit() {
    this.pacientes = await this.SupabaseService.usuariosAsociadosADoctor('1'); 
  }
  





  pacienteSeleccionado: any = null;
  busqueda: string = '';

  // Signos vitales
  presionArterial: string = '';
  frecuenciaCardiaca: number = 0;
  temperatura: number = 0;
  peso: number = 0;

  // Recordatorios
  recordatorios: { titulo: string, descripcion: string }[] = [];
  nuevoRecordatorioTitulo: string = '';
  nuevoRecordatorioDescripcion: string = '';

  seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    // Aquí cargarías los signos vitales del paciente desde tu servicio
    this.cargarSignosVitales(paciente.id);
    this.cargarRecordatorios(paciente.id);
  }

  cargarSignosVitales(pacienteId: number) {
    // Simulación - aquí deberías llamar a tu servicio para obtener los datos reales
    this.presionArterial = '120/80';
    this.frecuenciaCardiaca = 72;
    this.temperatura = 36.5;
    this.peso = 70;
  }

  cargarRecordatorios(pacienteId: number) {
    // Simulación - aquí deberías llamar a tu servicio para obtener los datos reales
    this.recordatorios = [
      { titulo: 'Paracetamol', descripcion: '500 mg cada 8 horas' },
      { titulo: 'Consulta Médica', descripcion: 'Cada 6 meses' }
    ];
  }

  agregarRecordatorio() {
    if (!this.pacienteSeleccionado) {
      alert('Por favor selecciona un paciente primero');
      return;
    }

    if (!this.nuevoRecordatorioTitulo || !this.nuevoRecordatorioDescripcion) {
      alert('Por favor completa todos los campos del recordatorio');
      return;
    }

    this.recordatorios.push({
      titulo: this.nuevoRecordatorioTitulo,
      descripcion: this.nuevoRecordatorioDescripcion
    });

    // Limpiar campos
    this.nuevoRecordatorioTitulo = '';
    this.nuevoRecordatorioDescripcion = '';

    // Aquí llamarías a tu servicio para guardar el recordatorio
    console.log('Recordatorio agregado:', this.recordatorios);
  }

  eliminarRecordatorio(index: number) {
    if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
      this.recordatorios.splice(index, 1);
      // Aquí llamarías a tu servicio para eliminar el recordatorio
      console.log('Recordatorio eliminado');
    }
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
  cargarPacientesAsignadosADoctor(idDoctor: number) {
    this.SupabaseService.usuariosAsociadosADoctor(idDoctor.toString())
      .then((usuarios: any[]) => { // 👈 tipo explícito
        this.pacientes = usuarios;
      });
  }

}
