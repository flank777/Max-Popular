import type { ConferenceResult } from '../types/conference.types';
import type { Product } from '../types/product.types';

export function compareProducts(expected: Product, found: Product): ConferenceResult {
  return expected.code === found.code ? 'CORRETO' : 'INCORRETO';
}
