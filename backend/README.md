# PACTA Backend

Backend para el sistema de gestión de contratos PACTA, desarrollado con Node.js, Express y Prisma ORM.

## Características

- API RESTful con Express
- Base de datos SQLite con Prisma ORM
- Autenticación segura con JWT (JSON Web Tokens)
- Validaciones con Express Validator y Zod
- Sistema de caché para consultas frecuentes
- Logging estructurado con Winston
- Gestión de notificaciones para vencimientos de contratos
- Rate limiting para prevenir ataques
- CORS configurado para seguridad
- Manejo de archivos con Multer
- Respuestas estandarizadas
- Manejo centralizado de errores
- Arquitectura modular basada en repositorios y servicios
- Sistema de roles y permisos (RBAC)

## Arquitectura

El backend sigue una arquitectura en capas:

- **Controllers**: Manejo de peticiones HTTP y respuestas
- **Services**: Lógica de negocio y operaciones
- **Repositories**: Acceso a datos y operaciones CRUD
- **Models**: Definición de modelos y esquemas
- **Middleware**: Funciones intermedias para autenticación, validación, etc.
- **Utils**: Utilidades y funciones auxiliares
- **Config**: Configuración de la aplicación

## Requisitos

- Node.js >= 16.0.0
- npm >= 7.0.0

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/pacta.git
cd pacta/backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones.

4. Inicializar la base de datos:
```bash
npx prisma migrate dev
```

5. Iniciar el servidor:
```bash
npm run dev
```

## Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código con Prettier
- `npm run build`: Construye el proyecto para producción

## API Endpoints

### General
- `GET /api`: Información de la API
- `GET /api/health`: Estado de salud del sistema
- `GET /api/stats`: Estadísticas del sistema (sólo admin)

### Autenticación
- `POST /api/auth/login`: Iniciar sesión
- `POST /api/auth/register`: Registrar usuario
- `POST /api/auth/refresh`: Renovar token
- `POST /api/auth/logout`: Cerrar sesión

### Usuarios
- `GET /api/users`: Obtener lista de usuarios
- `GET /api/users/:id`: Obtener usuario por ID
- `PUT /api/users/:id`: Actualizar usuario
- `DELETE /api/users/:id`: Eliminar usuario

### Contratos
- `GET /api/contracts`: Obtener lista de contratos
- `POST /api/contracts`: Crear contrato
- `GET /api/contracts/:id`: Obtener contrato por ID
- `PUT /api/contracts/:id`: Actualizar contrato
- `DELETE /api/contracts/:id`: Eliminar contrato
- `GET /api/contracts/expiring`: Obtener contratos próximos a vencer

### Compañías
- `GET /api/companies`: Obtener lista de compañías
- `POST /api/companies`: Crear compañía
- `GET /api/companies/:id`: Obtener compañía por ID
- `PUT /api/companies/:id`: Actualizar compañía
- `GET /api/companies/top/by-contracts`: Top compañías por contratos
- `GET /api/companies/with-expiring-contracts`: Compañías con contratos próximos a vencer

### Notificaciones
- `GET /api/notifications`: Obtener notificaciones del usuario
- `GET /api/notifications/unread-count`: Obtener conteo de no leídas
- `POST /api/notifications/read`: Marcar notificación como leída
- `POST /api/notifications/read-all`: Marcar todas como leídas

### Analytics
- `GET /api/analytics/contracts`: Estadísticas de contratos
- `GET /api/analytics/users`: Estadísticas de usuarios
- `GET /api/analytics/notifications`: Estadísticas de notificaciones

## Estructura de Directorios

```
src/
├── api/                  # Componentes de la API
│   ├── controllers/      # Controladores
│   ├── middleware/       # Middleware
│   └── routes/           # Definición de rutas
├── config/               # Configuración
├── database/             # Acceso a datos
│   └── repositories/     # Repositorios
├── models/               # Modelos de datos
├── services/             # Servicios de negocio
└── utils/                # Utilidades
```

## Seguridad

- Autenticación JWT con rotación de tokens
- Encriptación de contraseñas con bcrypt
- Rate limiting para prevenir ataques de fuerza bruta
- CORS configurado para orígenes específicos
- Helmet para headers de seguridad HTTP
- Validación estricta de datos de entrada
- Sistema de roles y permisos por recurso

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 