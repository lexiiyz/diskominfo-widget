import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build (npm run build:lib)
  if (mode === 'lib') {
    return {
      plugins: [react(), tailwindcss()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/DiskominfoWidget.jsx'),
          name: 'DiskominfoWidget',
          fileName: 'diskominfo-widget',
        },
        rollupOptions: {
          // React tidak di-bundle, harus disediakan oleh consumer
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
      },
    }
  }

  // Default: dev server & demo build
  return {
    plugins: [react(), tailwindcss()],
  }
})
