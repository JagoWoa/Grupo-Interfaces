import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Doctor {
  id: string;
  nombre_completo: string;
  titulo: string;
  especialidad: string;
  email: string;
  telefono?: string;
  disponible: boolean;
}

export interface Paciente {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  activo: boolean;
}

export interface PacienteDoctor {
  id?: number;
  paciente_id: string;
  doctor_id: string;
  fecha_asignacion?: string;
  activo: boolean;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Obtener el doctor asignado al paciente actual
   */
  async getDoctorAsignado(): Promise<{ success: boolean; data?: Doctor; error?: string }> {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener la asignación activa
      const { data: asignacion, error: asignacionError } = await this.supabase.client
        .from('pacientes_doctor')
        .select('doctor_id')
        .eq('paciente_id', userId)
        .eq('activo', true)
        .single();

      if (asignacionError) {
        if (asignacionError.code === 'PGRST116') {
          return { success: true, data: undefined }; // No tiene doctor asignado
        }
        throw asignacionError;
      }

      // Obtener información del doctor
      const { data: doctor, error: doctorError } = await this.supabase.client
        .from('v_doctores_completo')
        .select('*')
        .eq('id', asignacion.doctor_id)
        .single();

      if (doctorError) throw doctorError;

      return {
        success: true,
        data: {
          id: doctor.id,
          nombre_completo: doctor.nombre_completo,
          titulo: doctor.titulo,
          especialidad: doctor.especialidad,
          email: doctor.email,
          telefono: doctor.telefono,
          disponible: doctor.disponible
        }
      };
    } catch (error: any) {
      console.error('Error al obtener doctor asignado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener lista de pacientes del doctor actual
   */
  async getMisPacientes(): Promise<{ success: boolean; data?: Paciente[]; error?: string }> {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase.client
        .from('v_pacientes_con_doctor')
        .select('*')
        .eq('doctor_id', userId)
        .eq('asignacion_activa', true);

      if (error) throw error;

      const pacientes: Paciente[] = data.map(p => ({
        id: p.paciente_id,
        nombre_completo: p.paciente_nombre,
        email: p.paciente_email,
        telefono: p.paciente_telefono,
        fecha_nacimiento: p.fecha_nacimiento,
        activo: p.paciente_activo
      }));

      return { success: true, data: pacientes };
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los doctores disponibles
   */
  async getDoctoresDisponibles(): Promise<{ success: boolean; data?: Doctor[]; error?: string }> {
    try {
      const { data, error } = await this.supabase.client
        .from('v_doctores_completo')
        .select('*')
        .eq('disponible', true)
        .eq('activo', true);

      if (error) throw error;

      const doctores: Doctor[] = data.map(d => ({
        id: d.id,
        nombre_completo: d.nombre_completo,
        titulo: d.titulo,
        especialidad: d.especialidad,
        email: d.email,
        telefono: d.telefono,
        disponible: d.disponible
      }));

      return { success: true, data: doctores };
    } catch (error: any) {
      console.error('Error al obtener doctores disponibles:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Asignar un doctor a un paciente (solo admin)
   */
  async asignarDoctor(pacienteId: string, doctorId: string, notas?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Desactivar asignaciones anteriores
      await this.supabase.client
        .from('pacientes_doctor')
        .update({ activo: false })
        .eq('paciente_id', pacienteId);

      // Crear nueva asignación
      const { error } = await this.supabase.client
        .from('pacientes_doctor')
        .insert({
          paciente_id: pacienteId,
          doctor_id: doctorId,
          activo: true,
          notas: notas || null
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error al asignar doctor:', error);
      return { success: false, error: error.message };
    }
  }
}
