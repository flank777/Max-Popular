import { mockGondolas } from '../data/mocks/mockGondolas';
import type { Gondola } from '../types/gondola.types';
import { parseGondolaCode } from '../utils/parseGondolaCode';

export function findGondolaByCode(value: string): Gondola | undefined {
  const parsed = parseGondolaCode(value);
  return parsed ? mockGondolas.find((item) => item.id === parsed.id && item.shelf === parsed.shelf) : undefined;
}
