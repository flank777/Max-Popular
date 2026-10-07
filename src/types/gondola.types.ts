import type { Product } from './product.types';

export type Gondola = {
  id: string;
  shelf: string;
  sector: string;
  product: Product;
};
