export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: 'recordatorio' | 'emergencia' | 'alerta' | 'general';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  metadata?: any;
  created_at?: string;
}
