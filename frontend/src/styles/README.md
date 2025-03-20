# Guía de Estilos

## Uso de los estilos

Los archivos de estilos principales (`_colors.scss`, `_variables.scss` y `_mixins.scss`) se deben importar localmente en cada componente que los necesite.

### Cómo usar los estilos en componentes

Importar los archivos en cada componente con `@use`:

```scss
@use '[ruta-relativa]/assets/styles/_variables.scss' as v;
@use '[ruta-relativa]/assets/styles/_colors.scss' as c;
@use '[ruta-relativa]/assets/styles/_mixins.scss' as m;

.mi-clase {
  color: c.$color-primary;
  margin: v.$spacing-md;
  
  @include m.flex-center;
}
```

### Importaciones estándar

En archivos dentro de la carpeta `/components`:
```scss
@use '../../assets/styles/_variables.scss' as v;
@use '../../assets/styles/_colors.scss' as c;
@use '../../assets/styles/_mixins.scss' as m;
```

En archivos dentro de subcarpetas de `/components`:
```scss
@use '../../../assets/styles/_variables.scss' as v;
@use '../../../assets/styles/_colors.scss' as c;
@use '../../../assets/styles/_mixins.scss' as m;
```

En archivos dentro de `/views`:
```scss
@use '../assets/styles/_variables.scss' as v;
@use '../assets/styles/_colors.scss' as c;
@use '../assets/styles/_mixins.scss' as m;
```

## Estructura de archivos

- `_colors.scss`: Colores y paletas
- `_variables.scss`: Espaciado, bordes, sombras y otras variables
- `_mixins.scss`: Funciones reutilizables 
- `_reset.scss`: Reset de estilos básicos
- `theme.css`: Variables CSS para temas claro/oscuro 