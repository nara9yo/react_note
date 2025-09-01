# 🚀 노트 앱 설정 가이드

## 📋 필수 설정 단계

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 만들기" 클릭
3. 프로젝트 이름 입력 (예: `react-note-12345`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firestore 데이터베이스 설정

1. 왼쪽 메뉴에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 선택: "테스트 모드에서 시작" (개발용)
4. 위치 선택: `asia-northeast3 (서울)` 권장
5. 데이터베이스 생성 완료

### 3. 웹 앱 등록

1. 프로젝트 개요에서 웹 아이콘 클릭
2. 앱 닉네임 입력 (예: `react-note-web`)
3. "Firebase Hosting 설정" 체크 해제
4. "앱 등록" 클릭
5. Firebase SDK 설정 정보 복사

### 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**⚠️ 중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 5. Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{document} {
      allow read, write: if true;  // 개발용 (모든 접근 허용)
    }
  }
}
```

**🚨 프로덕션 환경에서는 더 엄격한 보안 규칙을 설정해야 합니다.**

## 🚀 GitHub Pages 배포 설정

### 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 저장소 이름 입력: `react_note`
3. Public 또는 Private 선택
4. README 파일 생성 체크
5. 저장소 생성

### 2. 로컬 프로젝트 연결

```bash
git init
git add .
git commit -m "Initial commit: Note app with React + Redux + Firebase"
git branch -M main
git remote add origin https://github.com/[USERNAME]/react_note.git
git push -u origin main
```

### 3. GitHub Pages 설정

1. 저장소 Settings 탭으로 이동
2. 왼쪽 메뉴에서 "Pages" 선택
3. Source를 "GitHub Actions"로 설정
4. 저장

### 4. 자동 배포 테스트

main 브랜치에 push하면 자동으로 배포가 시작됩니다:

```bash
git add .
git commit -m "Update deployment configuration"
git push
```

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.

## 🔧 개발 환경 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속

### 3. 빌드 테스트

```bash
npm run build
```

### 4. 테스트 실행

```bash
# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 🐛 문제 해결

### Firebase 연결 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Firebase 프로젝트 ID가 정확한지 확인
- Firestore 데이터베이스가 활성화되었는지 확인

### GitHub Pages 배포 실패

- 저장소 이름이 `react_note`인지 확인
- GitHub Actions 권한이 올바르게 설정되었는지 확인
- 빌드 오류가 없는지 확인

### 빌드 오류

- TypeScript 타입 오류 확인
- 의존성 설치 완료 확인
- Node.js 버전 확인 (18.x 이상 권장)

### Tailwind CSS 문제

- PostCSS 설정 확인
- Tailwind CSS 버전 호환성 확인 (v4.1.12 사용)

## 📚 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Redux Toolkit 공식 문서](https://redux-toolkit.js.org/)
- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/docs)
- [GitHub Pages 공식 문서](https://pages.github.com/)
- [Vitest 공식 문서](https://vitest.dev/)

## 🆘 도움 요청

문제가 발생하면 다음을 확인해주세요:

1. 콘솔 에러 메시지 확인
2. Firebase Console에서 프로젝트 상태 확인
3. GitHub Actions 로그 확인
4. 이슈를 생성하여 상세한 오류 내용 공유

## 🔄 버전 정보

이 프로젝트는 `react_shop`과 동일한 기술스택 버전을 사용합니다:

- React: 19.1.1
- Redux Toolkit: 2.8.2
- Firebase: 12.1.0
- Tailwind CSS: 4.1.12
- Vite: 7.1.2
- TypeScript: 5.8.3
