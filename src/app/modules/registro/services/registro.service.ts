import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RegistroMaestro {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  usuario_modificacion?: string;
}

export interface HistorialCambio {
  id?: number;
  tabla: string;
  registro_id: number;
  accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR';
  usuario_id: string;
  fecha: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private tableName = 'registros_maestros'; // Nombre de la tabla en Supabase

  constructor(private supabase: SupabaseService) {}

  /**
   * Obtener todos los registros con filtros opcionales
   */
  getRegistros(filtros?: { nombre?: string; categoria?: string; estado?: boolean }): Observable<RegistroMaestro[]> {
    let query = this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('fecha_creacion', { ascending: false });

    // Aplicar filtros si existen
    if (filtros) {
      if (filtros.nombre) {
        query = query.ilike('nombre', `%${filtros.nombre}%`);
      }
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros.estado !== undefined) {
        query = query.eq('estado', filtros.estado);
      }
    }

    return from(query).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as RegistroMaestro[];
      }),
      catchError(error => {
        console.error('Error al obtener registros:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener un registro por ID
   */
  getRegistroById(id: number): Observable<RegistroMaestro | null> {
    return from(
      this.supabase.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as RegistroMaestro;
      }),
      catchError(error => {
        console.error('Error al obtener registro:', error);
        return of(null);
      })
    );
  }

  /**
   * Crear un nuevo registro
   */
  crearRegistro(registro: RegistroMaestro, usuarioId: string): Observable<RegistroMaestro | null> {
    const nuevoRegistro = {
      ...registro,
      fecha_creacion: new Date().toISOString(),
      fecha_modificacion: new Date().toISOString(),
      usuario_modificacion: usuarioId,
      estado: registro.estado ?? true
    };

    return from(
      this.supabase.client
        .from(this.tableName)
        .insert(nuevoRegistro)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        // Registrar en historial
        this.registrarHistorial({
          tabla: this.tableName,
          registro_id: response.data.id,
          accion: 'CREAR',
          usuario_id: usuarioId,
          fecha: new Date().toISOString(),
          datos_nuevos: response.data
        });
        return response.data as RegistroMaestro;
      }),
      catchError(error => {
        console.error('Error al crear registro:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualizar un registro existente
   */
  actualizarRegistro(id: number, registro: Partial<RegistroMaestro>, usuarioId: string): Observable<RegistroMaestro | null> {
    const registroActualizado = {
      ...registro,
      fecha_modificacion: new Date().toISOString(),
      usuario_modificacion: usuarioId
    };

    return from(
      this.supabase.client
        .from(this.tableName)
        .update(registroActualizado)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        // Registrar en historial
        this.registrarHistorial({
          tabla: this.tableName,
          registro_id: id,
          accion: 'ACTUALIZAR',
          usuario_id: usuarioId,
          fecha: new Date().toISOString(),
          datos_nuevos: response.data
        });
        return response.data as RegistroMaestro;
      }),
      catchError(error => {
        console.error('Error al actualizar registro:', error);
        return of(null);
      })
    );
  }

  /**
   * Eliminar un registro
   */
  eliminarRegistro(id: number, usuarioId: string): Observable<boolean> {
    return from(
      this.supabase.client
        .from(this.tableName)
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        // Registrar en historial
        this.registrarHistorial({
          tabla: this.tableName,
          registro_id: id,
          accion: 'ELIMINAR',
          usuario_id: usuarioId,
          fecha: new Date().toISOString()
        });
        return true;
      }),
      catchError(error => {
        console.error('Error al eliminar registro:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtener categorías únicas (para el filtro)
   */
  getCategorias(): Observable<string[]> {
    return from(
      this.supabase.client
        .from(this.tableName)
        .select('categoria')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        const categorias = [...new Set(response.data.map((r: any) => r.categoria))];
        return categorias.filter(c => c) as string[];
      }),
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener historial de cambios de un registro
   */
  getHistorial(registroId: number): Observable<HistorialCambio[]> {
    return from(
      this.supabase.client
        .from('historial_cambios')
        .select('*')
        .eq('registro_id', registroId)
        .eq('tabla', this.tableName)
        .order('fecha', { ascending: false })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as HistorialCambio[];
      }),
      catchError(error => {
        console.error('Error al obtener historial:', error);
        return of([]);
      })
    );
  }

  /**
   * Registrar cambio en historial
   */
  private registrarHistorial(cambio: HistorialCambio): void {
    this.supabase.client
      .from('historial_cambios')
      .insert(cambio)
      .then(response => {
        if (response.error) {
          console.error('Error al registrar historial:', response.error);
        }
      });
  }

  /**
   * Búsqueda inteligente con autocompletado
   */
  buscarAutocompletado(termino: string, campo: 'nombre' | 'descripcion' = 'nombre'): Observable<string[]> {
    return from(
      this.supabase.client
        .from(this.tableName)
        .select(campo)
        .ilike(campo, `%${termino}%`)
        .limit(10)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return [...new Set(response.data.map((r: any) => r[campo]))].filter(v => v) as string[];
      }),
      catchError(error => {
        console.error('Error en autocompletado:', error);
        return of([]);
      })
    );
  }
}
