# Guía para Actualizar CHANGELOG.md

## Estructura del Changelog
El archivo CHANGELOG.md sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), adaptado para PACTA.

## Tipos de Cambios
- `Añadido`: Nuevas características
- `Modificado`: Cambios en funcionalidades existentes
- `Eliminado`: Características eliminadas
- `Corregido`: Corrección de errores
- `Seguridad`: Cambios de seguridad
- `Optimizado`: Mejoras de rendimiento

## Proceso de Actualización

### 1. Preparación
- Revisar commits desde último release
- Identificar cambios significativos
- Clasificar cambios según tipo

### 2. Actualización del CHANGELOG.md
```bash
# Crear nueva entrada en formato:
## [X.Y.Z] - YYYY-MM-DD
### Tipo de Cambio
- Descripción del cambio
  - Detalles específicos
  - Sub-cambios relacionados
  ```
### 3. Actualización de la Versión en package.json
```bash
{
  "name": "pacta-frontend",
  "version": "0.2.0",

}
{
  "name": "pacta-backend",
  "version": "0.2.0",
  // ... resto del archivo
}
```
### 4. Crear tag en GitHub
```bash	
# Actualizar versión en package.json (en ambos directorios)
# Actualizar README.md con la nueva versión
# Crear tag
git tag -a v0.2.0 -m "Version 0.2.0 - Integración Electron"

# Subir cambios y tag
git push && git push --tags

# Para deshacer un tag si hay error
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0
```
### 5. Crear release en GitHub
```bash
- MAJOR (1.0.0): Cambios grandes/incompatibles

- Ejemplo: Cambio completo de arquitectura
- Nueva versión de Vue o Node
- Cambios en API que rompen compatibilidad
- MINOR (0.1.0): Nuevas funcionalidades

- Ejemplo: Nuevo módulo de reportes
- Nueva funcionalidad de búsqueda
- Mejoras en UI/UX
- PATCH (0.0.1): Correcciones

- Ejemplo: Fix de bugs
- Mejoras de rendimiento
- Actualizaciones de documentación
```
