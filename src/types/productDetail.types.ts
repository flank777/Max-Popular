export type ProductStockStatus = 'DISPONÍVEL' | 'ESTOQUE BAIXO' | 'SEM ESTOQUE' | 'BLOQUEADO';

export type VerificationStatus = 'PENDENTE DE VERIFICAÇÃO' | 'VERIFICADO' | 'DESATUALIZADO';

export type ProductLotStatus = 'ATIVO' | 'PRÓXIMO DO VENCIMENTO' | 'VENCIDO' | 'BLOQUEADO';

export type ProductMovementType = 'ENTRADA' | 'SAÍDA' | 'AJUSTE' | 'REPOSIÇÃO';

export type ProductTechnicalInfo = {
  composition: string;
  concentration: string;
  presentation: string;
  pharmaceuticalForm: string;
  packageSize: string;
  barcode: string;
  anvisaRegistration: string;
  category: string;
  purpose: string;
  indications: string;
  benefits: string;
  differences: string;
  usage: string;
  dosage: string;
  interval: string;
  maximumDailyAmount: string;
  duration: string;
  ageRange: string;
  professionalGuidance: string;
  contraindications: string;
  warnings: string;
  pregnancyBreastfeeding: string;
  allergies: string;
  interactions: string;
  adverseEffects: string;
  referralGuidance: string;
  customerSummary: string;
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  reviewedBy: string;
};

export type ProductLot = {
  id: string;
  lotNumber: string;
  manufactureDate: string;
  expiryDate: string;
  receivedQuantity: number | null;
  remainingQuantity: number | null;
  receivedAt: string;
  supplier: string;
  status: ProductLotStatus;
  notes: string;
};

export type ProductMovement = {
  id: string;
  type: ProductMovementType;
  quantity: number;
  date: string;
  user: string;
  notes: string;
};

export type ProductDetail = {
  productId: string;
  technical: ProductTechnicalInfo;
  stockQuantity: number | null;
  minimumStock: number | null;
  replenishmentQuantity: number | null;
  replenishedQuantity: number | null;
  stockStatus: ProductStockStatus;
  lastMovementAt: string | null;
  movementUser: string | null;
  lots: ProductLot[];
  movements: ProductMovement[];
  updatedAt: string;
  updatedBy: string;
};
