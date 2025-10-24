import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol: 'adulto_mayor' | 'doctor' | 'admin';
  created_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre_completo?: string; // Opcional: nombre completo directo
  nombre?: string; // Opcional: nombre separado
  apellidos?: string; // Opcional: apellidos separados
  telefono?: string;
  fecha_nacimiento?: string;
  rol?: 'adulto_mayor' | 'doctor';
}

export interface RegisterDoctorData {
  email: string;
  password: string;
  nombre_completo: string;
  titulo: string;
  especialidad: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Verificar sesión al iniciar
    this.checkSession();
  }

  /**
   * Verificar si hay una sesión activa
   */
  private async checkSession() {
    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    }
  }

  /**
   * Cargar perfil del usuario desde la tabla usuarios
   */
  private async loadUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        this.currentUserSubject.next(data as User);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  }

  /**
   * Login con email y password
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  }

  /**
   * Registro de nuevo usuario (Adulto Mayor)
   */
  async register(userData: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      // Determinar nombre_completo: usar el que viene o componer desde nombre + apellidos
      const nombreCompleto = userData.nombre_completo 
        || `${userData.nombre || ''} ${userData.apellidos || ''}`.trim();

      if (!nombreCompleto) {
        throw new Error('Debe proporcionar nombre_completo o nombre y apellidos');
      }

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            telefono: userData.telefono,
            fecha_nacimiento: userData.fecha_nacimiento,
            rol: userData.rol || 'adulto_mayor'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear perfil en tabla usuarios
      const { error: profileError } = await this.supabase.client
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre_completo: nombreCompleto,
          telefono: userData.telefono || null,
          fecha_nacimiento: userData.fecha_nacimiento || null,
          rol: userData.rol || 'adulto_mayor'
        });

      if (profileError) throw profileError;

      return { success: true };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.message || 'Error al registrar usuario' 
      };
    }
  }

  /**
   * Registro de doctor
   */
  async registerDoctor(userData: RegisterDoctorData): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nombre_completo: userData.nombre_completo,
            telefono: userData.telefono,
            rol: 'doctor',
            titulo: userData.titulo,
            especialidad: userData.especialidad
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el doctor');
      }

      // 2. Crear perfil en tabla usuarios
      const { error: profileError } = await this.supabase.client
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre_completo: userData.nombre_completo,
          telefono: userData.telefono,
          rol: 'doctor'
        });

      if (profileError) throw profileError;

      // 3. Crear registro en tabla doctores con información adicional
      const { error: doctorError } = await this.supabase.client
        .from('doctores')
        .insert({
          usuario_id: authData.user.id,
          titulo: userData.titulo,
          especialidad: userData.especialidad
        });

      if (doctorError) throw doctorError;

      return { success: true };
    } catch (error: any) {
      console.error('Error en registro de doctor:', error);
      return { 
        success: false, 
        error: error.message || 'Error al registrar doctor' 
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await this.supabase.client.auth.signOut();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si hay usuario logueado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtener ID del usuario actual
   */
  getCurrentUserId(): string | null {
    return this.currentUserSubject.value?.id || null;
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error al recuperar contraseña:', error);
      return { 
        success: false, 
        error: error.message || 'Error al enviar email de recuperación' 
      };
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('No hay usuario autenticado');
      }

      const { error } = await this.supabase.client
        .from('usuarios')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Recargar perfil
      await this.loadUserProfile(userId);

      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      return { 
        success: false, 
        error: error.message || 'Error al actualizar perfil' 
      };
    }
  }
}
