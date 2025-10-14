export interface Consulta {
  id: string;
  paciente_id: string;
  medico_id?: string;
  tipo: 'chat' | 'videollamada';
  estado: 'pendiente' | 'en_curso' | 'finalizada';
  fecha_solicitud: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  notas_medico?: string;
  diagnostico?: string;
  created_at?: string;
  // Datos expandidos
  paciente?: {
    nombre: string;
  };
  medico?: {
    nombre: string;
  };
}
