import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'pre', 'code', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'hr', 'del', 'sup', 'sub', 'span'
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'alt', 'src', 'title']

const purifyConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  FORBID_TAGS: ['script', 'iframe', 'form', 'object', 'embed', 'style'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover']
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, purifyConfig) as string
}
