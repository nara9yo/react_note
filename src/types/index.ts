// 우선순위 타입 정의
// - 노트의 중요도 레벨
export type Priority = 'low' | 'medium' | 'high';

// 정렬 관련 타입들
// - 노트 목록 정렬 옵션
export type PrioritySortOrder = 'low-to-high' | 'high-to-low'; // 우선순위 정렬 순서
export type DateSortOrder = 'created' | 'edited'; // 날짜 정렬 기준

// 정렬 옵션 인터페이스
export interface SortOptions {
  priority: PrioritySortOrder | null; // 우선순위 정렬 (null이면 정렬 안함)
  date: DateSortOrder; // 날짜 정렬 기준
}

// 태그 타입 정의
// - 노트 분류를 위한 태그 정보
export interface Tag {
  id: string; // 태그 고유 ID
  name: string; // 태그 이름
  color: string; // 태그 색상 (HEX 코드)
  usageCount?: number; // 사용 횟수 (태그 선택 시 표시용)
  createdAt?: string; // 생성 시간 (ISO 8601 형식)
  updatedAt?: string; // 수정 시간 (ISO 8601 형식)
}

// 노트 타입 정의
// - 메인 노트 데이터 구조
export interface Note {
  id: string; // 노트 고유 ID
  title: string; // 노트 제목
  content: string; // 노트 내용 (Delta JSON 형식)
  tags: Tag[]; // 연결된 태그들
  priority: Priority; // 우선순위
  backgroundColor: string; // 배경색 (HEX 코드)
  createdAt: string; // 생성 시간 (ISO 8601 형식)
  updatedAt: string; // 수정 시간 (ISO 8601 형식)
  archived?: boolean; // 보관함 상태
  deleted?: boolean; // 삭제 상태
  pinned?: boolean; // 고정 상태
}

// 새 노트 생성 시 사용하는 타입 (ID 제외)
// - Firebase에 새 노트 추가 시 사용
export interface CreateNoteData {
  title: string; // 노트 제목
  content: string; // 노트 내용 (Delta JSON)
  tags: Tag[]; // 연결할 태그들
  priority: Priority; // 우선순위
  backgroundColor: string; // 배경색
}

// 노트 수정 시 사용하는 타입
// - 기존 노트 업데이트 시 사용 (모든 필드 선택적)
export interface UpdateNoteData {
  id: string; // 수정할 노트 ID (필수)
  title?: string; // 제목 (선택적)
  content?: string; // 내용 (선택적)
  tags?: Tag[]; // 태그들 (선택적)
  priority?: Priority; // 우선순위 (선택적)
  backgroundColor?: string; // 배경색 (선택적)
  archived?: boolean; // 보관함 상태 (선택적)
  deleted?: boolean; // 삭제 상태 (선택적)
  pinned?: boolean; // 고정 상태 (선택적)
}

// API 응답 상태 타입
// - Redux에서 비동기 작업 상태 관리용
export type ApiStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// 노트 상태 인터페이스
// - Redux store의 notes 슬라이스 상태
export interface NotesState {
  notes: Note[]; // 노트 목록
  status: ApiStatus; // 현재 API 상태
  error: string | null; // 에러 메시지
}
