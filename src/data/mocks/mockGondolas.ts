import type { Gondola } from '../../types/gondola.types';
import { mockProducts } from './mockProducts';

export const mockGondolas: Gondola[] = [
  { id: '03', shelf: '02', sector: 'Analgésicos', product: mockProducts[0] },
  { id: '03', shelf: '03', sector: 'Analgésicos', product: mockProducts[1] },
  { id: '04', shelf: '01', sector: 'Higiene', product: mockProducts[2] },
  { id: '05', shelf: '01', sector: 'Medicamentos', product: mockProducts[3] },
  { id: '06', shelf: '02', sector: 'Vitaminas', product: mockProducts[0] },
];
