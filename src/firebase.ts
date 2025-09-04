// Firebase SDK 라이브러리 import
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// 다국어 설정 import (에러 메시지용)
import i18n from './i18n';

// Firebase 설정 객체
// - Vite 환경 변수에서 Firebase 프로젝트 정보 가져옴
// - .env 파일에 정의된 값들 사용
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// 환경 변수 검증
// - Firebase 프로젝트 ID가 설정되지 않은 경우 에러 로그 출력
if (!firebaseConfig.projectId || firebaseConfig.projectId === '') {
  console.error(i18n.t('error.firebaseProjectIdMissing'));
}

// Firebase 앱 초기화
// - 설정 객체를 사용하여 Firebase 앱 인스턴스 생성
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스 생성 및 export
// - 앱의 다른 부분에서 데이터베이스 접근 시 사용
export const db = getFirestore(app);

// Firebase 앱 인스턴스 export (필요시 다른 Firebase 서비스에서 사용)
export default app;
