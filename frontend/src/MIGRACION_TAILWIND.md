# Migración a Tailwind CSS

## Estado de la migración

### Archivos de configuración
- ✅ `tailwind.config.js` - Creado y configurado correctamente
- ✅ `postcss.config.js` - Configurado para procesar Tailwind
- ✅ `index.css` - Creado como punto único de entrada para estilos
- ✅ `tailwind.css` - Configurado con directivas de Tailwind
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

### Componentes de módulos refactorizados
- ✅ `ContractStats.vue` (dashboard)
- ✅ `ContractsTable.vue`
- ✅ `ContractList.vue`
- ✅ `ContractDialog.vue`
- ✅ `UserDialog.vue`
- ✅ `UsersTable.vue`
- ✅ `ActivationDialog.vue`
- ✅ `ActivityFeed.vue`
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
- [ ] `AnalyticsView.vue`
- [ ] `ContractsView.vue`
- [ ] `LicenseRequiredView.vue`
- [ ] `LicensesView.vue`
- [ ] `NotificationsView.vue`
- [ ] `ProfileView.vue`
- [ ] `SettingsView.vue`
- [ ] `UsersView.vue`

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
- ✅ `MetricCard.scss`
- ✅ `notificationPanel.scss`
- ✅ `circularChart.scss`
- ✅ `sparkLine.scss`
- ✅ `AnalyticsChart.scss`
- ✅ `AnalyticsFilters.scss`
- ✅ `AnalyticsTable.scss`

### Archivos SCSS obsoletos a eliminar
- [ ] `base.scss`
- [ ] `colors.scss`
- [ ] `main.scss`
- [ ] `mixins.scss`
- [ ] `reset.scss`
- [ ] `responsive.scss`
- [ ] `theme.scss`
- [ ] `typography.scss`
- [ ] `variables.scss`

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