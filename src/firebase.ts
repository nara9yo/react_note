// Firebase SDK 라이브러리 import
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// 환경 변수 검증 유틸리티 import
import { 
  loadAndValidateEnv, 
  logValidationResult, 
  displayValidationError,
  createSafeFirebaseConfig 
} from './utils/envValidator';

// Firebase 환경 변수 검증 및 로드
const validationResult = loadAndValidateEnv();

// 검증 결과를 콘솔에 출력
logValidationResult(validationResult);

// 검증 실패 시 사용자에게 에러 표시
if (!validationResult.isValid) {
  displayValidationError(validationResult);
}

// 안전한 Firebase 설정 객체 생성
const firebaseConfig = createSafeFirebaseConfig(validationResult);

// Firebase 앱과 Firestore 인스턴스 변수
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Firebase 초기화 시도
if (firebaseConfig) {
  try {
    // Firebase 앱 초기화
    app = initializeApp(firebaseConfig);
    
    // Firestore 데이터베이스 인스턴스 생성
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // 초기화 실패 시 사용자에게 알림
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // 일반적인 Firebase 초기화 에러 처리
      if (errorMessage.includes('invalid-api-key')) {
        console.error('🔑 Invalid API Key. Please check VITE_FIREBASE_API_KEY');
      } else if (errorMessage.includes('project-not-found')) {
        console.error('🚫 Project not found. Please check VITE_FIREBASE_PROJECT_ID');
      } else if (errorMessage.includes('invalid-app-id')) {
        console.error('📱 Invalid App ID. Please check VITE_FIREBASE_APP_ID');
      } else {
        console.error('🔧 General Firebase configuration error. Please check all environment variables');
      }
    }
    
    // 앱과 DB를 null로 설정
    app = null;
    db = null;
  }
} else {
  console.error('❌ Cannot initialize Firebase: Environment validation failed');
}

// 안전한 Firestore 접근을 위한 래퍼 함수
export function getFirestoreInstance(): Firestore {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your environment variables.');
  }
  return db;
}

// Firebase 앱 상태 확인 함수
export function isFirebaseInitialized(): boolean {
  return app !== null && db !== null;
}

// Firebase 설정 상태 확인 함수
export function getFirebaseStatus() {
  return {
    isInitialized: isFirebaseInitialized(),
    hasValidConfig: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings
  };
}

// 개발 환경에서 Firebase 상태 전역 노출 (디버깅용)
if (import.meta.env.MODE === 'development') {
  (window as any).__FIREBASE_STATUS__ = getFirebaseStatus;
}

// Firestore 인스턴스 export (null일 수 있음)
// 사용 시 getFirestoreInstance() 함수 사용 권장
export { db };

// Firebase 앱 인스턴스 export (null일 수 있음)
export default app;
