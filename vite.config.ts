import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages などのサブパス配信に備えて相対パスで出力する
  base: './',
});
