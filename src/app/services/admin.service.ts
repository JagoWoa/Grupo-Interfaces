import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  // Obtener todos los usuarios
  async obtenerUsuarios(): Promise<Usuario[]> {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data as Usuario[];
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(usuarioId: string): Promise<Usuario> {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .single();

    if (error) throw error;
    return data as Usuario;
  }

  // Cambiar rol de usuario
  async cambiarRol(usuarioId: string, nuevoRol: Usuario['rol']): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId);

    if (error) throw error;
  }

  // Activar/Desactivar usuario
  async toggleEstadoUsuario(usuarioId: string, activo: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ activo })
      .eq('id', usuarioId);

    if (error) throw error;
  }

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    // Total de usuarios
    const { count: totalUsuarios } = await this.supabase.client
      .from('usuarios')
      .select('*', { count: 'exact', head: true });

    // Total de mensajes
    const { count: totalMensajes } = await this.supabase.client
      .from('mensajes')
      .select('*', { count: 'exact', head: true });

    // Total de consultas
    const { count: totalConsultas } = await this.supabase.client
      .from('consultas')
      .select('*', { count: 'exact', head: true });

    // Usuarios por rol
    const { data: usuariosPorRol } = await this.supabase.client
      .from('usuarios')
      .select('rol');

    const rolesCount = usuariosPorRol?.reduce((acc: any, user: any) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsuarios: totalUsuarios || 0,
      totalMensajes: totalMensajes || 0,
      totalConsultas: totalConsultas || 0,
      usuariosPorRol: rolesCount || {}
    };
  }

  // Obtener consultas recientes
  async obtenerConsultasRecientes(limite: number = 10) {
    const { data, error } = await this.supabase.client
      .from('consultas')
      .select(`
        *,
        paciente:usuarios!consultas_paciente_id_fkey(nombre, correo),
        medico:usuarios!consultas_medico_id_fkey(nombre, correo)
      `)
      .order('fecha_solicitud', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data;
  }

  // Eliminar usuario (solo admin)
  async eliminarUsuario(usuarioId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .delete()
      .eq('id', usuarioId);

    if (error) throw error;
  }
}
