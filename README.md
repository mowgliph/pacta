# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]() [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

PACTA es una aplicación web diseñada para optimizar la gestión de contratos en empresas grandes. Su objetivo es proporcionar una solución integral para la administración eficiente de contratos, con énfasis en usabilidad, seguridad y visualización avanzada.

---

## Tabla de Contenidos

- [Introducción](#introducción)
- [Características](#características)
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

## Características

- **Dashboard Estadístico Moderno:**  
  Resumen visual de contratos, indicadores de rendimiento, gráficos interactivos y acciones rápidas.

- **Gestión Integral de Contratos:**  
  Listado completo de contratos con filtros avanzados por tipo, estado, fecha, búsqueda avanzada y visualización detallada.

- **Gestión de Suplementos:**  
  Sistema completo para crear, visualizar y gestionar modificaciones a contratos preservando el historial completo de cambios.

- **Autenticación y Control de Acceso:**  
  Sistema de roles (Administrador, Gestor, Usuario) con autenticación JWT, control robusto de permisos y cambio de contraseña seguro.

- **Dashboard Público y Autenticado:**
  Vistas diferenciadas según el tipo de usuario, con información adaptada a sus necesidades y permisos.

- **Diseño y Usabilidad:**  
  Interfaz minimalista y moderna basada en Tailwind CSS, shadcn/UI y React con Vite, con transiciones y animaciones fluidas.

- **Optimización de Desempeño:**  
  Code splitting, lazy loading, react-query para gestión de datos en caché y SWR para una experiencia de usuario ágil.

- **Accesibilidad:**  
  Cumplimiento de estándares WCAG AA/AAA, diseño mobile-first, y micro-interacciones para una experiencia inclusiva.

- **Sistema de Actividades y Notificaciones:**
  Registro de actividades y eventos del sistema, con notificaciones para vencimientos de contratos y cambios importantes.

---

## Tecnologías

### Frontend
- **Framework:** React 19 con TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS, shadcn/UI y Lucide Icons
- **Enrutamiento:** React Router v6
- **Gestión de Estado:** Zustand para estado global
- **Gestión de Datos:** React Query y SWR para fetching y caché
- **Gráficos:** Recharts para visualizaciones
- **Formularios:** React Hook Form con Zod para validación
- **Componentes de Fecha:** date-fns para manipulación de fechas

### Backend
- **Runtime:** Node.js con Express.js
- **Base de Datos:** SQLite con Prisma ORM 
- **Autenticación:** JWT con bcrypt para encriptación
- **Validación:** Express Validator
- **Subida de Archivos:** Multer
- **Logging:** Sistema personalizado de registro de actividades

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