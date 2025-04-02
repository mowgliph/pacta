# PACTA: Plataforma de Automatización y Control de Contratos Empresariales

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]() [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

PACTA es una aplicación de escritorio instalable localmente, diseñada para optimizar la gestión de contratos en empresas grandes. Su objetivo es proporcionar una solución integral para la administración eficiente de contratos, con énfasis en usabilidad, seguridad y visualización avanzada.

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
  Listado completo de contratos con filtros por tipo, búsqueda avanzada y visualización detallada.

- **Gestión de Suplementos:**  
  Mecanismo para modificar contratos preservando el historial completo de cambios.

- **Autenticación y Control de Acceso:**  
  Sistema de roles (RA y admin) con autenticación JWT, control robusto de permisos y cambio de contraseña.

- **Diseño y Usabilidad:**  
  Interfaz minimalista y moderna basada en Tailwind CSS, shadcn/UI y React con Vite.

- **Optimización de Desempeño:**  
  Code splitting, lazy loading y caché inteligente para una experiencia de usuario ágil.

- **Accesibilidad:**  
  Cumplimiento de estándares WCAG AA/AAA, diseño mobile-first, y micro-interacciones para una experiencia inclusiva.

- **Innovación:**  
  Posible integración de analíticas predictivas y recomendaciones basadas en IA para mejorar la gestión proactiva de contratos.

---

## Tecnologías

### Frontend
- **Framework:** React 19 y TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS y shadcn/UI
- **Enrutamiento:** TanStack Router
- **Gestión de Estado:** Zustand y SWR

### Backend
- **Runtime:** Node.js con Express.js y TypeScript
- **Persistencia:** Prisma ORM con SQLite
- **Autenticación:** JWT
- **Validación:** Zod
- **Documentación:** Swagger/OpenAPI

---

## Arquitectura

### Frontend
- **Dashboard y Navegación:**  
  Interfaz con secciones de Contratos, Estadísticas y Perfil, complementada con micro-interacciones y animaciones sutiles.
- **Modularidad:**  
  Uso de componentes atómicos y reutilizables, facilitando la escalabilidad y el mantenimiento.
- **Optimización:**  
  Implementación de técnicas como code splitting, lazy loading y caché inteligente.

### Backend
- **API RESTful:**  
  Endpoints organizados para usuarios, contratos, suplementos, empresas, notificaciones y estadísticas.
- **Lógica de Negocio:**  
  Manejo automático de estados, validación exhaustiva con Zod y control centralizado de errores.
- **Seguridad:**  
  Autenticación basada en JWT, control de roles y protección de endpoints críticos.

---

## Instalación y Configuración

### Requisitos
- Node.js (versión LTS recomendada)
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
   - Revisa los archivos `.env.example` y configura tus variables en cada carpeta (backend y frontend).

4. **Ejecutar la aplicación:**
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
- **Dashboard:** Visualiza estadísticas, gráficos interactivos y accede a acciones rápidas.
- **Contratos:** Gestiona, filtra y busca contratos con facilidad.
- **Estadísticas:** Accede a análisis detallados, tendencias y reportes exportables.
- **Perfil:** Administra tu información personal y configura las notificaciones y la seguridad.

---

## Desarrollo

Para contribuir o personalizar la aplicación, consulta el archivo [desarrollo_de_pacta.txt](./docs/desarrollo_de_pacta.txt) que contiene el análisis profundo, cronograma y recomendaciones técnicas.

**Puntos clave:**
- Sigue las mejores prácticas de desarrollo y actualiza regularmente las dependencias.
- Realiza pruebas unitarias y de integración para mantener la estabilidad.
- Utiliza herramientas de monitoreo para detectar y resolver problemas en producción.

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