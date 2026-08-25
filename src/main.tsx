import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root が見つかりません');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// オフラインでも開けるようにする。開発中は登録しない。
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      // Service Worker が使えない環境でも、アプリ自体は問題なく動く
    });
  });
}
