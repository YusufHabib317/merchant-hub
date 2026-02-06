/**
 * CSV Export/Import utilities for products
 */

export interface CSVProduct {
  name: string;
  description: string;
  priceUSD: number;
  priceSYP?: number;
  exchangeRate?: number;
  category: string;
  stock: number;
  isPublished: boolean;
  tags: string;
  condition: string;
  imageUrls: string;
}

// CSV headers for product export/import
export const CSV_HEADERS = [
  'name',
  'description',
  'priceUSD',
  'priceSYP',
  'exchangeRate',
  'category',
  'stock',
  'isPublished',
  'tags',
  'condition',
  'imageUrls',
] as const;

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Parse a CSV value (handle escaped quotes)
 */
function parseCSVValue(value: string): string {
  const trimmed = value.trim();
  // Remove surrounding quotes and unescape internal quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }
  return trimmed;
}

/**
 * Parse a single CSV row handling quoted values
 */
function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  Array.from(row).forEach((char, i) => {
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        // Note: We can't skip next char in forEach, but the next iteration will handle it
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(parseCSVValue(current));
      current = '';
    } else {
      current += char;
    }
  });

  values.push(parseCSVValue(current));
  return values;
}

/**
 * Parse a product row from CSV values
 */
function parseProductRow(
  headers: string[],
  values: string[],
  lineNumber: number
): CSVProduct | null {
  const getValue = (header: string): string => {
    const index = headers.indexOf(header);
    return index >= 0 && index < values.length ? values[index] : '';
  };

  const name = getValue('name').trim();
  const priceUSDStr = getValue('priceUSD').trim();

  if (!name) {
    // eslint-disable-next-line no-console
    console.warn(`Line ${lineNumber}: Skipping row with empty name`);
    return null;
  }

  const priceUSD = parseFloat(priceUSDStr);
  if (Number.isNaN(priceUSD) || priceUSD < 0) {
    throw new Error(`Line ${lineNumber}: Invalid priceUSD value "${priceUSDStr}"`);
  }

  const priceSYPStr = getValue('priceSYP').trim();
  const exchangeRateStr = getValue('exchangeRate').trim();
  const stockStr = getValue('stock').trim();
  const isPublishedStr = getValue('isPublished').trim().toLowerCase();

  return {
    name,
    description: getValue('description'),
    priceUSD,
    priceSYP: priceSYPStr ? parseFloat(priceSYPStr) : undefined,
    exchangeRate: exchangeRateStr ? parseFloat(exchangeRateStr) : undefined,
    category: getValue('category') || 'General',
    stock: stockStr ? parseInt(stockStr, 10) : 0,
    isPublished: isPublishedStr !== 'false' && isPublishedStr !== '0',
    tags: getValue('tags'),
    condition: getValue('condition') || 'NEW',
    imageUrls: getValue('imageUrls'),
  };
}

/**
 * Convert products array to CSV string
 */
export function productsToCSV(
  products: Array<{
    name: string;
    description?: string | null;
    priceUSD: number;
    priceSYP?: number | null;
    exchangeRate?: number | null;
    category?: string | null;
    stock?: number;
    isPublished?: boolean;
    tags?: string[];
    condition?: string;
    imageUrls?: string[];
  }>
): string {
  const headerRow = CSV_HEADERS.join(',');

  const dataRows = products.map((product) => {
    const row = [
      escapeCSVValue(product.name),
      escapeCSVValue(product.description || ''),
      escapeCSVValue(product.priceUSD),
      escapeCSVValue(product.priceSYP || ''),
      escapeCSVValue(product.exchangeRate || ''),
      escapeCSVValue(product.category || ''),
      escapeCSVValue(product.stock ?? 0),
      escapeCSVValue(product.isPublished ?? true),
      escapeCSVValue(product.tags?.join(';') || ''),
      escapeCSVValue(product.condition || 'NEW'),
      escapeCSVValue(product.imageUrls?.join(';') || ''),
    ];
    return row.join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Parse CSV string to products array
 */
export function csvToProducts(csvContent: string): CSVProduct[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  // Parse header row
  const headers = parseCSVRow(lines[0]);

  // Validate headers
  const requiredHeaders = ['name', 'priceUSD'];
  const missingHeader = requiredHeaders.find((header) => !headers.includes(header));
  if (missingHeader) {
    throw new Error(`Missing required header: ${missingHeader}`);
  }

  // Parse data rows (skip header row at index 0)
  return lines
    .slice(1)
    .map((line, index) => {
      const values = parseCSVRow(line);
      return parseProductRow(headers, values, index + 2); // +2 because line numbers are 1-based and we skip header
    })
    .filter((product): product is CSVProduct => product !== null);
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
