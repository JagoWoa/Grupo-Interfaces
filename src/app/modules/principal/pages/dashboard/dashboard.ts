import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Chat } from '../../components/chat/chat';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { SpeakOnHoverDirective } from '../../../../core/directives/speak-on-hover.directive';
import { FamiliaresService } from '../../../../core/services/familiares.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Header, Footer, Chat, TranslatePipe, SpeakOnHoverDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  isLoading = true;
  user: any = null;
  userRole: string = '';
  userName: string = '';

  // Modal de agregar familiar
  showModalFamiliar = false;
  emailFamiliar = '';
  isLoadingFamiliar = false;
  errorMessageFamiliar = '';
  successMessageFamiliar = '';
  emailCuidadorActual: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private familiaresService: FamiliaresService
  ) {}

  async ngOnInit() {
    try {
      this.isLoading = true;
      
      console.log('📊 Dashboard - Iniciando carga...');
      
      const client = this.supabase.client;
      
      // PASO 1: Obtener sesión de Supabase Auth
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      console.log('� Dashboard - Sesión obtenida:', session?.user?.email);
      
      if (sessionError || !session?.user) {
        console.log('❌ Dashboard - No hay sesión, redirigiendo a login');
        this.router.navigate(['/login']);
        return;
      }

      const userId = session.user.id;
      console.log('👤 Dashboard - User ID:', userId);

      // PASO 2: Obtener datos del usuario desde la tabla usuarios
      const { data: usuario, error: usuarioError } = await client
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📋 Dashboard - Datos de usuarios:', usuario);
      
      if (usuarioError) {
        console.error('❌ Error al obtener usuario:', usuarioError);
        console.error('❌ Error detalles:', JSON.stringify(usuarioError, null, 2));
      }
      
      if (!usuario) {
        console.warn('⚠️ Dashboard - Usuario no encontrado en la tabla usuarios');
        alert('No se pudo cargar tu perfil. Por favor, contacta al administrador.');
        this.router.navigate(['/login']);
        return;
      }

      // Asignar datos
      this.user = usuario;
      this.userName = usuario.nombre_completo || 'Usuario';
      this.userRole = usuario.rol || '';
      this.emailCuidadorActual = usuario.email_cuidador || null;

      console.log('✅ Dashboard - Usuario cargado:', this.userName, 'Rol:', this.userRole);
      
      // Si es adulto mayor, cargar el email del cuidador si existe
      if (this.userRole === 'adulto_mayor') {
        await this.cargarEmailCuidador();
      }
    } catch (error) {
      console.error('❌ Dashboard - Error:', error);
      this.router.navigate(['/login']);
    } finally {
      this.isLoading = false;
      console.log('🏁 Dashboard - isLoading cambiado a:', this.isLoading);
      this.cdr.detectChanges(); // Forzar detección de cambios
    }
  }

  async logout() {
    try {
      await this.supabase.client.auth.signOut();
      console.log('🚪 Dashboard - Sesión cerrada');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  navegarAPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  formatDate(date: string | null): string {
    if (!date) return 'No especificado';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Abrir modal para agregar familiar
   */
  abrirModalFamiliar(): void {
    this.showModalFamiliar = true;
    this.emailFamiliar = '';
    this.errorMessageFamiliar = '';
    this.successMessageFamiliar = '';
  }

  /**
   * Cerrar modal de agregar familiar
   */
  cerrarModalFamiliar(): void {
    this.showModalFamiliar = false;
    this.emailFamiliar = '';
    this.errorMessageFamiliar = '';
    this.successMessageFamiliar = '';
    this.isLoadingFamiliar = false; // Asegurar que el loading se resetea
  }

  /**
   * Cargar el email del cuidador actual
   */
  async cargarEmailCuidador(): Promise<void> {
    try {
      const resultado = await this.familiaresService.getEmailCuidador();
      if (resultado.success) {
        this.emailCuidadorActual = resultado.email || null;
        // Actualizar también en el objeto user
        if (this.user) {
          this.user.email_cuidador = this.emailCuidadorActual;
        }
      }
    } catch (error) {
      console.error('Error al cargar email del cuidador:', error);
    }
  }

  /**
   * Agregar familiar por correo electrónico
   */
  async agregarFamiliar(): Promise<void> {
    this.errorMessageFamiliar = '';
    this.successMessageFamiliar = '';
    this.isLoadingFamiliar = true;

    if (!this.emailFamiliar || !this.emailFamiliar.trim()) {
      this.errorMessageFamiliar = 'Por favor, ingresa un correo electrónico';
      this.isLoadingFamiliar = false;
      return;
    }

    try {
      const resultado = await this.familiaresService.agregarFamiliarPorEmail(this.emailFamiliar);

      if (resultado.success) {
        this.isLoadingFamiliar = false; // Detener loading ANTES del mensaje de éxito
        this.successMessageFamiliar = 'Cuidador agregado correctamente';
        this.emailFamiliar = '';
        
        // Recargar el email del cuidador
        await this.cargarEmailCuidador();
        
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          this.cerrarModalFamiliar();
        }, 2000);
      } else {
        this.isLoadingFamiliar = false;
        this.errorMessageFamiliar = resultado.error || 'Error al agregar cuidador';
      }
    } catch (error: any) {
      console.error('Error al agregar familiar:', error);
      this.isLoadingFamiliar = false;
      this.errorMessageFamiliar = 'Error inesperado al agregar cuidador';
    }
  }

  /**
   * Eliminar cuidador
   */
  async eliminarCuidador(): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas eliminar el cuidador?')) {
      return;
    }

    try {
      const resultado = await this.familiaresService.eliminarCuidador();
      
      if (resultado.success) {
        this.emailCuidadorActual = null;
        if (this.user) {
          this.user.email_cuidador = null;
        }
        alert('Cuidador eliminado correctamente');
      } else {
        alert('Error al eliminar cuidador: ' + (resultado.error || 'Error desconocido'));
      }
    } catch (error: any) {
      console.error('Error al eliminar cuidador:', error);
      alert('Error inesperado al eliminar cuidador');
    }
  }
}
