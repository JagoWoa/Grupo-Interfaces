/**
 * SCRIPT DE MIGRACIÓN A SUPABASE AUTH
 * ====================================
 * Este script ayuda a migrar usuarios de las tablas antiguas (adulto_mayor, doctor)
 * a Supabase Auth de forma programática.
 * 
 * IMPORTANTE: Este script es solo para USO ÚNICO durante la migración.
 * NO incluir en la aplicación final.
 * 
 * Fecha: 23 de Octubre, 2025
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = 'TU_SERVICE_ROLE_KEY'; // ⚠️ Solo para admin, NO usar en frontend

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// INTERFACES
// ============================================
interface DoctorAntiguo {
  id: string;
  email: string;
  password: string; // ⚠️ En texto plano en BD antigua
  nombre_completo: string;
  titulo: string | null;
  especialidad: string | null;
  telefono: string | null;
}

interface AdultoMayorAntiguo {
  id: string;
  email: string;
  password: string; // ⚠️ En texto plano en BD antigua
  nombre_completo: string;
  telefono: string | null;
  doctor_id: string | null;
}

// ============================================
// FUNCIONES DE MIGRACIÓN
// ============================================

/**
 * Migrar un doctor a Supabase Auth
 */
async function migrarDoctor(doctor: DoctorAntiguo) {
  try {
    console.log(`\n🔄 Migrando doctor: ${doctor.email}`);

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: doctor.email,
      password: doctor.password, // Supabase hará el hash automáticamente
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        nombre_completo: doctor.nombre_completo
      }
    });

    if (authError) {
      console.error(`❌ Error al crear usuario en Auth:`, authError);
      return { success: false, error: authError };
    }

    const newAuthId = authData.user.id;
    console.log(`✅ Usuario creado en Auth: ${newAuthId}`);

    // 2. Ejecutar función SQL de migración
    const { error: migrationError } = await supabase.rpc('migrar_doctor_a_auth', {
      p_doctor_id: doctor.id,
      p_new_auth_id: newAuthId
    });

    if (migrationError) {
      console.error(`❌ Error al ejecutar función de migración:`, migrationError);
      return { success: false, error: migrationError };
    }

    console.log(`✅ Doctor migrado exitosamente: ${doctor.email} -> ${newAuthId}`);
    return { success: true, authId: newAuthId };

  } catch (error) {
    console.error(`❌ Error inesperado:`, error);
    return { success: false, error };
  }
}

/**
 * Migrar un adulto mayor a Supabase Auth
 */
async function migrarAdultoMayor(adulto: AdultoMayorAntiguo) {
  try {
    console.log(`\n🔄 Migrando adulto mayor: ${adulto.email}`);

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adulto.email,
      password: adulto.password,
      email_confirm: true,
      user_metadata: {
        nombre_completo: adulto.nombre_completo
      }
    });

    if (authError) {
      console.error(`❌ Error al crear usuario en Auth:`, authError);
      return { success: false, error: authError };
    }

    const newAuthId = authData.user.id;
    console.log(`✅ Usuario creado en Auth: ${newAuthId}`);

    // 2. Ejecutar función SQL de migración
    const { error: migrationError } = await supabase.rpc('migrar_adulto_mayor_a_auth', {
      p_adulto_mayor_id: adulto.id,
      p_new_auth_id: newAuthId
    });

    if (migrationError) {
      console.error(`❌ Error al ejecutar función de migración:`, migrationError);
      return { success: false, error: migrationError };
    }

    console.log(`✅ Adulto mayor migrado: ${adulto.email} -> ${newAuthId}`);
    return { success: true, authId: newAuthId };

  } catch (error) {
    console.error(`❌ Error inesperado:`, error);
    return { success: false, error };
  }
}

/**
 * Actualizar todas las referencias en las tablas relacionadas
 */
async function actualizarReferencias() {
  console.log('\n🔄 Actualizando referencias en tablas relacionadas...');
  
  const { error } = await supabase.rpc('actualizar_referencias_auth');
  
  if (error) {
    console.error('❌ Error al actualizar referencias:', error);
    return { success: false, error };
  }
  
  console.log('✅ Referencias actualizadas exitosamente');
  return { success: true };
}

// ============================================
// PROCESO COMPLETO DE MIGRACIÓN
// ============================================

async function ejecutarMigracionCompleta() {
  console.log('🚀 INICIANDO MIGRACIÓN A SUPABASE AUTH');
  console.log('==========================================\n');

  // 1. Obtener todos los doctores
  console.log('📋 Paso 1: Obteniendo doctores...');
  const { data: doctores, error: errorDoctores } = await supabase
    .from('doctor')
    .select('*');

  if (errorDoctores) {
    console.error('❌ Error al obtener doctores:', errorDoctores);
    return;
  }

  console.log(`✅ Encontrados ${doctores?.length || 0} doctores\n`);

  // 2. Migrar doctores
  console.log('📋 Paso 2: Migrando doctores...');
  let doctoresMigrados = 0;
  for (const doctor of doctores || []) {
    const result = await migrarDoctor(doctor);
    if (result.success) doctoresMigrados++;
    await delay(1000); // Esperar 1 segundo entre migraciones
  }
  console.log(`\n✅ Doctores migrados: ${doctoresMigrados}/${doctores?.length || 0}`);

  // 3. Obtener todos los adultos mayores
  console.log('\n📋 Paso 3: Obteniendo adultos mayores...');
  const { data: adultos, error: errorAdultos } = await supabase
    .from('adulto_mayor')
    .select('*');

  if (errorAdultos) {
    console.error('❌ Error al obtener adultos mayores:', errorAdultos);
    return;
  }

  console.log(`✅ Encontrados ${adultos?.length || 0} adultos mayores\n`);

  // 4. Migrar adultos mayores
  console.log('📋 Paso 4: Migrando adultos mayores...');
  let adultosMigrados = 0;
  for (const adulto of adultos || []) {
    const result = await migrarAdultoMayor(adulto);
    if (result.success) adultosMigrados++;
    await delay(1000);
  }
  console.log(`\n✅ Adultos mayores migrados: ${adultosMigrados}/${adultos?.length || 0}`);

  // 5. Actualizar referencias
  console.log('\n📋 Paso 5: Actualizando referencias...');
  await actualizarReferencias();

  // 6. Resumen final
  console.log('\n==========================================');
  console.log('✅ MIGRACIÓN COMPLETADA');
  console.log('==========================================');
  console.log(`Doctores migrados: ${doctoresMigrados}`);
  console.log(`Adultos mayores migrados: ${adultosMigrados}`);
  console.log('⚠️  IMPORTANTE: Verifica los datos antes de eliminar las tablas antiguas');
}

// ============================================
// FUNCIÓN AUXILIAR: Verificar migración
// ============================================

async function verificarMigracion() {
  console.log('\n🔍 VERIFICANDO MIGRACIÓN');
  console.log('==========================================\n');

  // Contar usuarios en tablas nuevas
  const { count: countUsuarios } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });

  const { count: countDoctores } = await supabase
    .from('doctores')
    .select('*', { count: 'exact', head: true });

  const { count: countPacientesDoctor } = await supabase
    .from('pacientes_doctor')
    .select('*', { count: 'exact', head: true });

  // Contar usuarios en tablas antiguas
  const { count: countDoctoresViejos } = await supabase
    .from('doctor')
    .select('*', { count: 'exact', head: true });

  const { count: countAdultosViejos } = await supabase
    .from('adulto_mayor')
    .select('*', { count: 'exact', head: true });

  console.log('📊 Resultados:');
  console.log(`  Tabla 'doctor' (antigua): ${countDoctoresViejos} registros`);
  console.log(`  Tabla 'adulto_mayor' (antigua): ${countAdultosViejos} registros`);
  console.log(`  Tabla 'usuarios' (nueva): ${countUsuarios} registros`);
  console.log(`  Tabla 'doctores' (nueva): ${countDoctores} registros`);
  console.log(`  Tabla 'pacientes_doctor' (nueva): ${countPacientesDoctor} registros`);

  const totalAntiguo = (countDoctoresViejos || 0) + (countAdultosViejos || 0);
  const totalNuevo = countUsuarios || 0;

  if (totalAntiguo === totalNuevo) {
    console.log('\n✅ Los totales coinciden! La migración parece correcta.');
  } else {
    console.log(`\n⚠️  ADVERTENCIA: Total antiguo (${totalAntiguo}) no coincide con total nuevo (${totalNuevo})`);
  }
}

// ============================================
// UTILIDADES
// ============================================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EJECUCIÓN
// ============================================

// Descomentar la función que quieras ejecutar:

// ejecutarMigracionCompleta(); // Migrar todos los usuarios
// verificarMigracion(); // Solo verificar el estado

// ============================================
// INSTRUCCIONES DE USO
// ============================================

/*
CÓMO USAR ESTE SCRIPT:

1. Instalar dependencias:
   npm install @supabase/supabase-js

2. Configurar variables:
   - Reemplazar SUPABASE_URL con tu URL de Supabase
   - Reemplazar SUPABASE_SERVICE_ROLE_KEY con tu service_role key
     (la encuentras en: Supabase Dashboard > Settings > API > service_role key)

3. Ejecutar primero el script SQL migration-to-supabase-auth.sql en Supabase

4. Ejecutar este script:
   ts-node migration-script.ts

5. Verificar resultados:
   - Descomentar verificarMigracion() y ejecutar de nuevo

6. Si todo está correcto, puedes eliminar las tablas antiguas desde Supabase

⚠️  IMPORTANTE: 
- Este script usa SERVICE_ROLE_KEY que tiene permisos de admin
- NUNCA incluir este script en tu aplicación frontend
- Solo ejecutar en entorno seguro (backend o local)
- Hacer backup de la base de datos antes de ejecutar
*/
