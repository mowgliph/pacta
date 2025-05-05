# Guía de Migración: Nextron → Electron Puro (Next.js SPA)

Esta guía te ayudará a migrar tu proyecto de Nextron a Electron puro, ideal para aplicaciones Next.js modernas con rutas dinámicas y arquitectura SPA.

---

## 1. ¿Por qué migrar?
- **Nextron** requiere `output: "export"` y no soporta bien rutas dinámicas SPA en Next.js 13+.
- **Electron puro** te da control total, soporte para rutas dinámicas y mejor compatibilidad con Next.js moderno.

---

## 2. Eliminar Nextron

1. **Desinstala Nextron y sus dependencias:**
   ```bash
   pnpm remove nextron
   # o
   npm uninstall nextron
   ```
2. **Elimina archivos de configuración de Nextron:**
   - `nextron.config.js` (si existe)
   - Scripts relacionados en `package.json` (ej: `nextron build`, `nextron start`)

---

## 3. Ajustar estructura del proyecto

- Mantén tu estructura:
  - `/main` (código de Electron principal)
  - `/renderer` (Next.js)
- Asegúrate de que el build de Next.js se genera en `/app`:
  - En `renderer/next.config.js`:
    ```js
    distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
    ```

---

## 4. Scripts recomendados en `package.json`

```json
"scripts": {
  "build:renderer": "cd renderer && pnpm build",
  "build:main": "tsc -p main",
  "build": "pnpm build:renderer && pnpm build:main",
  "start": "electron .",
  "dev": "concurrently \"pnpm --filter renderer dev\" \"pnpm --filter main dev\""
}
```
- Ajusta según tu gestor de paquetes (`npm`, `yarn`, `pnpm`).
- Usa `electron .` para lanzar la app en desarrollo/producción.

---

## 5. Ajustar el proceso principal de Electron

- En `main/window/window-manager.ts`, asegúrate de cargar el build correcto:
  ```ts
  if (isDevelopment) {
    await window.loadURL('http://localhost:8888');
  } else {
    await window.loadFile(join(app.getAppPath(), 'app', 'index.html'));
  }
  ```
- El preload debe apuntar a `../../app/preload.js`.

---

## 6. Build y empaquetado final

1. **Compila el renderer:**
   ```bash
   pnpm build:renderer
   # o
   npm run build:renderer
   ```
2. **Compila el main:**
   ```bash
   pnpm build:main
   # o
   npm run build:main
   ```
3. **Lanza la app:**
   ```bash
   pnpm start
   # o
   npm start
   ```
4. **Empaqueta para distribución:**
   - Usa [electron-builder](https://www.electron.build/) o [electron-forge](https://www.electronforge.io/).
   - Ejemplo con electron-builder:
     ```bash
     pnpm add -D electron-builder
     # En package.json:
     "build:dist": "electron-builder"
     ```

---

## 7. Recomendaciones finales

- **No uses `output: "export"`** en Next.js.
- Todas las rutas dinámicas funcionarán como SPA.
- Si tienes assets estáticos, asegúrate de copiarlos a `/app` tras el build.
- Prueba la app navegando a rutas dinámicas en producción.

---

## 8. Recursos útiles
- [Electron Docs](https://www.electronjs.org/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Guía SPA Electron + Next.js](./exp-SPA-electron.md)

---

**¡Listo! Ahora tienes una app Electron moderna, robusta y sin las limitaciones de Nextron.** 