export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: 'adulto' | 'familiar' | 'medico' | 'admin';
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  supervisor_id?: string;
  created_at?: string;
  updated_at?: string;
}
