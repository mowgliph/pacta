# Guía de Migración: Next.js → Vite + Electron Forge (PACTA)

Esta guía describe el proceso completo para migrar el proyecto PACTA de Next.js a Vite, integrando Electron Forge como sistema de empaquetado y distribución. Sigue cada paso cuidadosamente para asegurar una transición exitosa.

---

## 1. Preparativos Iniciales

### 1.1. Crea una nueva rama de migración

```bash
git checkout -b migration/vite-electron-forge
```

### 1.2. Realiza un commit de seguridad

Asegúrate de que tu rama principal esté limpia y sin cambios pendientes:

```bash
git add .
git commit -m "chore: backup antes de migrar a Vite + Electron Forge"
```

---

## 2. Instalación de Electron Forge con Vite + TypeScript

### 2.1. Instala Electron Forge CLI (si no lo tienes)

```bash
pnpm add -g @electron-forge/cli
```

### 2.2. Inicializa un proyecto temporal con la plantilla Vite + TypeScript

> **Nota:** Esto es solo para obtener la estructura y archivos de configuración base.

```bash
npx create-electron-app@latest temp-vite-app --template=vite-typescript
```

---

## 3. Copia y adapta la configuración de Electron Forge

### 3.1. Copia los siguientes archivos y carpetas desde `temp-vite-app` a tu proyecto PACTA:

- `forge.config.ts` o `forge.config.js`
- `vite.main.config.ts` y `vite.renderer.config.ts` (o variantes)
- Carpeta `src/` (solo como referencia para estructura)
- Archivos de ejemplo de `main/`, `preload/` y `renderer/`
- Ajusta el `package.json` según dependencias y scripts

### 3.2. Instala las dependencias necesarias

```bash
pnpm install
```

Asegúrate de tener:
- `electron`
- `@electron-forge/cli`
- `@electron-forge/plugin-vite`
- `vite`
- `typescript`
- Otras dependencias de tu proyecto (React, Zustand, Shadcn, etc.)

---

## 4. Reestructura el Proyecto

### 4.1. Estructura recomendada

```
/
├─ main/           # Código del proceso principal (Electron)
├─ preload/        # Scripts preload para IPC seguro
├─ renderer/       # Código de la UI (Vite + React)
├─ forge.config.ts # Configuración de Electron Forge
├─ vite.*.config.ts# Configuración de Vite para main y renderer
├─ package.json
└─ ...
```

### 4.2. Mueve el código de Next.js

- **Páginas y componentes:**
  - Copia los componentes de `renderer/app/` y `renderer/components/` a la nueva carpeta `renderer/`.
  - Adapta las rutas de Next.js a rutas de React Router (o similar) si es necesario.
- **API y lógica de backend:**
  - Mueve la lógica de backend a `main/` o servicios IPC.
- **Preload:**
  - Implementa el archivo `preload.ts` para exponer APIs seguras al renderer.

---

## 5. Configuración de Vite

### 5.1. Configura Vite para el renderer

- Adapta el archivo `vite.renderer.config.ts` para que apunte a tu nueva entrada principal (ej: `renderer/index.tsx`).
- Asegúrate de que los alias y paths coincidan con tu estructura.

### 5.2. Configura Vite para el main

- Ajusta `vite.main.config.ts` para compilar el proceso principal de Electron.

---

## 6. Migración de Código: Next.js → Vite + React

### 6.1. Elimina dependencias y archivos de Next.js

- Borra carpetas y archivos específicos de Next.js (`pages/`, `api/`, `_app.tsx`, `_document.tsx`, etc.).
- Elimina dependencias de Next.js en `package.json`.

### 6.2. Adapta la entrada principal

- Crea un `renderer/index.tsx` como punto de entrada de la app React.
- Usa `ReactDOM.createRoot` para renderizar la app.

### 6.3. Ruteo

- Sustituye el enrutador de Next.js por React Router DOM u otro sistema de rutas compatible con Vite.
- Adapta las rutas y navegación.

### 6.4. Migración de APIs y lógica de servidor

- Mueve la lógica de API a servicios en el proceso main de Electron.
- Expón funciones mediante IPC seguro usando el preload.

---

## 7. Integración de Electron y Comunicación IPC

### 7.1. Implementa el archivo `preload.ts`

- Expón solo las APIs necesarias al renderer usando `contextBridge`.
- Define y valida los canales IPC según la guía de seguridad.

### 7.2. Adapta los hooks y servicios del renderer para usar IPC

- Sustituye llamadas directas a APIs por invocaciones a través de `window.Electron.ipcRenderer.invoke`.

---

## 8. Ajustes Finales y Pruebas

### 8.1. Scripts de desarrollo y build

- Ajusta los scripts en `package.json`:
  - `start`: inicia Electron Forge en modo desarrollo
  - `make`: genera instaladores

### 8.2. Prueba la aplicación

```bash
pnpm start
```

- Verifica que la UI carga correctamente y que la comunicación IPC funciona.
- Revisa la consola para errores de importación o rutas.

### 8.3. Elimina archivos y dependencias obsoletas

- Borra cualquier archivo, configuración o dependencia que ya no sea necesaria.

---

## 9. Checklist de Migración

- [ ] Rama de migración creada y backup realizado
- [ ] Electron Forge y Vite instalados y configurados
- [ ] Estructura de carpetas reorganizada
- [ ] Código de Next.js migrado a React + Vite
- [ ] Ruteo adaptado
- [ ] Comunicación IPC implementada y segura
- [ ] Scripts de build y desarrollo funcionando
- [ ] Pruebas manuales realizadas
- [ ] Limpieza de archivos y dependencias

---

## 10. Recursos y Referencias

- [Electron Forge: Vite + TypeScript Template](https://www.electronforge.io/templates/vite-+-typescript)
- [Electron Forge: Documentación Oficial](https://www.electronforge.io/)
- [Guía de IPC Segura en Electron](./ipc-pacta.md)
- [Guía de Branding y Estilos](./doc-branding.txt)
- [PRD PACTA](./prd.txt)

---

**¡Listo! Sigue esta guía paso a paso para migrar PACTA a Vite + Electron Forge de forma segura y ordenada.** 