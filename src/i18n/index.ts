// 다국어 지원 라이브러리 import
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 한국어 번역 리소스
// - 앱의 모든 UI 텍스트를 한국어로 번역
const ko = {
  translation: {
    // 메뉴 및 네비게이션
    'menu.newNote': '새 노트 작성',
    'menu.viewNote': '노트 보기',
    'menu.editNote': '노트 수정',
    'menu.notes': '노트',
    'menu.archive': '보관함',
    'menu.trash': '휴지통',
    'menu.search': '검색',
    'menu.tags': '태그',
    'menu.tagManagement': '태그 관리',
    'menu.sort': '정렬',
    'menu.settings': '설정',

    // 버튼 및 액션
    'button.save': '저장',
    'button.edit': '편집',
    'button.delete': '삭제',
    'button.archive': '보관',
    'button.restore': '복원',
    'button.cancel': '취소',
    'button.confirm': '확인',
    'button.close': '닫기',
    'button.select': '선택',
    'button.deselect': '선택 해제',
    'button.selectAll': '전체 선택',
    'button.clearSelection': '선택 해제',

    // 메시지 및 알림
    'message.noteSaved': '노트가 저장되었습니다',
    'message.noteDeleted': '노트가 삭제되었습니다',
    'message.noteArchived': '노트가 보관되었습니다',
    'message.noteRestored': '노트가 복원되었습니다',
    'message.deleteConfirm': '정말로 삭제하시겠습니까?',
    'message.archiveConfirm': '이 노트를 Archive하시겠습니까?',
    'message.unarchiveConfirm': '이 노트의 Archive를 해제하시겠습니까?',
    'message.pinConfirm': '이 노트를 고정하시겠습니까?',
    'message.unpinConfirm': '이 노트의 고정을 해제하시겠습니까?',
    'message.restoreConfirm': '이 노트를 복원하시겠습니까?',
    'message.permanentDeleteConfirm': '정말로 이 노트를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    'message.moveToTrash': '이 노트를 휴지통으로 이동하시겠습니까?',
    'message.saveFailed': '저장에 실패했습니다',
    'message.loading': '로딩 중...',
    'message.noNotes': '노트가 없습니다',
    'message.noSearchResults': '검색 결과가 없습니다',
    'message.untagged': '태그 없음',

    // 상태 및 라벨
    'label.title': '제목',
    'label.content': '내용',
    'label.priority': '우선순위',
    'label.backgroundColor': '배경색',
    'label.tags': '태그',
    'label.createdAt': '생성일',
    'label.updatedAt': '수정일',
    'label.priority.low': '낮음',
    'label.priority.medium': '보통',
    'label.priority.high': '높음',

    // 모달 제목
    'modal.title.newNote': '새 노트 작성',
    'modal.title.viewNote': '노트 보기',
    'modal.title.editNote': '노트 수정',
    'modal.title.viewNoteTrash': '노트 보기 (휴지통)',
    'modal.title.deleteNote': '노트 삭제',
    'modal.title.archiveNote': '노트 보관',
    'modal.title.restoreNote': '노트 복원',
    'modal.title.permanentDelete': '완전 삭제',
    'modal.title.moveToTrash': '휴지통으로 이동',
    'modal.title.tagManagement': '태그 관리',
    'modal.title.sortOptions': '정렬 옵션',

    // 에러 메시지
    'error.saveFailed': '저장 실패',
    'error.deleteFailed': '노트 삭제 실패',
    'error.permanentDeleteFailed': '노트 완전 삭제 실패',
    'error.archiveFailed': '노트 Archive 상태 변경 실패',
    'error.restoreFailed': '노트 복원 실패',
    'error.pinFailed': '노트 고정 상태 변경 실패',
    'error.dateFormatFailed': '날짜 포맷팅 오류',
    'error.timeFormatFailed': '시간 포맷팅 오류',
    'error.loadFailed': '로딩 실패',
    'error.retryMessage': '다시 시도해주세요',
    'error.sortOptionLoadFailed': '저장된 정렬 옵션 불러오기 실패',
    'error.sortOptionSaveFailed': '정렬 옵션 저장 실패',
    'error.noteRestoreFailed': '노트 복구 실패',
    'error.noteTrashMoveFailed': '노트 Trash 이동 실패',
    'error.noteUnarchiveFailed': '노트 Archive 해제 실패',
    'error.noteArchiveFailed': '노트 보관 실패',
    'error.noteCreateFailed': '노트 생성 실패',
    'error.noteUpdateFailed': '노트 수정 실패',
    'error.tagLoadFailed': '태그 로드 실패',
    'error.tagAddFailed': '새 태그 추가 실패',
    'error.tagUpdateFailed': '태그 업데이트 실패',
    'error.tagDeleteFailed': '태그 삭제 실패',
    'error.tagInitFailed': '태그 초기화 실패',
    'error.firebaseProjectIdMissing': 'Firebase Project ID가 설정되지 않았습니다. 환경 변수를 확인해주세요.',
    'error.tagUsageUpdateFailed': '태그 사용량 업데이트 중 오류 발생',
    
    'error.fetchNotesFailed': '노트 불러오기 실패',
    'error.noteNotFound': '노트를 찾을 수 없습니다.',

    // 모달 제목 및 메시지
    'modal.title.restoreNotes': '노트 복구',
    'modal.title.permanentDeleteNotes': '완전 삭제',
    'modal.title.moveToTrashNotes': 'Trash로 이동',
    'modal.title.unarchiveNotes': 'Archive 해제',
    'modal.title.archiveNotes': '노트 보관',
    'modal.title.deleteNotes': '노트 삭제',
    'modal.title.restoreFailed': '복구 실패',
    'modal.title.deleteFailed': '삭제 실패',
    'modal.title.moveFailed': '이동 실패',
    'modal.title.unarchiveFailed': 'Archive 해제 실패',
    'modal.title.archiveFailed': '보관 실패',
    'modal.title.createFailed': '생성 실패',
    'modal.title.updateFailed': '수정 실패',
    'modal.title.tagAddFailed': '태그 추가 실패',
    'modal.title.duplicateTag': '중복 태그',
    'modal.title.tagEdit': '태그 수정',
    'modal.title.editFailed': '수정 실패',
    'modal.title.tagDeleteBlocked': '태그 삭제 불가',
    'modal.title.tagDelete': '태그 삭제',
    'message.restoreNotesConfirm': '선택된 {{count}}개의 노트를 복구하시겠습니까?',
    'message.permanentDeleteNotesConfirm': '선택된 {{count}}개의 노트를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    'message.moveToTrashNotesConfirm': '선택된 {{count}}개의 노트를 Trash로 이동하시겠습니까?',
    'message.unarchiveNotesConfirm': '선택된 {{count}}개의 노트를 Archive 해제하시겠습니까?',
    'message.archiveNotesConfirm': '선택된 {{count}}개의 노트를 보관하시겠습니까?',
    'message.deleteNotesConfirm': '선택된 {{count}}개의 노트를 삭제하시겠습니까? 삭제된 노트는 Trash로 이동됩니다.',
    'message.restoreFailed': '노트 복구에 실패했습니다. 다시 시도해주세요.',
    'message.deleteFailed': '노트 삭제에 실패했습니다. 다시 시도해주세요.',
    'message.moveFailed': '노트 Trash 이동에 실패했습니다. 다시 시도해주세요.',
    'message.unarchiveFailed': '노트 Archive 해제에 실패했습니다. 다시 시도해주세요.',
    'message.archiveFailed': '노트 보관에 실패했습니다. 다시 시도해주세요.',
    'message.createFailed': '노트 생성에 실패했습니다. 다시 시도해주세요.',
    'message.updateFailed': '노트 수정에 실패했습니다. 다시 시도해주세요.',
    'message.tagAddFailed': '새 태그 추가에 실패했습니다. 다시 시도해주세요.',
    'message.duplicateTag': '{{tagName}} 태그는 이미 존재합니다.',
    'message.tagEditConfirm': '태그 "{{oldName}}"을 "{{newName}}"으로 수정하시겠습니까?',
    'message.tagUpdateFailed': '태그 업데이트에 실패했습니다. 다시 시도해주세요.',
    'message.tagDeleteBlocked': '이 태그는 {{count}}개의 활성 노트에서 사용 중입니다. 먼저 노트에서 태그를 제거해주세요.',
    'message.tagDeleteConfirm': '태그 "{{tagName}}"을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    'message.tagDeleteFailed': '태그 삭제에 실패했습니다. 다시 시도해주세요.',
    'message.loadingNotes': '노트를 불러오는 중...',
    'message.loadNotesFailed': '노트를 불러오는데 실패했습니다.',
    'message.noteNotFound': '노트를 찾을 수 없습니다.',
    'button.retry': '다시 시도',
    'button.restoreWithCount': '복구 ({{count}})',
    'button.deleteWithCount': '삭제 ({{count}})',
    'button.unarchiveWithCount': 'Archive 해제 ({{count}})',
    'button.moveToTrashWithCount': 'Trash로 이동 ({{count}})',
    'button.archiveWithCount': '보관 ({{count}})',

    // 접근성 라벨
    'aria.closeSidebar': '사이드바 닫기',
    'aria.clearSearch': '검색어 지우기',
    'aria.toggleSidebar': '사이드바 토글',

    // 태그 모달
    'tag.title.select': '태그 선택',
    'tag.title.manage': '태그 관리',
    'tag.search.placeholder': '태그 이름으로 검색',
    'tag.add.new': '새 태그 추가',
    'tag.add.namePlaceholder': '새 태그 이름 입력',
    'tag.add.color': '색상',
    'tag.add.colorTitle': '태그 색상 선택',
    'tag.add.button': '추가',
    'tag.add.buttonTitle': '추가',
    'tag.available.select': '사용 가능한 태그',
    'tag.available.manage': '기존 태그 관리',
    'tag.loading': '태그를 불러오는 중...',
    'tag.empty': '사용 가능한 태그가 없습니다.',
    'tag.edit.colorTitle': '태그 색상 변경',
    'tag.edit.save': '저장',
    'tag.edit.saveTitle': '저장',
    'tag.edit.cancel': '취소',
    'tag.edit.cancelTitle': '취소',
    'tag.edit.edit': '편집',
    'tag.edit.editTitle': '편집',
    'tag.edit.delete': '삭제',
    'tag.edit.deleteTitle': '삭제',
    'tag.selected.title': '선택된 태그',
    'tag.done': '완료',

    // 태그 로드/경고
    'message.loadTagsFailed': '태그를 불러오는데 실패했습니다.',
    'warn.bloomFilterSkip': 'BloomFilter 오류 발생 - 태그 사용량 업데이트 건너뜀',

    // 정렬 옵션
    'sort.priority': '우선순위',
    'sort.date': '날짜',
    'sort.priority.lowToHigh': '낮음 → 높음',
    'sort.priority.highToLow': '높음 → 낮음',
    'sort.date.created': '생성일',
    'sort.date.edited': '수정일',

    // 검색
    'search.placeholder': '노트 검색...',
    'search.noResults': '검색 결과가 없습니다',

    // Placeholder
    'placeholder.title': '노트 제목을 입력하세요',
    'placeholder.content': '노트 내용을 입력하세요',

    // 시간 표현 (timeago.js와 연동)
    'time.ago': '전',
    'time.justNow': '방금 전',
    'time.minutesAgo': '분 전',
    'time.hoursAgo': '시간 전',
    'time.daysAgo': '일 전',
    'time.weeksAgo': '주 전',
    'time.monthsAgo': '개월 전',
    'time.yearsAgo': '년 전',

    // 우선순위 옵션
    'priority.low': '낮음',
    'priority.medium': '보통',
    'priority.high': '높음',

    // 배경색 옵션
    'color.white': '흰색',
    'color.yellow': '노란색',
    'color.blue': '파란색',
    'color.green': '초록색',
    'color.pink': '분홍색',
    'color.purple': '보라색',
    'color.red': '빨간색',
    'color.lightYellow': '연한 노란색'
  }
};

// 영어 번역
const en = {
  translation: {
    // 메뉴 및 네비게이션
    'menu.newNote': 'New Note',
    'menu.viewNote': 'View Note',
    'menu.editNote': 'Edit Note',
    'menu.notes': 'Notes',
    'menu.archive': 'Archive',
    'menu.trash': 'Trash',
    'menu.search': 'Search',
    'menu.tags': 'Tags',
    'menu.tagManagement': 'Tag Management',
    'menu.sort': 'Sort',
    'menu.settings': 'Settings',

    // 버튼 및 액션
    'button.save': 'Save',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'button.archive': 'Archive',
    'button.restore': 'Restore',
    'button.cancel': 'Cancel',
    'button.confirm': 'Confirm',
    'button.close': 'Close',
    'button.select': 'Select',
    'button.deselect': 'Deselect',
    'button.selectAll': 'Select All',
    'button.clearSelection': 'Clear Selection',

    // 메시지 및 알림
    'message.noteSaved': 'Note saved successfully',
    'message.noteDeleted': 'Note deleted successfully',
    'message.noteArchived': 'Note archived successfully',
    'message.noteRestored': 'Note restored successfully',
    'message.deleteConfirm': 'Are you sure you want to delete this note?',
    'message.archiveConfirm': 'Do you want to archive this note?',
    'message.unarchiveConfirm': 'Do you want to unarchive this note?',
    'message.pinConfirm': 'Do you want to pin this note?',
    'message.unpinConfirm': 'Do you want to unpin this note?',
    'message.restoreConfirm': 'Do you want to restore this note?',
    'message.permanentDeleteConfirm': 'Are you sure you want to permanently delete this note? This action cannot be undone.',
    'message.moveToTrash': 'Do you want to move this note to trash?',
    'message.saveFailed': 'Failed to save note',
    'message.loading': 'Loading...',

    // 에러 메시지
    'error.saveFailed': 'Save failed',
    'error.deleteFailed': 'Note deletion failed',
    'error.permanentDeleteFailed': 'Note permanent deletion failed',
    'error.archiveFailed': 'Note archive status change failed',
    'error.restoreFailed': 'Note restoration failed',
    'error.pinFailed': 'Note pin status change failed',
    'error.dateFormatFailed': 'Date formatting error',
    'error.timeFormatFailed': 'Time formatting error',
    'error.loadFailed': 'Loading failed',
    'error.retryMessage': 'Please try again',
    'error.sortOptionLoadFailed': 'Failed to load saved sort options',
    'error.sortOptionSaveFailed': 'Failed to save sort options',
    'error.noteRestoreFailed': 'Failed to restore note',
    'error.noteTrashMoveFailed': 'Failed to move note to trash',
    'error.noteUnarchiveFailed': 'Failed to unarchive note',
    'error.noteArchiveFailed': 'Failed to archive note',
    'error.noteCreateFailed': 'Failed to create note',
    'error.noteUpdateFailed': 'Failed to update note',
    'error.tagLoadFailed': 'Failed to load tags',
    'error.tagAddFailed': 'Failed to add new tag',
    'error.tagUpdateFailed': 'Failed to update tag',
    'error.tagDeleteFailed': 'Failed to delete tag',
    'error.tagInitFailed': 'Failed to initialize tags',
    'error.firebaseProjectIdMissing': 'Firebase Project ID is not set. Please check environment variables.',
    'error.tagUsageUpdateFailed': 'An error occurred while updating tag usage',
    'error.fetchNotesFailed': 'Failed to fetch notes',
    'error.noteNotFound': 'Note not found',

    // 모달 제목 및 메시지
    'modal.title.restoreNotes': 'Restore Notes',
    'modal.title.permanentDeleteNotes': 'Permanent Delete',
    'modal.title.moveToTrashNotes': 'Move to Trash',
    'modal.title.unarchiveNotes': 'Unarchive',
    'modal.title.archiveNotes': 'Archive Notes',
    'modal.title.deleteNotes': 'Delete Notes',
    'modal.title.restoreFailed': 'Restore Failed',
    'modal.title.deleteFailed': 'Delete Failed',
    'modal.title.moveFailed': 'Move Failed',
    'modal.title.unarchiveFailed': 'Unarchive Failed',
    'modal.title.archiveFailed': 'Archive Failed',
    'modal.title.createFailed': 'Create Failed',
    'modal.title.updateFailed': 'Update Failed',
    'modal.title.tagAddFailed': 'Tag Add Failed',
    'modal.title.duplicateTag': 'Duplicate Tag',
    'modal.title.tagEdit': 'Edit Tag',
    'modal.title.editFailed': 'Edit Failed',
    'modal.title.tagDeleteBlocked': 'Tag Delete Blocked',
    'modal.title.tagDelete': 'Delete Tag',
    'message.restoreNotesConfirm': 'Do you want to restore {{count}} selected notes?',
    'message.permanentDeleteNotesConfirm': 'Do you want to permanently delete {{count}} selected notes? This action cannot be undone.',
    'message.moveToTrashNotesConfirm': 'Do you want to move {{count}} selected notes to trash?',
    'message.unarchiveNotesConfirm': 'Do you want to unarchive {{count}} selected notes?',
    'message.archiveNotesConfirm': 'Do you want to archive {{count}} selected notes?',
    'message.deleteNotesConfirm': 'Do you want to delete {{count}} selected notes? Deleted notes will be moved to trash.',
    'message.restoreFailed': 'Failed to restore notes. Please try again.',
    'message.deleteFailed': 'Failed to delete notes. Please try again.',
    'message.moveFailed': 'Failed to move notes to trash. Please try again.',
    'message.unarchiveFailed': 'Failed to unarchive notes. Please try again.',
    'message.archiveFailed': 'Failed to archive notes. Please try again.',
    'message.createFailed': 'Failed to create note. Please try again.',
    'message.updateFailed': 'Failed to update note. Please try again.',
    'message.tagAddFailed': 'Failed to add new tag. Please try again.',
    'message.duplicateTag': 'Tag "{{tagName}}" already exists.',
    'message.tagEditConfirm': 'Do you want to change tag "{{oldName}}" to "{{newName}}"?',
    'message.tagUpdateFailed': 'Failed to update tag. Please try again.',
    'message.tagDeleteBlocked': 'This tag is used in {{count}} active notes. Please remove the tag from notes first.',
    'message.tagDeleteConfirm': 'Do you want to delete tag "{{tagName}}"? This action cannot be undone.',
    'message.tagDeleteFailed': 'Failed to delete tag. Please try again.',
    'message.loadingNotes': 'Loading notes...',
    'message.loadNotesFailed': 'Failed to load notes.',
    'message.noteNotFound': 'Note not found.',
    'button.retry': 'Retry',
    'button.restoreWithCount': 'Restore ({{count}})',
    'button.deleteWithCount': 'Delete ({{count}})',
    'button.unarchiveWithCount': 'Unarchive ({{count}})',
    'button.moveToTrashWithCount': 'Move to Trash ({{count}})',
    'button.archiveWithCount': 'Archive ({{count}})',

    // 접근성 라벨
    'aria.closeSidebar': 'Close sidebar',
    'aria.clearSearch': 'Clear search',
    'aria.toggleSidebar': 'Toggle sidebar',

    // 태그 모달
    'tag.title.select': 'Select Tags',
    'tag.title.manage': 'Manage Tags',
    'tag.search.placeholder': 'Search by tag name',
    'tag.add.new': 'Add New Tag',
    'tag.add.namePlaceholder': 'Enter new tag name',
    'tag.add.color': 'Color',
    'tag.add.colorTitle': 'Select tag color',
    'tag.add.button': 'Add',
    'tag.add.buttonTitle': 'Add',
    'tag.available.select': 'Available Tags',
    'tag.available.manage': 'Manage Existing Tags',
    'tag.loading': 'Loading tags...',
    'tag.empty': 'No available tags.',
    'tag.edit.colorTitle': 'Change tag color',
    'tag.edit.save': 'Save',
    'tag.edit.saveTitle': 'Save',
    'tag.edit.cancel': 'Cancel',
    'tag.edit.cancelTitle': 'Cancel',
    'tag.edit.edit': 'Edit',
    'tag.edit.editTitle': 'Edit',
    'tag.edit.delete': 'Delete',
    'tag.edit.deleteTitle': 'Delete',
    'tag.selected.title': 'Selected Tags',
    'tag.done': 'Done',

    // 태그 로드/경고
    'message.loadTagsFailed': 'Failed to load tags.',
    'warn.bloomFilterSkip': 'BloomFilter error occurred - skipping tag usage update',

    'message.noNotes': 'No notes found',
    'message.noSearchResults': 'No search results found',
    'message.untagged': 'Untagged',

    // 상태 및 라벨
    'label.title': 'Title',
    'label.content': 'Content',
    'label.priority': 'Priority',
    'label.backgroundColor': 'Background Color',
    'label.tags': 'Tags',
    'label.createdAt': 'Created',
    'label.updatedAt': 'Updated',
    'label.priority.low': 'Low',
    'label.priority.medium': 'Medium',
    'label.priority.high': 'High',

    // 모달 제목
    'modal.title.newNote': 'New Note',
    'modal.title.viewNote': 'View Note',
    'modal.title.editNote': 'Edit Note',
    'modal.title.viewNoteTrash': 'View Note (Trash)',
    'modal.title.deleteNote': 'Delete Note',
    'modal.title.archiveNote': 'Archive Note',
    'modal.title.restoreNote': 'Restore Note',
    'modal.title.permanentDelete': 'Permanent Delete',
    'modal.title.moveToTrash': 'Move to Trash',
    'modal.title.tagManagement': 'Tag Management',
    'modal.title.sortOptions': 'Sort Options',

    // 정렬 옵션
    'sort.priority': 'Priority',
    'sort.date': 'Date',
    'sort.priority.lowToHigh': 'Low to High',
    'sort.priority.highToLow': 'High to Low',
    'sort.date.created': 'Created Date',
    'sort.date.edited': 'Edited Date',

    // 검색
    'search.placeholder': 'Search notes...',
    'search.noResults': 'No search results found',

    // Placeholder
    'placeholder.title': 'Enter note title',
    'placeholder.content': 'Enter note content',

    // 시간 표현 (timeago.js와 연동)
    'time.ago': 'ago',
    'time.justNow': 'just now',
    'time.minutesAgo': 'minutes ago',
    'time.hoursAgo': 'hours ago',
    'time.daysAgo': 'days ago',
    'time.weeksAgo': 'weeks ago',
    'time.monthsAgo': 'months ago',
    'time.yearsAgo': 'years ago',

    // 우선순위 옵션
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',

    // 배경색 옵션
    'color.white': 'White',
    'color.yellow': 'Yellow',
    'color.blue': 'Blue',
    'color.green': 'Green',
    'color.pink': 'Pink',
    'color.purple': 'Purple',
    'color.red': 'Red',
    'color.lightYellow': 'Light Yellow'
  }
};

// i18next 초기화 설정
// - 언어 감지, React 통합, 번역 리소스 설정
i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React 컴포넌트 통합
  .init({
    resources: {
      ko, // 한국어 번역 리소스
      en  // 영어 번역 리소스
    },
    fallbackLng: 'ko', // 기본 언어 (한국어)
    // 개발 환경에서 디버그 모드 활성화
    debug: process.env.NODE_ENV === 'development',

    // HTML 이스케이프 비활성화 (React에서 자동 처리)
    interpolation: {
      escapeValue: false
    },

    // 언어 감지 설정
    detection: {
      order: ['localStorage', 'navigator'], // localStorage 우선, 그 다음 브라우저 언어
      caches: ['localStorage'] // 선택한 언어를 localStorage에 저장
    }
  });

export default i18n;
