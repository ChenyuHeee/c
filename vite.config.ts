import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'parser',
              test: /node_modules[\\/](?:@lezer|@marijn)[\\/]/,
              priority: 30,
            },
            {
              name: 'editor',
              test: /node_modules[\\/](?:@codemirror|@uiw|codemirror|style-mod|w3c-keyname|crelt)[\\/]/,
              priority: 20,
            },
            {
              name: 'react',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
