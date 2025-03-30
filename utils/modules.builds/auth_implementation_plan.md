# Plan de Implementación - Módulo de Autenticación y Usuarios

## Estado Actual
- Backend: 70% implementado
- Frontend: 40% implementado
- Base de datos: 90% implementado

## Cambios Requeridos

### 1. Modificaciones en el Esquema de Base de Datos
- Agregar campo `isSystemUser` al modelo User
- Actualizar enum Role para incluir RA y ADMIN
- Eliminar campos relacionados con verificación de email y recuperación de contraseña

### 2. Modificaciones en el Backend

#### 2.1 Controlador de Autenticación (AuthController.js)
- Simplificar para manejar solo:
  - Login
  - Verificación de token
  - Eliminar endpoints no necesarios:
    - Registro
    - Recuperación de contraseña
    - Verificación de email
    - 2FA
    - OAuth

#### 2.2 Rutas de Autenticación (auth.js)
- Mantener solo:
  - POST /login
  - POST /verify-token
- Eliminar todas las demás rutas

#### 2.3 Script de Inicialización
- Crear script para usuarios predefinidos:
  - RA (ra@pacta.local)
  - Admin (admin@pacta.local)
  - Contraseña por defecto: Pacta.25*

### 3. Modificaciones en el Frontend

#### 3.1 Componentes de Autenticación
- Crear LoginForm
- Implementar manejo de token
- Implementar protección de rutas
- Crear contexto de autenticación

#### 3.2 Páginas
- Login
- Dashboard (con verificación de rol)

## Plan de Implementación

### Fase 1: Backend
1. Modificar schema.prisma
2. Actualizar AuthController.js
3. Simplificar auth.js
4. Crear script de inicialización
5. Implementar middleware de autenticación

### Fase 2: Frontend
1. Crear componentes base
2. Implementar contexto de autenticación
3. Crear páginas principales
4. Implementar protección de rutas

### Fase 3: Testing
1. Pruebas de integración
2. Pruebas de seguridad
3. Verificación de usuarios predefinidos

## Criterios de Completado
1. Usuarios predefinidos funcionando
2. Login y verificación de token implementados
3. Protección de rutas funcionando
4. Tests pasando
5. Documentación actualizada

## Notas Adicionales
- La aplicación es offline, no se requieren servicios externos
- Se mantiene la seguridad básica con JWT
- Se eliminan características no necesarias
- Se mantiene la estructura actual del proyecto 