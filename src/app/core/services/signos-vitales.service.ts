import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface SignosVitales {
  id?: string;
  adulto_mayor_id: string;
  presion_arterial?: string;
  frecuencia_cardiaca?: string;
  temperatura?: string;
  peso?: string;
  ultima_medicion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignosVitalesService {

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Obtener signos vitales del usuario actual
   */
  async getSignosVitales(): Promise<{ success: boolean; data?: SignosVitales; error?: string }> {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase.client
        .from('signos_vitales')
        .select('*')
        .eq('adulto_mayor_id', userId)
        .order('ultima_medicion', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return { success: true, data: data || undefined };
    } catch (error: any) {
      console.error('Error al obtener signos vitales:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener historial de signos vitales
   */
  async getHistorialSignosVitales(limit: number = 10): Promise<{ success: boolean; data?: SignosVitales[]; error?: string }> {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase.client
        .from('signos_vitales')
        .select('*')
        .eq('adulto_mayor_id', userId)
        .order('ultima_medicion', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error al obtener historial de signos vitales:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear o actualizar signos vitales
   */
  async guardarSignosVitales(signos: Omit<SignosVitales, 'id' | 'adulto_mayor_id'>): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await this.supabase.client
        .from('signos_vitales')
        .insert({
          adulto_mayor_id: userId,
          ...signos,
          ultima_medicion: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error al guardar signos vitales:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener signos vitales de un paciente específico (para doctores)
   */
  async getSignosVitalesPaciente(pacienteId: string): Promise<{ success: boolean; data?: SignosVitales; error?: string }> {
    try {
      const { data, error } = await this.supabase.client
        .from('signos_vitales')
        .select('*')
        .eq('adulto_mayor_id', pacienteId)
        .order('ultima_medicion', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, data: data || undefined };
    } catch (error: any) {
      console.error('Error al obtener signos vitales del paciente:', error);
      return { success: false, error: error.message };
    }
  }
}
