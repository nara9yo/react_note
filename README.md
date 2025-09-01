# 📝 노트 앱 (React Note)

React, TypeScript, Redux Toolkit, Firebase를 사용하여 개발된 모던 노트 앱입니다.

## ✨ 주요 기능

- 📝 노트 생성, 조회, 수정, 삭제 (CRUD)
- 🔄 실시간 상태 관리 (Redux Toolkit)
- ☁️ Firebase Firestore를 통한 데이터 저장
- 📱 반응형 디자인 (Tailwind CSS)
- 🚀 GitHub Pages 자동 배포

## 🛠️ 기술 스택

- **프론트엔드**: React 19 + TypeScript
- **상태 관리**: Redux Toolkit 2.8.2
- **백엔드**: Firebase 12.1.0
- **스타일링**: Tailwind CSS 4.1.12
- **아이콘**: Lucide React 0.468.0
- **배포**: GitHub Pages + GitHub Actions

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/[USERNAME]/[REPOSITORY_NAME].git
cd [REPOSITORY_NAME]
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore 데이터베이스 활성화
3. 프로젝트 설정에서 웹 앱 추가
4. `.env.local` 파일 생성 및 Firebase 설정 추가:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 앱을 확인할 수 있습니다.

## 📦 빌드 및 배포

### 로컬 빌드

```bash
npm run build
```

### GitHub Pages 배포

1. GitHub 저장소 설정에서 Pages 소스를 "GitHub Actions"로 설정
2. main 브랜치에 push하면 자동으로 배포됩니다

## 🔧 프로젝트 구조

```
src/
├── app/                    # Redux 스토어 설정
│   ├── store.ts           # Redux 스토어
│   └── hooks.ts           # 타입이 지정된 Redux 훅들
├── components/             # UI 컴포넌트
│   ├── CreateNoteModal.tsx # 노트 생성 모달
│   ├── NoteCard.tsx        # 개별 노트 카드
│   └── NoteList.tsx        # 노트 목록
├── features/               # Redux 기능별 모듈
│   └── notes/             # 노트 관련 기능
│       ├── notesSlice.ts   # Redux 슬라이스
│       └── notesAPI.ts     # Firebase API 함수
├── types/                  # TypeScript 타입 정의
│   └── index.ts           # 공통 타입들
├── test/                   # 테스트 설정
│   └── setup.ts           # Vitest 설정
├── firebase.ts             # Firebase 초기화
├── App.tsx                 # 메인 앱 컴포넌트
└── main.tsx               # 앱 진입점
```

## 📱 사용법

1. **노트 생성**: 상단의 "새 노트" 버튼을 클릭하여 모달 열기
2. **노트 편집**: 노트 카드의 편집 아이콘 클릭
3. **노트 삭제**: 노트 카드의 삭제 아이콘 클릭 후 확인
4. **노트 조회**: 생성된 모든 노트가 자동으로 목록에 표시

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 🔒 보안

- Firebase 보안 규칙 설정을 통해 데이터 접근 제어
- 환경 변수를 통한 민감 정보 보호
- `.env.local` 파일은 Git에 커밋되지 않음


## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
