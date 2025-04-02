# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Estructura del Proyecto

El proyecto está organizado siguiendo una arquitectura basada en funcionalidades (feature-based architecture), inspirada en la estructura de Shadcn Admin:

```
src/
├── assets/         # Recursos estáticos (imágenes, fuentes, etc.)
├── components/     # Componentes reutilizables en toda la aplicación
│   ├── ui/         # Componentes básicos de UI (botones, inputs, etc.)
│   ├── layout/     # Componentes de estructura (header, sidebar, etc.)
│   │   └── data/   # Datos para componentes de layout (ej: items de navegación)
│   └── ...         # Otros componentes compartidos
├── config/         # Configuración de la aplicación
├── contexts/       # Contextos de React
├── features/       # Funcionalidades organizadas por dominio
│   ├── auth/       # Autenticación
│   │   ├── components/  # Componentes específicos de autenticación
│   │   └── ...     # Servicios, hooks, etc. de autenticación
│   ├── contracts/  # Gestión de contratos
│   │   ├── components/  # Componentes específicos de contratos
│   │   └── ...     # Servicios, hooks, etc. de contratos
│   ├── dashboard/  # Dashboard
│   │   ├── components/  # Componentes específicos del dashboard
│   │   └── ...     # Servicios, hooks, etc. del dashboard 
│   ├── users/      # Gestión de usuarios
│   │   ├── components/  # Componentes específicos de usuarios
│   │   └── ...     # Servicios, hooks, etc. de usuarios
│   └── common/     # Componentes y lógica compartida entre features
│       └── components/  # Componentes compartidos entre features
├── hooks/          # Hooks personalizados
├── lib/            # Bibliotecas y utilidades
│   └── api/        # Cliente API y configuración de SWR
├── pages/          # Páginas de la aplicación
├── providers/      # Proveedores de React
├── routes/         # Rutas de la aplicación (Remix)
├── store/          # Estado global (Zustand)
├── types/          # Tipos y definiciones TypeScript
└── utils/          # Funciones utilitarias
```

### Beneficios de la Estructura

1. **Separación por Dominio**: Cada característica está encapsulada en su propia carpeta
2. **Mejor Mantenibilidad**: Facilita encontrar y modificar componentes relacionados
3. **Componentes Reutilizables**: Componentes UI básicos separados de la lógica de negocio
4. **Escalabilidad**: Fácil agregar nuevas características sin afectar las existentes

### Convenciones de Componentes

- Los componentes básicos de UI van en `/components/ui/`
- Los componentes de layout van en `/components/layout/`
- Los componentes específicos de una feature van en `/features/[feature]/components/`
- Los componentes compartidos entre features van en `/features/common/components/`

## Estructura de Servicios API

Los servicios de API han sido reestructurados siguiendo el patrón de características (feature-based). Cada característica (auth, dashboard, contracts, users) tiene su propia carpeta de servicios que gestiona todas las interacciones con el backend.

### Cliente API Central

El cliente API central se encuentra en `src/lib/api.ts`, que proporciona:

- Gestión de tokens de autenticación
- Manejo de errores
- Métodos HTTP comunes (GET, POST, PUT, DELETE, PATCH)
- Tipado genérico para respuestas

### Servicios por Característica

Cada característica tiene sus propios servicios en su carpeta `services`:

- **Auth**: `src/features/auth/services/auth-service.ts`
  - Login
  - Registro
  - Verificación de token
  - Gestión de sesión

- **Dashboard**: `src/features/dashboard/services/dashboard-service.ts`
  - Estadísticas
  - Actividades recientes
  - Datos de gráficos

- **Contracts**: `src/features/contracts/services/contracts-service.ts`
  - CRUD de contratos
  - Gestión de adjuntos
  - Suplementos de contrato

- **Users**: `src/features/users/services/users-service.ts`
  - CRUD de usuarios
  - Gestión de permisos
  - Actualización de perfiles

Esta estructura modular facilita el mantenimiento y permite una mejor separación de responsabilidades siguiendo el principio de cohesión.
