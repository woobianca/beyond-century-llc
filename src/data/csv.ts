import { parse } from 'csv-parse/sync';

/**
 * Parse CSV text with a header row into trimmed string records. Header names are lower-cased.
 * Empty lines are kept as records so record index + 2 is the spreadsheet row number.
 */
export function parseCsv(text: string): Record<string, string>[] {
  return parse(text, {
    columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
    bom: true,
    skip_empty_lines: false,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

/** Header names of the CSV text, lower-cased; empty when there is no header row. */
export function csvHeaders(text: string): string[] {
  const rows = parse(text, { bom: true, to_line: 1, relax_column_count: true, trim: true }) as string[][];
  return (rows[0] ?? []).map((h) => h.toLowerCase());
}
