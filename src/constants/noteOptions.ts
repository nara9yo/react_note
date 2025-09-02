import type { Priority } from '../types';
import i18n from '../i18n';

// 우선순위 옵션 (i18n 함수)
export const getPriorityOptions = (): { value: Priority; label: string; color: string }[] => [
  { value: 'low', label: i18n.t('priority.low'), color: 'var(--color-priority-low)' },
  { value: 'medium', label: i18n.t('priority.medium'), color: 'var(--color-priority-medium)' },
  { value: 'high', label: i18n.t('priority.high'), color: 'var(--color-priority-high)' },
];

// 배경색 옵션 (i18n 함수)
export const getBackgroundColors = (): { value: string; label: string; preview: string }[] => [
  { value: '#ffffff', label: i18n.t('color.white'), preview: '#ffffff' },
  { value: '#fef3c7', label: i18n.t('color.yellow'), preview: '#fef3c7' },
  { value: '#dbeafe', label: i18n.t('color.blue'), preview: '#dbeafe' },
  { value: '#dcfce7', label: i18n.t('color.green'), preview: '#dcfce7' },
  { value: '#fce7f3', label: i18n.t('color.pink'), preview: '#fce7f3' },
  { value: '#f3e8ff', label: i18n.t('color.purple'), preview: '#f3e8ff' },
  { value: '#fef2f2', label: i18n.t('color.red'), preview: '#fef2f2' },
  { value: '#fefce8', label: i18n.t('color.lightYellow'), preview: '#fefce8' },
];

// 하위 호환성을 위한 상수 (기존 코드에서 사용 중인 경우)
export const PRIORITY_OPTIONS = getPriorityOptions();
export const BACKGROUND_COLORS = getBackgroundColors();

// 기본값
export const DEFAULT_NOTE_DATA = {
  tags: [],
  priority: 'medium' as Priority,
  backgroundColor: '#ffffff',
};
