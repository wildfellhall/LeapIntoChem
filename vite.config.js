import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/examples/jsm/tsl/display/BloomNode.js')) return 'three-bloom'
          if (id.includes('/node_modules/three/build/three.webgpu.js')) return 'three-webgpu-api'
          if (id.includes('/node_modules/three/src/')) {
            if (id.includes('/renderers/webgpu/') || id.includes('/renderers/webgl-fallback/')) return 'three-gpu-backends'
            if (id.includes('/renderers/common/') || id.includes('/nodes/') || id.includes('/materials/nodes/')) return 'three-tsl-runtime'
          }
          return undefined
        },
      },
    },
  },
})
