# Documento de Requerimientos del Producto (PRD) - PACTA v1.0

**Última actualización:** 22 de abril de 2025

## 1. Introducción y Resumen Ejecutivo

PACTA es una aplicación de escritorio instalable localmente, diseñada para optimizar la gestión de contratos existentes en empresas grandes. Su objetivo es centralizar la documentación contractual, automatizar el seguimiento de vencimientos y mejorar la organización general, funcionando tanto online como offline. Este documento describe los requerimientos para la versión inicial de PACTA.

## 2. Objetivos del Producto

- **Reducir errores:** Minimizar los riesgos legales y operativos asociados a vencimientos no detectados.
- **Optimizar tiempo:** Disminuir el tiempo dedicado a la búsqueda y gestión manual de contratos.
- **Mejorar organización:** Centralizar toda la información contractual en un repositorio único y seguro.
- **Facilitar cumplimiento:** Asegurar el seguimiento proactivo de plazos y obligaciones contractuales.
- **Proveer visibilidad:** Ofrecer información clara y rápida sobre el estado contractual a través de dashboards y estadísticas.

## 3. Alcance

**Incluido en v1.0:**

- Dashboard principal con estadísticas clave.
- Módulo de gestión de contratos (creación, visualización, filtrado, búsqueda).
- Sistema de suplementos para registrar modificaciones contractuales (sin alterar el contrato original).
- Notificaciones dentro de la aplicación para vencimientos y acciones pendientes.
- Gestión básica de usuarios con roles (RA, Admin) y cambio de contraseña.
- Sección de estadísticas avanzadas (métricas detalladas).
- Control automático del ciclo de vida de los contratos (estados: Vigente, Vencido, etc.).
- Almacenamiento local (SQLite) y sistema de archivos para documentos.
- Tema claro/oscuro.

**No incluido en v1.0 (Consideraciones Futuras):**

- Modo público/demo.
- Funcionalidades colaborativas avanzadas.
- Integraciones con sistemas externos (ERP, CRM).
- Personalización avanzada de roles y permisos.
- Auditoría detallada de acciones de usuario.
- Backups automáticos en la nube.
- Exportación avanzada de reportes personalizables.
- Configuración de servidor SMTP para notificaciones por email (se usará el sistema de notificaciones de la app).
- Gestión de documentos adjuntos (más allá de asociarlos al contrato/suplemento).

## 4. Usuarios y Roles

- **Administrador (Admin):** Acceso completo a todas las funcionalidades, incluida la gestión de usuarios y configuraciones del sistema. Responsable de la configuración inicial y mantenimiento.
- **Responsable de Área (RA):** Acceso a la gestión de contratos (crear, ver, modificar mediante suplementos), visualización de dashboards y estadísticas. No puede gestionar usuarios ni configuraciones globales.

## 5. Requerimientos Funcionales

### 5.1 Dashboard Principal

- **RF-DASH-001:** Mostrar resumen estadístico de contratos (total, por estado, por tipo Cliente/Proveedor).
- **RF-DASH-002:** Visualizar gráficos interactivos básicos (distribución por estado/tipo).
- **RF-DASH-003:** Presentar lista de contratos con vencimiento próximo (configurable, ej: próximos 30 días).
- **RF-DASH-004:** Incluir accesos directos para "Agregar Contrato" y "Agregar Suplemento".
- **RF-DASH-005:** Mostrar un feed de actividad reciente (últimos contratos/suplementos agregados).

### 5.2 Gestión de Contratos

- **RF-GCON-001:** Permitir la creación de nuevos contratos con campos definidos (Número, Empresa, Tipo [Cliente/Proveedor], Fecha Inicio, Fecha Fin, Monto inicial, Descripción General, etc.). Los datos iniciales del contrato son inmutables tras la creación.
- **RF-GCON-002:** Mostrar listado de contratos en una tabla interactiva (ordenable, paginada/virtualizada).
- **RF-GCON-003:** Permitir filtrar contratos por: Tipo (Cliente/Proveedor), Estado (Vigente, Próximo a Vencer, Vencido, Archivado).
- **RF-GCON-004:** Permitir búsqueda por número de contrato, nombre de empresa o palabras clave en la descripción.
- **RF-GCON-005:** Mostrar vista detallada de un contrato seleccionado, incluyendo todos sus campos iniciales y su estado actual.
- **RF-GCON-006:** Implementar sistema de "Suplementos" para modificar contratos existentes. Cada suplemento debe registrar qué campo se modifica (ej: Monto, Fecha de Vigencia, Descripción, Cliente), el valor anterior, el nuevo valor y la fecha del cambio.
- **RF-GCON-007:** La vista detallada del contrato debe mostrar el historial completo de suplementos asociados.
- **RF-GCON-008:** Permitir "Archivar" un contrato (cambio de estado, no eliminación física). Los contratos archivados no aparecerán por defecto en la lista principal pero podrán ser filtrados.
- **RF-GCON-009:** Calcular automáticamente el estado del contrato (Vigente, Próximo a Vencer, Vencido) basado en la fecha de fin (considerando la última fecha de vigencia definida en un suplemento, si existe).
- **RF-GCON-010:** Permitir adjuntar el documento principal del contrato (PDF, Word) durante la creación. (Simplificado para v1.0: solo un archivo principal).
- **RF-GCON-011:** Permitir adjuntar documentos a los suplementos.
- **RF-GCON-012:** Permitir exportar la lista de contratos (filtrada o completa) a CSV/Excel.
- **RF-GCON-013:** Permitir exportar los detalles de un contrato específico (incluyendo historial de suplementos) a PDF.

### 5.3 Notificaciones

- **RF-NOTI-001:** Generar notificaciones dentro de la aplicación para contratos que entren en estado "Próximo a Vencer".
- **RF-NOTI-002:** Mostrar un panel/icono de notificaciones no leídas.
- **RF-NOTI-003:** Permitir marcar notificaciones como leídas.

### 5.4 Gestión de Usuarios y Perfil

- **RF-USER-001:** Permitir al Admin crear nuevos usuarios (RA).
- **RF-USER-002:** Permitir al Admin desactivar/reactivar usuarios.
- **RF-USER-003:** Permitir a todos los usuarios cambiar su propia contraseña.
- **RF-USER-004:** Mostrar información básica del perfil del usuario logueado.

### 5.5 Estadísticas Avanzadas

- **RF-ESTA-001:** Mostrar métricas detalladas sobre contratos (ej: distribución por monto, duración promedio, etc.).
- **RF-ESTA-002:** Presentar gráficos comparativos (ej: contratos Cliente vs Proveedor por mes).
- **RF-ESTA-003:** Analizar tendencias de vencimiento y creación de contratos.

## 6. Requerimientos No Funcionales

- **RNF-PERF-001:** La interfaz debe ser responsiva y cargar rápidamente (< 3 segundos en hardware promedio).
- **RNF-USAB-001:** La aplicación debe ser intuitiva y fácil de usar, siguiendo principios de diseño modernos (basado en Shadcn/UI).
- **RNF-SECU-001:** La autenticación debe ser segura (JWT). Las contraseñas deben almacenarse hasheadas.
- **RNF-SECU-002:** El acceso a funcionalidades debe estar restringido por rol.
- **RNF-DATA-001:** Los datos se almacenarán localmente en una base de datos SQLite. Los archivos adjuntos se guardarán en el sistema de archivos local.
- **RNF-COMP-001:** La aplicación debe ser compatible con Windows 10/11 (versiones de 64 bits).
- **RNF-ESTA-001:** La aplicación debe ser estable y manejar errores de forma controlada (mostrar mensajes de error claros).

## 7. Diseño y Experiencia de Usuario (UX/UI)

- Se utilizará Next.js con TypeScript para el frontend.
- La interfaz se basará en Shadcn/UI y Tailwind CSS para un diseño limpio y moderno.
- Se implementará un tema claro y oscuro.
- El enrutamiento será gestionado con el enrutador de Next.js (App Router).
- Se priorizará la claridad visual de los datos en tablas y gráficos.
- Se adjuntarán wireframes/mockups de las pantallas principales (Referencia: `docs/Dashboard-Referencia.jpg`, `docs/lading page de referencia.jpg` - adaptar a aplicación de escritorio).

## 8. Criterios de Lanzamiento (Release Criteria)

- Todas las funcionalidades definidas en la sección 5 deben estar implementadas y probadas.
- No debe haber errores críticos (bloqueantes) o mayores sin resolver.
- Las pruebas de rendimiento deben cumplir los umbrales definidos en RNF-PERF-001.
- La documentación básica de usuario debe estar completa.
- El instalador para Windows debe funcionar correctamente.

## 9. Suposiciones

- Los usuarios tendrán conocimientos básicos de informática y gestión de contratos.
- La aplicación se instalará en equipos con los requisitos mínimos de sistema operativo y hardware.
- No se requiere integración con otros sistemas en esta versión.

## 10. Dependencias

- Dependencia del framework Electron para la creación de la aplicación de escritorio.
- Dependencia de las librerías de UI (Shadcn/UI, Tailwind).
- Dependencia de Node.js y Prisma para el backend y acceso a datos.

## 11. Preguntas Abiertas / Futuras Consideraciones

- ¿Se necesita un mecanismo de backup/restauración manual para la base de datos local en v1.0?

  - **Respuesta:** Sí, se necesita un mecanismo de respaldo y restauración para la base de datos local.

  **Detalles del Mecanismo:**

  - **Respaldo Diario:**

    - La aplicación generará automáticamente un respaldo diario de la base de datos local.
    - Los respaldos se almacenarán en una carpeta específica dentro del sistema de archivos local.
    - Los respaldos obsoletos (con más de 7 días de antigüedad) se eliminarán automáticamente para optimizar el espacio de almacenamiento.

  - **Restauración Manual:**
    - La funcionalidad de restauración estará disponible en la configuración del usuario administrador.
    - El administrador podrá seleccionar un archivo de respaldo existente para restaurar la base de datos.
    - La restauración sobrescribirá los datos actuales con los del respaldo seleccionado.

  **Consideraciones Adicionales:**

  - Se debe implementar un sistema de notificaciones para alertar al administrador en caso de fallos en el proceso de respaldo.
  - Los respaldos deben estar protegidos para evitar accesos no autorizados.

- ¿Cómo se gestionará la actualización de la aplicación a futuras versiones?
- **Detalle de Campos Requeridos:**
  - **I. Campos para un Contrato:**
    - **Encabezado:**
      - Número de contrato (ej. “No. \_**\_ / 20**”)
      - Fecha de firma: día, mes y año
      - Lugar de firma: ciudad o municipio
    - **Identificación de las Partes (Prestador y Cliente):**
      - Razón social / Nombre completo
      - Domicilio legal: calle, municipio y provincia
      - Nacionalidad
      - Autorización Comercial (MN)
      - Datos bancarios: Cuenta (CUP/MLC), sucursal, agencia, titular
      - Código REEUP
      - NIT
      - Teléfonos de contacto
      - Representante legal: Nombre, cargo, instrumento de representación (resolución/poder), número y fecha
    - **Objeto del Contrato:**
      - Descripción del servicio/producto
      - Referencia al Anexo Nº 1 (servicios, precios)
    - **Obligaciones de las Partes:**
      - Del Prestador: Especificar cada obligación
      - Del Cliente: Especificar cada obligación
    - **Lugar, plazos y condiciones de entrega:**
      - Lugar de entrega
      - Plazo acordado (Referencia Anexo 3)
      - Procedimiento de aceptación (Acta de Conformidad, Anexo 2)
    - **Condiciones económicas:**
      - Valor total y desglose (Referencia Anexo 1)
      - Moneda de pago (MN, MLC)
      - Forma de pago
      - Plazos de pago (ej. 30 días)
      - Cláusula de modificación de precios y procedimiento de suplemento
    - **Garantía y calidad:**
      - Plazo de garantía (según factura y Anexo 1)
      - Alcance y exclusiones
      - Normas técnicas aplicables
    - **Reclamaciones y solución de conflictos:**
      - Plazos y forma de reclamación
      - Jurisdicción y procedimiento (mediación/arbitraje)
    - **Penalidades:**
      - Intereses por mora
      - Sanciones por incumplimiento
    - **Avisos:**
      - Formas de notificación
      - Plazo mínimo de aviso
    - **Duración y terminación:**
      - Vigencia inicial y prórroga
      - Resolución anticipada (plazo de preaviso)
    - **Causas eximentes (fuerza mayor):**
      - Definición, notificación y terminación
    - **Anexos:**
      - Anexo 1: Listado de servicios y precios
      - Anexo 2: Acta de Conformidad
      - Anexo 3: Plazo de entrega
      - Otros documentos referenciados
    - **Firmas:**
      - Nombre, cargo y firma de ambas partes
      - Fecha y lugar de firma
  - **II. Campos para un Suplemento:**
    - **Encabezado del Suplemento:**
      - Título (ej. “Suplemento al Contrato... ”)
      - Número de suplemento (correlativo)
      - Fecha y lugar de emisión
    - **Referencia al Contrato original:**
      - Número de contrato y fecha de firma
      - Partes y representantes (igual que en contrato)
    - **Objeto del Suplemento:**
      - Propósito (modificar cláusulas, ampliar servicios, etc.)
    - **Detalle de Modificaciones:**
      - Campo modificado (ej. tipo cliente, monto, fecha vigencia)
      - Valor original
      - Nuevo valor
      - Fecha de entrada en vigor de la modificación
    - **Vinculación y aceptación:**
      - Cláusula de integración con el contrato original
    - **Firmas del Suplemento:**
      - Nombre, cargo y firma de representantes
      - Fecha de firma
- Explorar la viabilidad de la búsqueda de texto completo dentro de los documentos adjuntos en futuras versiones.
- **Flujo de Archivado/Desarchivado de Contratos:**
  - **Archivado Automático:** Un contrato pasará automáticamente al estado "Archivado" cuando se alcance su fecha de fin de vigencia (considerando la fecha del último suplemento, si existe) y no se haya registrado un nuevo suplemento que extienda dicha vigencia antes de esa fecha.
  - **Desarchivado Automático:** Si se agrega un nuevo suplemento a un contrato que se encuentra en estado "Archivado", y este suplemento modifica la fecha de fin de vigencia a una fecha futura, el contrato pasará automáticamente al estado "Vigente".
