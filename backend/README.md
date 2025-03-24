# PACTA Backend

Backend API para la Plataforma de Automatización y Control de Contratos Empresariales (PACTA).

## Descripción

PACTA es una aplicación web diseñada para optimizar la gestión de contratos en empresas grandes. El backend proporciona una API RESTful robusta y segura para manejar todas las operaciones relacionadas con la gestión de contratos.

## Características Principales

- API RESTful con Express.js
- Autenticación JWT y autorización basada en roles
- Base de datos SQLite con Prisma ORM
- Sistema de notificaciones y alertas
- Gestión de documentos y metadatos
- Búsqueda avanzada y filtrado
- Sistema de auditoría y logging
- Generación de reportes y estadísticas

## Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Prisma

## Instalación

1. Clonar el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
cd pacta/backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Inicializar la base de datos:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas
- `npm run lint`: Verifica el código con ESLint
- `npm run lint:fix`: Corrige problemas de linting
- `npm run format`: Formatea el código con Prettier
- `npm run format:check`: Verifica el formato del código
- `npm run prisma:studio`: Abre Prisma Studio para gestionar la base de datos
- `npm run db:seed`: Ejecuta los seeders de la base de datos

## Estructura del Proyecto

```
backend/
├── src/
│   ├── api/          # Rutas y controladores
│   ├── config/       # Configuraciones
│   ├── database/     # Migraciones y seeders
│   ├── docs/         # Documentación
│   ├── models/       # Modelos de datos
│   ├── services/     # Lógica de negocio
│   ├── utils/        # Utilidades
│   ├── server.js     # Punto de entrada
│   └── index.js      # Configuración principal
├── prisma/           # Esquemas y migraciones
├── tests/            # Pruebas
└── docs/             # Documentación adicional
```

## Estándares de Código

- ESLint para linting
- Prettier para formateo
- Jest para pruebas
- Husky para git hooks
- Conventional Commits para mensajes de commit

## Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Protección contra ataques comunes (XSS, CSRF)
- Rate limiting
- Validación de datos con Zod
- Logging de seguridad

## Documentación de la API

La documentación de la API está disponible en `/api-docs` cuando el servidor está en ejecución.

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## Despliegue

1. Construir la aplicación:

```bash
npm run build
```

2. Iniciar en producción:

```bash
npm run start:prod
```

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Para soporte, email [EMAIL] o crear un issue en el repositorio.
