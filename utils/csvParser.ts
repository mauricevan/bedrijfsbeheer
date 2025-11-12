/**
 * CSV Parser Utility
 * 
 * Utility voor het parsen en valideren van CSV bestanden
 * Gebruikt voor bulk import van items, klanten, werkorders, etc.
 */

export interface CSVParseResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  successRows: number;
}

export interface CSVColumnMapping {
  csvHeader: string;
  dataKey: string;
  required?: boolean;
  validator?: (value: string) => boolean;
  transformer?: (value: string) => any;
}

/**
 * Parse CSV bestand naar JavaScript objecten
 */
export function parseCSV<T>(
  csvText: string,
  columnMappings: CSVColumnMapping[]
): CSVParseResult<T> {
  const result: CSVParseResult<T> = {
    data: [],
    errors: [],
    warnings: [],
    totalRows: 0,
    successRows: 0,
  };

  try {
    // Split CSV in regels
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      result.errors.push('CSV bestand is leeg');
      return result;
    }

    // Eerste regel is header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    // Valideer verplichte kolommen
    const missingRequired: string[] = [];
    columnMappings.forEach(mapping => {
      if (mapping.required && !headers.includes(mapping.csvHeader)) {
        missingRequired.push(mapping.csvHeader);
      }
    });

    if (missingRequired.length > 0) {
      result.errors.push(
        `Verplichte kolommen ontbreken: ${missingRequired.join(', ')}`
      );
      return result;
    }

    // Parse data regels
    result.totalRows = lines.length - 1; // Exclusief header

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);

      // Skip lege regels
      if (values.every(v => !v.trim())) {
        result.warnings.push(`Rij ${i}: Lege rij overgeslagen`);
        continue;
      }

      // Check of aantal kolommen klopt
      if (values.length !== headers.length) {
        result.errors.push(
          `Rij ${i}: Aantal kolommen (${values.length}) komt niet overeen met header (${headers.length})`
        );
        continue;
      }

      // Bouw object op
      const item: any = {};
      let rowValid = true;

      columnMappings.forEach(mapping => {
        const headerIndex = headers.indexOf(mapping.csvHeader);
        
        if (headerIndex === -1) {
          // Kolom niet gevonden in CSV
          if (mapping.required) {
            result.errors.push(`Rij ${i}: Verplichte kolom '${mapping.csvHeader}' ontbreekt`);
            rowValid = false;
          }
          return;
        }

        const rawValue = values[headerIndex]?.trim() || '';

        // Valideer waarde
        if (mapping.required && !rawValue) {
          result.errors.push(`Rij ${i}: Verplichte veld '${mapping.csvHeader}' is leeg`);
          rowValid = false;
          return;
        }

        // Custom validator
        if (mapping.validator && rawValue && !mapping.validator(rawValue)) {
          result.errors.push(`Rij ${i}: Ongeldige waarde voor '${mapping.csvHeader}': ${rawValue}`);
          rowValid = false;
          return;
        }

        // Transformeer waarde
        const transformedValue = mapping.transformer 
          ? mapping.transformer(rawValue)
          : rawValue;

        item[mapping.dataKey] = transformedValue;
      });

      if (rowValid) {
        result.data.push(item as T);
        result.successRows++;
      }
    }

  } catch (error) {
    result.errors.push(`Fout bij parsen van CSV: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
  }

  return result;
}

/**
 * Parse één CSV regel, houdt rekening met quotes
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Dubbele quote binnen quoted string
        currentValue += '"';
        i++; // Skip volgende quote
      } else {
        // Toggle quote status
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Komma buiten quotes = nieuwe kolom
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Voeg laatste waarde toe
  values.push(currentValue);

  return values;
}

/**
 * Genereer CSV string van data
 */
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  const csvLines: string[] = [];

  // Header regel
  const headerLine = headers.map(h => escapeCSVValue(h.label)).join(',');
  csvLines.push(headerLine);

  // Data regels
  data.forEach(item => {
    const values = headers.map(h => {
      const value = item[h.key];
      return escapeCSVValue(String(value ?? ''));
    });
    csvLines.push(values.join(','));
  });

  return csvLines.join('\n');
}

/**
 * Escape CSV waarde (voeg quotes toe indien nodig)
 */
function escapeCSVValue(value: string): string {
  // Voeg quotes toe als waarde komma, newline of quote bevat
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape dubbele quotes door ze te verdubbelen
    const escapedValue = value.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  return value;
}

/**
 * Download CSV als bestand
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ==================== VALIDATORS ====================

export const csvValidators = {
  isNumber: (value: string): boolean => {
    return !isNaN(Number(value)) && value.trim() !== '';
  },
  
  isPositiveNumber: (value: string): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },
  
  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  isPhoneNumber: (value: string): boolean => {
    // Nederlands telefoonnummer formaat
    const phoneRegex = /^(\+31|0031|0)[1-9][0-9]{8}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ''));
  },
  
  isDate: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
};

// ==================== TRANSFORMERS ====================

export const csvTransformers = {
  toNumber: (value: string): number => {
    return Number(value) || 0;
  },
  
  toBoolean: (value: string): boolean => {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'ja' || lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1';
  },
  
  toDate: (value: string): Date => {
    return new Date(value);
  },
  
  toUpperCase: (value: string): string => {
    return value.toUpperCase();
  },
  
  toLowerCase: (value: string): string => {
    return value.toLowerCase();
  },
  
  trim: (value: string): string => {
    return value.trim();
  },
};
