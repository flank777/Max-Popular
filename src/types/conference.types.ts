import type { Product } from './product.types';

export type ConferenceResult = 'CORRETO' | 'INCORRETO' | 'AUSENTE';

export type ConferenceRecord = {
  id: string;
  date: string;
  user: string;
  gondola?: string;
  shelf?: string;
  expected?: string;
  found?: string;
  result: ConferenceResult;
  observation: string;
  status: 'REGISTRADA';
  expectedProduct?: Product;
  foundProduct?: Product;
};
