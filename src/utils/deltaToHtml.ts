/**
 * Quill Delta JSON을 HTML로 변환하는 유틸리티 함수
 * - 리치 텍스트 에디터의 Delta 형식을 HTML로 변환
 * - 노트 카드에서 서식이 적용된 텍스트 표시용
 */

// Delta Operation 인터페이스
// - Quill 에디터의 개별 텍스트 조작 단위
interface DeltaOp {
  insert: string; // 삽입할 텍스트 또는 객체
  attributes?: {
    // 텍스트 서식 속성들
    bold?: boolean; // 굵게
    italic?: boolean; // 기울임
    underline?: boolean; // 밑줄
    strike?: boolean; // 취소선
    color?: string; // 텍스트 색상
    background?: string; // 배경 색상
    list?: 'ordered' | 'bullet'; // 리스트 타입
    blockquote?: boolean; // 인용문
    'code-block'?: boolean; // 코드 블록
    link?: string; // 링크 URL
    image?: string; // 이미지 URL
    video?: string; // 비디오 URL
    formula?: string; // 수식
    header?: number; // 헤더 레벨
    align?: 'left' | 'center' | 'right' | 'justify'; // 정렬
    indent?: number; // 들여쓰기
    direction?: 'rtl'; // 텍스트 방향
    script?: 'sub' | 'super'; // 위첨자/아래첨자
    size?: string; // 폰트 크기
    font?: string; // 폰트 패밀리
  };
}

// Delta 인터페이스
// - Quill 에디터의 전체 문서 구조
interface Delta {
  ops: DeltaOp[]; // Delta Operation 배열
}

/**
 * Delta JSON 문자열을 HTML로 변환
 * @param deltaJson - Quill Delta JSON 문자열
 * @returns HTML 문자열
 */
export function deltaToHtml(deltaJson: string): string {
  try {
    const delta: Delta = JSON.parse(deltaJson);
    if (!delta.ops || !Array.isArray(delta.ops)) {
      return '';
    }

    let html = '';
    let inList = false;
    let listType: 'ordered' | 'bullet' | null = null;
    let listItems: string[] = [];

    for (let i = 0; i < delta.ops.length; i++) {
      const op = delta.ops[i];
      const nextOp = delta.ops[i + 1];
      
      // Early return: 문자열이 아닌 경우 임베드 처리
      if (typeof op.insert !== 'string') {
        if (!op.insert || typeof op.insert !== 'object') continue;
        
        const insertObj = op.insert as Record<string, string>;
        if (insertObj.image) {
          html += `<img src="${escapeHtml(insertObj.image)}" alt="Image" style="max-width: 100%; height: auto;">`;
        } else if (insertObj.video) {
          html += `<video controls style="max-width: 100%; height: auto;"><source src="${escapeHtml(insertObj.video)}" type="video/mp4"></video>`;
        } else if (insertObj.formula) {
          html += `<span class="formula">${escapeHtml(insertObj.formula)}</span>`;
        }
        continue;
      }

      const text = op.insert;
      const attributes = op.attributes || {};

      // 텍스트 서식 적용
      let formattedText = escapeHtml(text);

      // 인라인 서식 적용
      if (attributes.bold) formattedText = `<strong>${formattedText}</strong>`;
      if (attributes.italic) formattedText = `<em>${formattedText}</em>`;
      if (attributes.underline) formattedText = `<u>${formattedText}</u>`;
      if (attributes.strike) formattedText = `<s>${formattedText}</s>`;
      if (attributes.color) formattedText = `<span style="color: ${attributes.color}">${formattedText}</span>`;
      if (attributes.background) formattedText = `<span style="background-color: ${attributes.background}">${formattedText}</span>`;

      // 링크 처리
      if (attributes.link) {
        formattedText = `<a href="${escapeHtml(attributes.link)}" target="_blank" rel="noopener noreferrer">${formattedText}</a>`;
      }

      // Early return: 줄바꿈 처리
      if (text === '\n') {
        // 리스트 아이템 처리
        if (attributes.list) {
          if (listType !== attributes.list) {
            // 이전 리스트 종료
            if (inList && listItems.length > 0) {
              html += closeList(listType!, listItems);
              listItems = [];
            }
            listType = attributes.list;
            inList = true;
          }
          listItems.push('');
          continue;
        }
        
        // 일반 줄바꿈
        if (inList) {
          html += closeList(listType!, listItems);
          listItems = [];
          inList = false;
          listType = null;
        }
        html += '<br>';
        continue;
      }

      // 텍스트 추가 처리
      const isNextOpListItem = nextOp && 
        typeof nextOp.insert === 'string' && 
        nextOp.insert === '\n' && 
        nextOp.attributes?.list;

      if (isNextOpListItem && nextOp.attributes) {
        // 다음이 리스트 아이템인 경우
        const nextListType = nextOp.attributes.list;
        if (listType !== nextListType) {
          if (inList && listItems.length > 0) {
            html += closeList(listType!, listItems);
            listItems = [];
          }
          listType = nextListType || null;
          inList = true;
        }
        if (listItems.length === 0) listItems.push('');
        listItems[listItems.length - 1] += formattedText;
        continue;
      }

      // 일반 텍스트 추가
      if (inList && listType) {
        if (listItems.length === 0) listItems.push('');
        listItems[listItems.length - 1] += formattedText;
      } else {
        html += formattedText;
      }
    }

    // 마지막 리스트 종료
    if (inList && listType && listItems.length > 0) {
      const filteredItems = listItems.filter(item => item.trim() !== '');
      if (filteredItems.length > 0) {
        html += closeList(listType, filteredItems);
      }
    }

    return html;
  } catch (error) {
    console.error('Delta to HTML conversion failed:', error);
    return '';
  }
}

/**
 * 리스트를 HTML로 변환
 */
function closeList(listType: 'ordered' | 'bullet', items: string[]): string {
  const tag = listType === 'ordered' ? 'ol' : 'ul';
  const listItems = items.map(item => `<li>${item}</li>`).join('');
  return `<${tag}>${listItems}</${tag}>`;
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * HTML을 텍스트로 변환 (미리보기용)
 */
export function htmlToText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Delta JSON이 유효한지 확인
 */
export function isValidDelta(deltaJson: string): boolean {
  try {
    const delta = JSON.parse(deltaJson);
    return delta && typeof delta === 'object' && Array.isArray(delta.ops);
  } catch {
    return false;
  }
}

/**
 * 콘텐츠(HTML 또는 Delta JSON)를 검색용 일반 텍스트로 변환
 * @param content - 콘텐츠 문자열 (HTML 또는 Delta JSON)
 * @returns 콘텐츠의 일반 텍스트 표현
 */
export function contentToText(content: string): string {
  if (isValidDelta(content)) {
    const html = deltaToHtml(content);
    return htmlToText(html);
  }
  return htmlToText(content);
}
