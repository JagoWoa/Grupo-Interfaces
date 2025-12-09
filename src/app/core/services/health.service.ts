import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SignosVitales {
  id?: string;
  adulto_mayor_id: string;
  presion_arterial: string;
  frecuencia_cardiaca: string;
  temperatura: string;
  peso: string;
  glucosa?: string; // Campo adicional
  saturacion_oxigeno?: string; // Campo adicional
  ultima_medicion?: Date;
}

export interface Recordatorio {
  id?: string;
  adulto_mayor_id: string;
  titulo: string;
  subtitulo?: string;
  fecha_creacion?: Date;
  fecha_recordatorio?: Date;
  completado: boolean;
  tipo?: 'medicamento' | 'cita' | 'otro';
}

export interface DetallesPaciente {
  tipo_sangre?: string;
  altura?: number; // en cm
  peso?: number; // en kg
  alergias?: string[];
  condiciones_medicas?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private signosVitalesSubject = new BehaviorSubject<SignosVitales | null>(null);
  public signosVitales$ = this.signosVitalesSubject.asObservable();

  private recordatoriosSubject = new BehaviorSubject<Recordatorio[]>([]);
  public recordatorios$ = this.recordatoriosSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  // ==================== SIGNOS VITALES ====================

  async getSignosVitales(pacienteId: string): Promise<SignosVitales | null> {
    console.log('🔍 HealthService.getSignosVitales - Iniciando consulta para:', pacienteId);
    try {
      const { data, error } = await this.supabase.client
        .from('signos_vitales')
        .select('*')
        .eq('adulto_mayor_id', pacienteId)
        .order('ultima_medicion', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ HealthService.getSignosVitales - Error de Supabase:', error);
        throw error;
      }

      console.log('✅ HealthService.getSignosVitales - Datos obtenidos:', data);
      this.signosVitalesSubject.next(data);
      return data;
    } catch (error) {
      console.error('❌ HealthService.getSignosVitales - Error catch:', error);
      return null;
    }
  }

  async updateSignosVitales(pacienteId: string, signos: Partial<SignosVitales>): Promise<boolean> {
    console.log('💾 HealthService.updateSignosVitales - Iniciando actualización');
    console.log('📋 Paciente ID:', pacienteId);
    console.log('📊 Signos a guardar:', signos);
    
    try {
      // Verificar si ya existe un registro
      const { data: existing, error: selectError } = await this.supabase.client
        .from('signos_vitales')
        .select('id')
        .eq('adulto_mayor_id', pacienteId)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Error al buscar registro existente:', selectError);
        throw selectError;
      }

      console.log('🔍 Registro existente:', existing);

      if (existing) {
        // Actualizar registro existente
        console.log('📝 Actualizando registro existente con ID:', existing.id);
        const { data: updateData, error: updateError } = await this.supabase.client
          .from('signos_vitales')
          .update({
            ...signos,
            ultima_medicion: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();

        if (updateError) {
          console.error('❌ Error al actualizar signos vitales:', updateError);
          throw updateError;
        }
        console.log('✅ Actualización exitosa:', updateData);
      } else {
        // Crear nuevo registro
        console.log('➕ Creando nuevo registro de signos vitales');
        const { data: insertData, error: insertError } = await this.supabase.client
          .from('signos_vitales')
          .insert({
            adulto_mayor_id: pacienteId,
            ...signos,
            ultima_medicion: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('❌ Error al insertar signos vitales:', insertError);
          throw insertError;
        }
        console.log('✅ Inserción exitosa:', insertData);
      }

      // Recargar datos
      await this.getSignosVitales(pacienteId);
      return true;
    } catch (error: any) {
      console.error('❌ Error al actualizar signos vitales:', error);
      console.error('📌 Mensaje de error:', error?.message);
      console.error('📌 Código de error:', error?.code);
      console.error('📌 Detalles:', error?.details);
      return false;
    }
  }

  // ==================== RECORDATORIOS ====================

  async getRecordatorios(pacienteId: string): Promise<Recordatorio[]> {
    console.log('🔍 HealthService.getRecordatorios - Iniciando consulta para:', pacienteId);
    try {
      const { data, error } = await this.supabase.client
        .from('recordatorio')
        .select('*')
        .eq('adulto_mayor_id', pacienteId)
        .order('fecha_recordatorio', { ascending: true });

      if (error) {
        console.error('❌ HealthService.getRecordatorios - Error de Supabase:', error);
        throw error;
      }

      const recordatorios = data || [];
      console.log('✅ HealthService.getRecordatorios - Datos obtenidos:', recordatorios.length, 'recordatorios');
      this.recordatoriosSubject.next(recordatorios);
      return recordatorios;
    } catch (error) {
      console.error('❌ HealthService.getRecordatorios - Error catch:', error);
      return [];
    }
  }

  async createRecordatorio(recordatorio: Recordatorio): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .insert(recordatorio);

      if (error) throw error;

      // Recargar recordatorios
      await this.getRecordatorios(recordatorio.adulto_mayor_id);
      return true;
    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      return false;
    }
  }

  async updateRecordatorio(id: string, updates: Partial<Recordatorio>): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Recargar recordatorios
      const recordatorios = this.recordatoriosSubject.value;
      const recordatorio = recordatorios.find(r => r.id === id);
      if (recordatorio) {
        await this.getRecordatorios(recordatorio.adulto_mayor_id);
      }
      return true;
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
      return false;
    }
  }

  async deleteRecordatorio(id: string, pacienteId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Recargar recordatorios
      await this.getRecordatorios(pacienteId);
      return true;
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
      return false;
    }
  }

  async toggleRecordatorioCompletado(id: string, completado: boolean, pacienteId: string): Promise<boolean> {
    return this.updateRecordatorio(id, { completado });
  }

  // ==================== DETALLES DEL PACIENTE ====================
  // Estos podrían guardarse en una nueva tabla o en campos adicionales de usuarios
  
  async getDetallesPaciente(pacienteId: string): Promise<DetallesPaciente | null> {
    // Por ahora, devolver datos de ejemplo
    // Más adelante se puede crear una tabla específica para esto
    return {
      tipo_sangre: 'A+',
      altura: 170,
      peso: 70,
      alergias: ['Penicilina'],
      condiciones_medicas: ['Hipertensión']
    };
  }

  // ==================== DOCTOR ASIGNADO ====================

  async getDoctorAsignado(pacienteId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.client
        .from('pacientes_doctor')
        .select(`
          *,
          doctor:usuarios!pacientes_doctor_doctor_id_fkey(
            id,
            nombre_completo,
            email,
            telefono
          )
        `)
        .eq('paciente_id', pacienteId)
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener doctor asignado:', error);
      return null;
    }
  }

  // ==================== MÉTODOS PARA DOCTORES ====================

  /**
   * Obtiene la lista de pacientes asignados a un doctor
   */
  async getPacientesDeDoctor(doctorId: string): Promise<any[]> {
    console.log('🔍 HealthService.getPacientesDeDoctor - Consultando para doctor:', doctorId);
    try {
      const { data, error } = await this.supabase.client
        .from('pacientes_doctor')
        .select(`
          id,
          fecha_asignacion,
          activo,
          notas,
          paciente:usuarios!pacientes_doctor_paciente_id_fkey(
            id,
            nombre_completo,
            email,
            telefono,
            fecha_nacimiento
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('activo', true)
        .order('fecha_asignacion', { ascending: false });

      if (error) {
        console.error('❌ Error al obtener pacientes del doctor:', error);
        throw error;
      }

      console.log('✅ Pacientes obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getPacientesDeDoctor:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los datos de un paciente (para que el doctor lo vea)
   */
  async getDatosPacienteParaDoctor(pacienteId: string): Promise<any> {
    console.log('🔍 HealthService.getDatosPacienteParaDoctor - Paciente:', pacienteId);
    try {
      // Obtener signos vitales, recordatorios y datos del paciente en paralelo
      const [signosVitales, recordatorios, pacienteInfo] = await Promise.all([
        this.getSignosVitales(pacienteId),
        this.getRecordatorios(pacienteId),
        this.supabase.client
          .from('usuarios')
          .select('*')
          .eq('id', pacienteId)
          .single()
      ]);

      console.log('📊 Signos vitales obtenidos:', signosVitales);
      console.log('📌 Recordatorios obtenidos:', recordatorios?.length || 0);

      return {
        paciente: pacienteInfo.data,
        signosVitales: signosVitales || {
          presion_arterial: '',
          frecuencia_cardiaca: '',
          temperatura: '',
          peso: '',
          glucosa: '',
          saturacion_oxigeno: ''
        },
        recordatorios: recordatorios || []
      };
    } catch (error) {
      console.error('❌ Error al obtener datos del paciente:', error);
      return null;
    }
  }

  /**
   * Crea un recordatorio para un paciente (usado por el doctor)
   */
  async crearRecordatorioParaPaciente(
    pacienteId: string,
    titulo: string,
    subtitulo: string,
    fechaRecordatorio?: Date
  ): Promise<boolean> {
    console.log('🔍 HealthService.crearRecordatorioParaPaciente - Creando para:', pacienteId);
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .insert({
          adulto_mayor_id: pacienteId,
          titulo,
          subtitulo,
          fecha_recordatorio: fechaRecordatorio || new Date(),
          completado: false
        });

      if (error) {
        console.error('❌ Error al crear recordatorio:', error);
        throw error;
      }

      console.log('✅ Recordatorio creado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en crearRecordatorioParaPaciente:', error);
      return false;
    }
  }
}
