import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

/**
 * Servicio para gestionar el correo del cuidador/familiar en la tabla usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class FamiliaresService {

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Agregar un familiar/cuidador por correo electrónico
   * Actualiza el campo email_cuidador en la tabla usuarios
   */
  async agregarFamiliarPorEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      if (currentUser.rol !== 'adulto_mayor') {
        return {
          success: false,
          error: 'Solo los adultos mayores pueden agregar familiares'
        };
      }

      // Verificar que el email no esté vacío
      if (!email || !email.trim()) {
        return {
          success: false,
          error: 'El correo electrónico es requerido'
        };
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          error: 'El correo electrónico no es válido'
        };
      }

      // Verificar que no sea el mismo email del usuario
      if (email.trim().toLowerCase() === currentUser.email?.toLowerCase()) {
        return {
          success: false,
          error: 'No puedes agregar tu propio correo como cuidador'
        };
      }

      // Actualizar el campo email_cuidador en la tabla usuarios
      const { error } = await this.supabase.client
        .from('usuarios')
        .update({
          email_cuidador: email.trim().toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error al actualizar email_cuidador:', error);
        
        // Manejo de errores específicos
        if (error.message?.includes('email_cuidador')) {
          return {
            success: false,
            error: 'El formato del correo electrónico no es válido'
          };
        }
        
        throw error;
      }

      // Recargar el perfil del usuario para obtener el email_cuidador actualizado
      await this.authService.getUserProfile();

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error al agregar familiar:', error);
      return {
        success: false,
        error: error.message || 'Error al agregar familiar'
      };
    }
  }

  /**
   * Obtener el email del cuidador del adulto mayor actual
   */
  async getEmailCuidador(): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      if (currentUser.rol !== 'adulto_mayor') {
        return {
          success: false,
          error: 'Solo los adultos mayores pueden ver su cuidador'
        };
      }

      // Obtener el email_cuidador desde la base de datos
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('email_cuidador')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        email: data?.email_cuidador || null
      };
    } catch (error: any) {
      console.error('Error al obtener email del cuidador:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener email del cuidador'
      };
    }
  }

  /**
   * Eliminar el email del cuidador (establecerlo en null)
   */
  async eliminarCuidador(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      if (currentUser.rol !== 'adulto_mayor') {
        return {
          success: false,
          error: 'Solo los adultos mayores pueden eliminar su cuidador'
        };
      }

      // Actualizar el campo email_cuidador a null
      const { error } = await this.supabase.client
        .from('usuarios')
        .update({
          email_cuidador: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      // Recargar el perfil del usuario
      await this.authService.getUserProfile();

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error al eliminar cuidador:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar cuidador'
      };
    }
  }
}

