import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './perfil.html'
})
export class Perfil implements OnInit, OnDestroy {
  loading: boolean = true;
  user: any = null;
  role: 'adulto_mayor' | 'doctor' | null = null;
  profile: any = {};
  doctorInfo: any = null;
  message: string = '';
  messageType: 'success' | 'error' = 'error';
  private authSubscription: any = null;

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    
    // Escuchar cambios de autenticación
    try {
      const client = this.supabase.client;
      const { data: sub } = client.auth.onAuthStateChange((event: any, session: any) => {
        console.debug('perfil: auth event', event, session);
        if (event === 'SIGNED_OUT') {
          this.router.navigate(['/login']);
        } else if (session?.user) {
          this.loadProfile();
        }
      });
      this.authSubscription = sub?.subscription || sub;
    } catch (e) {
      console.error('perfil: error al subscribir onAuthStateChange', e);
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.authSubscription && typeof this.authSubscription.unsubscribe === 'function') {
        this.authSubscription.unsubscribe();
      }
    } catch (e) {
      // noop
    }
  }

  async loadProfile() {
    this.loading = true;
    this.message = '';
    
    try {
      console.log('🔍 Perfil - Iniciando carga...');
      
      const client = this.supabase.client;
      
      // PASO 1: Obtener sesión de Supabase Auth
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      console.log('� Perfil - Sesión obtenida:', session?.user?.email);
      
      if (sessionError || !session?.user) {
        console.log('❌ Perfil - No hay sesión activa');
        this.message = 'No hay sesión activa. Por favor, inicia sesión.';
        this.messageType = 'error';
        this.router.navigate(['/login']);
        return;
      }

      const userId = session.user.id;
      console.log('👤 Perfil - User ID:', userId);

      // PASO 2: Obtener datos del usuario desde la tabla usuarios
      const { data: usuario, error: usuarioError } = await client
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📋 Perfil - Datos de usuarios:', usuario);
      
      if (usuarioError) {
        console.error('❌ Error al obtener usuario:', usuarioError);
        throw new Error('No se pudo obtener el perfil del usuario: ' + usuarioError.message);
      }

      if (!usuario) {
        console.warn('⚠️ Perfil - Usuario no encontrado en la tabla usuarios');
        this.message = 'No se encontró perfil asociado al usuario. Por favor, contacta al administrador.';
        this.messageType = 'error';
        return;
      }

      // Guardar usuario y rol
      this.user = { id: userId, email: session.user.email };
      this.profile = usuario;
      this.role = usuario.rol;

      console.log('✅ Perfil - Rol detectado:', this.role);

      // PASO 3: Si es doctor, obtener información adicional de la tabla doctores
      if (this.role === 'doctor') {
        const { data: doctor, error: doctorError } = await client
          .from('doctores')
          .select('*')
          .eq('usuario_id', userId)
          .single();

        console.log('🩺 Perfil - Datos de doctores:', doctor);

        if (!doctorError && doctor) {
          this.doctorInfo = {
            titulo: doctor.titulo || '',
            especialidad: doctor.especialidad || '',
            numero_licencia: doctor.numero_licencia || '',
            anos_experiencia: doctor.anos_experiencia || null
          };
          console.log('✅ Perfil - Información de doctor cargada:', this.doctorInfo);
        } else {
          console.warn('⚠️ No se encontró información adicional de doctor');
        }
      }

      console.log('✅ Perfil cargado exitosamente');
    } catch (e: any) {
      console.error('❌ Perfil - Error cargando:', e);
      this.message = 'Error cargando perfil: ' + (e.message || e);
      this.messageType = 'error';
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    }
  }

  async updateProfile() {
    this.message = '';
    
    if (!this.user || !this.role) {
      this.message = 'Usuario no autenticado o rol desconocido.';
      this.messageType = 'error';
      return;
    }

    const client = this.supabase.client;

    try {
      // Actualizar tabla usuarios
      const usuarioPayload: any = {
        nombre_completo: this.profile.nombre_completo,
        telefono: this.profile.telefono
      };

      const { error: usuarioError } = await client
        .from('usuarios')
        .update(usuarioPayload)
        .eq('id', this.user.id);

      if (usuarioError) throw usuarioError;

      // Si es doctor, actualizar tabla doctores
      if (this.role === 'doctor' && this.doctorInfo) {
        const doctorPayload = {
          titulo: this.doctorInfo.titulo,
          especialidad: this.doctorInfo.especialidad,
          numero_licencia: this.doctorInfo.numero_licencia || null,
          anos_experiencia: this.doctorInfo.anos_experiencia || null
        };

        const { error: doctorError } = await client
          .from('doctores')
          .update(doctorPayload)
          .eq('usuario_id', this.user.id);

        if (doctorError) throw doctorError;
      }

      this.message = '✅ Perfil actualizado correctamente.';
      this.messageType = 'success';
      
      // Recargar datos
      setTimeout(() => {
        this.loadProfile();
      }, 1500);
    } catch (e: any) {
      console.error('Error al actualizar perfil:', e);
      this.message = 'Error al actualizar perfil: ' + (e.message || e);
      this.messageType = 'error';
    }
  }

  cancelEdit(): void {
    // Volver al dashboard
    this.router.navigate(['/dashboard']);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
