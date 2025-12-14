
import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';
import { ChatService } from '..//../../../core/services/chat.service';

import { HealthService, SignosVitales, Recordatorio } from '../../../../core/services/health.service';
import { AuthService } from '../../../../core/services/auth.service';

import { SignosVitalesService } from '../../../../core/services/signos-vitales.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';
import { AutoSpeakDirective } from '../../../../core/directives/auto-speak.directive';

@Component({
  selector: 'app-usuarioAnciano',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer, Chat, TranslatePipe, SpeakOnHoverDirective, AutoSpeakDirective],
  templateUrl: './usuarioAnciano.html',
  styleUrls: ['./usuarioAnciano.css'],
})

export class UsuarioAnciano implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  chatExpanded = false;
  currentDate = new Date();
  isLoading = true;
  pacienteId: string = '';
  userName: string = '';
 
  // Estado de signos vitales y formulario
  signos: SignosVitales | null = null;
  isEditing = false;
  form: { presion_arterial: string; frecuencia_cardiaca: string; temperatura: string; peso: string } = {
    presion_arterial: '',
    frecuencia_cardiaca: '',
    temperatura: '',
    peso: ''
  };


  // Signos vitales
  signosVitales: SignosVitales = {
    adulto_mayor_id: '',
    presion_arterial: '',
    frecuencia_cardiaca: '',
    temperatura: '',
    peso: '',
    glucosa: '',
    saturacion_oxigeno: ''
  };

  // Recordatorios
  recordatorios: Recordatorio[] = [];

  // Doctor asignado
  doctorAsignado: any = null;

  // Detalles del paciente
  detallesPaciente = {
    tipo_sangre: 'A+',
    altura: 170,
    peso: 70
  };

  // Modo de edición
  editingVitalSigns = false;

  // Doctores disponibles y asignación
  doctoresDisponibles: any[] = [];
  showDoctorSelector = false;
  isLoadingDoctors = false;

  constructor(
    private chatService: ChatService,
    private healthService: HealthService,
    private authService: AuthService,
    private signosVitalesService: SignosVitalesService
  ) {}

  /**
   * Verifica si el paciente tiene signos vitales registrados
   */
  tieneSignosVitales(): boolean {
    return !!(
      this.signosVitales.presion_arterial ||
      this.signosVitales.frecuencia_cardiaca ||
      this.signosVitales.temperatura ||
      this.signosVitales.peso
    );
  }

  ngOnInit() {
    // Solo ejecutar en el navegador, no en el servidor (SSR)
    if (isPlatformBrowser(this.platformId)) {
      console.log('🌐 Componente inicializado en el navegador');
      this.loadUserData();
    } else {
      console.log('🖥️ Componente en servidor (SSR), omitiendo carga de datos');
    }
  }

  async loadUserData() {
    this.isLoading = true;
    console.log('🚀 Iniciando carga de datos...');
    
    try {
      // Esperar a que el AuthService cargue el usuario con timeout
      const user = await this.waitForUser();
      
      if (!user) {
        console.error('❌ No hay usuario autenticado después de esperar');
        alert('No se pudo cargar el usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('👤 Usuario cargado:', user.nombre_completo, 'ID:', user.id);

      this.pacienteId = user.id;
      this.userName = user.nombre_completo;
      this.signosVitales.adulto_mayor_id = user.id;

      console.log('📦 Cargando todos los datos en paralelo...');

      // Crear promesas con timeout de 5 segundos cada una
      const timeoutMs = 5000;
      
      const [signosResult, recordatoriosResult, doctorResult, detallesResult] = await Promise.allSettled([
        this.withTimeout(this.healthService.getSignosVitales(this.pacienteId), timeoutMs, 'signos vitales'),
        this.withTimeout(this.healthService.getRecordatorios(this.pacienteId), timeoutMs, 'recordatorios'),
        this.withTimeout(this.healthService.getDoctorAsignado(this.pacienteId), timeoutMs, 'doctor'),
        this.withTimeout(this.healthService.getDetallesPaciente(this.pacienteId), timeoutMs, 'detalles')
      ]);

      // Procesar signos vitales
      if (signosResult.status === 'fulfilled' && signosResult.value) {
        this.signosVitales = { ...this.signosVitales, ...signosResult.value };
        console.log('✅ Signos vitales cargados:', signosResult.value);
      } else {
        console.log('ℹ️ No hay signos vitales registrados o error:', 
          signosResult.status === 'rejected' ? signosResult.reason : 'sin datos');
      }

      // Procesar recordatorios
      if (recordatoriosResult.status === 'fulfilled') {
        this.recordatorios = recordatoriosResult.value || [];
        console.log('✅ Recordatorios cargados:', this.recordatorios.length);
      } else {
        console.error('⚠️ Error cargando recordatorios:', recordatoriosResult.reason);
        this.recordatorios = [];
      }

      // Procesar doctor asignado
      if (doctorResult.status === 'fulfilled') {
        this.doctorAsignado = doctorResult.value;
        console.log('✅ Doctor asignado:', this.doctorAsignado);
      } else {
        console.error('⚠️ Error cargando doctor:', doctorResult.reason);
        this.doctorAsignado = null;
      }

      // Procesar detalles del paciente
      if (detallesResult.status === 'fulfilled' && detallesResult.value) {
        this.detallesPaciente = {
          tipo_sangre: detallesResult.value.tipo_sangre || 'A+',
          altura: detallesResult.value.altura || 170,
          peso: detallesResult.value.peso || 70
        };
        console.log('✅ Detalles del paciente cargados');
      } else {
        console.log('ℹ️ Usando detalles por defecto');
      }

      console.log('✅✅✅ Datos del paciente cargados completamente');
    } catch (error) {
      console.error('❌❌❌ Error FATAL cargando datos:', error);
      alert('Error al cargar los datos: ' + (error as any)?.message || error);
    } finally {
      console.log('🏁 Finalizando carga, isLoading = false');
      this.isLoading = false;
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      console.log('🔄 Change detection forzada en usuarioAnciano');
    }
  }

  // Función auxiliar para esperar al usuario con reintentos
  private async waitForUser(): Promise<any> {
    let user = this.authService.getCurrentUser();
    
    if (user) {
      return user;
    }

    // Reintentar hasta 3 veces con delays crecientes
    const delays = [500, 1000, 1500];
    for (const delay of delays) {
      console.log(`⏳ Esperando usuario (${delay}ms)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      user = this.authService.getCurrentUser();
      if (user) {
        return user;
      }
    }

    return null;
  }

  // Función auxiliar para agregar timeout a las promesas
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, name: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout en ${name} después de ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  toggleEditVitalSigns() {
    this.editingVitalSigns = !this.editingVitalSigns;
  }

  async saveVitalSigns() {
    const success = await this.healthService.updateSignosVitales(
      this.pacienteId,
      this.signosVitales
    );

    if (success) {
      this.editingVitalSigns = false;
      alert('✅ Signos vitales actualizados correctamente');
    } else {
      alert('❌ Error al actualizar signos vitales');
    }
  }

  cancelEditVitalSigns() {
    this.editingVitalSigns = false;
    // Recargar datos originales
    this.loadUserData();
  }

  async toggleRecordatorio(recordatorio: Recordatorio) {
    if (recordatorio.id) {
      await this.healthService.toggleRecordatorioCompletado(
        recordatorio.id,
        !recordatorio.completado,
        this.pacienteId
      );
      // Recargar recordatorios
      this.recordatorios = await this.healthService.getRecordatorios(this.pacienteId);
    }
  }

  async deleteRecordatorio(recordatorio: Recordatorio) {
    if (recordatorio.id && confirm('¿Estás seguro de eliminar este recordatorio?')) {
      await this.healthService.deleteRecordatorio(recordatorio.id, this.pacienteId);
      // Recargar recordatorios
      this.recordatorios = await this.healthService.getRecordatorios(this.pacienteId);
    }
  }

  getVitalSignIcon(tipo: string): string {
    const icons: any = {
      presion: 'fas fa-heartbeat',
      frecuencia: 'fas fa-heart',
      temperatura: 'fas fa-thermometer-half',
      glucosa: 'fas fa-tint'
    };
    return icons[tipo] || 'fas fa-info-circle';
  }
  
  toggleChat(): void {
    this.chatExpanded = !this.chatExpanded;
    this.chatService.toggleChat();
  }

  obtenerSignosVitales(): void {
    this.signosVitalesService.getSignosVitales().then(response => {
      if (response.success && response.data) {
        console.log('Signos vitales obtenidos:', response.data);
        //this.signos = response.data;
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

  // ==================== MÉTODOS PARA ASIGNACIÓN DE DOCTORES ====================

  /**
   * Muestra/oculta el selector de doctores
   */
  toggleDoctorSelector() {
    this.showDoctorSelector = !this.showDoctorSelector;
    if (this.showDoctorSelector && this.doctoresDisponibles.length === 0) {
      this.cargarDoctoresDisponibles();
    }
  }

  /**
   * Carga la lista de doctores disponibles
   */
  async cargarDoctoresDisponibles() {
    this.isLoadingDoctors = true;
    try {
      this.doctoresDisponibles = await this.healthService.getDoctoresDisponibles();
      console.log('✅ Doctores disponibles cargados:', this.doctoresDisponibles.length);
    } catch (error) {
      console.error('❌ Error al cargar doctores disponibles:', error);
      alert('Error al cargar la lista de doctores');
    } finally {
      this.isLoadingDoctors = false;
    }
  }

  /**
   * Asigna un doctor al paciente
   */
  async asignarDoctorAlPaciente(doctorId: string, doctorNombre: string) {
    if (!confirm(`¿Deseas asignar a ${doctorNombre} como tu doctor?`)) {
      return;
    }

    try {
      const success = await this.healthService.asignarDoctor(this.pacienteId, doctorId);
      
      if (success) {
        alert(`✅ Doctor ${doctorNombre} asignado correctamente`);
        // Recargar doctor asignado
        this.doctorAsignado = await this.healthService.getDoctorAsignado(this.pacienteId);
        this.showDoctorSelector = false;
      } else {
        alert('❌ Error al asignar el doctor');
      }
    } catch (error) {
      console.error('❌ Error al asignar doctor:', error);
      alert('Error al asignar el doctor');
    }
  }

  /**
   * Desasigna el doctor actual
   */
  async desasignarDoctorActual() {
    if (!this.doctorAsignado) {
      return;
    }

    if (!confirm(`¿Deseas desasignar a tu doctor actual?`)) {
      return;
    }

    try {
      const success = await this.healthService.desasignarDoctor(this.pacienteId);
      
      if (success) {
        alert('✅ Doctor desasignado correctamente');
        this.doctorAsignado = null;
      } else {
        alert('❌ Error al desasignar el doctor');
      }
    } catch (error) {
      console.error('❌ Error al desasignar doctor:', error);
      alert('Error al desasignar el doctor');
    }
  }
}
