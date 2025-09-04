/**
 * Quill Delta JSON을 HTML로 변환하는 유틸리티 함수
 */

interface DeltaOp {
  insert: string;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    background?: string;
    list?: 'ordered' | 'bullet';
    blockquote?: boolean;
    'code-block'?: boolean;
    link?: string;
    image?: string;
    video?: string;
    formula?: string;
    header?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
    indent?: number;
    direction?: 'rtl';
    script?: 'sub' | 'super';
    size?: string;
    font?: string;
  };
}

interface Delta {
  ops: DeltaOp[];
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
      
      if (typeof op.insert === 'string') {
        const text = op.insert;
        const attributes = op.attributes || {};

        // 텍스트 서식 적용
        let formattedText = escapeHtml(text);

        // 인라인 서식
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

        // 줄바꿈 처리
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
          } else {
            // 일반 줄바꿈
            if (inList) {
              // 리스트 종료
              html += closeList(listType!, listItems);
              listItems = [];
              inList = false;
              listType = null;
            }
            html += '<br>';
            continue;
          }
        }

        // 다음 operation이 리스트 줄바꿈인지 확인
        if (nextOp && typeof nextOp.insert === 'string' && nextOp.insert === '\n' && nextOp.attributes?.list) {
          // 다음이 리스트 아이템이면 현재 텍스트도 리스트 아이템으로 처리
          if (listType !== nextOp.attributes.list) {
            // 이전 리스트 종료
            if (inList && listItems.length > 0) {
              html += closeList(listType!, listItems);
              listItems = [];
            }
            listType = nextOp.attributes.list;
            inList = true;
          }
          if (listItems.length === 0) listItems.push('');
          listItems[listItems.length - 1] += formattedText;
        } else {
          // 리스트 아이템에 텍스트 추가
          if (inList && listType) {
            if (listItems.length === 0) listItems.push('');
            listItems[listItems.length - 1] += formattedText;
          } else {
            html += formattedText;
          }
        }
      } else if (op.insert && typeof op.insert === 'object') {
        // 이미지, 비디오 등 임베드 처리
        const insertObj = op.insert as Record<string, string>;
        if (insertObj.image) {
          html += `<img src="${escapeHtml(insertObj.image)}" alt="Image" style="max-width: 100%; height: auto;">`;
        } else if (insertObj.video) {
          html += `<video controls style="max-width: 100%; height: auto;"><source src="${escapeHtml(insertObj.video)}" type="video/mp4"></video>`;
        } else if (insertObj.formula) {
          html += `<span class="formula">${escapeHtml(insertObj.formula)}</span>`;
        }
      }
    }

    // 마지막 리스트 종료 (빈 아이템 제거)
    if (inList && listType && listItems.length > 0) {
      // 빈 아이템 제거
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
