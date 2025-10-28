import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('🔧 Inicializando SupabaseService...');
    console.log('📍 URL:', environment.supabase.url);
    console.log('🔑 AnonKey presente:', !!environment.supabase.anonKey);
    
    const isBrowser = isPlatformBrowser(this.platformId);
    
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: isBrowser,
          detectSessionInUrl: isBrowser,
          storage: isBrowser ? window.localStorage : undefined,
          storageKey: 'supabase.auth.token'
        }
      }
    );
    
    console.log('✅ SupabaseService inicializado correctamente');
  }

  get client() {
    return this.supabase;
  }
}
