import { mockProducts } from '../data/mocks/mockProducts';
import type { Product } from '../types/product.types';

export function findProductByCode(code: string) {
  return mockProducts.find((product) => product.code === code);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.toLowerCase();
  return mockProducts.filter((product) => `${product.name}${product.code}${product.active}`.toLowerCase().includes(normalized));
}
