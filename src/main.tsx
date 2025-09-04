// React 및 ReactDOM 라이브러리 import
import React from 'react'
import ReactDOM from 'react-dom/client'
// 메인 App 컴포넌트 import
import App from './App.tsx'
// 전역 CSS 스타일 import
import './index.css'
// 다국어 설정 초기화
import './i18n'

// React 18의 새로운 createRoot API 사용
// - StrictMode로 개발 모드에서 잠재적 문제 감지
// - root 엘리먼트에 앱 마운트
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
