import DOMPurify from 'dompurify';
import styles from './RichTextDisplay.module.css';

const RichTextDisplay = ({ content, className = '' }) => {
    if (!content) return null;

    // Sanitize HTML to prevent XSS vulnerabilities
    let cleanHTML = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'a'],
        ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
    });

    // Add target="_blank" and rel="noopener noreferrer" to all links
    cleanHTML = cleanHTML.replace(
        /<a\s+href="([^"]+)"([^>]*)>/gi,
        '<a href="$1" target="_blank" rel="noopener noreferrer"$2>'
    );

    return (
        <div
            className={`${styles.richTextDisplay} ${className}`}
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
    );
};

export default RichTextDisplay;
