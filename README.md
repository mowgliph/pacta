# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

PACTA es una aplicación de escritorio instalable localmente, diseñada para optimizar la gestión de contratos en empresas grandes. Su objetivo principal es proporcionar una solución integral para la administración eficiente de contratos ya existentes, facilitando su seguimiento, organización y control de vencimientos, garantizando así la seguridad, organización y cumplimiento de plazos, tanto en entornos con conexión a internet como sin ella.

---

## **Funciones Principales**
PACTA ofrece diversas funcionalidades para facilitar la gestión contractual:

- **Dashboard Estadístico:** Panel principal con resumen visual de estadísticas de contratos y acciones rápidas personalizables.
- **Gestión de Contratos:** Visualización, filtrado y búsqueda avanzada de contratos por tipo (Cliente/Proveedor), estado y otros criterios.
- **Suplementos Contractuales:** Sistema para modificación de contratos mediante suplementos, manteniendo historial completo de cambios.
- **Notificaciones y Recordatorios:** Alertas automáticas sobre vencimientos, renovaciones y acciones pendientes mostradas en la aplicación.
- **Perfiles de Usuario:** Gestión de usuarios con roles específicos (RA y admin) con capacidad de personalización de contraseñas.
- **Estadísticas Avanzadas:** Sección dedicada a métricas y análisis detallado de la gestión contractual global.
- **Ciclo de Vida de Contratos:** Control automático de estados de contratos basado en fechas de vencimiento.

---

## **Objetivo de PACTA**

El principal objetivo de PACTA es **reducir los errores, optimizar el tiempo de gestión y mejorar la organización de contratos** dentro de las empresas. Con esta plataforma, se busca automatizar el seguimiento y minimizar riesgos legales derivados de la falta de control de vencimientos contractuales.

**Objetivos específicos implementados:**
- Eliminación de vencimientos no detectados mediante alertas proactivas
- Centralización de toda la documentación contractual en un único repositorio seguro
- Reducción del tiempo de búsqueda de contratos con un sistema avanzado de filtros
- Visualización eficiente mediante dashboard intuitivo y estadísticas detalladas

---

## **Características Técnicas Implementadas**

- **Arquitectura Frontend:** 
  - Desarrollado con React 18 y TypeScript para un código robusto y tipado
  - Interfaz moderna con Shadcn/UI y Tailwind CSS para diseño minimalista y responsivo
  - Enrutamiento tipo-seguro con TanStack Router
  - Gestión de estado global con Zustand para manejo eficiente de datos
  - Sistema de componentes modulares y reutilizables
  - Visualización de datos con gráficos interactivos
  - Dashboard principal optimizado para visualización de estadísticas
  - Sistema de temas claro/oscuro incorporado

- **Arquitectura Backend:**
  - Servidor Express con TypeScript
  - Base de datos SQLite para almacenamiento local
  - API RESTful organizada por recursos
  - Sistema de autenticación JWT con roles definidos
  - Validación de datos con Zod
  - Gestión de suplementos contractuales
  - Lógica de negocio para estados de contratos

- **Flujo de Trabajo de Contratos:**
  - Creación de contratos nuevos con datos completos
  - Modificación mediante suplementos (preservando historial)
  - Cambio automático de estado según fechas de vencimiento
  - Sin eliminación física (solo cambios de estado)
  - Filtrado por tipo de contrato (Cliente/Proveedor)
  - Clasificación automática (Vigente, Vencido, etc.)

---

## **Secciones Principales de la Aplicación**

### **1. Dashboard Principal**
Panel central con visualización de estadísticas clave, indicadores de rendimiento y acciones rápidas como:
- Resumen de contratos por estado y tipo
- Gráficos de distribución de contratos
- Accesos directos para agregar contratos o suplementos
- Alertas de vencimientos próximos
- Vista rápida de actividad reciente

### **2. Gestión de Contratos**
Vista completa de todos los contratos con:
- Tabla interactiva con ordenamiento y filtrado
- Filtros principales por tipo (Cliente/Proveedor)
- Búsqueda por número de contrato, empresa, etc.
- Vista detallada de cada contrato
- Historial de suplementos asociados
- Estados visuales según vigencia

### **3. Estadísticas Avanzadas**
Sección dedicada exclusivamente al análisis con:
- Métricas detalladas de contratos por categoría
- Gráficos comparativos y evolutivos
- Tendencias de renovación y cancelación
- Rendimiento por tipo de contrato
- Reportes exportables

### **4. Perfil de Usuario**
Gestión personalizada del usuario con:
- Datos de perfil modificables
- Cambio de contraseñas seguro
- Preferencias de notificaciones
- Historial de actividad

---

PACTA evoluciona para ofrecer una solución completa y eficiente para la gestión contractual empresarial, con enfoque en usabilidad, visualización de datos y flujos de trabajo optimizados.

