// Script para probar las consultas del dashboard
const { PrismaClient } = require('@prisma/client');
const { DASHBOARD_QUERIES } = require('./sql-queries.cjs');

// Función para formatear objetos con soporte para BigInt
function safeStringify(obj) {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  , 2);
}

// Función para formatear fechas para SQLite
function formatDateForSQLite(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Función para obtener la fecha actual en UTC
function getTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

// Función para obtener la fecha de hoy + 30 días en UTC
function getThirtyDaysLaterUTC() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));
}

// Función para formatear fechas para SQLite
function formatDateForSQLite(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

async function testDashboardQueries() {
  const prisma = new PrismaClient({
    log: ['error'] // Solo mostrar errores
  });
  
  try {
    console.log('🔍 Iniciando pruebas de consultas del dashboard...');
    
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');

    // 1. Obtener fechas para las consultas
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const todayStr = formatDateForSQLite(today);
    const thirtyDaysLaterStr = formatDateForSQLite(thirtyDaysLater);

    console.log('\n📅 Fechas para la consulta:');
    console.log(`- Hoy: ${todayStr}`);
    console.log(`- En 30 días: ${thirtyDaysLaterStr}`);

    // 2. Ejecutar consulta de estadísticas del dashboard
    console.log('\n📊 Ejecutando consulta GET_DASHBOARD_STATS...');
    
    const dashboardStats = await prisma.$queryRawUnsafe(
      DASHBOARD_QUERIES.GET_DASHBOARD_STATS,
      todayStr,
      thirtyDaysLaterStr
    );
    
    console.log('\n✅ Resultados de GET_DASHBOARD_STATS:');
    console.log(safeStringify(dashboardStats[0]));

    // 3. Contar contratos directamente con Prisma
    console.log('\n🔍 Contando contratos directamente con Prisma...');
    
    const counts = await Promise.all([
      prisma.contract.count({ where: { isArchived: false } }),
      prisma.contract.count({ 
        where: { isArchived: false, status: 'ACTIVO' } 
      }),
      prisma.contract.count({ 
        where: { isArchived: false, status: 'VENCIDO' } 
      }),
      prisma.contract.count({
        where: {
          isArchived: false,
          status: 'ACTIVO',
          endDate: {
            gte: today,
            lte: thirtyDaysLater
          }
        }
      })
    ]);
    
    console.log('\n📊 Conteo directo con Prisma:');
    console.log(`- Total contratos: ${counts[0]}`);
    console.log(`- Contratos activos: ${counts[1]}`);
    console.log(`- Contratos vencidos: ${counts[2]}`);
    console.log(`- Contratos próximos a vencer (próximos 30 días): ${counts[3]}`);
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  testDashboardQueries()
    .then(() => console.log('\n✨ Pruebas completadas'))
    .catch(console.error);
}

module.exports = { testDashboardQueries };
