# Migración a Tailwind CSS

## Resumen de Progreso

La migración a Tailwind CSS ha avanzado considerablemente:

- ✅ **Componentes base:** 100% completado (14/14)
- ✅ **Componentes compartidos:** 100% completado (2/2)
- ✅ **Componentes de módulos:** 100% completado (16/16)
- ✅ **Layouts:** 100% completado (2/2)
- ✅ **Vistas:** 100% completado (12/12)
- ✅ **Archivos SCSS específicos:** 100% eliminados (26/26)
- 🔄 **Archivos SCSS globales:** En progreso (3/9)

**Estado actual:** Se han migrado con éxito todos los componentes, layouts y vistas a Tailwind CSS. Los archivos SCSS específicos de componentes han sido eliminados. Estamos avanzando en la migración de los archivos SCSS globales, con progreso en los más importantes como typography.scss, colors.scss y variables.scss.

## Estado de la migración

### Archivos de configuración
- ✅ `tailwind.config.js` - Creado y configurado correctamente
- ✅ `postcss.config.js` - Configurado para procesar Tailwind
- ✅ `index.css` - Actualizado para mantener solo animaciones y estilos específicos
- ✅ `tailwind.css` - Configurado con directivas de Tailwind, componentes personalizados y tipografía migrada
- ✅ `theme.css` - Variables CSS para temas claro/oscuro

### Componentes base refactorizados
- ✅ `BaseButton.vue`
- ✅ `BaseCard.vue`
- ✅ `BaseCheckbox.vue`
- ✅ `BaseDialog.vue`
- ✅ `BaseIcon.vue`
- ✅ `BaseInput.vue`
- ✅ `BaseNotification.vue`
- ✅ `BaseSelect.vue`
- ✅ `BaseTable.vue`
- ✅ `BaseToggle.vue`
- ✅ `Logo.vue`
- ✅ `StatusBadge.vue`
- ✅ `ThemeTransition.vue`
- ✅ `UserAvatar.vue`

### Componentes compartidos refactorizados
- ✅ `Toast.vue`
- ✅ `StatusBadge.vue`

### Layouts refactorizados
- ✅ `AuthLayout.vue`
- ✅ `DashboardLayout.vue`

### Vistas refactorizadas
- ✅ `LoginView.vue`
- ✅ `ResetPasswordView.vue`
- ✅ `NotFoundView.vue`
- ✅ `AnalyticsView.vue`
- ✅ `ContractsView.vue`
- ✅ `DashboardView.vue`
- ✅ `LicenseRequiredView.vue`
- ✅ `LicensesView.vue`
- ✅ `NotificationsView.vue`
- ✅ `ProfileView.vue`
- ✅ `SettingsView.vue`
- ✅ `UsersView.vue`

### Componentes de módulos refactorizados
- ✅ `ContractStats.vue` (dashboard)
- ✅ `ContractsTable.vue`
- ✅ `ContractList.vue`
- ✅ `ContractDialog.vue`
- ✅ `UserDialog.vue`
- ✅ `UsersTable.vue`
- ✅ `ActivationDialog.vue`
- ✅ `ActivityFeed.vue`
- ✅ `LicenseStatus.vue`
- ✅ `MetricCard.vue`
- ✅ `SkeletonLoader.vue`
- ✅ `NotificationPanel.vue`
- ✅ `CircularChart.vue`
- ✅ `SparkLine.vue`
- ✅ `AnalyticsChart.vue`
- ✅ `AnalyticsFilters.vue`
- ✅ `AnalyticsTable.vue`

## Próximos pasos

### Vistas a refactorizar
- [x] `AnalyticsView.vue`
- [x] `ContractsView.vue`
- [x] `DashboardView.vue`
- [x] `LicenseRequiredView.vue`
- [x] `LicensesView.vue`
- [x] `NotificationsView.vue`
- [x] `ProfileView.vue`
- [x] `SettingsView.vue`
- [x] `UsersView.vue`

### Archivos SCSS eliminados
- ✅ `contractTable.scss`
- ✅ `contractList.scss`
- ✅ `contractDialog.scss`
- ✅ `statusBadge.scss`
- ✅ `Toast.scss`
- ✅ `userDialog.scss`
- ✅ `usersTable.scss`
- ✅ `activationDialog.scss`
- ✅ `activityFeed.scss`
- ✅ `licenseStatus.scss`
- ✅ `MetricCard.scss`
- ✅ `notificationPanel.scss`
- ✅ `circularChart.scss`
- ✅ `sparkLine.scss`
- ✅ `AnalyticsChart.scss`
- ✅ `AnalyticsFilters.scss`
- ✅ `AnalyticsTable.scss`
- ✅ `AnalyticsView.scss`
- ✅ `App.scss`
- ✅ `contracts.scss`
- ✅ `dashboard.scss`
- ✅ `licenceRequired.scss`
- ✅ `licenseView.scss`
- ✅ `profile.scss`
- ✅ `settings.scss`
- ✅ `usersView.scss`

## Archivos pendientes

Todos los componentes y vistas han sido migrados a Tailwind CSS. Estamos avanzando con la migración de los archivos SCSS globales:

- 🔄 `base.scss` - Parcialmente migrado, funcionalidades básicas incluidas en tailwind.css
- 🔄 `colors.scss` - Migrado a theme.css y tailwind.config.js
- 🔄 `main.scss` - En proceso de migración
- [ ] `mixins.scss` - Pendiente de migración
- ✅ `reset.scss` - Reemplazado por @tailwind base en tailwind.css
- 🔄 `responsive.scss` - Parcialmente migrado a los breakpoints de Tailwind
- ✅ `theme.scss` - Completamente migrado a theme.css 
- ✅ `typography.scss` - Migrado a tailwind.css con clases de componentes usando @apply
- 🔄 `variables.scss` - Mayoritariamente migrado a theme.css y tailwind.config.js

## Plan de migración para archivos SCSS globales

Después de analizar el código base, he preparado un plan detallado para migrar los archivos SCSS globales a Tailwind CSS de manera sistemática y segura:

### 1. Mapeo de dependencias

Los archivos SCSS globales tienen las siguientes dependencias:

```
main.scss
  ├── variables.scss
  ├── colors.scss
  ├── mixins.scss
  │     ├── variables.scss
  │     ├── colors.scss
  │     └── typography.scss
  ├── typography.scss
  │     ├── variables.scss
  │     └── colors.scss
  └── responsive.scss
        └── variables.scss

base.scss
  ├── colors.scss
  ├── variables.scss
  ├── mixins.scss
  └── reset.scss

theme.scss (ya reemplazado por theme.css)
```

### 2. Orden de migración

Basado en las dependencias, se sugiere el siguiente orden de migración para minimizar el impacto:

1. `variables.scss` → Ya está migrado en parte a `theme.css`
2. `colors.scss` → Ya está migrado en parte a `theme.css` y `tailwind.config.js`
3. `typography.scss` → Migrar a `tailwind.config.js` y `theme.css`
4. `reset.scss` → Reemplazar por `@tailwind base`
5. `responsive.scss` → Reemplazar por breakpoints de Tailwind en `tailwind.config.js`
6. `mixins.scss` → Migrar a componentes con `@apply` en `tailwind.css`
7. `main.scss` → Migrar utilidades restantes a `tailwind.css`
8. `base.scss` → Eliminar (sus funcionalidades ya estarán cubiertas)
9. `theme.scss` → Ya reemplazado por `theme.css`

### 3. Estrategia por archivo

#### 3.1 Variables & Colors
- Las variables de color de `colors.scss` y `variables.scss` ya están definidas en `theme.css` y `tailwind.config.js`
- Verificar que todas las variables de diseño de `variables.scss` (espaciados, radios, etc.) estén en `theme.css`
- Asegurar que todas las variables de color de `colors.scss` estén mapeadas en `tailwind.config.js`

#### 3.2 Typography
- Trasladar los tamaños de fuente, pesos, alturas de línea y familias al `theme.css` y `tailwind.config.js`
- Actualizar la sección de tipografía en `tailwind.css` con clases de utilidad usando `@apply`

#### 3.3 Reset & Responsive
- `reset.scss` puede ser eliminado y reemplazado por `@tailwind base` que proporciona reset moderno
- Para `responsive.scss`, usar los breakpoints de Tailwind definidos en `tailwind.config.js`

#### 3.4 Mixins
- Analizar cada mixin en `mixins.scss` y crear equivalentes en `tailwind.css` usando `@apply`
- Para mixins complejos, crear componentes Tailwind personalizados bajo la directiva `@layer components`
- Documentar cada mixin migrado para mantener consistencia

#### 3.5 Main & Base
- Migrar las utilidades definidas en `main.scss` a `tailwind.css`
- Comprobar que todas las funcionalidades de `base.scss` estén cubiertas en `theme.css` y `tailwind.css`

### 4. Implementación y pruebas

Para cada archivo:
1. **Crear implementación Tailwind** de las funcionalidades en el archivo adecuado
2. **Reemplazar gradualmente** las importaciones SCSS en archivos afectados
3. **Pruebas exhaustivas** en componentes que utilizaban los estilos migrados
4. **Eliminar el archivo SCSS** original tras verificar funcionamiento correcto

## Progreso actual

### Migración de tipografía (typography.scss)
Se ha completado la migración de los estilos tipográficos definidos en typography.scss a tailwind.css, utilizando la directiva @layer components para definir los estilos de encabezados (h1-h6), párrafos, enlaces y otros elementos tipográficos comunes.

### Actualización del sistema de importación
Se ha actualizado el archivo main.ts para eliminar las importaciones de estilos obsoletos y utilizar únicamente los nuevos archivos CSS basados en Tailwind:
- Se removió la importación de index.css como archivo unificado
- Se añadieron importaciones específicas para tailwind.css y theme.css
- Se mantuvieron las importaciones de PrimeVue necesarias

### Limpieza del archivo index.css
Se ha optimizado el archivo index.css para contener únicamente:
- Animaciones personalizadas (fadeIn, slideInUp)
- Transiciones para efectos de página
- Utilidades específicas para el modo oscuro que no están en Tailwind

### Próximos pasos
1. **Migrar `mixins.scss`**:
   - Analizar los mixins más utilizados
   - Convertirlos a componentes de Tailwind con @apply
   - Documentar los equivalentes para mantener consistencia

2. **Completar la migración de `main.scss`**:
   - Verificar que todos los estilos globales estén cubiertos
   - Asegurar que las clases de utilidad sean accesibles en todos los componentes

3. **Pruebas globales**:
   - Verificar que la aplicación mantenga su aspecto y funcionalidad en todos los breakpoints
   - Comprobar que el tema oscuro funcione correctamente
   - Validar la consistencia del diseño en toda la aplicación

Una vez completados estos pasos, podremos eliminar los archivos SCSS restantes y simplificar la base de código, mejorando el rendimiento y la mantenibilidad.

## Instrucciones para continuar la migración

1. **Para refactorizar un componente**:
   - Migrar las clases de estilo SCSS a clases de utilidad de Tailwind
   - Eliminar la etiqueta `<style lang="scss">` y su contenido
   - Eliminar las importaciones de archivos SCSS

2. **Para eliminar archivos SCSS**:
   - Verificar que ningún componente lo esté utilizando
   - Eliminar el archivo
   - Actualizar referencias en otros archivos si es necesario

3. **Convenciones de estilo con Tailwind**:
   - Usar clases de utilidad directamente en los elementos HTML
   - Aprovechar los modificadores (hover:, focus:, dark:, etc.)
   - Utilizar variables CSS del tema para colores y espaciados
   - Para componentes complejos, considerar el uso de @apply en un archivo CSS global

## Paleta de colores

Usar las siguientes variables CSS para mantener consistencia:

- `--color-primary` / `bg-primary`, `text-primary`
- `--color-secondary` / `bg-secondary`, `text-secondary`
- `--color-success` / `bg-success`, `text-success`
- `--color-warning` / `bg-warning`, `text-warning`
- `--color-error` / `bg-error`, `text-error`
- `--color-info` / `bg-info`, `text-info`
- `--color-surface` / `bg-surface`
- `--color-background` / `bg-background`

## Temas claro/oscuro

Usar el prefijo `dark:` para definir estilos específicos del tema oscuro:

```html
<div class="bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
  Contenido con tema claro/oscuro
</div>
``` 