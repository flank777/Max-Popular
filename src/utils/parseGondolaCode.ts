export function parseGondolaCode(value: string): { id: string; shelf: string } | undefined {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '');
  const match = normalized.match(/GONDOLA[-_]?(\d{1,2})[-_]?PRATELEIRA[-_]?(\d{1,2})|^(\d{1,2})[-_](\d{1,2})$/);
  if (!match) return undefined;
  return {
    id: (match[1] ?? match[3]).padStart(2, '0'),
    shelf: (match[2] ?? match[4]).padStart(2, '0'),
  };
}
