# Estructura del Proyecto Frontend PACTA

## Organización del Proyecto

```typescript
frontend/
├── src/
│   ├── features/           # Módulos funcionales
│   │   ├── auth/          # Módulo de autenticación
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── users/        # Módulo de usuarios
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api/
│   │       ├── types/
│   │       └── index.ts
│   │
│   ├── components/        # Componentes React
│   │   ├── common/       # Componentes genéricos reutilizables
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── Button.module.css
│   │   │   └── Input/
│   │   ├── layout/      # Componentes estructurales
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   └── ui/         # Componentes UI específicos
│   │       ├── Modal/
│   │       └── Card/
│   │
│   ├── pages/           # Páginas/Rutas
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   └── Home.module.css
│   │   └── Profile/
│   │
│   ├── hooks/           # Hooks personalizados
│   │   ├── useFetch.ts
│   │   └── useForm.ts
│   │
│   ├── services/        # Servicios
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   └── storage/
│   │
│   ├── store/          # Estado global
│   │   ├── slices/
│   │   └── index.ts
│   │
│   ├── styles/         # Estilos globales
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── types/          # Tipos TypeScript globales
│   │   └── index.ts
│   │
│   ├── utils/          # Utilidades
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   └── main.tsx
```
## Explicación Detallada
### 1. Features (Módulos Funcionales)
- Organización basada en dominios de negocio
- Cada feature es independiente y autocontenida
- Estructura interna consistente:
  - components/ : Componentes específicos del módulo
  - hooks/ : Lógica de negocio reutilizable
  - api/ : Llamadas a API relacionadas
  - types/ : Tipos específicos del módulo
  - index.ts : Punto de entrada y exportaciones
### 2. Components (Componentes)
- Tres categorías principales:
  - common/ : Componentes genéricos reutilizables
  - layout/ : Componentes estructurales
  - ui/ : Componentes específicos de la aplicación
- Estructura de cada componente:
  - ComponentName.tsx : Lógica y JSX
  - ComponentName.types.ts : Interfaces y tipos
  - ComponentName.module.css : Estilos con scope local
### 3. Pages (Páginas)
- Representan rutas de la aplicación
- Componen componentes y features
- Manejan la lógica de nivel de página
- Incluyen sus propios estilos modulares
### 4. Hooks (Hooks Personalizados)
- Encapsulan lógica reutilizable
- Siguen las convenciones de React Hooks
- Facilitan la composición de funcionalidades
### 5. Services (Servicios)
- Centralizan la lógica de comunicación externa
- Configuración de clientes HTTP
- Gestión de almacenamiento local
- Interfaces consistentes para APIs
### 6. Store (Estado Global)
- Gestión centralizada del estado
- Organizado por slices/features
- Tipado fuerte con TypeScript
- Acciones y selectores bien definidos
### 7. Styles (Estilos)
- Sistema de diseño consistente
- Variables CSS para temas
- Integración con Tailwind CSS
- Módulos CSS para estilos locales
### 8. Types (Tipos)
- Tipos globales compartidos
- Interfaces comunes
- Enums y constantes tipadas
- Utilidades de TypeScript
### 9. Utils (Utilidades)
- Funciones helper reutilizables
- Constantes y configuraciones
- Utilidades de formato y validación
- Funciones puras y testeables
## Mejores Prácticas
### Código
- TypeScript en modo estricto
- ESLint y Prettier configurados
- Convenciones de nombrado consistentes
- Documentación inline cuando sea necesario
### Componentes
- Componentes funcionales
- Props tipadas explícitamente
- Manejo de errores robusto
- Lazy loading cuando sea apropiado
### Estado
- Minimizar estado global
- Usar estado local cuando sea posible
- Acciones tipadas
- Selectores memoizados
### Performance
- Code splitting por rutas
- Lazy loading de componentes pesados
- Optimización de imágenes
- Memoización apropiada
## Convenciones de Nombrado
### Archivos
- Componentes: PascalCase (Button.tsx)
- Hooks: camelCase (useAuth.ts)
- Utilidades: camelCase (formatDate.ts)
- Tipos: PascalCase (UserTypes.ts)
### Componentes
- Nombres descriptivos y claros
- Sufijos significativos (.types.ts, .module.css)
- Index.ts para exportaciones limpias
### Variables y Funciones
- camelCase para variables y funciones
- PascalCase para tipos e interfaces
- Prefijo 'handle' para event handlers
## Configuración del Proyecto
### TypeScript
- Modo estricto activado
- Paths aliases configurados
- Tipos declarados explícitamente
### Vite
- Hot Module Replacement
- Optimizaciones de build
- Manejo de assets eficiente
### ESLint y Prettier
- Reglas consistentes
- Integración con TypeScript
- Formateo automático
## Notas Adicionales
- Mobile-first approach
- Accesibilidad como prioridad
- Testing unitario y de integración
- Documentación mantenible