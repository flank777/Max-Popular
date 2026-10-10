import catalogData from '../data/catalog/catalogoProdutosMaxPopular.json';
import { getProductDetail } from './productDetailRepository';
import type { CatalogProduct } from '../types/catalogProduct.types';

function isCatalogProduct(item: unknown): item is CatalogProduct {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  return typeof candidate.id === 'string'
    && typeof candidate.shelf === 'string'
    && typeof candidate.brand === 'string'
    && typeof candidate.product_name === 'string';
}

const catalogProducts: CatalogProduct[] = Array.isArray(catalogData)
  ? catalogData.filter(isCatalogProduct)
  : [];

export function getCatalogProducts(): CatalogProduct[] {
  return catalogProducts;
}

export function getCatalogShelves(): string[] {
  return [...new Set(catalogProducts.map((product) => product.shelf))].sort();
}

export function getCatalogCategories(): string[] {
  return [...new Set(
    catalogProducts
      .map((product) => getProductDetail(product.id).technical.category.trim())
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right, 'pt-BR'));
}

export function searchCatalogProducts(query: string, shelf = '', category = ''): CatalogProduct[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return catalogProducts.filter((product) => {
    const matchesQuery = !normalizedQuery
      || `${product.product_name} ${product.brand}`.toLocaleLowerCase().includes(normalizedQuery);
    const matchesShelf = !shelf || product.shelf === shelf;
    const matchesCategory = !category || getProductDetail(product.id).technical.category === category;
    return matchesQuery && matchesShelf && matchesCategory;
  });
}
