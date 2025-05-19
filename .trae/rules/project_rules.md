PACTA Project Rules
This document consolidates the development, design, functional, security, and testing rules for the PACTA application, a desktop platform for enterprise contract management built with Electron, Vite, TypeScript (renderer), and JavaScript (main), using SQLite for data persistence. These rules ensure consistency, quality, and alignment with the project’s goals of reducing errors, optimizing time, and improving contract organization.

1. General Principles

Project Context: PACTA is a secure, offline-capable desktop application for managing contracts, with features for contract creation, supplementation, notifications, and analytics.
Development Workflow:
Always check for existing files before creating new ones.
Analyze and match the style of existing code for consistency.
Use npm for package management.
Follow object-oriented programming principles and modern development practices.
Organize code by functional domains (e.g., contracts, users, notifications).
Resolve import, logic, and typing errors (for TypeScript in renderer) in modified code.
Locate files before editing; if unclear, ask for guidance on file location or creation.

Prioritization:
High: Contract management, supplements, notifications.
Medium: Dashboard, basic statistics.
Low: Advanced statistics, email notifications, document uploads.

Documentation: Reference prd.mdc, app-flow.mdc, branding.mdc, ipc.mdc, pacta.mdc, and ficha-tecnica.mdc for requirements and guidelines.

2. Development Rules
   2.1 Frontend (Renderer Process)

Technologies:
Use TypeScript with strict mode (strict: true in tsconfig.json) and well-defined interfaces.
Implement functional React components with custom hooks.
Use Vite as the build tool, configured via vite.config.ts.
Use Shadcn/UI and Tailwind CSS for UI, following branding.mdc.
Manage global state with Zustand.
Use React Hook Form with Zod for form validation.
Support suspense for asynchronous component loading.

TypeScript Rules:
Define interfaces for all data structures and component props.
Avoid any; use unknown for dynamic data.
Use ESLint with @typescript-eslint and Airbnb style guide.
Enforce type-safe imports and exports.
Use explicit return types for functions.
Document complex types with JSDoc for clarity.

Vite Rules:
Configure Vite in vite.config.ts with plugins (e.g., vite-plugin-react, vite-plugin-electron).
Use environment variables via import.meta.env (prefix with VITE\_ for custom variables).
Optimize builds with code splitting and tree-shaking.
Serve assets from public/ and reference via / (e.g., /assets/image.png).
Use Vite’s HMR (Hot Module Replacement) during development.
Ensure dist/ output is compatible with Electron packaging.

Best Practices:
Create modular, reusable components in src/components/.
Implement responsive design (desktop-first, min 1024px).
Ensure accessibility (WCAG AA contrast, keyboard navigation).
Provide visual feedback for user actions (e.g., loading states, success messages).
Avoid direct imports from the main process; use IPC via contextBridge.
Organize code by feature (e.g., src/features/contracts/).

2.2 Backend (Main Process)

Technologies:
Use pure JavaScript (ES Modules or CommonJS) for the Electron main process.
Use ipcMain for handling renderer requests.
Use Prisma with SQLite for data persistence.
Structure handlers by domain in main/handlers/.
Implement business logic in main/services/.

JavaScript Rules:
Follow Airbnb JavaScript style guide, enforced by ESLint.
Use CommonJS (require/module.exports) for compatibility with Electron.
Avoid global variables; use const or let for variable declarations.
Document functions and complex logic with JSDoc.
Use async/await for asynchronous operations (e.g., database queries, file I/O).
Handle errors with try/catch and log meaningful messages.
Keep functions small and single-purpose.

Best Practices:
Validate all IPC data with Zod before processing.
Use contextBridge to expose safe APIs to the renderer.
Implement daily automated backups to data/backups/ (delete backups >7 days).
Provide manual restoration for admins via a UI in the settings section.
Avoid synchronous file operations; use asynchronous APIs (e.g., fs.promises).
Structure code by domain (e.g., main/handlers/contracts.js).

2.3 IPC Communication

Security:
Use a whitelist of allowed IPC channels in preload.js.
Avoid exposing sensitive APIs to the renderer.
Enable contextIsolation and sandbox in webPreferences.
Log unauthorized access attempts.

Implementation:
Define channels in both renderer (src/constants/channels.ts) and main (main/constants/channels.js) (e.g., documents:save).
Use ipcRenderer.invoke for bidirectional communication.
Handle errors consistently with descriptive messages.
Clean up IPC listeners to prevent memory leaks.
Example (renderer):import { ipcRenderer } from 'electron';
import { DocumentsChannels } from '@/constants/channels';
const saveDocument = async (data) => {
try {
return await ipcRenderer.invoke(DocumentsChannels.SAVE, data);
} catch (error) {
console.error('IPC Error:', error);
throw error;
}
};

Example (main):const { ipcMain } = require('electron');
const { DocumentsChannels } = require('./constants/channels');
ipcMain.handle(DocumentsChannels.SAVE, async (event, data) => {
// Validate and process data
return { success: true, data };
});

3. Design and UX Rules

Branding:
Follow the color palette from branding.mdc (e.g., Azul Medio #018ABE for interactive elements, Blanco #FFFFFF for card backgrounds).
Use Inter (headings, buttons) and Roboto (body text) fonts with specified sizes and weights.
Use Lucide Icons (16px–24px, line style) for iconography.

UI Components:
Cards: 8px rounded borders, subtle shadow, 16px–24px padding, white background.
Buttons: 40px height, 6px border radius, primary uses Azul Medio, destructive uses Rojo #F44336.
Forms: 40px input height, 6px border radius, Azul Medio focus border, error messages in Rojo.
Tables: Azul Muy Claro #D6E8EE header background, alternate row colors, 12px vertical padding.
Charts: Use Azul Medio for primary data, Naranja #FF9800 for highlights, çerçeves

System: \* Today's date and time is 05:50 PM CEST on Monday, May 19, 2025.
