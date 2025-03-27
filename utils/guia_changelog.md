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