# Migración del Dashboard a SWR

## Resumen de Cambios

La migración del módulo Dashboard a SWR (Stale-While-Revalidate) ha sido completada. Los cambios realizados incluyen:

1. **Hooks de SWR para el Dashboard:**
   - Implementación de hooks especializados para cada funcionalidad del dashboard
   - Configuración de opciones de revalidación y caché según los requisitos de cada tipo de dato

2. **APIs Adaptadas:**
   - Las llamadas a API ahora utilizan los métodos de SWR: `useGet`, `usePost`, `usePut` y `useDelete`
   - Eliminación de las llamadas directas a la API a través de servicios tradicionales

3. **Gestión de Estados:**
   - Adopción del patrón de estados que ofrece SWR: `isLoading`, `isError`, `data`, etc.
   - Implementación de componentes para mostrar estados de carga y errores

4. **Separación de Tipos:**
   - Creación de un módulo centralizado de tipos en `features/dashboard/types/index.ts`
   - Movimiento de interfaces y tipos desde el servicio y los hooks hacia este módulo central
   - Eliminación de definiciones duplicadas para mejorar la mantenibilidad

## Beneficios de SWR

- **Caché Inteligente:** Almacena y reutiliza respuestas de la API automáticamente
- **Revalidación Automática:** Actualiza datos en segundo plano según la configuración
- **Dedupingación:** Evita múltiples solicitudes para el mismo recurso
- **Gestión de Estados:** Proporciona estados como carga, error y datos de manera consistente
- **Revalidación Programática:** Permite actualizar el caché de forma explícita cuando sea necesario

## Hooks Implementados

- `useDashboardStats`: Obtiene las estadísticas principales del dashboard
- `useExpiringContracts`: Obtiene los contratos próximos a vencer
- `useRecentActivity`: Obtiene la actividad reciente
- `useContractsByType`: Obtiene estadísticas de contratos por tipo
- `useContractsByStatus`: Obtiene estadísticas de contratos por estado
- `useContractsByMonth`: Obtiene estadísticas de contratos por mes
- `useUpcomingContracts`: Obtiene contratos próximos a vencer
- `useContractStats`: Obtiene estadísticas generales de contratos
- `useSupplementStats`: Obtiene estadísticas de suplementos
- `useSpecificStats`: Obtiene estadísticas específicas según el tipo
- `useUserMetrics`: Obtiene métricas específicas del usuario

## Componentes Actualizados

- `DashboardPage`: Utiliza los hooks de SWR para obtener y mostrar datos
- `DashboardPublicPage`: Versión pública del dashboard con datos limitados
- `DashboardStatsCards`: Muestra tarjetas con estadísticas obtenidas mediante SWR
- `DashboardChart`: Visualiza datos gráficos con revalidación automática
- Componentes adicionales adaptados para utilizar los hooks de SWR

## Tipos Implementados

- `DashboardStats`: Estadísticas principales del dashboard
- `Activity`: Información sobre actividades recientes
- `Contract`: Datos de contratos
- `UpcomingContract`: Información sobre contratos próximos a vencer
- `ContractStats`: Estadísticas de contratos para gráficos
- `SpecificStats`: Estadísticas específicas para diferentes entidades
- `UserMetrics`: Métricas específicas del usuario

## Configuración de SWR

La configuración de SWR se ha optimizado para diferentes tipos de datos:

- Estadísticas generales: revalidación cada 5 minutos
- Contratos por vencer: revalidación cada 10 minutos
- Actividad reciente: revalidación más frecuente (cada minuto) con revalidación al enfocar
- Estadísticas históricas: revalidación menos frecuente (cada 30 minutos o más)

## Próximos Pasos

- Monitorear el rendimiento de la aplicación con SWR para ajustar tiempos de revalidación
- Evaluar la posibilidad de implementar una estrategia de suspense con SWR
- Considerar la implementación de estrategias de prefetching para mejorar la experiencia de usuario 