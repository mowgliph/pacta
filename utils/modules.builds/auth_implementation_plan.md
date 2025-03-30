# Plan de Implementación - Módulo de Autenticación y Usuarios

## Estado Actual
- **Backend: 95% implementado** (Pendiente testing)
- **Frontend: 40% implementado**
- **Base de datos: 100% implementado**

## Cambios Requeridos

### 1. Modificaciones en el Esquema de Base de Datos (✅ Completado)
- [x] Agregar campo `isSystemUser` al modelo User
- [x] Actualizar enum Role para incluir RA y ADMIN
- [x] Eliminar campos relacionados con verificación de email y recuperación de contraseña

### 2. Modificaciones en el Backend (✅ Completado)

#### 2.1 Controlador de Autenticación (AuthController.js)
- [x] Simplificar para manejar solo:
  - [x] Login
  - [x] Verificación de token
  - [x] Refresh Token
- [x] Eliminar endpoints no necesarios

#### 2.2 Rutas de Autenticación (auth.js)
- [x] Mantener solo:
  - [x] POST /login
  - [x] POST /verify-token
  - [x] POST /refresh-token
- [x] Eliminar todas las demás rutas

#### 2.3 Script de Inicialización
- [x] Crear script para usuarios predefinidos (`systemUsers.js`):
  - [x] RA (ra@pacta.local)
  - [x] Admin (admin@pacta.local)
  - [x] Contraseña por defecto: Pacta.25*
- [x] Asegurar ejecución en `init.js`

#### 2.4 Middleware de Autenticación (`authMiddleware.js`)
- [x] Actualizar `authenticate` para verificar `isSystemUser`
- [x] Actualizar `generateTokens` para incluir `isSystemUser` en payload
- [x] Actualizar `refreshToken` para verificar `isSystemUser`

#### 2.5 Validadores (`authValidators.js`)
- [x] Simplificar para mantener solo:
  - [x] `loginSchema`
  - [x] `verifyTokenSchema`
  - [x] `refreshTokenSchema`
- [x] Eliminar validadores innecesarios

### 3. Modificaciones en el Frontend (Pendiente)

#### 3.1 Componentes de Autenticación
- [ ] Crear LoginForm
- [ ] Implementar manejo de token
- [ ] Implementar protección de rutas
- [ ] Crear contexto de autenticación

#### 3.2 Páginas
- [ ] Login
- [ ] Dashboard (con verificación de rol)

## Plan de Implementación

### Fase 1: Backend (✅ Completado)
1. [x] Modificar `schema.prisma`
2. [x] Actualizar `AuthController.js`
3. [x] Simplificar `auth.js`
4. [x] Crear script de inicialización y asegurar ejecución (`systemUsers.js`, `init.js`)
5. [x] Actualizar `authMiddleware.js`
6. [x] Simplificar `authValidators.js`

### Fase 2: Frontend (Pendiente)
1. [ ] Crear componentes base
2. [ ] Implementar contexto de autenticación
3. [ ] Crear páginas principales
4. [ ] Implementar protección de rutas

### Fase 3: Testing (Pendiente)
1. [ ] Pruebas de integración backend
2. [ ] Pruebas de seguridad backend
3. [ ] Verificación de usuarios predefinidos
4. [ ] Pruebas unitarias frontend
5. [ ] Pruebas E2E

## Criterios de Completado
1. [x] Usuarios predefinidos funcionando en backend
2. [x] Login, verificación y refresh de token implementados en backend
3. [ ] Protección de rutas funcionando en frontend
4. [ ] Tests pasando
5. [ ] Documentación actualizada (Plan de implementación actualizado)

## Notas Adicionales
- La aplicación es offline, no se requieren servicios externos
- Se mantiene la seguridad básica con JWT
- Se eliminan características no necesarias
- Se mantiene la estructura actual del proyecto 