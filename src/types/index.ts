// 우선순위 타입
export type Priority = 'low' | 'medium' | 'high';

// 태그 타입
export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount?: number; // 사용 횟수 (태그 선택 시 표시용)
}

// Note 타입 정의
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  priority: Priority;
  backgroundColor: string;
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
  archived?: boolean; // Archive 상태
  deleted?: boolean; // 삭제 상태
  pinned?: boolean; // 고정 상태
}

// 새 노트 생성 시 사용하는 타입 (ID 제외)
export interface CreateNoteData {
  title: string;
  content: string;
  tags: Tag[];
  priority: Priority;
  backgroundColor: string;
}

// 노트 수정 시 사용하는 타입
export interface UpdateNoteData {
  id: string;
  title?: string;
  content?: string;
  tags?: Tag[];
  priority?: Priority;
  backgroundColor?: string;
  archived?: boolean;
  deleted?: boolean;
  pinned?: boolean;
}

// API 응답 상태
export type ApiStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// 노트 상태 인터페이스
export interface NotesState {
  notes: Note[];
  status: ApiStatus;
  error: string | null;
}
