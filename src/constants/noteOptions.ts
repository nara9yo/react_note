import type { Priority } from '../types';

// 우선순위 옵션
export const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: '낮음', color: '#10b981' },
  { value: 'medium', label: '보통', color: '#f59e0b' },
  { value: 'high', label: '높음', color: '#ef4444' },
];

// 배경색 옵션
export const BACKGROUND_COLORS: { value: string; label: string; preview: string }[] = [
  { value: '#ffffff', label: '흰색', preview: '#ffffff' },
  { value: '#fef3c7', label: '노란색', preview: '#fef3c7' },
  { value: '#dbeafe', label: '파란색', preview: '#dbeafe' },
  { value: '#dcfce7', label: '초록색', preview: '#dcfce7' },
  { value: '#fce7f3', label: '분홍색', preview: '#fce7f3' },
  { value: '#f3e8ff', label: '보라색', preview: '#f3e8ff' },
  { value: '#fef2f2', label: '빨간색', preview: '#fef2f2' },
  { value: '#fefce8', label: '연한 노란색', preview: '#fefce8' },
];

// 기본값
export const DEFAULT_NOTE_DATA = {
  tags: [],
  priority: 'medium' as Priority,
  backgroundColor: '#ffffff',
};
