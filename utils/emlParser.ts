/**
 * EML Parser Utility
 * 
 * Parses .eml (RFC 822) email files and extracts:
 * - from, to, cc, bcc
 * - subject
 * - body (plain text and/or HTML)
 * - date
 * - attachments (basic detection)
 */

export interface ParsedEmail {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  date?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

/**
 * Parses an .eml file content string into a ParsedEmail object
 */
export function parseEmlFile(content: string): ParsedEmail {
  // Split headers and body
  const parts = content.split(/\r?\n\r?\n/);
  const headers = parts[0];
  const bodyStartIndex = content.indexOf('\n\n') !== -1 
    ? content.indexOf('\n\n') + 2 
    : content.indexOf('\r\n\r\n') !== -1 
    ? content.indexOf('\r\n\r\n') + 4 
    : headers.length;

  // Parse headers
  const headerLines = headers.split(/\r?\n/);
  const headerMap: Record<string, string> = {};
  
  let currentHeader = '';
  let currentValue = '';
  
  for (const line of headerLines) {
    // Check if line starts with whitespace (continuation of previous header)
    if (/^\s/.test(line)) {
      currentValue += ' ' + line.trim();
    } else {
      // Save previous header
      if (currentHeader) {
        headerMap[currentHeader.toLowerCase()] = currentValue.trim();
      }
      // Start new header
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        currentHeader = line.substring(0, colonIndex).trim().toLowerCase();
        currentValue = line.substring(colonIndex + 1).trim();
      }
    }
  }
  // Save last header
  if (currentHeader) {
    headerMap[currentHeader.toLowerCase()] = currentValue.trim();
  }

  // Extract email addresses from header value
  function extractEmailAddresses(value: string): string[] {
    if (!value) return [];
    // Match email addresses in format: "Name <email@domain.com>" or "email@domain.com"
    const emailRegex = /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/g;
    const matches = value.matchAll(emailRegex);
    return Array.from(matches, m => m[1]);
  }

  // Parse From
  const from = extractEmailAddresses(headerMap['from'] || '')[0] || headerMap['from'] || '';

  // Parse To
  const to = extractEmailAddresses(headerMap['to'] || '');

  // Parse CC
  const cc = headerMap['cc'] ? extractEmailAddresses(headerMap['cc']) : undefined;

  // Parse BCC
  const bcc = headerMap['bcc'] ? extractEmailAddresses(headerMap['bcc']) : undefined;

  // Parse Subject (decode encoded words)
  const subject = decodeHeader(headerMap['subject'] || '');

  // Parse Date
  const date = headerMap['date'] || undefined;

  // Parse body
  const bodyContent = content.substring(bodyStartIndex).trim();
  
  // Check for multipart content
  const contentType = headerMap['content-type'] || '';
  let body = '';
  let htmlBody: string | undefined = undefined;

  if (contentType.includes('multipart/alternative') || contentType.includes('multipart/mixed')) {
    // Parse multipart message
    const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      const parts = bodyContent.split(`--${boundary}`);
      
      for (const part of parts) {
        if (part.trim() === '' || part.trim() === '--') continue;
        
        const partHeadersEnd = part.indexOf('\n\n') !== -1 
          ? part.indexOf('\n\n') 
          : part.indexOf('\r\n\r\n') !== -1 
          ? part.indexOf('\r\n\r\n') 
          : 0;
        
        const partHeaders = part.substring(0, partHeadersEnd);
        const partBody = part.substring(partHeadersEnd).trim();
        
        const partContentType = partHeaders.match(/content-type:\s*([^\r\n]+)/i)?.[1] || '';
        
        if (partContentType.includes('text/plain') && !body) {
          body = decodeBody(partBody, partContentType);
        } else if (partContentType.includes('text/html') && !htmlBody) {
          htmlBody = decodeBody(partBody, partContentType);
        }
      }
    }
  } else {
    // Simple single-part message
    if (contentType.includes('text/html')) {
      htmlBody = decodeBody(bodyContent, contentType);
      // Extract plain text from HTML as fallback
      body = stripHtml(htmlBody);
    } else {
      body = decodeBody(bodyContent, contentType);
    }
  }

  // Use HTML body as plain text fallback if no plain text body
  if (!body && htmlBody) {
    body = stripHtml(htmlBody);
  }

  // Clean up body (remove trailing boundaries, etc.)
  body = body.replace(/--[a-zA-Z0-9_-]+--?\s*$/gm, '').trim();

  return {
    from,
    to,
    cc,
    bcc,
    subject,
    body,
    htmlBody,
    date,
  };
}

/**
 * Decodes email header values (handles encoded-words like =?UTF-8?B?...?=)
 */
function decodeHeader(header: string): string {
  // Handle encoded-words: =?charset?encoding?text?=
  const encodedWordRegex = /=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi;
  
  return header.replace(encodedWordRegex, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        // Base64 encoding
        return atob(text);
      } else if (encoding.toUpperCase() === 'Q') {
        // Quoted-printable encoding
        return text.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        }).replace(/_/g, ' ');
      }
    } catch (e) {
      console.warn('Failed to decode header:', match);
    }
    return match;
  });
}

/**
 * Decodes email body content (handles quoted-printable and base64)
 */
function decodeBody(body: string, contentType: string): string {
  let decoded = body;

  // Check for transfer encoding
  const transferEncodingMatch = contentType.match(/charset=([^;\s]+)/i);
  const charset = transferEncodingMatch ? transferEncodingMatch[1] : 'utf-8';

  // Handle quoted-printable
  if (contentType.includes('quoted-printable')) {
    decoded = decoded.replace(/=\r?\n/g, ''); // Remove soft line breaks
    decoded = decoded.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }

  // Handle base64 (basic detection - might need improvement)
  if (contentType.includes('base64')) {
    try {
      decoded = atob(decoded.replace(/\s/g, ''));
    } catch (e) {
      console.warn('Failed to decode base64 body');
    }
  }

  return decoded.trim();
}

/**
 * Strips HTML tags from text (simple version)
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}







