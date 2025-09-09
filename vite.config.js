import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // 配置WASM文件的MIME类型
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    // 配置静态文件服务
    fs: {
      allow: ['..', '..']
    }
  },
  // 优化器配置
  optimizeDeps: {
    exclude: ['espeak-ng'],
    include: []
  },
  // 配置WASM文件处理
  assetsInclude: ['**/*.wasm'],
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 配置WASM文件处理
    rollupOptions: {
      output: {
        manualChunks: {
          // 将其他大型依赖分离，但不包括espeak-ng
          'framer-motion': ['framer-motion']
        }
      }
    },
    // 确保WASM文件被正确处理
    target: 'esnext'
  },
  // 定义全局变量
  define: {
    global: 'globalThis'
  }
})