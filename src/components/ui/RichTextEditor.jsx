import { useId, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styles from './RichTextEditor.module.css';

const RichTextEditor = ({
    label,
    id,
    className = '',
    error,
    helperText,
    value = '',
    onChange,
    placeholder = '',
}) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        // Initialize Quill once
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: placeholder || 'Write something...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link'],
                    ['clean']
                ]
            }
        });

        quillRef.current = quill;

        // Function to fix accessibility issues in toolbar elements
        const fixToolbarAccessibility = () => {
            const toolbar = editorRef.current?.previousSibling;
            if (toolbar?.classList.contains('ql-toolbar')) {
                // Fix select elements
                const selects = toolbar.querySelectorAll('select');
                selects.forEach((select, index) => {
                    if (!select.id) {
                        select.id = `${inputId}-toolbar-select-${index}`;
                    }
                    if (!select.name) {
                        select.name = select.className.replace('ql-', '');
                    }
                    select.setAttribute('autocomplete', 'off');
                    select.setAttribute('aria-label', select.className.replace('ql-', '').replace('-', ' '));
                });

                // Fix input elements in toolbar
                const inputs = toolbar.querySelectorAll('input[type="text"]');
                inputs.forEach((input, index) => {
                    if (!input.id) {
                        input.id = `${inputId}-toolbar-input-${index}`;
                    }
                    if (!input.name) {
                        input.name = `toolbar-input-${index}`;
                    }
                    input.setAttribute('autocomplete', 'off');
                    if (!input.getAttribute('aria-label')) {
                        input.setAttribute('aria-label', 'Link URL');
                    }
                });
            }

            // Fix tooltip inputs (for links, videos, etc.)
            const tooltips = document.querySelectorAll('.ql-tooltip input[type="text"]');
            tooltips.forEach((input, index) => {
                if (!input.id) {
                    input.id = `${inputId}-tooltip-input-${index}`;
                }
                if (!input.name) {
                    input.name = `tooltip-input-${index}`;
                }
                input.setAttribute('autocomplete', 'off');
                if (!input.getAttribute('aria-label')) {
                    const dataLink = input.getAttribute('data-link');
                    const dataVideo = input.getAttribute('data-video');
                    if (dataLink) {
                        input.setAttribute('aria-label', 'Enter link URL');
                    } else if (dataVideo) {
                        input.setAttribute('aria-label', 'Enter video URL');
                    } else {
                        input.setAttribute('aria-label', 'Enter URL');
                    }
                }
            });
        };

        // Fix immediately
        setTimeout(fixToolbarAccessibility, 0);

        // Observe DOM changes to fix dynamically created tooltips
        const observer = new MutationObserver(() => {
            fixToolbarAccessibility();
        });

        if (editorRef.current) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Handle changes
        const handleChange = () => {
            const html = quill.root.innerHTML;
            if (onChange) {
                onChange(html === '<p><br></p>' ? '' : html);
            }
        };

        quill.on('text-change', handleChange);

        // Capture reference for cleanup
        const editorElement = editorRef.current;

        // Complete cleanup for StrictMode
        return () => {
            observer.disconnect();
            if (quillRef.current) {
                quill.off('text-change', handleChange);
                if (editorElement) {
                    const toolbar = editorElement.previousSibling;
                    if (toolbar?.classList.contains('ql-toolbar')) {
                        toolbar.remove();
                    }
                    editorElement.innerHTML = '';
                }
                quillRef.current = null;
            }
        };
    }, [onChange, placeholder, inputId]);

    // Update content when value changes
    useEffect(() => {
        if (quillRef.current) {
            const currentContent = quillRef.current.root.innerHTML;
            const newValue = value || '';

            if (currentContent !== newValue && newValue !== '<p><br></p>') {
                quillRef.current.root.innerHTML = newValue;
            }
        }
    }, [value]);

    return (
        <div className={`${styles.richTextEditorField} ${className}`}>
            {label && (
                <div id={`${inputId}-label`} className="input-label">
                    {label}
                </div>
            )}
            <div
                ref={editorRef}
                id={inputId}
                className={error ? styles.hasError : ''}
                role="textbox"
                aria-multiline="true"
                aria-labelledby={label ? `${inputId}-label` : undefined}
                aria-invalid={error ? 'true' : 'false'}
            />
            {helperText && !error && (
                <span className="input-helper">
                    {helperText}
                </span>
            )}
            {error && (
                <span className="input-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
