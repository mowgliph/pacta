# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

PACTA es una aplicación de escritorio instalable localmente, diseñada para optimizar la gestión de contratos en empresas grandes. Su objetivo principal es proporcionar una solución integral para la administración eficiente de contratos ya existentes, facilitando su seguimiento, organización y control de vencimientos, garantizando así la seguridad, organización y cumplimiento de plazos, tanto en entornos con conexión a internet como sin ella.

---

## **Funciones Principales**
PACTA ofrece diversas funcionalidades para facilitar la gestión contractual:

- **Almacenamiento Local Centralizado:** Repositorio digital local para todos los contratos ya firmados y formalizados por la empresa.
- **Notificaciones y Recordatorios:** Alertas automáticas sobre vencimientos, renovaciones y acciones pendientes mostradas en la aplicación, con sincronización de correo electrónico cuando hay conexión a internet.
- **Roles y Permisos:** Sistema jerárquico de acceso con roles predefinidos (Administrador, Gestor, Usuario) y permisos personalizables por departamento, gestionado localmente.
- **Almacenamiento Seguro:** Guardado de contratos en una base de datos SQLite con cifrado AES-256 para garantizar su seguridad, con respaldos locales automáticos.
- **Búsqueda Avanzada:** Filtros dinámicos por tipo de contrato, partes involucradas, fechas y palabras clave con indexación de documentos en modo offline.
- **Dashboard y Reportes:** Panel de control interactivo con gráficos, KPIs y capacidad de exportación de informes en múltiples formatos (PDF, Excel, CSV), disponible sin conexión.
- **Importación y Exportación:** Sistema de migración de datos que permite incorporar registros de contratos existentes y exportar en formatos estándar, funcionando completamente offline.

---

## **Objetivo de PACTA**

El principal objetivo de PACTA es **reducir los errores, optimizar el tiempo de gestión y mejorar la organización de contratos** dentro de las empresas. Con esta plataforma, se busca automatizar el seguimiento y minimizar riesgos legales derivados de la falta de control de vencimientos contractuales.

PACTA también está orientado a mejorar la **transparencia y trazabilidad** en la administración de contratos, permitiendo a los usuarios acceder a datos clave de manera eficiente.

**Objetivos específicos implementados:**
- Eliminación de vencimientos no detectados mediante alertas proactivas
- Centralización de toda la documentación contractual en un único repositorio seguro
- Reducción del tiempo de búsqueda de contratos con un sistema avanzado de filtros

---

## **Características Técnicas Implementadas**

- **Instalador Windows:**
  - Ejecutable .exe para instalación completa del sistema
  - Configuración automática de base de datos local
  - Instalación del servidor backend como servicio de Windows
  - Configuración de puertos y permisos necesarios
  - Asistente de primera configuración

- **Arquitectura Frontend:** 
  - Desarrollado con React 18 y TypeScript para un código robusto y tipado
  - Gestión de estado global con Zustand para manejo eficiente de datos
  - Interfaz de usuario moderna y responsiva implementada con:
    - Tailwind CSS para estilos utilitarios y diseño adaptativo
    - Componentes shadcn/ui para una interfaz consistente y accesible
    - Sistema de temas claro/oscuro incorporado
  - Enrutamiento tipo-seguro con TanStack Router
  - Gestión de datos del servidor con TanStack Query
  - Arquitectura modular organizada por características (feature-based)
  - Gestión de formularios y validación con React Hook Form
  - Sistema de iconografía con Tabler Icons
  - Modo offline con sincronización cuando hay conexión
  - Sistema de caché local para datos frecuentes
  - Interfaz adaptada para modo offline/online
  - Sistema de notificaciones local

- **Arquitectura Backend:**
  - Servidor Express ejecutándose como servicio local
  - Base de datos SQLite para almacenamiento local
  - Sistema de caché local para optimizar consultas
  - Sincronización diferida cuando hay conexión
  - Gestión de usuarios local sin dependencias externas

- **Seguridad:**
  - Cifrado de datos sensibles en reposo y en tránsito
  - Protección contra ataques XSS, CSRF e inyección SQL
  - Backups automáticos diarios de la base de datos
  - Cifrado local de base de datos
  - Backups automáticos locales
  - Gestión de claves sin dependencia de servicios externos
  - Autenticación local sin recuperación de contraseña

- **Modo Offline:**
  - Funcionamiento completo sin conexión a internet
  - Sistema de notificaciones local
  - Almacenamiento y búsqueda local
  - Reportes y análisis sin conexión
  - Exportación local de datos

---

## **Modelo de Negocio**

PACTA adopta un modelo de negocio basado en **licencias perpetuas** con tres niveles:

- **Licencia Básica:** 
  - Hasta 100 contratos almacenados
  - 5 usuarios locales
  - Funcionalidades esenciales
  - Asistencia Tecnica
  - Sin personalización

- **Licencia Profesional:**
  - Hasta 500 contratos almacenados
  - 20 usuarios locales
  - Todas las funcionalidades
  - Asistencias Tecnicas
  - Personalización básica

- **Licencia Empresarial:**
  - Contratos ilimitados
  - Usuarios locales ilimitados
  - Todas las funcionalidades avanzadas
  - Asistnecias tecnicas
  - Personalización completa
  - Migración de datos incluida

---

## **Funcionamiento de la Aplicación**

### **1. Instalación y Configuración**
- Instalador unificado .exe
- Configuración inicial guiada
- Creación de usuario administrador local
- Configuración de backup local
- Verificación de requisitos del sistema

### **2. Gestión de Usuarios**
Sistema de autenticación local sin recuperación de contraseña externa. Los administradores son los únicos que pueden gestionar usuarios y restablecer contraseñas localmente.

### **3. Carga y Organización de Contratos**
Interfaz intuitiva para subir contratos ya firmados en formatos digitales comunes (PDF, DOCX), añadir metadatos relevantes y clasificarlos según tipo, partes involucradas, fechas clave y departamento responsable.

### **4. Almacenamiento y Seguridad**
Arquitectura de almacenamiento distribuido con cifrado de extremo a extremo y políticas de retención de documentos configurables.

### **5. Notificaciones y Alertas**
Centro de notificaciones centralizado con configuración personalizable de canales (email, SMS, in-app) y frecuencia de alertas según criticidad, enfocado en fechas de vencimiento y renovación de contratos.

### **6. Historial de Accesos y Auditoría**
Sistema de registro detallado de todas las consultas y modificaciones a los metadatos de contratos, asegurando trazabilidad completa para cumplimiento normativo.

### **7. Visualización de Contratos**
Visor integrado para documentos que permite consulta rápida sin necesidad de descargar, con controles de seguridad para prevenir fugas de información sensible.

### **8. Reportes y Análisis**
Motor de informes interactivos con dashboards personalizables, alertas predictivas sobre vencimientos próximos y capacidades de análisis avanzado con exportación en múltiples formatos.

### **9. Importación y Exportación**
Asistentes guiados para migración de registros de contratos desde otros sistemas con validación y mapeo inteligente de campos y exportación por lotes.

---

## **Casos de Uso Implementados**

### **Sector Legal**
Gestión completa del ciclo de vida de contratos para despachos de abogados, con control exhaustivo de fechas límite y vencimientos de acuerdos legales.

### **Departamentos de Compras**
Seguimiento de contratos con proveedores, monitoreo de renovaciones y análisis de condiciones para optimización de costos.

### **Recursos Humanos**
Gestión de contratos laborales, acuerdos de confidencialidad y documentación relacionada con empleados, con alertas automáticas de renovaciones.

### **Sector Inmobiliario**
Administración de contratos de arrendamiento, compraventa y servicios, con seguimiento automatizado de fechas clave y condiciones especiales.

---

PACTA continúa evolucionando para ofrecer la solución más completa, segura y eficiente para la gestión y seguimiento de contratos empresariales, adaptándose a las necesidades específicas de cada organización y sector.

