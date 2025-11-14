/**
 * Email Quote Parser
 * 
 * Analyseert email content om automatisch offerte items te extraheren.
 * Zoekt naar producten, diensten, hoeveelheden en prijzen in de email body.
 */

import { QuoteItem, QuoteLabor } from "../types";

export interface ParsedQuoteData {
  items: QuoteItem[];
  labor?: QuoteLabor[];
  notes?: string;
  suggestedTotal?: number;
}

/**
 * Parse email body om offerte items te extraheren
 */
export function parseEmailForQuote(
  emailBody: string,
  emailSubject: string
): ParsedQuoteData {
  const items: QuoteItem[] = [];
  const labor: QuoteLabor[] = [];
  let notes = emailBody;

  // Normalize text - verwijder HTML tags als aanwezig
  const cleanBody = emailBody
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Keywords voor producten/materialen
  const productKeywords = [
    "product",
    "materiaal",
    "onderdeel",
    "item",
    "artikel",
    "stuk",
    "stuks",
    "x",
    "aantal",
    "hoeveelheid",
    "qty",
    "quantity",
  ];

  // Keywords voor diensten/werk
  const serviceKeywords = [
    "dienst",
    "service",
    "werk",
    "werkzaamheden",
    "uren",
    "uur",
    "hour",
    "hours",
    "uitvoeren",
    "installeren",
    "plaatsen",
    "monteren",
    "repareren",
    "onderhoud",
  ];

  // Keywords voor prijzen
  const priceKeywords = [
    "prijs",
    "prijzen",
    "kosten",
    "tarief",
    "tarieven",
    "euro",
    "eur",
    "€",
    "stukprijs",
    "per stuk",
    "per uur",
    "per uur",
  ];

  // Pattern voor getallen met komma's of punten (prijzen)
  const pricePattern = /[\d.,]+/g;

  // Split in regels voor betere analyse
  const lines = cleanBody.split(/\n/).map((line) => line.trim());

  // Probeer items te vinden in genummerde lijsten of bullet points
  const listPattern = /^[\d•\-\*]\s*(.+)/i;
  const numberedPattern = /^(\d+)[\.\)]\s*(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const originalLine = lines[i];

    // Skip lege regels
    if (!line || line.length < 3) continue;

    // Zoek naar lijst items
    const listMatch = originalLine.match(listPattern);
    const numberedMatch = originalLine.match(numberedPattern);
    const itemText = listMatch
      ? listMatch[1]
      : numberedMatch
      ? numberedMatch[2]
      : null;

    if (itemText) {
      // Probeer hoeveelheid te vinden
      const quantityMatch = itemText.match(/(\d+)\s*(?:x|stuks?|stuk|×)/i);
      const quantity = quantityMatch
        ? parseInt(quantityMatch[1], 10)
        : 1;

      // Probeer prijs te vinden (in dezelfde regel of volgende regel)
      let price = 0;
      const priceInLine = itemText.match(/(?:€|eur|euro)?\s*([\d.,]+)/i);
      if (priceInLine) {
        price = parseFloat(
          priceInLine[1].replace(",", ".")
        );
      } else if (i + 1 < lines.length) {
        // Check volgende regel voor prijs
        const nextLine = lines[i + 1];
        const nextPriceMatch = nextLine.match(
          /(?:prijs|kosten|€|eur|euro)?\s*([\d.,]+)/i
        );
        if (nextPriceMatch) {
          price = parseFloat(
            nextPriceMatch[1].replace(",", ".")
          );
        }
      }

      // Bepaal of het een product of dienst is
      const isService = serviceKeywords.some((keyword) =>
        itemText.toLowerCase().includes(keyword)
      );
      const isProduct = productKeywords.some((keyword) =>
        itemText.toLowerCase().includes(keyword)
      );

      if (isService && (line.includes("uur") || line.includes("hour"))) {
        // Dit is waarschijnlijk arbeid/werkuren
        const hoursMatch = itemText.match(/(\d+(?:[.,]\d+)?)\s*(?:uur|hours?)/i);
        const hours = hoursMatch
          ? parseFloat(hoursMatch[1].replace(",", "."))
          : quantity;

        // Probeer uurtarief te vinden
        let hourlyRate = price || 50; // Default €50/uur als niet gevonden

        if (!price) {
          const rateMatch = itemText.match(
            /(?:€|eur|euro)?\s*([\d.,]+)\s*(?:per\s*)?(?:uur|hour)/i
          );
          if (rateMatch) {
            hourlyRate = parseFloat(rateMatch[1].replace(",", "."));
          }
        }

        labor.push({
          description: itemText.trim(),
          hours: hours,
          hourlyRate: hourlyRate,
          total: hours * hourlyRate,
        });
      } else {
        // Dit is een product/item
        const description = itemText.trim();
        if (description.length > 0) {
          items.push({
            description: description,
            quantity: quantity,
            pricePerUnit: price || 0, // Als geen prijs gevonden, wordt 0 gebruikt (moet handmatig worden ingevuld)
            total: quantity * (price || 0),
          });
        }
      }
    }
  }

  // Als geen items gevonden zijn via lijst parsing, probeer dan andere methoden
  if (items.length === 0 && labor.length === 0) {
    // Zoek naar expliciete vermeldingen van producten/diensten
    const explicitProductMatch = cleanBody.match(
      /(?:product|materiaal|onderdeel|artikel)[:\s]+(.+?)(?:[.,;]|$)/i
    );
    if (explicitProductMatch) {
      items.push({
        description: explicitProductMatch[1].trim(),
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
      });
    }

    // Zoek naar expliciete vermeldingen van werk/uren
    const explicitServiceMatch = cleanBody.match(
      /(?:werk|dienst|service|uren?)[:\s]+(.+?)(?:[.,;]|$)/i
    );
    if (explicitServiceMatch) {
      const serviceText = explicitServiceMatch[1].trim();
      const hoursMatch = serviceText.match(/(\d+(?:[.,]\d+)?)/);
      const hours = hoursMatch
        ? parseFloat(hoursMatch[1].replace(",", "."))
        : 1;

      labor.push({
        description: serviceText,
        hours: hours,
        hourlyRate: 50, // Default tarief
        total: hours * 50,
      });
    }
  }

  // Als nog steeds niets gevonden, gebruik de hele email body als één item
  if (items.length === 0 && labor.length === 0) {
    // Zoek naar hoeveelheden en prijzen in de hele body
    const quantityMatches = cleanBody.match(/(\d+)\s*(?:x|stuks?|×)/gi);
    const priceMatches = cleanBody.match(/€?\s*([\d.,]+)/gi);

    if (quantityMatches && quantityMatches.length > 0) {
      // Er zijn hoeveelheden genoemd
      const quantities = quantityMatches.map((m) =>
        parseInt(m.replace(/\D/g, ""), 10)
      );
      const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

      items.push({
        description: `Offerte aanvraag: ${emailSubject}`,
        quantity: totalQuantity,
        pricePerUnit: 0,
        total: 0,
      });
    } else {
      // Geen specifieke hoeveelheden, gebruik beschrijving
      items.push({
        description: `Offerte aanvraag: ${emailSubject}`,
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
      });
    }
  }

  // Bereken geschat totaal
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, l) => sum + l.total, 0);
  const suggestedTotal = itemsSubtotal + laborSubtotal;

  return {
    items,
    labor: labor.length > 0 ? labor : undefined,
    notes: notes.length > 500 ? notes.substring(0, 500) + "..." : notes,
    suggestedTotal: suggestedTotal > 0 ? suggestedTotal : undefined,
  };
}







