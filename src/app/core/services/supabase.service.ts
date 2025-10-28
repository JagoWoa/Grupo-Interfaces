import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }

  async usuariosAsociadosADoctor(doctorId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('doctor_id', doctorId); // Usa el ID recibido por parámetro

    if (error) {
      console.error('Error obteniendo usuarios asociados:', error);
      return [];
    }

    console.log('Usuarios asociados:', data);
    return data || [];
  }
}
