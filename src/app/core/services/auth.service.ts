import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol: 'adulto_mayor' | 'doctor' | 'admin';
  activo?: boolean;
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
  numero_licencia?: string;
  anos_experiencia?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Configuración de bloqueo por intentos fallidos
  private maxFailedAttempts = environment.security?.authLock?.maxFailedAttempts ?? 5; // número de intentos permitidos
  private lockoutSeconds = environment.security?.authLock?.lockoutSeconds ?? 60; // tiempo de bloqueo en segundos

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
      console.log('🔍 Verificando sesión almacenada...');
      const { data: { session } } = await this.supabase.client.auth.getSession();
      if (session?.user) {
        console.log('✅ Sesión encontrada para:', session.user.email);
        await this.loadUserProfile(session.user.id);
      } else {
        console.log('❌ No hay sesión activa');
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
        console.log('👤 Perfil cargado:', data.nombre_completo, '- Rol:', data.rol);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  }

  /**
   * Login con email y password
   * Verifica que el email esté confirmado antes de permitir el acceso
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }> {
    try {
      // Rechazar si el email está bloqueado por demasiados intentos fallidos
      const lockCheck = this.checkLockout(email);
      if (lockCheck.locked) {
        const remaining = Math.ceil(lockCheck.remainingMs / 1000);
        return { success: false, error: `Demasiados intentos fallidos. Intenta nuevamente en ${remaining} segundos.` };
      }
      console.log('🔐 AuthService.login - Iniciando con:', email);
      
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      console.log('📊 AuthService.login - Respuesta de Supabase:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ AuthService.login - Error de Supabase:', error);
        // Registrar intento fallido y evaluar bloqueo
        this.recordFailedAttempt(email);
        throw error;
      }

      if (data.user) {
        console.log('👤 AuthService.login - Usuario autenticado:', data.user.email);
        console.log('📧 Email confirmado:', !!data.user.email_confirmed_at);
        console.log('🎫 Sesión activa:', !!data.session);
        
        // Verificar si el email está confirmado
        if (!data.user.email_confirmed_at) {
          console.warn('⚠️ Email no confirmado, cerrando sesión');
          await this.supabase.client.auth.signOut();
          return { 
            success: false, 
            error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
            needsEmailVerification: true
          };
        }

        // Cargar perfil del usuario
        console.log('📋 Cargando perfil del usuario...');
        await this.loadUserProfile(data.user.id);
        
        // Activar cuenta si aún no está activa
        const currentUser = this.getCurrentUser();
        console.log('👤 Usuario actual después de cargar perfil:', currentUser);
        
        if (currentUser && !currentUser.activo) {
          console.log('⚙️ Activando cuenta...');
          await this.activateAccount(data.user.id);
          await this.loadUserProfile(data.user.id); // Recargar con activo = true
        }

        console.log('✅ AuthService.login - Login exitoso');
        // Limpiar contador de intentos si el login fue exitoso
        this.clearFailedAttempts(email);
        return { success: true };
      }

      console.warn('⚠️ AuthService.login - No hay usuario en la respuesta');
      this.recordFailedAttempt(email);
      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (error: any) {
      console.error('❌ AuthService.login - Error:', error);
      
      // Manejo específico de errores
      let errorMessage = 'Error al iniciar sesión';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, verifica tu correo electrónico antes de iniciar sesión.';
        return { 
          success: false, 
          error: errorMessage,
          needsEmailVerification: true
        };
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  /**
   * Obtener tiempo restante de bloqueo para mostrar en UI
   */
  getLockoutRemainingSeconds(email: string): number {
    const check = this.checkLockout(email);
    return Math.max(0, Math.ceil(check.remainingMs / 1000));
  }

  /**
   * Registrar intento fallido de login para un email
   */
  private recordFailedAttempt(email: string) {
    try {
      const key = this.getLockKey(email);
      const existing = this.getLockData(key);
      const now = Date.now();
      const attempts = (existing?.attempts || 0) + 1;

      let lockedUntil = existing?.lockedUntil || 0;
      if (attempts >= this.maxFailedAttempts) {
        lockedUntil = now + this.lockoutSeconds * 1000;
      }

      const data = { attempts, lockedUntil };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  /**
   * Limpiar contador de intentos fallidos para un email
   */
  private clearFailedAttempts(email: string) {
    try {
      const key = this.getLockKey(email);
      window.localStorage.removeItem(key);
    } catch {}
  }

  /**
   * Verificar si el email está bloqueado actualmente
   */
  private checkLockout(email: string): { locked: boolean; remainingMs: number } {
    try {
      const key = this.getLockKey(email);
      const data = this.getLockData(key);
      if (!data) return { locked: false, remainingMs: 0 };

      const now = Date.now();
      if (data.lockedUntil && data.lockedUntil > now) {
        return { locked: true, remainingMs: data.lockedUntil - now };
      }
      return { locked: false, remainingMs: 0 };
    } catch {
      return { locked: false, remainingMs: 0 };
    }
  }

  private getLockKey(email: string) {
    return `auth.lock.${email.toLowerCase()}`;
  }

  private getLockData(key: string): { attempts: number; lockedUntil: number } | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Registro de nuevo usuario (Adulto Mayor)
   * Envía email de verificación automáticamente
   */
  async register(userData: RegisterData): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }> {
    try {
      // Determinar nombre_completo: usar el que viene o componer desde nombre + apellidos
      const nombreCompleto = userData.nombre_completo 
        || `${userData.nombre || ''} ${userData.apellidos || ''}`.trim();

      if (!nombreCompleto) {
        throw new Error('Debe proporcionar nombre_completo o nombre y apellidos');
      }

      // 1. Crear usuario en Supabase Auth con verificación de email
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: nombreCompleto,
            phone: userData.telefono,
            fecha_nacimiento: userData.fecha_nacimiento,
            rol: userData.rol || 'adulto_mayor'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id);
      console.log('📧 Necesita verificación:', !authData.session);
      console.log('🔐 Session:', authData.session ? 'Activa' : 'Requiere confirmación de email');

      // Verificar si Supabase requiere confirmación de email
      const needsVerification = !authData.session || (authData.user.identities && authData.user.identities.length === 0);

      // 3. Crear perfil en tabla usuarios
      const { error: profileError } = await this.supabase.client
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre_completo: nombreCompleto,
          telefono: userData.telefono || null,
          fecha_nacimiento: userData.fecha_nacimiento || null,
          rol: userData.rol || 'adulto_mayor',
          activo: !needsVerification // Activo inmediatamente si no requiere verificación
        });

      if (profileError) {
        console.error('❌ Error al crear perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil creado en tabla usuarios');

      // Si no requiere verificación, cargar el perfil y dejarlo logueado
      if (!needsVerification && authData.session) {
        // Cargar el perfil del usuario
        await this.loadUserProfile(authData.user.id);
        console.log('✅ Usuario logueado automáticamente');
      } else {
        console.log('⏳ Usuario pendiente de verificación de email');
      }

      return { 
        success: true,
        needsEmailVerification: needsVerification // Indica si debe verificar su email
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Manejo específico de errores comunes
      let errorMessage = 'Error al registrar usuario';
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El correo electrónico no es válido';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  /**
   * Registro de doctor
   * Envía email de verificación automáticamente
   */
  async registerDoctor(userData: RegisterDoctorData): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }> {
    try {
      // 1. Crear usuario en Supabase Auth con verificación de email
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: userData.nombre_completo,
            phone: userData.telefono,
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

      console.log('✅ Doctor creado en Auth:', authData.user.id);

      // Verificar si Supabase requiere confirmación de email
      const needsVerification = !authData.session || (authData.user.identities && authData.user.identities.length === 0);

      // 3. Crear perfil en tabla usuarios
      const { error: profileError } = await this.supabase.client
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre_completo: userData.nombre_completo,
          telefono: userData.telefono,
          rol: 'doctor',
          activo: !needsVerification
        });

      if (profileError) {
        console.error('❌ Error al crear perfil de doctor:', profileError);
        throw profileError;
      }

      // 4. Crear registro en tabla doctores con información adicional
      const { error: doctorError } = await this.supabase.client
        .from('doctores')
        .insert({
          usuario_id: authData.user.id,
          titulo: userData.titulo,
          especialidad: userData.especialidad,
          numero_licencia: userData.numero_licencia || null,
          anos_experiencia: userData.anos_experiencia || null,
          disponible: !needsVerification
        });

      if (doctorError) {
        console.error('❌ Error al crear registro de doctor:', doctorError);
        throw doctorError;
      }

      console.log('✅ Registro completo de doctor');

      // Si no requiere verificación, cargar el perfil
      if (!needsVerification && authData.session) {
        await this.loadUserProfile(authData.user.id);
      }

      return { 
        success: true,
        needsEmailVerification: needsVerification
      };
    } catch (error: any) {
      console.error('Error en registro de doctor:', error);
      
      // Manejo específico de errores
      let errorMessage = 'Error al registrar doctor';
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El correo electrónico no es válido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Cerrando sesión...');
      await this.supabase.client.auth.signOut();
      this.currentUserSubject.next(null);
      console.log('✅ Sesión cerrada exitosamente');
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
   * Reenviar email de verificación
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error al reenviar email de verificación:', error);
      return { 
        success: false, 
        error: error.message || 'Error al reenviar email de verificación' 
      };
    }
  }

  /**
   * Verificar si el email del usuario está confirmado
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      return user?.email_confirmed_at !== null;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }

  /**
   * Activar cuenta después de verificar email
   * Este método se llama automáticamente después de que el usuario confirma su email
   */
  async activateAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Actualizar usuario a activo
      const { error: userError } = await this.supabase.client
        .from('usuarios')
        .update({ activo: true })
        .eq('id', userId);

      if (userError) throw userError;

      // Si es doctor, también activarlo en la tabla doctores
      const { data: doctor } = await this.supabase.client
        .from('doctores')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (doctor) {
        const { error: doctorError } = await this.supabase.client
          .from('doctores')
          .update({ disponible: true })
          .eq('usuario_id', userId);

        if (doctorError) throw doctorError;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error al activar cuenta:', error);
      return { 
        success: false, 
        error: error.message || 'Error al activar cuenta' 
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

  /**
   * Obtener perfil completo del usuario actual
   */
  async getUserProfile(): Promise<any | null> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return null;
      }

      // Obtener datos básicos del usuario
      const { data: usuario, error: usuarioError } = await this.supabase.client
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError) throw usuarioError;

      // Si es doctor, obtener datos adicionales
      if (usuario && usuario.rol === 'doctor') {
        const { data: doctor, error: doctorError } = await this.supabase.client
          .from('doctores')
          .select('*')
          .eq('usuario_id', userId)
          .single();

        if (!doctorError && doctor) {
          return { ...usuario, ...doctor };
        }
      }

      return usuario;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    try {
      await this.supabase.client.auth.signOut();
      this.currentUserSubject.next(null);
      console.log('🚪 Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
}
