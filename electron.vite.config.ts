import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    assetsInclude: ['**/*.glb', '**/*.hdr']
  },
  preload: {
    assetsInclude: ['**/*.glb', '**/*.hdr']
  },
  renderer: {
    assetsInclude: ['**/*.glb', '**/*.hdr'],
    publicDir: './src/renderer/src/assets',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@/components': resolve('@/components'),
        '@/hooks': resolve('@/hooks'),
        '@/resources': resolve('./resources'),
        '@/lib': resolve('@/lib')
      }
    },
    plugins: [
      //
      react(),
      tailwindcss()
    ]
  }
})
