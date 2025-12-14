-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE conversacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  adulto_mayor_id uuid NOT NULL,
  creada_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  activo boolean DEFAULT true,
  CONSTRAINT conversacion_pkey PRIMARY KEY (id),
  CONSTRAINT conversacion_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES usuarios(id),
  CONSTRAINT conversacion_adulto_mayor_id_fkey FOREIGN KEY (adulto_mayor_id) REFERENCES usuarios(id)
);
CREATE TABLE doctores (
  id integer NOT NULL DEFAULT nextval('doctores_id_seq'::regclass),
  usuario_id uuid NOT NULL UNIQUE,
  titulo character varying NOT NULL,
  especialidad character varying NOT NULL,
  numero_licencia character varying,
  anos_experiencia integer,
  disponible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT doctores_pkey PRIMARY KEY (id),
  CONSTRAINT doctores_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE TABLE historial_medico (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  adulto_mayor_id uuid NOT NULL,
  diagnostico text NOT NULL,
  tratamiento text,
  medicamentos text,
  observaciones text,
  fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT historial_medico_pkey PRIMARY KEY (id),
  CONSTRAINT historial_medico_adulto_mayor_id_fkey FOREIGN KEY (adulto_mayor_id) REFERENCES usuarios(id)
);
CREATE TABLE mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversacion_id uuid NOT NULL,
  emisor_tipo character varying NOT NULL CHECK (emisor_tipo::text = ANY (ARRAY['doctor'::character varying, 'adulto_mayor'::character varying]::text[])),
  contenido text NOT NULL,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  leido boolean DEFAULT false,
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES conversacion(id)
);
CREATE TABLE pacientes_doctor (
  id integer NOT NULL DEFAULT nextval('pacientes_doctor_id_seq'::regclass),
  paciente_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  fecha_asignacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  activo boolean DEFAULT true,
  notas text,
  CONSTRAINT pacientes_doctor_pkey PRIMARY KEY (id),
  CONSTRAINT pacientes_doctor_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
  CONSTRAINT pacientes_doctor_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES usuarios(id)
);
CREATE TABLE recordatorio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  adulto_mayor_id uuid NOT NULL,
  titulo text NOT NULL,
  subtitulo text,
  fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_recordatorio timestamp with time zone,
  completado boolean DEFAULT false,
  CONSTRAINT recordatorio_pkey PRIMARY KEY (id),
  CONSTRAINT recordatorio_adulto_mayor_id_fkey FOREIGN KEY (adulto_mayor_id) REFERENCES usuarios(id)
);
CREATE TABLE signos_vitales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  adulto_mayor_id uuid NOT NULL,
  presion_arterial character varying,
  frecuencia_cardiaca character varying,
  temperatura character varying,
  peso character varying,
  ultima_medicion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT signos_vitales_pkey PRIMARY KEY (id),
  CONSTRAINT signos_vitales_adulto_mayor_id_fkey FOREIGN KEY (adulto_mayor_id) REFERENCES usuarios(id)
);
CREATE TABLE usuarios (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  nombre_completo character varying NOT NULL,
  telefono character varying CHECK (telefono IS NULL OR telefono::text !~ '@'::text AND length(regexp_replace(telefono::text, '[^0-9]'::text, ''::text, 'g'::text)) >= 10),
  fecha_nacimiento date,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['adulto_mayor'::character varying, 'doctor'::character varying, 'admin'::character varying]::text[])),
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  email_cuidador character varying CHECK (email_cuidador IS NULL OR email_cuidador::text ~~ '%@%.%'::text),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE v_doctor_id (
  id uuid
);