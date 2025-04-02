/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "src",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    /^react-icons/,
    // Agrega aquí otras dependencias que necesiten ser bundleadas
  ],
  // Flags futuros recomendados
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true,
  },
  // Resolución de alias
  watchPaths: ["./src/**/*"],
  // Configuración de entorno
  env: {
    API_URL: process.env.API_URL,
    AUTH_STORAGE_KEY: process.env.AUTH_STORAGE_KEY
  }
}; 