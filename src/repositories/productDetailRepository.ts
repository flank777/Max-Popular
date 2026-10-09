import type {
  ProductDetail,
  ProductLot,
  ProductMovement,
  ProductStockStatus,
  ProductTechnicalInfo,
} from '../types/productDetail.types';

const STORAGE_KEY = 'maxi-popular-product-details';
const USER = 'Usuário local';

const emptyTechnicalInfo: ProductTechnicalInfo = {
  composition: '',
  concentration: '',
  presentation: '',
  pharmaceuticalForm: '',
  packageSize: '',
  barcode: '',
  anvisaRegistration: '',
  category: '',
  purpose: '',
  indications: '',
  benefits: '',
  differences: '',
  usage: '',
  dosage: '',
  interval: '',
  maximumDailyAmount: '',
  duration: '',
  ageRange: '',
  professionalGuidance: '',
  contraindications: '',
  warnings: '',
  pregnancyBreastfeeding: '',
  allergies: '',
  interactions: '',
  adverseEffects: '',
  referralGuidance: '',
  customerSummary: '',
  sourceName: '',
  sourceUrl: '',
  lastVerifiedAt: '',
  verificationStatus: 'PENDENTE DE VERIFICAÇÃO',
  reviewedBy: '',
};

function readStore(): Record<string, ProductDetail> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, ProductDetail> : {};
  } catch {
    return {};
  }
}

function writeStore(details: Record<string, ProductDetail>): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
}

export function createProductDetail(productId: string): ProductDetail {
  return {
    productId,
    technical: { ...emptyTechnicalInfo },
    stockQuantity: null,
    minimumStock: null,
    replenishmentQuantity: null,
    replenishedQuantity: null,
    stockStatus: 'SEM ESTOQUE',
    lastMovementAt: null,
    movementUser: null,
    lots: [],
    movements: [],
    updatedAt: new Date().toISOString(),
    updatedBy: USER,
  };
}

export function getProductDetail(productId: string): ProductDetail {
  const stored = readStore()[productId];
  return stored ? {
    ...createProductDetail(productId),
    ...stored,
    technical: { ...emptyTechnicalInfo, ...stored.technical },
    lots: stored.lots ?? [],
    movements: stored.movements ?? [],
  } : createProductDetail(productId);
}

export function saveProductDetail(detail: ProductDetail): ProductDetail {
  const next = { ...detail, updatedAt: new Date().toISOString(), updatedBy: USER };
  const store = readStore();
  store[detail.productId] = next;
  writeStore(store);
  return next;
}

export function calculateStockStatus(quantity: number | null, minimum: number | null): ProductStockStatus {
  if (quantity === null || quantity <= 0) return 'SEM ESTOQUE';
  if (minimum !== null && quantity <= minimum) return 'ESTOQUE BAIXO';
  return 'DISPONÍVEL';
}

export function addProductLot(detail: ProductDetail, lot: Omit<ProductLot, 'id' | 'status'>): ProductDetail {
  const expiry = lot.expiryDate ? new Date(`${lot.expiryDate}T23:59:59`) : null;
  const now = new Date();
  const daysUntilExpiry = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / 86400000) : null;
  const status = expiry && expiry < now
    ? 'VENCIDO'
    : daysUntilExpiry !== null && daysUntilExpiry <= 90
      ? 'PRÓXIMO DO VENCIMENTO'
      : 'ATIVO';
  return saveProductDetail({
    ...detail,
    lots: [...detail.lots, { ...lot, id: crypto.randomUUID(), status }],
  });
}

export function addProductMovement(
  detail: ProductDetail,
  movement: Omit<ProductMovement, 'id' | 'date' | 'user'>,
): ProductDetail {
  const nextQuantity = detail.stockQuantity === null
    ? movement.type === 'SAÍDA' ? 0 : movement.quantity
    : movement.type === 'SAÍDA'
      ? Math.max(0, detail.stockQuantity - movement.quantity)
      : detail.stockQuantity + movement.quantity;
  const next = {
    ...detail,
    stockQuantity: nextQuantity,
    stockStatus: calculateStockStatus(nextQuantity, detail.minimumStock),
    lastMovementAt: new Date().toISOString(),
    movementUser: USER,
    movements: [
      ...detail.movements,
      { ...movement, id: crypto.randomUUID(), date: new Date().toISOString(), user: USER },
    ],
  };
  return saveProductDetail(next);
}
