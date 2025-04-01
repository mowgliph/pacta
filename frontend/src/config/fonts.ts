/**
 * Configuración de fuentes disponibles en la aplicación
 * Estas fuentes se utilizan en el archivo tailwind.config.js
 */

/**
 * Lista de fuentes disponibles para la aplicación (visita la ruta `/settings/appearance` para cambiarlas).
 * 
 * Este array se utiliza para generar el `safelist` en 'tailwind.config.js' y en los componentes
 * de configuración de apariencia para prevenir que las clases dinámicas de fuentes (ej: `font-inter`, `font-manrope`) 
 * sean eliminadas durante la purga de CSS.
 *
 * 📝 Cómo añadir una nueva fuente:
 * 1. Añade el nombre de la fuente aquí.
 * 2. Actualiza la etiqueta `<link>` en 'index.html' para incluir la nueva fuente desde Google Fonts (u otra fuente).
 * 3. Añade la nueva familia de fuentes en 'tailwind.config.js'
 *
 * Ejemplo:
 * fonts.ts           → Añade 'roboto' a este array.
 * index.html         → Añade el enlace de Google Fonts para Roboto.
 * tailwind.config.js → Añade la nueva fuente en `theme.extend.fontFamily`.
 * ```ts
 * theme: {
 *   // otras configuraciones
 *   extend: {
 *      fontFamily: {
 *        inter: ['Inter', ...fontFamily.sans],
 *        manrope: ['Manrope', ...fontFamily.sans],
 *        roboto: ['Roboto', ...fontFamily.sans], // Añade la nueva fuente aquí
 *      }
 *   }
 * }
 * ```
 */
export const fonts = ['inter', 'manrope', 'system'] as const;

/**
 * Tipo para las fuentes disponibles
 */
export type FontType = (typeof fonts)[number];

/**
 * Detalles de cada fuente
 */
export const fontDetails = {
  inter: {
    name: 'Inter',
    description: 'Fuente moderna con alta legibilidad, ideal para interfaces.'
  },
  manrope: {
    name: 'Manrope',
    description: 'Fuente geométrica elegante, perfecta para títulos y datos.'
  },
  system: {
    name: 'Sistema',
    description: 'Fuente predeterminada del sistema, optimizada para rendimiento.'
  }
}; 