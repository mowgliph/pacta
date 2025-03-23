import { fileURLToPath, URL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('i-')
                }
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
            '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                charset: false
            }
        },
        devSourcemap: true
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
        watch: {
            usePolling: true
        }
    },
    build: {
        sourcemap: true,
        cssCodeSplit: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['vue'],
                    'styles': ['./src/styles/tailwind.css']
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        }
    },
    optimizeDeps: {
        include: ['vue'],
        exclude: ['@vueuse/core']
    }
});
