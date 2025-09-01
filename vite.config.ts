import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/react_note/', // GitHub Pages 레포지토리명
    define: {
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      })
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // React 핵심 라이브러리
            'react-vendor': ['react', 'react-dom'],
            // Redux 관련
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            // Firebase 관련 (더 세분화)
            'firebase-core': ['firebase/app'],
            'firebase-firestore': ['firebase/firestore'],
            // UI 컴포넌트 라이브러리
            'ui-vendor': ['lucide-react'],
          },
        },
      },
      // 청크 크기 경고 임계값 조정
      chunkSizeWarningLimit: 1000,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
      },
    }
  }
})
