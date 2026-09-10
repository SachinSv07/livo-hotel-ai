import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  const isGuestBuild = mode === 'guest';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isGuestBuild ? [{
        name: 'guest-index-entry',
        generateBundle(_options: unknown, bundle: Record<string, { fileName: string }>) {
          const guestHtml = bundle['guest.html'];
          if (guestHtml) {
            guestHtml.fileName = 'index.html';
            bundle['index.html'] = guestHtml;
            delete bundle['guest.html'];
          }
        },
      }] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: isGuestBuild ? 'dist-guest' : 'dist',
      rollupOptions: isGuestBuild ? { input: path.resolve(__dirname, 'guest.html') } : undefined,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
