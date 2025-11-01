import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Chat } from '../../components/chat/chat';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer, Chat],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  isLoading = true;
  user: any = null;
  userRole: string = '';
  userName: string = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

      console.log('✅ Dashboard - Usuario cargado:', this.userName, 'Rol:', this.userRole);
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
}
