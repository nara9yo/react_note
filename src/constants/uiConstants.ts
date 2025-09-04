/**
 * UI 관련 상수 정의
 * - 매직 넘버를 중앙 집중식으로 관리
 * - 일관성 있는 UI/UX 제공
 */

// ===== 시간 관련 상수 =====
export const TIMING = {
  // 애니메이션 지연 시간 (JavaScript에서만 사용)
  MODAL_ANIMATION_DELAY: 200,        // 모달 닫기 애니메이션 지연
  FOCUS_DELAY: 100,                  // 포커싱 지연 (모달 애니메이션 고려)
  CONTENT_CHANGE_DELAY: 100,         // 내용 변경 감지 지연
  
  // 즉시 실행
  IMMEDIATE: 0,                      // setTimeout 즉시 실행용
  
  // 참고: CSS 트랜지션 시간은 index.css의 CSS 변수로 관리됨
  // --transition-fast: 200ms
  // --transition-normal: 300ms
  // --transition-slow: 500ms
} as const;

// ===== 레이아웃 관련 상수 =====
export const LAYOUT = {
  // 콘텐츠 표시 설정
  NOTE_CARD_CONTENT_LINES: 3,        // 노트 카드 내용 표시 줄 수
  
  // 사이드바
  SIDEBAR_WIDTH: 64,                 // 사이드바 기본 폭 (w-64 = 16rem = 256px)
  
  // 모달
  MODAL_MARGIN: 4,                   // 모달 여백 (mx-4)
  
  // 참고: CSS로 이동된 레이아웃 상수들
  // --note-card-min-width: 300px (CSS 그리드에서 사용)
  // --modal-max-height: 90vh (CSS 클래스에서 사용)
} as const;

// ===== z-index 관리 =====
// 참고: z-index 값들은 CSS 클래스로 관리됨 (index.css 참조)
// .z-base, .z-dropdown, .z-tooltip, .z-overlay, .z-sidebar-mobile,
// .z-sort-modal, .z-modal, .z-modal-backdrop, .z-toast, 
// .z-tag-modal, .z-confirm-modal
// 
// JavaScript에서 동적으로 z-index가 필요한 경우에만 아래 상수 사용
export const Z_INDEX = {
  // 동적 계산이 필요한 경우를 위한 참조값
  BASE: 1,
  DROPDOWN: 10,
  TOOLTIP: 20,
  OVERLAY: 40,
  SIDEBAR_MOBILE: 50,
  MODAL: 9999,
  MODAL_BACKDROP: 9998,
  TOAST: 10000,
  TAG_MODAL: 10000,
  CONFIRM_MODAL: 10001,
} as const;

// ===== 색상 관련 상수 =====
export const COLORS = {
  // 기본 태그 색상
  DEFAULT_TAG_COLOR: '#3b82f6',      // blue-500
  
  // 우선순위 색상 (CSS 변수와 연동)
  PRIORITY: {
    LOW: 'var(--color-priority-low)',
    MEDIUM: 'var(--color-priority-medium)', 
    HIGH: 'var(--color-priority-high)',
  },
  
  // 배경색
  DEFAULT_BACKGROUND: '#ffffff',     // 기본 노트 배경색
} as const;

// ===== 크기 관련 상수 =====
export const SIZES = {
  // 아이콘 크기
  ICON: {
    SMALL: 12,                       // 작은 아이콘
    MEDIUM: 16,                      // 기본 아이콘  
    LARGE: 24,                       // 큰 아이콘
    EXTRA_LARGE: 32,                 // 매우 큰 아이콘
  },
  
  // 입력 필드
  INPUT: {
    HEIGHT: 10,                      // h-10 = 2.5rem = 40px
    PADDING_X: 3,                    // px-3 = 0.75rem = 12px
    PADDING_Y: 2,                    // py-2 = 0.5rem = 8px
  },
  
  // 버튼
  BUTTON: {
    SMALL: {
      PADDING_X: 2,                  // px-2 = 0.5rem = 8px
      PADDING_Y: 1,                  // py-1 = 0.25rem = 4px
    },
    MEDIUM: {
      PADDING_X: 4,                  // px-4 = 1rem = 16px
      PADDING_Y: 2,                  // py-2 = 0.5rem = 8px  
    },
  },
} as const;

// ===== 개발 환경 상수 =====
export const DEV = {
  // 개발 서버
  DEFAULT_PORT: 5173,                // Vite 기본 포트
  
  // 디버그
  LOG_LEVEL: 'info',                 // 로그 레벨
} as const;

// ===== 성능 관련 상수 =====
export const PERFORMANCE = {
  // Debounce 시간
  SEARCH_DEBOUNCE: 300,              // 검색 입력 debounce (ms)
  RESIZE_DEBOUNCE: 150,              // 리사이즈 debounce (ms)
  
  // 페이지네이션
  ITEMS_PER_PAGE: 20,                // 페이지당 아이템 수
  
  // 캐시
  CACHE_DURATION: 5 * 60 * 1000,     // 5분 (ms)
} as const;

// ===== 제한값 =====
export const LIMITS = {
  // 텍스트 길이
  NOTE_TITLE_MAX: 100,               // 노트 제목 최대 길이
  TAG_NAME_MAX: 50,                  // 태그 이름 최대 길이
  
  // 개수 제한
  MAX_TAGS_PER_NOTE: 10,             // 노트당 최대 태그 수
  MAX_NOTES_DISPLAY: 1000,           // 화면에 표시할 최대 노트 수
} as const;
