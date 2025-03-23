# PACTA Backend

Backend para el sistema de gestión de contratos PACTA, desarrollado con Node.js, Express y Sequelize.

## Características

- API RESTful con Express
- Base de datos SQLite con Sequelize ORM
- Autenticación JWT
- Validación de datos con Joi
- Caché con node-cache
- Logging estructurado con Winston
- Rate limiting
- CORS configurado
- Manejo de archivos con Multer
- Respuestas estandarizadas
- Manejo de errores centralizado

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
npm run dev
```

## Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código con Prettier


## API Endpoints

### Autenticación
- `POST /api/v1/auth/login`: Iniciar sesión
- `POST /api/v1/auth/register`: Registrar usuario
- `POST /api/v1/auth/refresh-token`: Renovar token
- `POST /api/v1/auth/logout`: Cerrar sesión

### Usuarios
- `GET /api/v1/users`: Obtener lista de usuarios
- `GET /api/v1/users/:id`: Obtener usuario por ID
- `PUT /api/v1/users/:id`: Actualizar usuario
- `DELETE /api/v1/users/:id`: Eliminar usuario

### Contratos
- `GET /api/v1/contracts`: Obtener lista de contratos
- `POST /api/v1/contracts`: Crear contrato
- `GET /api/v1/contracts/:id`: Obtener contrato por ID
- `PUT /api/v1/contracts/:id`: Actualizar contrato
- `DELETE /api/v1/contracts/:id`: Eliminar contrato

### Notificaciones
- `GET /api/v1/notifications`: Obtener notificaciones del usuario
- `POST /api/v1/notifications/read`: Marcar notificación como leída
- `POST /api/v1/notifications/archive`: Archivar notificación
- `GET /api/v1/notifications/unread-count`: Obtener conteo de no leídas

## Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Rate limiting para prevenir ataques de fuerza bruta
- CORS configurado
- Helmet para headers de seguridad
- Validación de datos de entrada

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 