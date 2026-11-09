import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// mode "preview": один HTML-файл без скрипта Telegram (для показа прототипа)
// mode "production": обычная сборка для хостинга как Telegram Mini App
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'telegram-sdk',
      transformIndexHtml(html) {
        return mode === 'preview'
          ? html.replace('<!--TG_SDK-->', '')
          : html.replace('<!--TG_SDK-->', '<script src="https://telegram.org/js/telegram-web-app.js"></script>');
      },
    },
    ...(mode === 'preview' ? [viteSingleFile()] : []),
  ],
  build: { outDir: mode === 'preview' ? 'dist-preview' : 'dist' },
}));
