# Guía de Branding y Estilos para PACTA

## 1. Paleta de Colores

### 1.1 Colores Principales

La paleta principal de PACTA está basada en tonos azules que transmiten profesionalismo, confianza y estabilidad:

| Color              | Código Hex | RGB                | Uso                                       |
| ------------------ | ---------- | ------------------ | ----------------------------------------- |
| Azul Marino Oscuro | `#001B48`  | rgb(0, 27, 72)     | Encabezados principales, navbar, footer   |
| Azul Oscuro        | `#02457A`  | rgb(2, 69, 122)    | Elementos interactivos, botones, enlaces  |
| Azul Medio         | `#018ABE`  | rgb(1, 138, 190)   | Acentos, datos destacados, gráficos       |
| Azul Claro         | `#97CADB`  | rgb(151, 202, 219) | Fondos suaves, bordes, separadores        |
| Azul Muy Claro     | `#D6E8EE`  | rgb(214, 232, 238) | Fondos de paneles, hover, disabled states |

### 1.2 Colores Secundarios y Funcionales

| Propósito      | Código Hex | Nombre         | Uso                                   |
| -------------- | ---------- | -------------- | ------------------------------------- |
| Éxito/Positivo | `#4CAF50`  | Verde          | Confirmaciones, datos positivos       |
| Advertencia    | `#FF9800`  | Naranja        | Alertas, fechas próximas a vencer     |
| Error/Negativo | `#F44336`  | Rojo           | Errores, rechazos, datos negativos    |
| Neutral Oscuro | `#333333`  | Gris Oscuro    | Texto principal                       |
| Neutral Medio  | `#757575`  | Gris Medio     | Texto secundario, descripciones       |
| Neutral Claro  | `#F5F5F5`  | Gris Muy Claro | Fondos de página                      |
| Blanco         | `#FFFFFF`  | Blanco         | Fondos de tarjetas, texto sobre color |

## 2. Tipografía

### 2.1 Fuentes Principales

- **Familia Principal**: Inter
- **Familia Secundaria**: Roboto
- **Familia para Código**: JetBrains Mono

### 2.2 Jerarquía y Tamaños

| Elemento               | Fuente |          Peso |          Tamaño | Espaciado |
| ---------------------- | ------ | ------------: | --------------: | --------: |
| Título Principal (h1)  | Inter  |    600 (Semi) |     32px / 2rem |    -0.2px |
| Título Secundario (h2) | Inter  |    600 (Semi) |   24px / 1.5rem |    -0.1px |
| Subtítulo (h3)         | Inter  |  500 (Medium) |  20px / 1.25rem |    normal |
| Subtítulo (h4)         | Inter  |  500 (Medium) | 18px / 1.125rem |    normal |
| Texto Normal           | Roboto | 400 (Regular) |     16px / 1rem |    normal |
| Texto Pequeño          | Roboto | 400 (Regular) | 14px / 0.875rem |    normal |
| Etiquetas, Captions    | Roboto | 400 (Regular) |  12px / 0.75rem |     0.2px |
| Botones, Menús         | Inter  |  500 (Medium) | 14px / 0.875rem |     0.2px |

### 2.3 Uso de la Tipografía

- **Contraste**: Asegurar una relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande
- **Consistencia**: Mantener el mismo estilo tipográfico en toda la aplicación
- **Jerarquía**: Usar diferencias de tamaño y peso para establecer jerarquía clara
- **Espacio**: Permitir suficiente espacio en blanco alrededor del texto para mejorar legibilidad

## 3. Elementos de Interfaz

### 3.1 Tarjetas

- **Estilo**: Bordes redondeados (8px)
- **Sombra**: Sutil (0px 2px 8px rgba(0, 0, 0, 0.08))
- **Espaciado interno**: 16px - 24px
- **Fondo**: Blanco (#FFFFFF)
- **Separación entre tarjetas**: 16px - 24px

### 3.2 Botones

| Tipo        | Fondo                | Texto      | Borde          | Estado Hover          |
| ----------- | -------------------- | ---------- | -------------- | --------------------- |
| Primario    | Azul Medio (#018ABE) | Blanco     | Ninguno        | Azul Oscuro (#02457A) |
| Secundario  | Transparente         | Azul Medio | Azul Medio 1px | Fondo: Azul Muy Claro |
| Terciario   | Transparente         | Azul Medio | Ninguno        | Fondo: Azul Muy Claro |
| Destructivo | #F44336              | Blanco     | Ninguno        | Rojo más oscuro       |

- **Tamaño**: Altura de 40px para botones estándar
- **Padding**: 16px horizontal (8px para botones pequeños, 24px para grandes)
- **Bordes**: Redondeados (6px)

### 3.3 Formularios

- **Inputs**: Altura de 40px, border-radius 6px, borde gris claro 1px
- **Foco**: Borde azul medio (#018ABE) con sombra suave
- **Padding**: 12px horizontal, texto alineado a la izquierda
- **Etiquetas**: Por encima del campo, margen inferior de 8px
- **Mensajes de error**: Color rojo (#F44336), tamaño 12px, debajo del campo

### 3.4 Iconografía

- **Biblioteca**: Lucide Icons
- **Tamaños**:
  - Pequeño: 16px x 16px
  - Estándar: 20px x 20px
  - Grande: 24px x 24px
- **Estilo**: Line icons (contorno), stroke-width 1.5-2px
- **Color**: Heredado del texto o específico según contexto

### 3.5 Tablas

- **Encabezados**: Fondo azul muy claro (#D6E8EE), texto en peso medio
- **Filas**: Alternancia sutil de colores (blanco/#F9FBFC)
- **Bordes**: Separadores horizontales ligeros (color #EEEEEE)
- **Padding**: Vertical 12px, Horizontal 16px
- **Hover**: Fondo azul muy claro (#D6E8EE) en filas al pasar el mouse

## 4. Gráficos y Visualización de Datos

### 4.1 Paleta para Gráficos

- **Datos primarios**: Azul Medio (#018ABE)
- **Datos secundarios**: Azul Claro (#97CADB)
- **Datos terciarios**: Azul Muy Claro (#D6E8EE)
- **Datos destacados**: Naranja (#FF9800) o Verde (#4CAF50)
- **Fondos**: Transparente o Blanco

### 4.2 Elementos de Gráficos

- **Ejes**: Líneas sutiles en gris claro (#DDDDDD)
- **Etiquetas**: Texto pequeño (12px) en gris medio (#757575)
- **Tooltip**: Fondo blanco con sombra sutil, bordes redondeados
- **Leyendas**: Alineadas a la parte superior o inferior del gráfico

## 5. Principios de Diseño

### 5.1 Claridad

- Priorizar la legibilidad y comprensión
- Evitar elementos decorativos innecesarios
- Utilizar espaciado consistente para separar secciones

### 5.2 Consistencia

- Mantener consistencia en colores, tipografía y elementos interactivos
- Utilizar los mismos patrones de diseño en toda la aplicación
- Establecer un sistema de componentes reutilizables

### 5.3 Eficiencia

- Diseñar para facilitar tareas frecuentes
- Minimizar los pasos necesarios para completar acciones
- Agrupar información relacionada en tarjetas o secciones

### 5.4 Feedback

- Proporcionar retroalimentación clara para acciones del usuario
- Utilizar colores y animaciones sutiles para indicar cambios de estado
- Mostrar mensajes de confirmación para acciones importantes

## 6. Adaptabilidad y Responsive Design

- Diseñar primero para escritorio (Desktop First)
- Considerar punto de quiebre a 1280px para adaptación a pantallas más pequeñas
- Garantizar usabilidad mínima hasta 1024px de ancho
- Componentes adaptativos según el espacio disponible:
  - Tablas: scroll horizontal en contenedores pequeños
  - Tarjetas: reorganización en columnas según espacio
  - Gráficos: versiones simplificadas para espacios reducidos

## 7. Accesibilidad

- Asegurar contraste adecuado entre texto y fondo (WCAG AA mínimo)
- Incluir estados de focus visibles para navegación por teclado
- Textos alternativos para imágenes e iconos funcionales
- Estructurar el contenido con encabezados jerárquicos adecuados

## 8. Aplicación en la Interfaz

### 8.1 Estructura del Dashboard

- **Barra lateral**: Fondo azul marino oscuro (#001B48), iconos y texto en blanco
- **Encabezado**: Fondo blanco, sombra sutil para separación
- **Área de contenido**: Fondo gris muy claro (#F5F5F5), padding de 24px
- **Tarjetas de resumen**: 4 por fila en pantallas grandes, datos clave con iconos
- **Gráficos principales**: Ocupan ancho completo o mitad según importancia
- **Tablas de datos**: Con paginación para conjuntos grandes

### 8.2 Pantallas de Detalle y Formularios

- Encabezado con título y acciones principales (botones)
- Organización en secciones con subtítulos claros
- Formularios con validación inmediata y mensajes de ayuda

- Acciones primarias destacadas (botón primario) y secundarias con menor prominencia
