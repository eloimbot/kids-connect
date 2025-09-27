// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // Puerto para desarrollo
    open: true,        // Abre navegador automáticamente
    strictPort: true,  // Falla si el puerto está ocupado
  },
  build: {
    outDir: 'dist',    // Carpeta de salida
    sourcemap: false,  // Mapas de origen
  },
});
