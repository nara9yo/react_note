/**
 * 환경 변수 검증 유틸리티
 * - Firebase 필수 환경 변수들에 대한 완전한 검증
 * - 개발/프로덕션 환경별 다른 검증 규칙 적용
 * - 사용자 친화적인 에러 메시지 제공
 */

import i18n from '../i18n';

// Firebase 환경 변수 인터페이스
interface FirebaseEnvVars {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// 환경 변수 검증 결과 인터페이스
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  config?: FirebaseEnvVars;
}

// 검증 에러 인터페이스
interface ValidationError {
  field: keyof FirebaseEnvVars;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

// 검증 경고 인터페이스
interface ValidationWarning {
  field: keyof FirebaseEnvVars;
  code: string;
  message: string;
}

// 환경 변수 검증 규칙
const VALIDATION_RULES = {
  apiKey: {
    required: true,
    minLength: 30,
    pattern: /^AIza[0-9A-Za-z_-]{35}$/,
    description: 'Firebase API Key (starts with AIza, 39 characters)'
  },
  authDomain: {
    required: true,
    minLength: 10,
    pattern: /^[a-z0-9-]+\.firebaseapp\.com$/,
    description: 'Firebase Auth Domain (*.firebaseapp.com)'
  },
  projectId: {
    required: true,
    minLength: 6,
    maxLength: 30,
    pattern: /^[a-z0-9-]+$/,
    description: 'Firebase Project ID (lowercase, numbers, hyphens only)'
  },
  storageBucket: {
    required: true,
    minLength: 10,
    pattern: /^[a-z0-9-]+\.(appspot\.com|firebasestorage\.app)$/,
    description: 'Firebase Storage Bucket (*.appspot.com or *.firebasestorage.app)'
  },
  messagingSenderId: {
    required: true,
    minLength: 10,
    pattern: /^\d+$/,
    description: 'Firebase Messaging Sender ID (numbers only)'
  },
  appId: {
    required: true,
    minLength: 20,
    pattern: /^1:[0-9]+:(web|android|ios):[0-9a-f]+$/,
    description: 'Firebase App ID (1:*:web:*)'
  }
} as const;

// 개발 환경 여부 확인
const isDevelopment = import.meta.env.MODE === 'development';

/**
 * 단일 환경 변수 검증
 * @param field - 검증할 필드명
 * @param value - 검증할 값
 * @returns 검증 에러 배열
 */
function validateField(
  field: keyof FirebaseEnvVars, 
  value: string | undefined
): ValidationError[] {
  const errors: ValidationError[] = [];
  const rule = VALIDATION_RULES[field];

  // 필수 값 검증
  if (rule.required && (!value || value.trim() === '')) {
    errors.push({
      field,
      code: 'REQUIRED',
      message: i18n.t('error.envRequired', { field: field.toUpperCase() }),
      severity: 'error'
    });
    return errors; // 값이 없으면 추가 검증 불필요
  }

  if (!value) return errors;

  const trimmedValue = value.trim();

  // 길이 검증
  if (rule.minLength && trimmedValue.length < rule.minLength) {
    errors.push({
      field,
      code: 'TOO_SHORT',
      message: i18n.t('error.envTooShort', { 
        field: field.toUpperCase(), 
        minLength: rule.minLength 
      }),
      severity: 'error'
    });
  }

  if ('maxLength' in rule && rule.maxLength && trimmedValue.length > rule.maxLength) {
    errors.push({
      field,
      code: 'TOO_LONG',
      message: i18n.t('error.envTooLong', { 
        field: field.toUpperCase(), 
        maxLength: rule.maxLength 
      }),
      severity: 'error'
    });
  }

  // 패턴 검증
  if (rule.pattern && !rule.pattern.test(trimmedValue)) {
    errors.push({
      field,
      code: 'INVALID_FORMAT',
      message: i18n.t('error.envInvalidFormat', { 
        field: field.toUpperCase(),
        description: rule.description
      }),
      severity: 'error'
    });
  }

  // 개발 환경에서 예시 값 사용 경고
  if (isDevelopment && isExampleValue(field, trimmedValue)) {
    errors.push({
      field,
      code: 'EXAMPLE_VALUE',
      message: i18n.t('error.envExampleValue', { field: field.toUpperCase() }),
      severity: 'warning'
    });
  }

  return errors;
}

/**
 * 예시 값 여부 확인
 * @param field - 필드명
 * @param value - 값
 * @returns 예시 값 여부
 */
function isExampleValue(field: keyof FirebaseEnvVars, value: string): boolean {
  const examplePatterns: Record<keyof FirebaseEnvVars, RegExp[]> = {
    apiKey: [/your_api_key_here/i, /your_firebase_api_key/i],
    authDomain: [/your_project.*\.firebaseapp\.com/i],
    projectId: [/your_project_id/i, /your-project-id/i],
    storageBucket: [/your_project.*\.appspot\.com/i],
    messagingSenderId: [/your_messaging_sender_id/i, /123456789/],
    appId: [/your_app_id/i, /1:123456789:web:/]
  };

  return examplePatterns[field]?.some(pattern => pattern.test(value)) || false;
}

/**
 * Firebase 환경 변수 전체 검증
 * @param envVars - 환경 변수 객체
 * @returns 검증 결과
 */
export function validateFirebaseEnv(envVars: Partial<FirebaseEnvVars>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 각 필드 검증
  Object.keys(VALIDATION_RULES).forEach(field => {
    const fieldErrors = validateField(field as keyof FirebaseEnvVars, envVars[field as keyof FirebaseEnvVars]);
    errors.push(...fieldErrors);
  });

  // 프로젝트 일관성 검증
  if (envVars.projectId && envVars.authDomain && envVars.storageBucket) {
    const projectIdFromDomain = envVars.authDomain.replace('.firebaseapp.com', '');
    
    // Storage Bucket에서 프로젝트 ID 추출 (두 가지 형식 지원)
    let projectIdFromBucket = '';
    if (envVars.storageBucket.includes('.appspot.com')) {
      projectIdFromBucket = envVars.storageBucket.replace('.appspot.com', '');
    } else if (envVars.storageBucket.includes('.firebasestorage.app')) {
      projectIdFromBucket = envVars.storageBucket.replace('.firebasestorage.app', '');
    }

    if (envVars.projectId !== projectIdFromDomain) {
      errors.push({
        field: 'authDomain',
        code: 'INCONSISTENT_PROJECT_ID',
        message: i18n.t('error.envInconsistentProjectId', { 
          field: 'AUTH_DOMAIN',
          expected: `${envVars.projectId}.firebaseapp.com`
        }),
        severity: 'error'
      });
    }

    if (projectIdFromBucket && envVars.projectId !== projectIdFromBucket) {
      // 어떤 형식을 사용하고 있는지 확인하여 적절한 메시지 표시
      const expectedFormat = envVars.storageBucket.includes('.appspot.com') 
        ? `${envVars.projectId}.appspot.com`
        : `${envVars.projectId}.firebasestorage.app`;
        
      errors.push({
        field: 'storageBucket',
        code: 'INCONSISTENT_PROJECT_ID',
        message: i18n.t('error.envInconsistentProjectId', { 
          field: 'STORAGE_BUCKET',
          expected: expectedFormat
        }),
        severity: 'error'
      });
    }
  }

  // 경고를 에러 배열에서 분리
  const actualErrors = errors.filter(e => e.severity === 'error');
  const actualWarnings = errors.filter(e => e.severity === 'warning').map(e => ({
    field: e.field,
    code: e.code,
    message: e.message
  }));

  warnings.push(...actualWarnings);

  const isValid = actualErrors.length === 0;

  return {
    isValid,
    errors: actualErrors,
    warnings,
    config: isValid ? envVars as FirebaseEnvVars : undefined
  };
}

/**
 * 환경 변수 로드 및 검증
 * @returns 검증 결과
 */
export function loadAndValidateEnv(): ValidationResult {
  const envVars: Partial<FirebaseEnvVars> = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // 개발 환경에서 디버깅 정보 출력
  if (isDevelopment) {
    console.group('🔍 Environment Variables Debug Info');
    console.log('Current Mode:', import.meta.env.MODE);
    console.log('Base URL:', import.meta.env.BASE_URL);
    console.log('Environment Variables:');
    
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`- ${key}:`, value ? `"${value}"` : '❌ undefined');
    });
    
    // 모든 VITE_ 환경 변수 표시
    console.log('\nAll VITE_ Environment Variables:');
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        console.log(`- ${key}:`, import.meta.env[key]);
      }
    });
    console.groupEnd();
  }

  return validateFirebaseEnv(envVars);
}

/**
 * 검증 에러를 콘솔에 출력
 * @param result - 검증 결과
 */
export function logValidationResult(result: ValidationResult): void {
  if (result.isValid) {
    console.log('✅ Firebase environment variables validation passed');
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Firebase environment variables warnings:');
      result.warnings.forEach(warning => {
        console.warn(`  - ${warning.field}: ${warning.message}`);
      });
    }
  } else {
    console.error('❌ Firebase environment variables validation failed:');
    result.errors.forEach(error => {
      console.error(`  - ${error.field}: ${error.message}`);
    });

    if (result.warnings.length > 0) {
      console.warn('⚠️  Additional warnings:');
      result.warnings.forEach(warning => {
        console.warn(`  - ${warning.field}: ${warning.message}`);
      });
    }

    console.error('\n📋 Environment variables setup guide:');
    console.error('1. Copy env.example to .env');
    console.error('2. Replace all example values with your Firebase project values');
    console.error('3. Ensure all values follow the correct format');
    console.error('4. Restart the development server');
  }
}

/**
 * 검증 실패 시 사용자 친화적인 에러 표시
 * @param result - 검증 결과
 */
export function displayValidationError(result: ValidationResult): void {
  if (result.isValid) return;

  // DOM이 로드된 후 에러 표시
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => showErrorModal(result));
  } else {
    showErrorModal(result);
  }
}

/**
 * 에러 모달 표시
 * @param result - 검증 결과
 */
function showErrorModal(result: ValidationResult): void {
  // 기존 에러 모달 제거
  const existingModal = document.getElementById('env-validation-error');
  if (existingModal) {
    existingModal.remove();
  }

  // 에러 모달 생성
  const modal = document.createElement('div');
  modal.id = 'env-validation-error';
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        padding: 32px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="
            width: 48px;
            height: 48px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
          ">
            <span style="color: #dc2626; font-size: 24px;">⚠️</span>
          </div>
          <div>
            <h2 style="margin: 0; color: #dc2626; font-size: 20px; font-weight: 600;">
              ${i18n.t('error.envValidationFailed')}
            </h2>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
              ${i18n.t('error.envValidationDescription')}
            </p>
          </div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 500;">
            ${i18n.t('error.envValidationErrors')}:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #dc2626;">
            ${result.errors.map(error => `
              <li style="margin-bottom: 8px;">
                <strong>${error.field}</strong>: ${error.message}
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="
          background: #f3f4f6;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        ">
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 500;">
            ${i18n.t('error.envValidationSteps')}:
          </h4>
          <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
            <li style="margin-bottom: 4px;">${i18n.t('error.envStep1')}</li>
            <li style="margin-bottom: 4px;">${i18n.t('error.envStep2')}</li>
            <li style="margin-bottom: 4px;">${i18n.t('error.envStep3')}</li>
            <li style="margin-bottom: 4px;">${i18n.t('error.envStep4')}</li>
          </ol>
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button 
            onclick="document.getElementById('env-validation-error').remove()"
            style="
              background: #dc2626;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.background='#b91c1c'"
            onmouseout="this.style.background='#dc2626'"
          >
            ${i18n.t('button.close')}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

/**
 * 안전한 Firebase 설정 객체 생성
 * @param result - 검증 결과
 * @returns Firebase 설정 객체 또는 null
 */
export function createSafeFirebaseConfig(result: ValidationResult): FirebaseEnvVars | null {
  if (!result.isValid || !result.config) {
    return null;
  }

  return { ...result.config };
}
