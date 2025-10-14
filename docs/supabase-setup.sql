-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  rol VARCHAR(20) CHECK (rol IN ('adulto', 'familiar', 'medico', 'admin')) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  supervisor_id UUID REFERENCES usuarios(id), -- Para vincular adulto mayor con familiar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de signos vitales
CREATE TABLE signos_vitales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  presion_arterial VARCHAR(20),
  glucosa DECIMAL(5,2),
  temperatura DECIMAL(4,2),
  peso DECIMAL(5,2),
  frecuencia_cardiaca INTEGER,
  notas TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de medicaciones
CREATE TABLE medicaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  medico_id UUID REFERENCES usuarios(id),
  nombre_medicamento VARCHAR(255) NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  hora_programada TIME,
  activo BOOLEAN DEFAULT true,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recordatorios
CREATE TABLE recordatorios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medicacion_id UUID REFERENCES medicaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  tomado BOOLEAN DEFAULT false,
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes (chat)
CREATE TABLE mensajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  emisor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  receptor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'emergencia')),
  leido BOOLEAN DEFAULT false,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de consultas
CREATE TABLE consultas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  medico_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(20) CHECK (tipo IN ('chat', 'videollamada')),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'finalizada')),
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  notas_medico TEXT,
  diagnostico TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('recordatorio', 'emergencia', 'alerta', 'general')),
  titulo VARCHAR(255),
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_signos_vitales_usuario ON signos_vitales(usuario_id);
CREATE INDEX idx_signos_vitales_fecha ON signos_vitales(fecha_registro DESC);
CREATE INDEX idx_medicaciones_usuario ON medicaciones(usuario_id);
CREATE INDEX idx_recordatorios_usuario ON recordatorios(usuario_id);
CREATE INDEX idx_mensajes_emisor ON mensajes(emisor_id);
CREATE INDEX idx_mensajes_receptor ON mensajes(receptor_id);
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha DESC);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_medico ON consultas(medico_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);

-- Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE signos_vitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
-- Los usuarios pueden ver su propia información
CREATE POLICY "Usuarios pueden ver su perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden ver sus propios signos vitales
CREATE POLICY "Ver propios signos vitales" ON signos_vitales
  FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden insertar sus propios signos vitales
CREATE POLICY "Insertar propios signos vitales" ON signos_vitales
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden ver sus mensajes
CREATE POLICY "Ver mensajes propios" ON mensajes
  FOR SELECT USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

-- Los usuarios pueden enviar mensajes
CREATE POLICY "Enviar mensajes" ON mensajes
  FOR INSERT WITH CHECK (auth.uid() = emisor_id);
