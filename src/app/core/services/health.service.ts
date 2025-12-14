import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SignosVitales {
  id?: string;
  adulto_mayor_id: string;
  presion_arterial: string;
  frecuencia_cardiaca: string;
  temperatura: string;
  peso: string;
  glucosa?: string; // Campo adicional
  saturacion_oxigeno?: string; // Campo adicional
  ultima_medicion?: Date;
}

export interface Recordatorio {
  id?: string;
  adulto_mayor_id: string;
  titulo: string;
  subtitulo?: string;
  fecha_creacion?: Date;
  fecha_recordatorio?: Date;
  completado: boolean;
  tipo?: 'medicamento' | 'cita' | 'otro';
}

export interface DetallesPaciente {
  tipo_sangre?: string;
  altura?: number; // en cm
  peso?: number; // en kg
  alergias?: string[];
  condiciones_medicas?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private signosVitalesSubject = new BehaviorSubject<SignosVitales | null>(null);
  public signosVitales$ = this.signosVitalesSubject.asObservable();

  private recordatoriosSubject = new BehaviorSubject<Recordatorio[]>([]);
  public recordatorios$ = this.recordatoriosSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  // ==================== SIGNOS VITALES ====================

  async getSignosVitales(pacienteId: string): Promise<SignosVitales | null> {
    console.log('HealthService.getSignosVitales - Iniciando consulta para:', pacienteId);
    try {
      const { data, error } = await this.supabase.client
        .from('signos_vitales')
        .select('*')
        .eq('adulto_mayor_id', pacienteId)
        .order('ultima_medicion', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('HealthService.getSignosVitales - Error de Supabase:', error);
        throw error;
      }

      console.log('HealthService.getSignosVitales - Datos obtenidos:', data);
      this.signosVitalesSubject.next(data);
      return data;
    } catch (error) {
      console.error('HealthService.getSignosVitales - Error catch:', error);
      return null;
    }
  }

  async updateSignosVitales(pacienteId: string, signos: Partial<SignosVitales>): Promise<boolean> {
    console.log('HealthService.updateSignosVitales - Iniciando actualización');
    console.log('Paciente ID:', pacienteId);
    console.log('Signos a guardar:', signos);
    
    try {
      // Verificar si ya existe un registro
      const { data: existing, error: selectError } = await this.supabase.client
        .from('signos_vitales')
        .select('id')
        .eq('adulto_mayor_id', pacienteId)
        .maybeSingle();

      if (selectError) {
        console.error('Error al buscar registro existente:', selectError);
        throw selectError;
      }

      console.log('Registro existente:', existing);

      if (existing) {
        // Actualizar registro existente
        console.log('Actualizando registro existente con ID:', existing.id);
        const { data: updateData, error: updateError } = await this.supabase.client
          .from('signos_vitales')
          .update({
            ...signos,
            ultima_medicion: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();

        if (updateError) {
          console.error('❌ Error al actualizar signos vitales:', updateError);
          throw updateError;
        }
        console.log('✅ Actualización exitosa:', updateData);
      } else {
        // Crear nuevo registro
        console.log('➕ Creando nuevo registro de signos vitales');
        const { data: insertData, error: insertError } = await this.supabase.client
          .from('signos_vitales')
          .insert({
            adulto_mayor_id: pacienteId,
            ...signos,
            ultima_medicion: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('❌ Error al insertar signos vitales:', insertError);
          throw insertError;
        }
        console.log('✅ Inserción exitosa:', insertData);
      }

      // Recargar datos
      await this.getSignosVitales(pacienteId);
      return true;
    } catch (error: any) {
      console.error('❌ Error al actualizar signos vitales:', error);
      console.error('📌 Mensaje de error:', error?.message);
      console.error('📌 Código de error:', error?.code);
      console.error('📌 Detalles:', error?.details);
      return false;
    }
  }

  // ==================== RECORDATORIOS ====================

  async getRecordatorios(pacienteId: string): Promise<Recordatorio[]> {
    console.log('🔍 HealthService.getRecordatorios - Iniciando consulta para:', pacienteId);
    try {
      const { data, error } = await this.supabase.client
        .from('recordatorio')
        .select('*')
        .eq('adulto_mayor_id', pacienteId)
        .order('fecha_recordatorio', { ascending: true });

      if (error) {
        console.error('❌ HealthService.getRecordatorios - Error de Supabase:', error);
        throw error;
      }

      const recordatorios = data || [];
      console.log('✅ HealthService.getRecordatorios - Datos obtenidos:', recordatorios.length, 'recordatorios');
      this.recordatoriosSubject.next(recordatorios);
      return recordatorios;
    } catch (error) {
      console.error('❌ HealthService.getRecordatorios - Error catch:', error);
      return [];
    }
  }

  async createRecordatorio(recordatorio: Recordatorio): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .insert(recordatorio);

      if (error) throw error;

      // Recargar recordatorios
      await this.getRecordatorios(recordatorio.adulto_mayor_id);
      return true;
    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      return false;
    }
  }

  async updateRecordatorio(id: string, updates: Partial<Recordatorio>): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Recargar recordatorios
      const recordatorios = this.recordatoriosSubject.value;
      const recordatorio = recordatorios.find(r => r.id === id);
      if (recordatorio) {
        await this.getRecordatorios(recordatorio.adulto_mayor_id);
      }
      return true;
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
      return false;
    }
  }

  async deleteRecordatorio(id: string, pacienteId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Recargar recordatorios
      await this.getRecordatorios(pacienteId);
      return true;
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
      return false;
    }
  }

  async toggleRecordatorioCompletado(id: string, completado: boolean, pacienteId: string): Promise<boolean> {
    return this.updateRecordatorio(id, { completado });
  }

  // ==================== DETALLES DEL PACIENTE ====================
  // Estos podrían guardarse en una nueva tabla o en campos adicionales de usuarios
  
  async getDetallesPaciente(pacienteId: string): Promise<DetallesPaciente | null> {
    // Por ahora, devolver datos de ejemplo
    // Más adelante se puede crear una tabla específica para esto
    return {
      tipo_sangre: 'A+',
      altura: 170,
      peso: 70,
      alergias: ['Penicilina'],
      condiciones_medicas: ['Hipertensión']
    };
  }

  // ==================== DOCTOR ASIGNADO ====================

  async getDoctorAsignado(pacienteId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.client
        .from('pacientes_doctor')
        .select(`
          *,
          doctor:usuarios!pacientes_doctor_doctor_id_fkey(
            id,
            nombre_completo,
            email,
            telefono
          )
        `)
        .eq('paciente_id', pacienteId)
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener doctor asignado:', error);
      return null;
    }
  }

  // ==================== MÉTODOS PARA DOCTORES ====================

  /**
   * Obtiene la lista de pacientes asignados a un doctor
   */
  async getPacientesDeDoctor(doctorId: string): Promise<any[]> {
    console.log('🔍 HealthService.getPacientesDeDoctor - Consultando para doctor:', doctorId);
    try {
      const { data, error } = await this.supabase.client
        .from('pacientes_doctor')
        .select(`
          id,
          fecha_asignacion,
          activo,
          notas,
          paciente:usuarios!pacientes_doctor_paciente_id_fkey(
            id,
            nombre_completo,
            email,
            telefono,
            fecha_nacimiento
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('activo', true)
        .order('fecha_asignacion', { ascending: false });

      if (error) {
        console.error('❌ Error al obtener pacientes del doctor:', error);
        throw error;
      }

      console.log('✅ Pacientes obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getPacientesDeDoctor:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los datos de un paciente (para que el doctor lo vea)
   */
  async getDatosPacienteParaDoctor(pacienteId: string): Promise<any> {
    console.log('🔍 HealthService.getDatosPacienteParaDoctor - Paciente:', pacienteId);
    try {
      // Obtener signos vitales, recordatorios y datos del paciente en paralelo
      const [signosVitales, recordatorios, pacienteInfo] = await Promise.all([
        this.getSignosVitales(pacienteId),
        this.getRecordatorios(pacienteId),
        this.supabase.client
          .from('usuarios')
          .select('*')
          .eq('id', pacienteId)
          .single()
      ]);

      console.log('📊 Signos vitales obtenidos:', signosVitales);
      console.log('📌 Recordatorios obtenidos:', recordatorios?.length || 0);

      return {
        paciente: pacienteInfo.data,
        signosVitales: signosVitales || {
          presion_arterial: '',
          frecuencia_cardiaca: '',
          temperatura: '',
          peso: '',
          glucosa: '',
          saturacion_oxigeno: ''
        },
        recordatorios: recordatorios || []
      };
    } catch (error) {
      console.error('❌ Error al obtener datos del paciente:', error);
      return null;
    }
  }

  /**
   * Crea un recordatorio para un paciente (usado por el doctor)
   */
  async crearRecordatorioParaPaciente(
    pacienteId: string,
    titulo: string,
    subtitulo: string,
    fechaRecordatorio?: Date
  ): Promise<boolean> {
    console.log('🔍 HealthService.crearRecordatorioParaPaciente - Creando para:', pacienteId);
    try {
      const { error } = await this.supabase.client
        .from('recordatorio')
        .insert({
          adulto_mayor_id: pacienteId,
          titulo,
          subtitulo,
          fecha_recordatorio: fechaRecordatorio || new Date(),
          completado: false
        });

      if (error) {
        console.error('❌ Error al crear recordatorio:', error);
        throw error;
      }

      console.log('✅ Recordatorio creado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en crearRecordatorioParaPaciente:', error);
      return false;
    }
  }

  // ==================== ASIGNACIÓN DE DOCTORES ====================

  /**
   * Obtiene todos los doctores disponibles
   */
  async getDoctoresDisponibles(): Promise<any[]> {
    console.log('🔍 HealthService.getDoctoresDisponibles - Consultando doctores disponibles');
    try {
      // Primero verificar cuántos registros hay en la tabla doctores
      console.log('🔍 Paso 1: Consultando todos los registros de tabla doctores...');
      const { data: allDoctores, error: errorAll } = await this.supabase.client
        .from('doctores')
        .select('*');
      
      if (errorAll) {
        console.error('❌ Error en Paso 1:', errorAll);
      }
      
      console.log('📊 Total registros en tabla doctores:', allDoctores?.length || 0);
      if (allDoctores && allDoctores.length > 0) {
        console.log('📋 Datos completos de doctores:', JSON.stringify(allDoctores, null, 2));
        allDoctores.forEach((d: any, index: number) => {
          console.log(`📋 Doctor ${index + 1}:`, {
            id: d.id,
            usuario_id: d.usuario_id,
            titulo: d.titulo,
            especialidad: d.especialidad,
            disponible: d.disponible,
            numero_licencia: d.numero_licencia,
            anos_experiencia: d.anos_experiencia
          });
          
          // Verificar si tiene usuario_id
          if (!d.usuario_id) {
            console.error(`❌ Doctor ${index + 1} NO TIENE usuario_id - esto es REQUERIDO!`);
          }
        });
        
        // Verificar si hay doctores SIN usuario_id
        const sinUsuarioId = allDoctores.filter((d: any) => !d.usuario_id);
        if (sinUsuarioId.length > 0) {
          console.error('❌❌❌ PROBLEMA ENCONTRADO:', sinUsuarioId.length, 'doctores sin usuario_id');
          console.error('Los registros en la tabla doctores DEBEN tener usuario_id vinculado a la tabla usuarios');
          console.error('Ejecuta este SQL para verificar: SELECT id, usuario_id, titulo, especialidad FROM doctores;');
        }
      } else {
        console.warn('⚠️ La tabla doctores está vacía. Necesitas insertar doctores primero.');
        console.warn('⚠️ Ejecuta el archivo insert-doctores-prueba.sql para crear doctores de prueba.');
        return [];
      }

      // Paso 2: Obtener información de doctores disponibles
      console.log('🔍 Paso 2: Obteniendo doctores con disponible=true...');
      const { data: doctoresDisponibles, error: errorDisponibles } = await this.supabase.client
        .from('doctores')
        .select('*')
        .eq('disponible', true);

      if (errorDisponibles) {
        console.error('❌ Error al obtener doctores disponibles:', errorDisponibles);
        throw errorDisponibles;
      }

      console.log('📊 Doctores con disponible=true:', doctoresDisponibles?.length || 0);

      if (!doctoresDisponibles || doctoresDisponibles.length === 0) {
        console.warn('⚠️ No hay doctores con disponible=true');
        return [];
      }

      // Paso 3: Para cada doctor, obtener su información de usuario
      console.log('🔍 Paso 3: Obteniendo información de usuarios...');
      const doctoresFormateados = [];

      for (const doctor of doctoresDisponibles) {
        console.log(`🔍 Procesando doctor ID ${doctor.id}, usuario_id: ${doctor.usuario_id}`);
        
        try {
          const { data: usuario, error: errorUsuario } = await this.supabase.client
            .from('usuarios')
            .select('id, nombre_completo, email, telefono, activo')
            .eq('id', doctor.usuario_id)
            .single();

          if (errorUsuario) {
            console.error(`❌ Error al obtener usuario ${doctor.usuario_id}:`, errorUsuario);
            continue;
          }

          if (!usuario) {
            console.warn(`⚠️ No se encontró usuario con id ${doctor.usuario_id}`);
            continue;
          }

          if (!usuario.activo) {
            console.log(`️ Usuario ${usuario.nombre_completo} no está activo, saltando...`);
            continue;
          }

          console.log(`✅ Doctor encontrado: ${usuario.nombre_completo} - ${doctor.especialidad}`);

          doctoresFormateados.push({
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email || '',
            telefono: usuario.telefono || '',
            doctores: [{
              titulo: doctor.titulo,
              especialidad: doctor.especialidad,
              numero_licencia: doctor.numero_licencia,
              anos_experiencia: doctor.anos_experiencia,
              disponible: doctor.disponible
            }]
          });
        } catch (err) {
          console.error(`❌ Error procesando doctor ${doctor.id}:`, err);
        }
      }

      console.log('✅ Doctores disponibles formateados:', doctoresFormateados.length);
      return doctoresFormateados;
    } catch (error) {
      console.error('❌ Error en getDoctoresDisponibles:', error);
      return [];
    }
  }

  /**
   * Asigna o actualiza el doctor asignado a un paciente
   */
  async asignarDoctor(pacienteId: string, doctorId: string, notas?: string): Promise<boolean> {
    console.log('🔍 HealthService.asignarDoctor - Asignando doctor:', doctorId, 'a paciente:', pacienteId);
    try {
      // Primero, desactivar cualquier asignación previa
      const { error: updateError } = await this.supabase.client
        .from('pacientes_doctor')
        .update({ activo: false })
        .eq('paciente_id', pacienteId)
        .eq('activo', true);

      if (updateError) {
        console.error('❌ Error al desactivar asignaciones previas:', updateError);
        throw updateError;
      }

      // Insertar nueva asignación
      const { error: insertError } = await this.supabase.client
        .from('pacientes_doctor')
        .insert({
          paciente_id: pacienteId,
          doctor_id: doctorId,
          fecha_asignacion: new Date().toISOString(),
          activo: true,
          notas: notas || null
        });

      if (insertError) {
        console.error('❌ Error al crear nueva asignación:', insertError);
        throw insertError;
      }

      console.log('✅ Doctor asignado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en asignarDoctor:', error);
      return false;
    }
  }

  /**
   * Desasigna el doctor actual de un paciente
   */
  async desasignarDoctor(pacienteId: string): Promise<boolean> {
    console.log('HealthService.desasignarDoctor - Desasignando doctor de paciente:', pacienteId);
    try {
      const { error } = await this.supabase.client
        .from('pacientes_doctor')
        .update({ activo: false })
        .eq('paciente_id', pacienteId)
        .eq('activo', true);

      if (error) {
        console.error('Error al desasignar doctor:', error);
        throw error;
      }

      console.log('Doctor desasignado exitosamente');
      return true;
    } catch (error) {
      console.error('Error en desasignarDoctor:', error);
      return false;
    }
  }

  // ==================== NOTIFICACIONES ====================

  /**
   * Envía notificación por email al cuidador sobre actualización de signos vitales
   */
  async enviarNotificacionSignosVitales(
    pacienteId: string, 
    pacienteNombre: string,
    doctorNombre: string,
    signos: Partial<SignosVitales>
  ): Promise<boolean> {
    console.log('HealthService.enviarNotificacionSignosVitales - Iniciando envío');
    try {
      // Obtener el email del cuidador del paciente
      const { data: paciente, error: errorPaciente } = await this.supabase.client
        .from('usuarios')
        .select('email_cuidador, nombre_completo')
        .eq('id', pacienteId)
        .single();

      if (errorPaciente) {
        console.error('Error al obtener datos del paciente:', errorPaciente);
        return false;
      }

      if (!paciente?.email_cuidador) {
        console.log('El paciente no tiene email de cuidador registrado');
        return false;
      }

      console.log('Enviando notificación a:', paciente.email_cuidador);

      // Preparar el contenido del email
      const asunto = `Actualización de Signos Vitales - ${pacienteNombre}`;
      const contenido = this.generarContenidoEmail(
        paciente.nombre_completo,
        doctorNombre,
        signos
      );

      // Enviar email usando Supabase Edge Function
      const { data, error } = await this.supabase.client.functions.invoke('send-email', {
        body: {
          to: paciente.email_cuidador,
          subject: asunto,
          html: contenido
        }
      });

      if (error) {
        console.error('Error al enviar email:', error);
        // No lanzar error, solo registrar - el fallo del email no debe detener la actualización
        return false;
      }

      console.log('Notificación enviada exitosamente');
      return true;
    } catch (error) {
      console.error('Error en enviarNotificacionSignosVitales:', error);
      return false;
    }
  }

  /**
   * Genera el contenido HTML del email de notificación
   */
  private generarContenidoEmail(
    pacienteNombre: string,
    doctorNombre: string,
    signos: Partial<SignosVitales>
  ): string {
    const fecha = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .vital-sign { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .vital-sign strong { color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Telecuidado Mayor</h1>
            <h2>Actualización de Signos Vitales</h2>
          </div>
          <div class="content">
            <p>Estimado familiar/cuidador:</p>
            <p>El Dr. <strong>${doctorNombre}</strong> ha actualizado los signos vitales de <strong>${pacienteNombre}</strong>.</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            
            <h3>Signos Vitales Registrados:</h3>
            
            ${signos.presion_arterial ? `<div class="vital-sign"><strong>Presión Arterial:</strong> ${signos.presion_arterial} mmHg</div>` : ''}
            ${signos.frecuencia_cardiaca ? `<div class="vital-sign"><strong>Frecuencia Cardíaca:</strong> ${signos.frecuencia_cardiaca} bpm</div>` : ''}
            ${signos.temperatura ? `<div class="vital-sign"><strong>Temperatura:</strong> ${signos.temperatura} °C</div>` : ''}
            ${signos.peso ? `<div class="vital-sign"><strong>Peso:</strong> ${signos.peso} kg</div>` : ''}
            ${signos.glucosa ? `<div class="vital-sign"><strong>Glucosa:</strong> ${signos.glucosa} mg/dL</div>` : ''}
            ${signos.saturacion_oxigeno ? `<div class="vital-sign"><strong>Saturación de Oxígeno:</strong> ${signos.saturacion_oxigeno}%</div>` : ''}
            
            <p style="margin-top: 30px;">Puede revisar el historial completo en la plataforma.</p>
            
            <div style="text-align: center;">
              <a href="http://localhost:4200/login" class="button">Acceder a la Plataforma</a>
            </div>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
            <p>&copy; 2025 Telecuidado Mayor. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
