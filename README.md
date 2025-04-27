# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
<!-- TODO: Añadir badges de estado de build/CI cuando esté configurado -->

**PACTA es una aplicación de escritorio para Windows (instalable localmente) diseñada para optimizar la gestión de contratos existentes en empresas grandes, con un enfoque en seguridad, accesibilidad y funcionamiento offline.** Centraliza la documentación contractual, automatiza el seguimiento de vencimientos y mejora la organización general.

<!-- TODO: Insertar un logo o captura de pantalla principal aquí -->

---

## Tabla de Contenidos

- [Introducción](#introducción)
- [Características Principales (v1.0)](#características-principales-v10)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso Básico](#uso-básico)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Introducción

PACTA aborda la necesidad de las empresas de gestionar eficientemente su cartera de contratos, reduciendo riesgos operativos y legales asociados a vencimientos o incumplimientos. Funciona como una aplicación de escritorio instalada localmente, asegurando la disponibilidad de la información incluso sin conexión a internet.

**Objetivos Principales:**
- **Centralizar y Organizar:** Unificar todos los contratos y documentos asociados en un solo lugar.
- **Automatizar Seguimiento:** Gestionar el ciclo de vida de los contratos y alertar sobre fechas clave.
- **Facilitar Cumplimiento:** Ayudar a cumplir con las obligaciones contractuales.
- **Mejorar Visibilidad:** Ofrecer dashboards y estadísticas para una visión clara del estado contractual.
- **Operación Segura y Offline:** Garantizar el acceso y la seguridad de los datos localmente.

---

## Características Principales (v1.0)

<!-- TODO: Insertar GIFs o capturas de pantalla de las características clave -->

- **Dashboard Interactivo:**
  - Resumen estadístico (total de contratos, por estado, por tipo).
  - Gráficos de distribución (estado, tipo).
  - Lista de contratos con vencimiento próximo.
  - Accesos directos para acciones comunes (Agregar Contrato/Suplemento).
  - Feed de actividad reciente.
- **Gestión Completa de Contratos:**
  - Creación de contratos con campos detallados (Número, Empresa, Fechas, Monto, etc.). *Los datos iniciales son inmutables.*
  - Listado, filtrado (Tipo, Estado) y búsqueda avanzada de contratos.
  - Vista detallada del contrato con toda su información y estado actual (Vigente, Próximo a Vencer, Vencido, Archivado).
  - **Sistema de Suplementos:** Registra modificaciones (cambio de monto, fecha, etc.) sin alterar el contrato original, manteniendo un historial completo.
  - Adjuntar documento principal al contrato y documentos adicionales a los suplementos.
  - Archivado de contratos (lógico, no eliminación).
  - Exportación de listas (CSV) y detalles (PDF).
- **Ciclo de Vida Automatizado:**
  - Cálculo automático del estado del contrato basado en fechas (considerando suplementos).
  - Archivado automático al vencer (si no hay suplemento que extienda).
  - Desarchivado automático si un suplemento futuro reactiva el contrato.
- **Notificaciones Integradas:**
  - Alertas dentro de la aplicación para contratos próximos a vencer.
  - Panel de notificaciones no leídas.
- **Gestión de Usuarios y Roles:**
  - Roles definidos: Administrador (Admin) y Responsable de Área (RA).
  - Admin puede crear y gestionar usuarios RA.
  - Todos los usuarios pueden cambiar su contraseña.
- **Estadísticas Avanzadas:**
  - Métricas detalladas y gráficos comparativos sobre la cartera de contratos.
- **Almacenamiento Local:**
  - Base de datos SQLite gestionada con Prisma.
  - Documentos adjuntos guardados en el sistema de archivos local.
- **Backup y Restauración:**
  - Sistema de backup diario automático local.
  - Funcionalidad de restauración manual para Administradores.
- **Interfaz de Usuario:**
  - Tema claro y oscuro.
  - Diseño moderno basado en Shadcn/UI y Tailwind CSS.

---

## Instalación y Configuración

### Requisitos Previos
- Node.js (v20 o superior recomendado)
- npm (v10 o superior recomendado)

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/mowgliph/pacta.git # Reemplaza con la URL correcta
    cd pacta
    ```

2.  **Instalar dependencias (Frontend y Electron):**
    ```bash
    pnpm install
    ```
    *(Esto instalará todas las dependencias listadas en `package.json` para el proyecto completo).*

3.  **Configurar variables de entorno:**
    - Busca archivos `.env.example` en las carpetas relevantes.
    - Copia estos archivos a `.env` (ej. `cp .env.example .env`).
    - Edita los archivos `.env` con tu configuración específica (ej. secretos JWT, configuración de base de datos si es necesario, etc.).

4.  **Preparar la base de datos (Prisma):**
    ```bash
    # Genera el cliente Prisma basado en tu schema.prisma
    npx prisma generate

    # Aplica las migraciones para crear/actualizar el esquema de la base de datos SQLite
    npx prisma migrate dev
    ```
    *(Opcional) Puedes inspeccionar la base de datos con:*
    ```bash
    # npx prisma studio
    ```

5.  **Ejecutar la aplicación en modo desarrollo:**
    ```bash
    # Este comando usualmente inicia el backend, frontend y Electron simultáneamente
    npm run dev
    ```
    *(Consulta los scripts en `package.json` si este comando no funciona como esperas).*


---

## Uso Básico

1.  **Iniciar Sesión:** Abre la aplicación e ingresa tus credenciales (creadas previamente por un Admin si eres RA).
2.  **Dashboard:** Al iniciar sesión, verás un resumen general, contratos por vencer y acciones rápidas.
3.  **Gestionar Contratos:**
    *   Navega a la sección de "Contratos".
    *   Usa los filtros y la búsqueda para encontrar contratos específicos.
    *   Haz clic en "Agregar Contrato" para crear uno nuevo, completando todos los campos requeridos y adjuntando el documento principal.
    *   Selecciona un contrato existente para ver sus detalles.
4.  **Añadir Suplementos:**
    *   Desde la vista de detalle de un contrato, haz clic en "Agregar Suplemento".
    *   Especifica qué campo se modifica, el nuevo valor y adjunta documentos si es necesario. El historial se actualizará.
5.  **Consultar Estadísticas:** Ve a la sección de "Estadísticas" para análisis más profundos.
6.  **Revisar Notificaciones:** Haz clic en el icono de notificaciones para ver alertas importantes.
7.  **Gestionar Usuarios (Admin):** Accede a la configuración para añadir o gestionar usuarios RA.
8.  **Backup/Restauración (Admin):** En la configuración, puedes gestionar los backups y restaurar la base de datos desde un archivo previo.

---

## Contribución

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1.  Realiza un fork del repositorio.
2.  Crea una rama para tu feature o corrección (`git checkout -b feature/mi-mejora`).
3.  Realiza tus cambios y haz commit (`git commit -m 'Agrega X funcionalidad'`).
4.  Haz push a tu rama (`git push origin feature/mi-mejora`).
5.  Abre un Pull Request detallando tus cambios.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) (si existe) para pautas más detalladas.

---

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## Contacto

Para problemas, preguntas o sugerencias, por favor abre un **Issue** en este repositorio de GitHub.

---

*¡Gracias por usar PACTA!*