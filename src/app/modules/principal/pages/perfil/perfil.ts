import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit, OnDestroy {
  loading: boolean = true;
  user: any = null;
  role: 'adulto' | 'doctor' | null = null;
  profile: any = {};
  message: string = '';
  private authSubscription: any = null;

  constructor(private supabase: SupabaseService) {}

  ngOnInit(): void {
    this.loadProfile();
    // Escuchar cambios de autenticación para recargar perfil si el login ocurre después
    try {
      const client = this.supabase.client;
      const { data: sub } = client.auth.onAuthStateChange((event: any, session: any) => {
        console.debug('perfil: auth event', event, session);
        if (session && (session as any).user) {
          // recargar perfil cuando exista sesión
          this.loadProfile();
        }
      });
      // sub puede contener { subscription }
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
    const client = this.supabase.client;
    try {
      // Soporte de debug: ?debug_user_id=<id> para forzar carga por id
      try {
        const params = new URLSearchParams(window.location.search);
        const debugId = params.get('debug_user_id');
        if (debugId) {
          console.debug('perfil: modo debug usando id desde querystring', debugId);
          this.user = { id: debugId } as any;
          // intentar cargar directamente con ese id
          const dbgAdulto: any = await client.from('adulto_mayor').select('*').eq('id', debugId).maybeSingle();
          if (dbgAdulto && dbgAdulto.data) {
            this.role = 'adulto';
            this.profile = dbgAdulto.data;
            return;
          }
          const dbgDoctor: any = await client.from('doctor').select('*').eq('id', debugId).maybeSingle();
          if (dbgDoctor && dbgDoctor.data) {
            this.role = 'doctor';
            this.profile = dbgDoctor.data;
            return;
          }
          this.message = 'Modo debug: no se halló perfil para id proporcionado.';
          return;
        }
      } catch (e) {
        // ignore if window not available or URL parsing fails
      }
      // Intentar obtener sesión primero (supabase-js v2)
      let userObj: any = null;
      try {
        const { data: sessionData, error: sessionErr } = await client.auth.getSession();
        console.debug('perfil: sessionData', sessionData, 'sessionErr', sessionErr);
        if (!sessionErr && sessionData && (sessionData as any).session && (sessionData as any).session.user) {
          userObj = (sessionData as any).session.user;
        }
      } catch (e) {
        // ignore and fallback to getUser
      }

      if (!userObj) {
        // Fallback a getUser (algunas versiones/entornos)
        try {
          const res: any = await client.auth.getUser();
          console.debug('perfil: getUser res', res);
          if (res && res.data && res.data.user) {
            userObj = res.data.user;
          }
        } catch (e) {
          console.error('perfil: getUser error', e);
        }
      }

      if (!userObj) {
        this.message = 'No se ha identificado usuario autenticado. Abre la consola para más detalles.';
        return;
      }

      this.user = userObj;

      // Buscar en adulto_mayor
      const adultoRes: any = await client
        .from('adulto_mayor')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle();
      console.debug('perfil: adultoRes', adultoRes);

      if (adultoRes && adultoRes.data) {
        this.role = 'adulto';
        this.profile = adultoRes.data;
        return;
      }

      // Buscar en doctor
      const doctorRes: any = await client
        .from('doctor')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle();
      console.debug('perfil: doctorRes', doctorRes);

      if (doctorRes && doctorRes.data) {
        this.role = 'doctor';
        this.profile = doctorRes.data;
        return;
      }

      this.message = 'No se encontró perfil asociado al usuario.';
    } catch (e: any) {
      this.message = 'Error cargando perfil: ' + (e.message || e);
    } finally {
      this.loading = false;
    }
  }

  async updateProfile() {
    this.message = '';
    if (!this.user || !this.role) {
      this.message = 'Usuario no autenticado o rol desconocido.';
      return;
    }

    const client = this.supabase.client;
    const table = this.role === 'doctor' ? 'doctor' : 'adulto_mayor';

    // Construir payload evitando campos sensibles
    const payload: any = {};
    if (this.role === 'doctor') {
      payload.nombre_completo = this.profile.nombre_completo;
      payload.titulo = this.profile.titulo;
      payload.especialidad = this.profile.especialidad;
      payload.telefono = this.profile.telefono;
    } else {
      payload.nombre_completo = this.profile.nombre_completo;
      payload.telefono = this.profile.telefono;
    }

    try {
      const { error } = await client.from(table).update(payload).eq('id', this.user.id);
      if (error) {
        this.message = 'Error al actualizar: ' + error.message;
        return;
      }
      this.message = 'Perfil actualizado correctamente.';
      // recargar datos
      await this.loadProfile();
    } catch (e: any) {
      this.message = 'Error al actualizar perfil: ' + (e.message || e);
    }
  }
}
