
import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';
import { ChatService } from '..//../../../core/services/chat.service';
import { HealthService, SignosVitales } from '../../../../core/services/health.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '..//../../../core/services/supabase.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
@Component({
  selector: 'app-usuario-doctor',
  imports: [CommonModule, FormsModule, Header, Footer, Chat, TranslatePipe],
  templateUrl: './usuario-doctor.html',
  styleUrls: ['./usuario-doctor.css']
})
export class UsuarioDoctor implements OnInit {

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  
  // Estado de carga
  isLoading = true;
  doctorId: string = '';  
  doctorName: string = '';

  // Lista de pacientes
  pacientes: any[] = [];
  pacienteSeleccionado: any = null;
  busqueda: string = '';

  // Signos vitales del paciente seleccionado
  presionArterial: string = '';
  frecuenciaCardiaca: string = '';
  temperatura: string = '';
  peso: string = '';
  glucosa: string = '';
  saturacionOxigeno: string = '';

  // Recordatorios
  recordatorios: any[] = [];
  nuevoRecordatorioTitulo: string = '';
  nuevoRecordatorioDescripcion: string = '';

  // Estado de guardado para feedback visual
  isSaving: boolean = false;

  constructor(
    private healthService: HealthService,
    private authService: AuthService,
  private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDoctorData();
    }
  }

  async loadDoctorData() {
    this.isLoading = true;
    console.log('🏥 Iniciando carga de datos del doctor...');

    try {
      // Obtener el doctor autenticado
      const user = this.authService.getCurrentUser();
      
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryUser = this.authService.getCurrentUser();
        if (!retryUser) {
          console.error('❌ No hay doctor autenticado');
          alert('No se pudo cargar la sesión del doctor');
          return;
        }
        this.doctorId = retryUser.id;
        this.doctorName = retryUser.nombre_completo;
      } else {
        this.doctorId = user.id;
        this.doctorName = user.nombre_completo;
      }

      console.log('👨‍⚕️ Doctor cargado:', this.doctorName, 'ID:', this.doctorId);

      // Cargar lista de pacientes
      await this.cargarPacientes();
      
      console.log('🏁 Carga completada exitosamente');

    } catch (error) {
      console.error('❌ Error cargando datos del doctor:', error);
      alert('Error al cargar los datos: ' + (error as any)?.message);
    } finally {
      console.log('🔚 Finally block - Cambiando isLoading a false');
      this.isLoading = false;
      console.log('✅ isLoading ahora es:', this.isLoading);
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      console.log('🔄 Change detection forzada');
    }
  }

  async cargarPacientes() {
    console.log('📋 Cargando pacientes del doctor...');
    try {
      const data = await this.healthService.getPacientesDeDoctor(this.doctorId);
      console.log('📦 Datos recibidos:', data);
      
      // Transformar datos para el formato esperado
      this.pacientes = data
        .filter((item: any) => item.paciente) // Filtrar items sin paciente
        .map((item: any) => ({
          id: item.paciente.id,
          nombre: item.paciente.nombre_completo,
          email: item.paciente.email || '',
          telefono: item.paciente.telefono || '',
          fechaNacimiento: item.paciente.fecha_nacimiento || '',
          fechaAsignacion: item.fecha_asignacion,
          ultimaConsulta: this.formatearFecha(item.fecha_asignacion)
        }));

      console.log('✅ Pacientes cargados:', this.pacientes.length);
      console.log('👥 Lista de pacientes:', this.pacientes);
    } catch (error) {
      console.error('❌ Error cargando pacientes:', error);
      this.pacientes = [];
    }
  }

  async seleccionarPaciente(paciente: any) {
    console.log('🔍 Seleccionando paciente:', paciente.nombre);
    this.pacienteSeleccionado = paciente;
    
    // Cargar datos del paciente
    await this.cargarDatosPaciente(paciente.id);
  }

  async cargarDatosPaciente(pacienteId: string) {
    try {
      console.log('📋 Cargando datos del paciente:', pacienteId);
      const datos = await this.healthService.getDatosPacienteParaDoctor(pacienteId);
      
      console.log('📦 Datos recibidos:', datos);
      
      if (datos) {
        // Cargar signos vitales
        const signos = datos.signosVitales;
        this.presionArterial = signos.presion_arterial || '';
        this.frecuenciaCardiaca = signos.frecuencia_cardiaca || '';
        this.temperatura = signos.temperatura || '';
        this.peso = signos.peso || '';
        this.glucosa = signos.glucosa || '';
        this.saturacionOxigeno = signos.saturacion_oxigeno || '';

        // Cargar recordatorios
        this.recordatorios = datos.recordatorios;
        console.log('📌 Recordatorios cargados:', this.recordatorios.length);

        console.log('✅ Datos del paciente cargados');
      }
    } catch (error) {
      console.error('❌ Error cargando datos del paciente:', error);
    }
  }

  async actualizarSignosVitales() {
    if (!this.pacienteSeleccionado) {
      alert('Por favor selecciona un paciente primero');
      return;
    }

    console.log('💾 Actualizando signos vitales del paciente:', this.pacienteSeleccionado.id);
    this.isSaving = true;

    try {
      const success = await this.healthService.updateSignosVitales(
        this.pacienteSeleccionado.id,
        {
          presion_arterial: this.presionArterial,
          frecuencia_cardiaca: this.frecuenciaCardiaca,
          temperatura: this.temperatura,
          peso: this.peso,
          glucosa: this.glucosa,
          saturacion_oxigeno: this.saturacionOxigeno
        }
      );

      if (success) {
        alert('✅ Signos vitales actualizados correctamente');
      } else {
        alert('❌ Error al actualizar los signos vitales');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al actualizar los signos vitales');
    } finally {
      this.isSaving = false;
    }
  }

  async agregarRecordatorio() {
    if (!this.pacienteSeleccionado) {
      alert('Por favor selecciona un paciente primero');
      return;
    }

    if (!this.nuevoRecordatorioTitulo || !this.nuevoRecordatorioDescripcion) {
      alert('Por favor completa todos los campos del recordatorio');
      return;
    }

    console.log('➕ Agregando recordatorio para:', this.pacienteSeleccionado.id);
    this.isSaving = true;

    try {
      const success = await this.healthService.crearRecordatorioParaPaciente(
        this.pacienteSeleccionado.id,
        this.nuevoRecordatorioTitulo,
        this.nuevoRecordatorioDescripcion
      );

      if (success) {
        // Recargar recordatorios
        await this.cargarDatosPaciente(this.pacienteSeleccionado.id);
        
        // Limpiar campos
        this.nuevoRecordatorioTitulo = '';
        this.nuevoRecordatorioDescripcion = '';

        alert('✅ Recordatorio agregado correctamente');
      } else {
        alert('❌ Error al agregar el recordatorio');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al agregar el recordatorio');
    } finally {
      this.isSaving = false;
    }
  }

  async eliminarRecordatorio(recordatorio: any) {
    if (!confirm('¿Estás seguro de eliminar este recordatorio?')) {
      return;
    }

    console.log('🗑️ Eliminando recordatorio:', recordatorio.id);

    try {
      const success = await this.healthService.deleteRecordatorio(
        recordatorio.id,
        this.pacienteSeleccionado.id
      );

      if (success) {
        // Recargar recordatorios
        await this.cargarDatosPaciente(this.pacienteSeleccionado.id);
        alert('✅ Recordatorio eliminado correctamente');
      } else {
        alert('❌ Error al eliminar el recordatorio');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al eliminar el recordatorio');
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return date.toLocaleDateString('es-ES');
  }

  get pacientesFiltrados() {
    if (!this.busqueda) {
      return this.pacientes;
    }

    return this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      p.email?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
  cargarPacientesAsignadosADoctor(idDoctor: number) {
    this.supabaseService.usuariosAsociadosADoctor(idDoctor.toString())
      .then((usuarios: any[]) => { // 👈 tipo explícito
        this.pacientes = usuarios;
      });
  }

  // Método para limpiar formulario de signos vitales
  limpiarSignosVitales() {
    this.presionArterial = '';
    this.frecuenciaCardiaca = '';
    this.temperatura = '';
    this.peso = '';
    this.glucosa = '';
    this.saturacionOxigeno = '';
  }

  // Método para limpiar formulario de recordatorio
  limpiarFormularioRecordatorio() {
    this.nuevoRecordatorioTitulo = '';
    this.nuevoRecordatorioDescripcion = '';
  }

}
