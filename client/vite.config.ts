import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ 映射到 src 文件夹
      '@': path.resolve(__dirname, './src'),
      // 共享类型目录（share 在 client 的上一级）
      '@shared': path.resolve(__dirname, '../shared/'),
    },
  },
})
