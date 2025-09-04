# 📝 React Note - 모던 노트 관리 애플리케이션

> React 19 + TypeScript + Vite 기반의 모던 노트 관리 앱. Firebase Firestore, Redux Toolkit 상태 관리, 리치 텍스트 에디터, 다국어 지원을 포함합니다.

---

## 📑 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [데모/스크린샷](#-데모스크린샷)
3. [주요 기능](#-주요-기능)
4. [기술 스택](#️-기술-스택)
5. [프로젝트 구조](#-프로젝트-구조)
6. [시작하기](#-시작하기)
7. [환경 변수](#-환경-변수)
8. [스크립트](#-스크립트)
9. [배포](#-배포)
10. [아키텍처/상태 관리](#-아키텍처상태-관리)
11. [변경 이력](#-변경-이력)

---

## 📘 프로젝트 소개

Firebase Firestore를 백엔드로 활용한 개인 노트 관리 데모입니다. 리치 텍스트 에디터(Quill.js)를 통한 서식 지정, 태그 시스템, 우선순위 설정, 다국어 지원(한국어/영어) 등 현대적인 노트 앱의 핵심 기능을 제공합니다. UX는 모달, 토스트 알림, 반응형 디자인으로 보완했습니다.

## 🖼️ 데모/스크린샷

**📱 [GitHub Pages에서 바로 사용해보기](https://nara9yo.github.io/react_note/)**

## ✨ 주요 기능

### 📝 노트 관리
- **CRUD 기능**: 노트 생성, 조회, 수정, 삭제
- **리치 텍스트 에디터**: Quill.js 기반 서식 지정 (굵게, 기울임, 밑줄, 리스트, 인용 등)
- **태그 시스템**: 색상별 태그 생성 및 관리
- **우선순위 설정**: 낮음/보통/높음 우선순위 분류
- **배경색 선택**: 8가지 배경색 옵션
- **고정 기능**: 중요 노트 상단 고정

### 🌐 다국어 지원
- **언어 선택**: 한국어/영어 지원
- **동적 번역**: 모든 UI 요소 실시간 번역
- **시간 표시**: timeago.js를 통한 로케일별 상대 시간
- **언어 저장**: localStorage를 통한 언어 설정 유지

### 🎨 사용자 경험
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **모달 시스템**: 노트 편집, 태그 관리, 정렬 옵션
- **토스트 알림**: 작업 완료/오류 알림
- **드래그 앤 드롭**: 직관적인 인터페이스
- **검색 및 필터**: 제목/내용 기반 검색, 태그별 필터링

### 🔄 고급 기능
- **실시간 동기화**: Firebase Firestore 실시간 업데이트
- **오프라인 지원**: 로컬 상태 관리
- **백업/복원**: Firebase 기반 데이터 백업
- **정렬 옵션**: 날짜, 우선순위, 제목별 정렬

## 🛠️ 기술 스택

### Frontend
- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드

### 상태 관리
- **Redux Toolkit**: 예측 가능한 상태 관리

### 백엔드
- **Firebase Firestore**: NoSQL 실시간 데이터베이스
- **Firebase Auth**: 인증 시스템 (향후 확장)

### 스타일링
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React**: 모던 아이콘 라이브러리

### 에디터
- **Quill.js**: 리치 텍스트 에디터
- **Delta JSON**: 안전한 서식 데이터 저장

### 다국어
- **i18next**: 다국어 프레임워크
- **react-i18next**: React 통합
- **timeago.js**: 로케일별 시간 표시

### 개발 도구
- **ESLint**: 코드 품질 관리
- **GitHub Actions**: CI/CD 자동화

## 🚀 시작하기

### 요구사항

- Node.js 20 이상
- npm 또는 yarn

### 설치

```bash
git clone https://github.com/your-username/react_note.git
cd react_note
npm install
```

### 개발 서버

```bash
npm run dev
```

브라우저: `http://localhost:5173`

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

### 4. Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 노트 컬렉션
    match /notes/{document} {
      allow read, write: if true;  // 개발용 (모든 접근 허용)
    }
    // 태그 컬렉션
    match /tags/{document} {
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
git commit -m "Initial commit: React Note app with i18n, rich text editor, and Firebase"
git branch -M main
git remote add origin https://github.com/[USERNAME]/react_note.git
git push -u origin main
```

### 3. GitHub Pages 설정

1. 저장소 Settings 탭으로 이동
2. 왼쪽 메뉴에서 "Pages" 선택
3. Source를 "GitHub Actions"로 설정
4. 저장

### 4. GitHub Actions 워크플로우 확인

프로젝트에는 이미 `.github/workflows/deploy.yml` 파일이 포함되어 있습니다:
- Node.js 20 사용
- 자동 빌드 및 배포
- Firebase 환경 변수 지원

### 5. 자동 배포 테스트

main 브랜치에 push하면 자동으로 배포가 시작됩니다:

```bash
git add .
git commit -m "Update deployment configuration"
git push
```

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.

## 🌐 다국어 설정

### 언어 변경
- 사이드바 하단의 언어 선택기에서 한국어/영어 전환
- 선택한 언어는 localStorage에 자동 저장
- 기본 언어: 한국어

### 번역 추가
`src/i18n/index.ts`에서 새로운 번역 키 추가:

```typescript
export const resources = {
  ko: {
    translation: {
      // 기존 번역들...
      "새로운키": "새로운 값"
    }
  },
  en: {
    translation: {
      // 기존 번역들...
      "새로운키": "New Value"
    }
  }
};
```

## 🐛 문제 해결

### Firebase 연결 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Firebase 프로젝트 ID가 정확한지 확인
- Firestore 데이터베이스가 활성화되었는지 확인
- Firestore 보안 규칙이 올바르게 설정되었는지 확인

### GitHub Pages 배포 실패

- 저장소 이름이 `react_note`인지 확인
- GitHub Actions 권한이 올바르게 설정되었는지 확인
- 빌드 오류가 없는지 확인
- Node.js 버전이 20인지 확인

### 빌드 오류

- TypeScript 타입 오류 확인
- 의존성 설치 완료 확인
- Node.js 버전 확인 (20.x 이상 권장)

### 리치 텍스트 에디터 문제

- Quill.js가 올바르게 로드되었는지 확인
- Delta JSON 형식이 올바른지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 다국어 문제

- i18next 초기화가 완료되었는지 확인
- 번역 키가 올바르게 정의되었는지 확인
- localStorage에 언어 설정이 저장되었는지 확인

### Tailwind CSS 문제

- PostCSS 설정 확인
- Tailwind CSS 버전 호환성 확인 (v4.1.12 사용)

## 📚 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Redux Toolkit 공식 문서](https://redux-toolkit.js.org/)
- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/docs)
- [GitHub Pages 공식 문서](https://pages.github.com/)
- [i18next 공식 문서](https://www.i18next.com/)
- [Quill.js 공식 문서](https://quilljs.com/)
- [React 19 공식 문서](https://react.dev/)

## 🔄 버전 정보

이 프로젝트는 다음 기술 스택을 사용합니다:

- **React**: 19.1.1
- **TypeScript**: 5.8.3
- **Vite**: 7.1.3
- **Redux Toolkit**: 2.8.2
- **Firebase**: 12.1.0
- **Tailwind CSS**: 4.1.12
- **i18next**: 25.4.2
- **Quill.js**: 2.0.0
- **Lucide React**: 0.468.0

## 🎯 주요 기능 체크리스트

설정 완료 후 다음 기능들이 정상 작동하는지 확인하세요:

- ✅ 노트 생성/수정/삭제
- ✅ 리치 텍스트 에디터 (서식 지정)
- ✅ 태그 생성/관리
- ✅ 우선순위 설정
- ✅ 배경색 변경
- ✅ 노트 고정/해제
- ✅ 검색 및 필터링
- ✅ 정렬 옵션
- ✅ 다국어 지원 (한국어/영어)
- ✅ 반응형 디자인
- ✅ Firebase 실시간 동기화
- ✅ GitHub Pages 자동 배포

## 🔐 환경 변수

`.env`에 Firebase 설정을 주입합니다.

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🧰 스크립트

```bash
npm run dev           # 개발 서버
npm run build         # 타입체크 + 프로덕션 빌드
npm run preview       # 로컬 미리보기
npm run lint          # ESLint 검사
```


## 🚢 배포

- 정적 호스팅 배포(예: GitHub Pages) 지원
- Vite `base` 설정으로 서브경로 호스팅 대응(`vite.config.ts`의 `base: '/react_note/'`)
- GitHub Actions 워크플로우로 CI/CD 자동화 구성

## 📁 프로젝트 구조

```
src/
├── app/                    # Redux 스토어 설정
│   ├── store.ts           # Redux 스토어
│   └── hooks.ts           # 타입이 지정된 Redux 훅들
├── components/             # UI 컴포넌트
│   ├── ConfirmModal.tsx   # 확인 모달
│   ├── LanguageSelector.tsx # 언어 선택기
│   ├── NoteCard.tsx       # 개별 노트 카드
│   ├── NoteList.tsx       # 노트 목록
│   ├── NoteModal.tsx      # 노트 편집 모달
│   ├── PortalModal.tsx    # 포털 모달
│   ├── RichTextEditor.tsx # 리치 텍스트 에디터
│   ├── Sidebar.tsx        # 사이드바
│   ├── SortModal.tsx      # 정렬 모달
│   └── TagModal.tsx       # 태그 관리 모달
├── constants/              # 상수 정의
│   └── noteOptions.ts     # 노트 옵션 상수
├── features/               # Redux 기능별 모듈
│   ├── notes/             # 노트 관련 기능
│   │   ├── notesSlice.ts  # Redux 슬라이스
│   │   └── notesAPI.ts    # Firebase API 함수
│   └── tags/              # 태그 관련 기능
│       └── tagsSlice.ts   # 태그 Redux 슬라이스
├── i18n/                   # 다국어 설정
│   └── index.ts           # 번역 리소스
├── types/                  # TypeScript 타입 정의
│   └── index.ts           # 공통 타입들
├── utils/                  # 유틸리티 함수
│   └── deltaToHtml.ts     # Delta JSON → HTML 변환
├── firebase.ts             # Firebase 초기화
├── App.tsx                 # 메인 앱 컴포넌트
└── main.tsx               # 앱 진입점
```

## 🧭 아키텍처/상태 관리

### Redux Toolkit 슬라이스
- **notesSlice**: 노트 CRUD, 정렬, 필터링 상태 관리
- **tagsSlice**: 태그 생성, 수정, 삭제 상태 관리

### 다국어 (i18n)
- **i18next**: 중앙화된 번역 리소스 관리
- **react-i18next**: React 컴포넌트 통합
- **timeago.js**: 로케일별 상대 시간 표시

### 리치 텍스트 에디터
- **Quill.js**: 커스텀 React 컴포넌트로 래핑
- **Delta JSON**: 안전한 서식 데이터 저장 형식
- **HTML 변환**: 노트 카드 표시용 유틸리티

## 📝 변경 이력

### v1.0.0 (현재)
- ✅ **다국어 지원**: 한국어/영어 완전 지원
- ✅ **리치 텍스트 에디터**: Quill.js 기반 서식 지정
- ✅ **태그 시스템**: 색상별 태그 관리
- ✅ **우선순위 설정**: 낮음/보통/높음 분류
- ✅ **배경색 선택**: 8가지 배경색 옵션
- ✅ **고정 기능**: 중요 노트 상단 고정
- ✅ **정렬 옵션**: 날짜, 우선순위, 제목별 정렬
- ✅ **검색 기능**: 제목/내용 기반 검색
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- ✅ **Firebase 연동**: Firestore 실시간 동기화
- ✅ **GitHub Actions**: CI/CD 자동 배포

### 기술적 개선사항
- **React 19 호환성**: 최신 React 기능 활용
- **TypeScript**: 완전한 타입 안전성
- **커스텀 에디터**: react-quill 대신 직접 구현으로 React 19 호환
- **접근성**: ARIA 속성, 키보드 네비게이션 지원
- **성능 최적화**: 지연 로딩, 메모이제이션 적용

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 [Issues](https://github.com/your-username/react_note/issues)를 생성해 주세요.

