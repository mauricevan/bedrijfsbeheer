/**
 * Email Parser - Extracteert klantgegevens en items uit emails
 */

import { Quote, QuoteItem, QuoteLabor, Customer, Email } from '../../types';

export interface ParsedEmailData {
  customer: Partial<Customer>;
  items: QuoteItem[];
  labor: QuoteLabor[];
  notes: string;
  estimatedValue?: number;
}

/**
 * Parse email content en extract klantgegevens
 */
export function parseEmailForCustomer(from: string, subject: string, body: string): Partial<Customer> {
  // Extract naam uit from field
  const nameMatch = from.match(/^([^<@]+)/);
  const name = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
  
  // Extract email
  const emailMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
  const email = emailMatch ? emailMatch[1] : from;
  
  // Extract telefoon uit subject of body
  const phoneRegex = /(\+31|0)[- ]?(\d{1,3})[- ]?(\d{6,7})/g;
  const phoneMatch = subject.match(phoneRegex) || body.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].replace(/[- ]/g, '') : '';
  
  // Bepaal type (business als bedrijfsnaam in body)
  const hasCompanyIndicators = /B\.?V\.?|N\.?V\.?|VOF|Eenmanszaak|bedrijf|company/i.test(body);
  const type = hasCompanyIndicators ? 'business' : 'private';
  
  // Extract bedrijfsnaam als aanwezig
  const companyMatch = body.match(/(?:bedrijf|company)[:;]?\s*([^\n]+)/i);
  const company = companyMatch ? companyMatch[1].trim() : undefined;
  
  return {
    name,
    email,
    phone,
    type,
    company,
    source: 'email',
    since: new Date().toISOString(),
  };
}

/**
 * Parse email body voor items en diensten
 */
export function parseEmailForItems(body: string, subject: string): { items: QuoteItem[]; labor: QuoteLabor[] } {
  const items: QuoteItem[] = [];
  const labor: QuoteLabor[] = [];
  
  // Zoek naar producten met prijzen
  // Patronen: "Product X - €50", "2x Product Y €100", "Product Z: 3 stuks à €25"
  const itemPatterns = [
    /(\d+)x?\s+([^€\n]+?)\s*[-–]\s*€\s*(\d+(?:[.,]\d{2})?)/gi,
    /([^€\n]+?)\s*[-–:]\s*(\d+)\s*stuks?\s*[aà@]\s*€\s*(\d+(?:[.,]\d{2})?)/gi,
    /([^€\n]+?)\s*[-–:]\s*€\s*(\d+(?:[.,]\d{2})?)/gi,
  ];
  
  itemPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      const quantity = match[1] && /^\d+$/.test(match[1]) ? parseInt(match[1]) : 1;
      const description = match[2] ? match[2].trim() : match[1].trim();
      const priceStr = match[3] ? match[3] : match[2];
      const pricePerUnit = parseFloat(priceStr.replace(',', '.'));
      
      if (description && pricePerUnit > 0) {
        items.push({
          description,
          quantity,
          pricePerUnit,
          total: quantity * pricePerUnit,
        });
      }
    }
  });
  
  // Zoek naar werkuren
  // Patronen: "5 uur werk", "3 uren à €75", "Montage: 2 uur"
  const laborPatterns = [
    /(\d+)\s*(?:uur|uren|hours?)\s+(?:werk|arbeid|montage)?(?:\s*[aà@]\s*€\s*(\d+(?:[.,]\d{2})?))?/gi,
    /([^:\n]+?):\s*(\d+)\s*(?:uur|uren|hours?)/gi,
  ];
  
  laborPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      const hours = parseInt(match[2] || match[1]);
      const description = match[1] && !/^\d+$/.test(match[1]) ? match[1].trim() : 'Werkuren';
      const hourlyRate = match[2] ? parseFloat(match[2].replace(',', '.')) : 75; // Default €75/uur
      
      if (hours > 0) {
        labor.push({
          description,
          hours,
          hourlyRate,
          total: hours * hourlyRate,
        });
      }
    }
  });
  
  // Als geen items gevonden, probeer algemene items uit subject te halen
  if (items.length === 0 && subject) {
    // Extract keywords die op producten lijken
    const productKeywords = ['offerte', 'prijsopgave', 'quote', 'aanvraag', 'bestelling'];
    const hasProductKeyword = productKeywords.some(kw => subject.toLowerCase().includes(kw));
    
    if (hasProductKeyword) {
      // Maak een algemeen item aan
      items.push({
        description: subject.replace(/^(re:|fw:|offerte|prijsopgave|quote|aanvraag)[:;]?\s*/gi, '').trim(),
        quantity: 1,
        pricePerUnit: 0, // Moet handmatig ingevuld worden
        total: 0,
      });
    }
  }
  
  return { items, labor };
}

/**
 * Parse volledige email en maak Quote concept
 */
export function parseEmailToQuote(email: Partial<Email>): Partial<Quote> {
  const { from = '', subject = '', body = '' } = email;
  
  // Parse items en labor
  const { items, labor } = parseEmailForItems(body, subject);
  
  // Bereken totalen
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, l) => sum + l.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatRate = 21; // Standaard 21% BTW
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;
  
  // Extract locatie/adres uit body
  const locationPatterns = [
    /(?:locatie|adres|address)[:;]?\s*([^\n]+)/i,
    /(?:op|naar|aan)\s+(?:het\s+)?([A-Z][a-zé]+(?:\s+\d+)?(?:,\s*\d{4}\s*[A-Z]{2})?)/,
  ];
  
  let location: string | undefined;
  for (const pattern of locationPatterns) {
    const match = body.match(pattern);
    if (match) {
      location = match[1].trim();
      break;
    }
  }
  
  // Probeer datum te extraheren
  const datePatterns = [
    /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
  ];
  
  let scheduledDate: string | undefined;
  for (const pattern of datePatterns) {
    const match = body.match(pattern);
    if (match) {
      // Parse naar ISO formaat
      const date = new Date(match[0]);
      if (!isNaN(date.getTime())) {
        scheduledDate = date.toISOString();
      }
      break;
    }
  }
  
  // Validity period: 30 dagen vanaf nu
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  
  return {
    items,
    labor: labor.length > 0 ? labor : undefined,
    subtotal,
    vatRate,
    vatAmount,
    total,
    status: 'draft',
    createdDate: new Date().toISOString(),
    validUntil: validUntil.toISOString(),
    notes: `Offerte aangemaakt van email:\nVan: ${from}\nOnderwerp: ${subject}\n\nOriginele email:\n${body.substring(0, 500)}${body.length > 500 ? '...' : ''}`,
    location,
    scheduledDate,
  };
}

/**
 * Parse email data voor opslag
 */
export function parseEmailForStorage(emailData: any): Partial<Email> {
  const { from, to, subject, body, date, htmlBody } = emailData;
  
  return {
    from,
    to: Array.isArray(to) ? to : [to].filter(Boolean),
    subject,
    body,
    htmlBody,
    status: 'received',
    priority: 'normal',
    receivedDate: date || new Date().toISOString(),
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Extract samenvattende info voor notificatie
 */
export function getEmailSummary(email: Partial<Email>): string {
  const { from = 'Onbekend', subject = 'Geen onderwerp' } = email;
  const fromName = from.split('<')[0].trim() || from.split('@')[0];
  return `Email van ${fromName}: ${subject}`;
}
