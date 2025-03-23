<template>
  <div 
    class="flex items-center justify-center rounded-full font-medium uppercase transition-all duration-200 
           shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
           relative overflow-hidden hover:before:opacity-100"
    :style="{ 
      backgroundColor: avatarColor,
      color: textColor,
      width: size + 'px',
      height: size + 'px',
      fontSize: fontSize + 'px',
      '--before-gradient': 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))'
    }"
  >
    <span class="relative z-10">{{ initials }}</span>
    <div class="absolute inset-0 opacity-0 transition-opacity duration-200 bg-gradient-to-tr from-white/10 to-transparent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColors } from '../../types/colors'

const props = defineProps<{
  name: string
  size?: number
}>()

const colors = useColors()

// Colores predefinidos para los avatares (paleta más suave y profesional)
const avatarColors = [
  colors.primary,
  colors.success,
  colors.warning,
  colors.error,
  colors.info,
  colors.accent,
  colors.primaryLight,
  colors.secondaryLight,
  colors.accentLight
]

// Tamaño por defecto si no se especifica
const size = computed(() => props.size || 40)
const fontSize = computed(() => Math.floor(size.value * 0.4))

// Calcular las iniciales del nombre
const initials = computed(() => {
  return props.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Seleccionar un color basado en el nombre
const avatarColor = computed(() => {
  const index = props.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[index]
})

// Calcular el color del texto (blanco o negro) basado en el brillo del color de fondo
const textColor = computed(() => {
  const hex = avatarColor.value.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
})
</script> 