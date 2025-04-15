# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

[![Version](https://img.shields.io/badge/version-0.6.0-blue.svg)]() [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

PACTA es una aplicación moderna para la gestión integral de contratos empresariales, con un enfoque en la usabilidad y la experiencia del usuario. Ofrece una vista pública gratuita que permite a los usuarios explorar las funcionalidades básicas antes de acceder al sistema completo.

---

## Tabla de Contenidos

- [Introducción](#introducción)
- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Introducción

PACTA es una plataforma diseñada para:
- **Gestionar contratos:** Visualización, filtrado y búsqueda de contratos (Cliente/Proveedor).
- **Automatizar el ciclo de vida de los contratos:** Creación, modificaciones (suplementos) y cancelación por vencimiento.
- **Generar alertas y notificaciones:** Seguimiento de vencimientos y cambios críticos.
- **Ofrecer una interfaz moderna:** Dashboard interactivo y visualización avanzada de estadísticas.

---

## Características Principales

- **Dashboard Público y Premium:**
  - Vista previa gratuita con datos de demostración
  - Dashboard completo con estadísticas en tiempo real para usuarios autenticados
  - Visualización de contratos próximos a vencer
  - Panel de acciones rápidas personalizable

- **Gestión Avanzada de Contratos:**
  - Sistema completo de CRUD para contratos
  - Gestión de suplementos con historial de cambios
  - Filtros avanzados por tipo, estado y fecha
  - Sistema de archivos integrado para documentos

- **Sistema de Roles y Permisos:**
  - Roles RA (desarrollador) y Admin con acceso completo
  - Sistema de invitación y gestión de usuarios
  - Control granular de permisos por módulo
  - Auditoría de acciones y cambios

- **Interfaz Moderna:**
  - Diseño responsive y accesible
  - Tema claro/oscuro incorporado
  - Micro-interacciones y animaciones fluidas
  - Componentes reutilizables basados en shadcn/ui

---

## Tecnologías

### Frontend
- React 19 + TypeScript
- Vite + SWR para gestión de datos
- Tailwind CSS + shadcn/ui
- Zustand para estado global
- Recharts para visualizaciones

### Backend
- Node.js + Express
- SQLite + Prisma ORM
- JWT para autenticación
- Sistema de backups automáticos

---

## Arquitectura

### Frontend
- **Feature-First Architecture:**  
  Organización por funcionalidades (contracts, dashboard, auth, users) para mejor mantenimiento y escalabilidad.
- **Componentes Atómicos:**  
  Construcción de UI con componentes pequeños, reutilizables y compositivos.
- **Custom Hooks:**  
  Lógica encapsulada en hooks personalizados para contratos, suplementos, dashboard y autenticación.
- **Separación de Responsabilidades:**
  Separación clara entre componentes de presentación, lógica de negocio y servicios.

### Backend
- **API RESTful:**  
  Endpoints organizados para usuarios, contratos, suplementos, empresas, estadísticas y actividades.
- **Controladores y Servicios:**
  Separación de la lógica de negocio en servicios independientes de los controladores.
- **Middleware de Autenticación:**
  Sistema de protección de rutas basado en tokens JWT y roles de usuario.
- **Migraciones y Modelado:**
  Gestión de base de datos mediante Prisma con migraciones versionadas.

---

## Instalación y Configuración

### Requisitos
- Node.js (v16 o superior)
- npm o yarn
- SQLite (para el backend)

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu_usuario/pacta.git
   cd pacta
   ```

2. **Instalar dependencias:**
   - **Backend:**
     ```bash
     cd backend
     npm install
     ```
   - **Frontend:**
     ```bash
     cd ../frontend
     npm install
     ```

3. **Configurar variables de entorno:**
   - Copia los archivos `.env.example` a `.env` en cada carpeta (backend y frontend) y configura tus variables.

4. **Ejecutar migraciones de base de datos:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Ejecutar la aplicación:**
   - **Backend:**
     ```bash
     npm run dev
     ```
   - **Frontend:**
     ```bash
     npm run dev
     ```

---

## Uso

Una vez iniciada la aplicación:
- **Dashboard:** Visualiza estadísticas, contratos por vencer, actividad reciente y gráficos interactivos.
- **Contratos:** Gestiona, filtra, crea y edita contratos. Visualiza detalles y documentos adjuntos.
- **Suplementos:** Gestiona modificaciones a contratos existentes con su propia documentación.
- **Perfil y Configuración:** Administra tu información personal, cambia tu contraseña y ajusta preferencias.

---

## Desarrollo

Para contribuir o personalizar la aplicación, consulta el archivo [desarrollo_pacta.md](./docs/desarrollo_pacta.md) que contiene el análisis profundo, cronograma y recomendaciones técnicas.

**Mejores prácticas:**
- Utiliza los hooks personalizados y servicios existentes para mantener la consistencia.
- Sigue el patrón establecido para componentes y funcionalidades.
- Realiza pruebas unitarias para nuevas funcionalidades.
- Documenta adecuadamente los cambios realizados.

---

## Contribución

¡Las contribuciones son bienvenidas! Para colaborar:

1. Realiza un fork del repositorio.
2. Crea una rama con tu feature o corrección:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git commit -m 'Agregar nueva funcionalidad'
   ```
4. Haz push a tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request.

Consulta el archivo [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles sobre el proceso de contribución.

---

## Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## Contacto

Si tienes preguntas o sugerencias, abre un issue en GitHub o contáctanos directamente.

---

*¡Gracias por utilizar PACTA y por contribuir a mejorar la gestión de contratos empresariales!*