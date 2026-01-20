import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer, Chat],
  templateUrl: './chat-page.html',
  styleUrls: ['./chat-page.css']
})
export class ChatPage implements OnInit {
  userRole: string = '';
  isLoading: boolean = true;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      const client = this.supabase.client;
      const { data: { session } } = await client.auth.getSession();

      if (!session?.user) {
        this.router.navigate(['/login']);
        return;
      }

      // Obtener rol del usuario
      const { data: usuario } = await client
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .maybeSingle();

      this.userRole = usuario?.rol || '';

      // Si es doctor, redirigir al panel de pacientes
      if (this.userRole === 'doctor') {
        this.router.navigate(['/usuariodoctor']);
        return;
      }
    } catch (error) {
      console.error('Error cargando chat-page:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
