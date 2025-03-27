# PACTA - Historial de Cambios

Todos los cambios notables en PACTA serán documentados en este archivo.

## [0.3.0] - 2024-03-26
### Añadido
- Sistema de Backup
  - Implementación de backup automático
  - Sistema de purga automática
  - API de backup completa
  - Compresión y verificación de integridad
  - Rotación de backups

- Configuración Electron
  - Sistema de auto-updates
  - Scripts de empaquetado
  - Integración con sistema operativo
  - Manejo de errores de aplicación

### Modificado
- Migración a SQLite
  - Optimización de consultas
  - Implementación de índices
  - Configuración de ruta local

- Sistema de Archivos
  - Estructura de directorios optimizada
  - Sistema de versionado de archivos
  - Gestión de permisos mejorada

## [0.2.0] - 2024-03-25
### Añadido
- Autenticación Offline
  - Sistema JWT local
  - Gestión de usuarios offline
  - RBAC local
  - Auditoría local
  - Políticas de contraseñas

- Base Local
  - Configuración Prisma con SQLite
  - Sistema de archivos local
  - Compresión y optimización
  - Limpieza automática

### Modificado
- Arquitectura Backend
  - Adaptación para modo offline
  - Optimización de consultas locales
  - Sistema de caché local

## [0.1.0] - 2024-03-24
### Añadido
- Estructura inicial del proyecto
  - Configuración base Vue.js
  - Configuración base Express
  - Integración inicial SQLite
  - Sistema básico de autenticación

### Seguridad
- Implementación de cifrado local
- Sistema básico de backups
- Protección de datos en reposo

## Próximas Características
- Sistema de notificaciones local
- Motor de búsqueda offline
- Panel de administración local
- Interfaz de gestión de backups
- Sistema de logs completo