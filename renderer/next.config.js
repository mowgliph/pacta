/** @type {import('next').NextConfig} */
module.exports = {
  // En desarrollo no usaremos export para evitar problemas de recarga
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Si no estamos en el servidor, proporcionamos polyfills vacíos para módulos de Node
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        net: false,
        tls: false,
        electron: false,
      };
    }
    return config;
  },
}
