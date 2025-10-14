export interface Mensaje {
  id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  tipo: 'texto' | 'emergencia';
  leido: boolean;
  fecha: string;
  created_at?: string;
  // Datos expandidos (joins)
  emisor?: {
    nombre: string;
    rol: string;
  };
  receptor?: {
    nombre: string;
    rol: string;
  };
}
