import React, { useEffect, useMemo, useRef } from 'react';
import type QuillType from 'quill';
import { TIMING } from '../constants/uiConstants';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onDeltaChange?: (deltaJson: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    backgroundColor?: string;
    id?: string;
    name?: string;
    ariaLabelledBy?: string;
    initialDelta?: string; // JSON string of Quill Delta
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    readOnly = false,
    placeholder,
    backgroundColor,
    id = 'content',
    name = 'content',
    ariaLabelledBy,
    onDeltaChange,
    initialDelta,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<QuillType | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const onChangeRef = useRef(onChange);
    const onDeltaChangeRef = useRef(onDeltaChange);
    const initialDeltaRef = useRef(initialDelta);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onDeltaChangeRef.current = onDeltaChange; }, [onDeltaChange]);

    const toolbar = useMemo(
        () => [
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            ['image', 'blockquote', 'code-block'],
        ],
        []
    );

    useEffect(() => {
        let mounted = true;
        const hostContainer = containerRef.current;
        (async () => {
            const [{ default: Quill }] = await Promise.all([
                import('quill'),
                import('quill/dist/quill.snow.css'),
            ]);

            if (!mounted || !hostContainer) return;

            // Create editor wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'ql-container ql-snow';
            const editorEl = document.createElement('div');
            editorEl.className = 'ql-editor';
            editorEl.id = id;
            editorEl.setAttribute('name', name);
            editorEl.setAttribute('role', 'textbox');
            editorEl.setAttribute('aria-multiline', 'true');
            if (ariaLabelledBy) editorEl.setAttribute('aria-labelledby', ariaLabelledBy);
            wrapper.appendChild(editorEl);
            hostContainer.appendChild(wrapper);
            editorRef.current = editorEl;

            // Initialize Quill
            const quill = new Quill(wrapper, {
                theme: 'snow',
                readOnly,
                placeholder,
                modules: { toolbar },
            });
            quillRef.current = quill;

            // Set initial content
            try {
                if (initialDeltaRef.current) {
                    const delta = JSON.parse(initialDeltaRef.current);
                    quill.setContents(delta);
                } else {
                    quill.clipboard.dangerouslyPasteHTML(value || '');
                }
            } catch {
                quill.clipboard.dangerouslyPasteHTML(value || '');
            }

            // Listen content changes
            quill.on('text-change', () => {
                if (!editorRef.current) return;
                const html = editorRef.current.innerHTML;
                if (onChangeRef.current) onChangeRef.current(html);
                // keep hidden input (id/name="content") synced for submit fallback
                const hidden = document.getElementById('content') as HTMLInputElement | null;
                if (hidden && hidden.value !== html) hidden.value = html;
                if (onDeltaChangeRef.current) {
                    try {
                        const delta = quill.getContents();
                        onDeltaChangeRef.current(JSON.stringify(delta));
                    } catch {
                        // ignore delta serialization errors
                    }
                }
            });

            // emit initial delta once after init
            try {
                if (onDeltaChangeRef.current) {
                    const delta = quill.getContents();
                    onDeltaChangeRef.current(JSON.stringify(delta));
                }
            } catch {/* noop */ }

            // Add id/name for selects and inputs created by Quill toolbar
            const root = hostContainer as HTMLDivElement | null;
            const addA11yAttributes = () => {
                if (!root) return;
                let idx = 0;
                root.querySelectorAll('select:not([name])').forEach((el) => {
                    idx += 1;
                    el.setAttribute('name', `ql-select-${idx}`);
                    if (!el.getAttribute('id')) el.setAttribute('id', `ql-select-${idx}`);
                });
                root.querySelectorAll('input[type="file"]:not([name])').forEach((el, i) => {
                    el.setAttribute('name', `ql-image-${i + 1}`);
                    if (!el.getAttribute('id')) el.setAttribute('id', `ql-image-${i + 1}`);
                });
                // Quill tooltip inputs (link / video / formula)
                root.querySelectorAll('.ql-tooltip input:not([name])').forEach((el, i) => {
                    const input = el as HTMLInputElement;
                    let base = 'ql-input';
                    if (input.dataset.link !== undefined) base = 'ql-link';
                    if (input.dataset.video !== undefined) base = 'ql-video';
                    if (input.dataset.formula !== undefined) base = 'ql-formula';
                    const id = `${base}-${i + 1}`;
                    input.setAttribute('name', id);
                    if (!input.getAttribute('id')) input.setAttribute('id', id);
                    // also provide autocomplete hints off by default
                    if (!input.getAttribute('autocomplete')) input.setAttribute('autocomplete', 'off');
                });
            };
            // run once and observe future mutations
            setTimeout(addA11yAttributes, TIMING.IMMEDIATE);
            const observer = new MutationObserver(addA11yAttributes);
            if (root) observer.observe(root, { childList: true, subtree: true });
            observerRef.current = observer;
        })();

        return () => {
            mounted = false;
            const container = hostContainer as HTMLDivElement | null;
            if (container) container.innerHTML = '';
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            quillRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholder, readOnly, toolbar, id, name, ariaLabelledBy]);

    // Sync external value to editor
    useEffect(() => {
        const quill = quillRef.current;

        // Early return: Quill이나 에디터 요소가 없는 경우
        if (!quill || !editorRef.current) return;

        // Early return: 에디터가 포커스 중인 경우
        if (quill.hasFocus()) return;

        try {
            if (initialDelta) {
                const delta = JSON.parse(initialDelta);
                quill.setContents(delta);
                return;
            }

            if (value) {
                const currentHtml = editorRef.current.innerHTML;
                if (value !== currentHtml) {
                    quill.clipboard.dangerouslyPasteHTML(value);
                }
            }
        } catch {
            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }
        }
    }, [value, initialDelta]);

    return (
        <div
            ref={containerRef}
            className="quill-wrapper w-full"
            style={{
                backgroundColor: backgroundColor || undefined,
                borderRadius: 'inherit',
                overflow: 'hidden',
                width: '100%',
                height: '100%',
            }}
        />
    );
};

export default RichTextEditor;


