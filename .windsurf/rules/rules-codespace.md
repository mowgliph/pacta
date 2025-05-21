---
trigger: always_on
---

# Windsurf Rules for PACTA

Rules for developing PACTA, a desktop contract management app built with Electron, Vite, TypeScript (renderer), JavaScript (main), and SQLite. These ensure consistency, security, and alignment with project goals.

- Always response on Spanish

## General Code Style & Formatting
- Follow Airbnb Style Guide for JavaScript and TypeScript.
- Use 2-space indentation, max 100-character line length.
- Main (JavaScript): Use CommonJS, `const`/`let`, JSDoc, `.cjs` extensions.
- Renderer (TypeScript): Use strict mode, interfaces, no `any`, explicit return types, `.tsx`/`.ts` extensions.
- Name React components in PascalCase (e.g., `ContractCard.tsx`).
- Prefer named exports for components and utilities.
- Use ESLint (Airbnb, `@typescript-eslint` for renderer) and Prettier.

## Project Structure & Architecture
- Main (JavaScript):
- Renderer (TypeScript):
- Strictly separate main and renderer; no direct imports.
- Use SQLite database and backups in `data/`.
- Use Vite for renderer, configured in `vite.renderer.config.ts`.
- Configure Electron in `vite.main.config.ts`.
- Configure preload in `vite.preload.config.ts`

## Styling & UI
- Use Tailwind CSS (`renderer/tailwind.config.ts`) and PostCSS (`renderer/postcss.config.ts`).
- Apply global styles from `renderer/styles/globals.css`.
- Use Shadcn/UI for components (e.g., buttons, forms).
- Use colors: Azul Medio (#018ABE) for interactive elements, Blanco (#FFFFFF) for backgrounds.
- Use Inter (headings/buttons, 14–32px) and Roboto (body, 12–16px) fonts.
- Use Lucide Icons (16–24px, line style).
- Cards: 8px border-radius, subtle shadow, 16–24px padding.
- Buttons: 40px height, 6px border-radius, Azul Medio (primary), Rojo (#F44336, destructive).
- Forms: 40px input height, Azul Medio focus border, Rojo error messages.
- Tables: Azul Muy Claro (#D6E8EE) headers, alternate row colors.
- Ensure WCAG AA contrast and keyboard navigation.

## Data Fetching & Forms
- Fetch data via IPC calls to main process.
- Use React Hook Form with Zod for form validation.
- Validate IPC data with Zod in main process.
- Use Zustand for global state management in renderer.
- Support suspense for async component loading.

## Backend & Database
- Use JavaScript (CommonJS) for main process (`main/index.cjs`, `main/preload.cjs`).
- Use Prisma for SQLite, align with `schema.prisma`.
- Implement daily backups to `data/backups/`; delete backups >7 days.
- Provide admin UI for manual database restoration.
- Use async APIs (e.g., `fs.promises`) for file operations.
- Structure handlers (`main/handlers/`) and utilities (`main/utils/`) by domain.

## IPC Communication
- Define channels by domain (e.g., `contracts:save`) in `renderer/constants/channels.ts` and `main/constants/channels.js`.
- Use `ipcRenderer.invoke` for bidirectional communication; no direct imports.
- Whitelist channels in `main/preload.cjs` with `contextBridge`.
- Enable `contextIsolation` and `sandbox` in `webPreferences`.
- Log unauthorized access attempts.

## Security
- Use JWT for authentication; store passwords hashed with salting.
- Restrict functionality by role (Admin: full access; RA: contract management only).
- Validate user inputs and IPC data to prevent injection.
- Protect backups with restricted file permissions.

## Testing & Quality
- Write unit tests for critical logic (e.g., contract state calculation).
- Test integration flows (e.g., contract creation, backup/restore).
- Verify offline functionality and role-based permissions.
- Ensure UI loads in <3s on average hardware.
- Handle errors with clear messages.
- Comment complex logic with JSDoc (main) or TypeScript comments (renderer).

## Vite Configuration
- Configure renderer in `vite.renderer.config.ts` with `vite-plugin-react`.
- Configure main in `vite.main.config.ts` with `vite-plugin-electron`.
- Use `import.meta.env` for environment variables (prefix: `VITE_`) in renderer.
- Optimize builds with code splitting and tree-shaking.
- Serve assets from `renderer/public/` (e.g., `/assets/image.png`).
- Ensure `dist/` output is Electron-compatible.

## Notes
- Use `npm` for package management.
- Verify file existence before editing; ask for path if unclear.
- Prioritize contracts, supplements, notifications, stadistics.
- Reference `prd.mdc`, `app-flow.mdc`, `branding.mdc`, `ipc.mdc`, `pacta.mdc`, `ficha-tecnica.mdc`.