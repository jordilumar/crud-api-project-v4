import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sales': 'http://127.0.0.1:5000',
      '/cars': 'http://127.0.0.1:5000',
    },
    historyApiFallback: true, // Redirige todas las rutas al index.html
  },
});