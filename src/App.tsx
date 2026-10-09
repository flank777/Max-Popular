import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Bell,
  Camera,
  Check,
  CircleCheck,
  ChevronRight,
  ClipboardCheck,
  Grid2X2,
  History,
  ImageOff,
  Menu,
  PackageSearch,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { BarcodeScanner } from './components/scanner/BarcodeScanner';
import { QRScanner } from './components/scanner/QRScanner';
import { getConferences, saveConference } from './repositories/conferenceRepository';
import { getCatalogShelves, searchCatalogProducts } from './repositories/catalogProductRepository';
import { findGondolaByCode } from './repositories/gondolaRepository';
import { findProductByCode, searchProducts } from './repositories/productRepository';
import {
  addProductLot,
  addProductMovement,
  calculateStockStatus,
  getProductDetail,
  saveProductDetail,
} from './repositories/productDetailRepository';
import { compareProducts } from './services/conferenceService';
import type { ConferenceResult } from './types/conference.types';
import type { CatalogProduct } from './types/catalogProduct.types';
import type { Gondola } from './types/gondola.types';
import type { Product } from './types/product.types';
import type { ProductDetail } from './types/productDetail.types';

type Screen = 'reader' | 'shelf' | 'product' | 'history' | 'catalog' | 'catalog-detail';
type Result = ConferenceResult;

function Brand() {
  return (
    <div className="brand" aria-label="Drogarias Maxi Popular">
      <div className="brand-mark">M</div>
      <div>
        <strong>DROGARIAS</strong>
        <b>MAXI POPULAR</b>
        <small>Mais saúde para você</small>
      </div>
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar app-header">
      <Brand />
      <div className="topbar-actions">
        <button className="icon-button notification" aria-label="Notificações">
          <Bell size={19} />
          <span />
        </button>
        <button className="profile" aria-label="Perfil do usuário">
          <UserRound size={19} />
        </button>
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

function StatusPill({
  children,
  tone = 'success',
}: {
  children: React.ReactNode;
  tone?: 'success' | 'attention';
}) {
  return (
    <span className={`status-pill ${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

function Reader({ onScan, onSearch }: { onScan: () => void; onSearch: (value: string) => void }) {
  const [code, setCode] = useState('');

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Store size={15} /> OPERAÇÃO DE LOJA</span>
          <h1>Olá, <em>Repositor!</em></h1>
          <p>Vamos deixar cada produto no lugar certo?</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-bottle" />
          <div className="hero-shelf shelf-top" />
          <div className="hero-shelf shelf-bottom" />
          <div className="hero-box box-one" />
          <div className="hero-box box-two" />
          <CircleCheck className="hero-check" size={47} />
          <Sparkles className="hero-spark" size={20} />
        </div>
      </section>

      <section className="scan-card card">
        <div className="section-title">
          <div>
            <span className="eyebrow blue">COMECE POR AQUI</span>
            <h2>Identifique a gôndola</h2>
          </div>
          <div className="step-count">
            01 <span>/ 03</span>
          </div>
        </div>
        <p className="muted">
          Aponte a câmera para o QR Code da prateleira para identificar o local e conferir os
          produtos.
        </p>
        <div className="qr-illustration">
          <ScanLine size={52} strokeWidth={1.5} />
          <span>QR CODE</span>
          <small>Toque para escanear</small>
        </div>
        <button className="primary-button" onClick={onScan}>
          <Camera size={20} /> Ler QR Code <ChevronRight size={19} />
        </button>
        <div className="manual-divider">
          <span>ou digite o código manualmente</span>
        </div>
        <div className="manual-row">
          <div className="input-wrap">
            <Barcode size={19} />
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Código da gôndola"
              aria-label="Código da gôndola"
            />
          </div>
          <button className="secondary-button" onClick={() => onSearch(code)}>
            <Search size={18} /> Buscar
          </button>
        </div>
      </section>

      <section className="benefits">
        {[
          [ShieldCheck, 'PRECISÃO', 'Produto no lugar certo'],
          [ScanLine, 'AGILIDADE', 'Conferência rápida'],
          [ClipboardCheck, 'CONFORMIDADE', 'Menos erros na gôndola'],
          [Grid2X2, 'CONTROLE', 'Visibilidade da operação'],
        ].map(([Icon, title, text]) => {
          const BenefitIcon = Icon as typeof ShieldCheck;
          return (
            <div className="benefit" key={title as string}>
              <BenefitIcon size={20} />
              <strong>{title as string}</strong>
              <span>{text as string}</span>
            </div>
          );
        })}
      </section>
    </>
  );
}

function Shelf({
  data,
  onBack,
  onProduct,
  onError,
}: {
  data: Gondola;
  onBack: () => void;
  onProduct: () => void;
  onError: (message: string) => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const [problem, setProblem] = useState(false);
  const [observation, setObservation] = useState('');
  const checks = [
    'Produto correto',
    'Marca correta',
    'Apresentação correta',
    'Preço correto',
    'Etiqueta de preço visível',
    'QR Code ativo',
  ];
  const toggle = (item: string) => {
    setChecked((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={18} /> Voltar ao leitor
      </button>
      <section className="page-heading">
        <div>
          <span className="eyebrow blue">FICHA DA GÔNDOLA</span>
          <h1>Gôndola {data.id}</h1>
          <p>
            Prateleira {data.shelf} <span>•</span> Setor de {data.sector}
          </p>
        </div>
        <StatusPill>Local identificado</StatusPill>
      </section>
      <section className="expected-card card">
        <div className="expected-image">
          <PackageSearch size={42} />
          <span>
            IMAGEM
            <br />
            DO PRODUTO
          </span>
        </div>
        <div className="expected-info">
          <span className="eyebrow">PRODUTO ESPERADO</span>
          <h2>{data.product.name}</h2>
          <p>{data.product.active}</p>
          <div className="product-meta">
            <span>
              Apresentação<strong>{data.product.presentation}</strong>
            </span>
            <span>
              Preço<strong>{data.product.price}</strong>
            </span>
          </div>
        </div>
      </section>
      <section className="card checklist-card">
        <div className="section-title">
          <div>
            <span className="eyebrow blue">CONFERÊNCIA VISUAL</span>
            <h2>O que deve estar na gôndola</h2>
          </div>
          <span className="check-score">{checked.length}/6</span>
        </div>
        <div className="check-list">
          {checks.map((item) => (
            <label
              className={`check-item interactive ${checked.includes(item) ? 'checked' : ''}`}
              key={item}
            >
              <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} />
              <span>
                <Check size={15} />
              </span>
              {item}
              <b>{checked.includes(item) ? 'OK' : 'PENDENTE'}</b>
            </label>
          ))}
        </div>
        <label className="problem-toggle">
          <input
            type="checkbox"
            checked={problem}
            onChange={(event) => setProblem(event.target.checked)}
          />{' '}
          Problema encontrado
        </label>
        {problem && (
          <textarea
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="Descreva o problema"
            aria-label="Descreva o problema"
          />
        )}
      </section>
      <section className="reference card">
        <div className="reference-photo">
          <div className="shelf-stripe yellow" />
          <div className="shelf-boxes">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="shelf-stripe blue-stripe" />
        </div>
        <div>
          <span className="eyebrow">REFERÊNCIA VISUAL</span>
          <h3>Foto da gôndola</h3>
          <p className="muted">Use a imagem para encontrar a posição correta.</p>
        </div>
      </section>
      <button
        className="primary-button full"
        onClick={() => {
          if (problem && !observation.trim()) {
            onError('Descreva o problema antes de continuar.');
            return;
          }
          onProduct();
        }}
      >
        <ClipboardCheck size={20} /> Conferir produto encontrado <ChevronRight size={19} />
      </button>
    </>
  );
}

function ProductScreen({
  expected,
  initialFound,
  onBack,
  onScanner,
  onFinish,
}: {
  expected: Product;
  initialFound?: Product;
  onBack: () => void;
  onScanner: () => void;
  onFinish: (found: Product | undefined, result: Result, observation: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Product | undefined>(initialFound);
  const [result, setResult] = useState<Result | undefined>(
    initialFound ? (initialFound.code === expected.code ? 'CORRETO' : 'INCORRETO') : undefined,
  );
  const [observation, setObservation] = useState('');
  const matches = useMemo(() => searchProducts(query), [query]);
  const select = (item: Product) => {
    setFound(item);
    setResult(compareProducts(expected, item));
  };

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={18} /> Ficha da gôndola
      </button>
      <section className="page-heading">
        <div>
          <span className="eyebrow blue">CONFERÊNCIA DO PRODUTO</span>
          <h1>Produto encontrado</h1>
          <p>Qual produto foi encontrado nesta posição?</p>
        </div>
      </section>
      <section className="barcode-card card">
        <div className="barcode-icon">
          <Barcode size={32} />
        </div>
        <div>
          <h2>Escaneie o código de barras</h2>
          <p className="muted">Compare o item encontrado com o produto esperado.</p>
        </div>
        <button className="secondary-button" onClick={onScanner}>
          <Camera size={18} /> Escanear
        </button>
      </section>
      <section className="search-product card">
        <div className="input-wrap">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite o nome, código ou EAN"
          />
        </div>
        {query && (
          <div className="product-results">
            {matches.map((item) => (
              <button key={item.code} onClick={() => select(item)}>
                <PackageSearch size={22} />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.presentation} • {item.code}
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
            {matches.length === 0 && <p className="muted">Produto não encontrado.</p>}
          </div>
        )}
      </section>

      {found && (
        <section className="compare card">
          <span className="eyebrow blue">COMPARAÇÃO AUTOMÁTICA</span>
          <div className="comparison-grid">
            <div>
              <span className="eyebrow">PRODUTO ESPERADO</span>
              <h2>{expected.name}</h2>
              <p>{expected.active}</p>
            </div>
            <div className="comparison-equals">=</div>
            <div>
              <span className="eyebrow">PRODUTO ENCONTRADO</span>
              <h2>{found.name}</h2>
              <p>{found.active}</p>
            </div>
          </div>
          <div className={`result ${result === 'CORRETO' ? 'correct' : 'wrong'}`}>
            <div className="result-icon">{result === 'CORRETO' ? <Check /> : <AlertCircle />}</div>
            <div>
              <h3>{result === 'CORRETO' ? 'PRODUTO CORRETO' : 'PRODUTO INCORRETO'}</h3>
              <p>
                {result === 'CORRETO'
                  ? 'O produto está na posição correta.'
                  : 'Este produto não corresponde ao produto cadastrado para esta posição.'}
              </p>
            </div>
          </div>
          {result === 'INCORRETO' && (
            <div className="action-row">
              <button className="secondary-button" onClick={() => onFinish(found, result, observation)}>
                Registrar divergência
              </button>
              <button className="primary-button" onClick={() => onFinish(found, result, observation)}>
                Corrigir localização
              </button>
            </div>
          )}
          {result === 'CORRETO' && (
            <button className="primary-button full" onClick={() => onFinish(found, result, observation)}>
              Finalizar conferência
            </button>
          )}
        </section>
      )}
      {!found && (
        <button className="absent-button" onClick={() => setResult('AUSENTE')}>
          <X size={18} /> Produto não encontrado na prateleira
        </button>
      )}
      {result === 'AUSENTE' && (
        <section className="absent-card card">
          <div className="result missing">
            <div className="result-icon">
              <AlertCircle />
            </div>
            <div>
              <h3>PRODUTO AUSENTE</h3>
              <p>O produto esperado não está nesta posição.</p>
            </div>
          </div>
          <textarea
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="Observação"
            aria-label="Observação da ausência"
          />
          <button className="primary-button full" onClick={() => onFinish(undefined, 'AUSENTE', observation)}>
            Registrar ausência
          </button>
        </section>
      )}
    </>
  );
}

function CatalogScreen({ onBack, onOpenProduct }: { onBack: () => void; onOpenProduct: (product: CatalogProduct) => void }) {
  const [query, setQuery] = useState('');
  const [shelf, setShelf] = useState('');
  const shelves = useMemo(() => getCatalogShelves(), []);
  const products = useMemo(() => searchCatalogProducts(query, shelf), [query, shelf]);

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={18} /> Voltar ao leitor
      </button>
      <section className="page-heading catalog-heading">
        <div>
          <span className="eyebrow blue">CATÁLOGO DE PRODUTOS</span>
          <h1>Produtos cadastrados</h1>
          <p>Consulte os produtos por nome, marca ou gôndola.</p>
        </div>
        <span className="catalog-count">{products.length} / 170</span>
      </section>
      <section className="catalog-filters card">
        <label className="catalog-search input-wrap">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar nome ou marca"
            aria-label="Pesquisar nome ou marca"
          />
        </label>
        <label className="catalog-shelf-filter">
          <span>Filtrar por gôndola</span>
          <select value={shelf} onChange={(event) => setShelf(event.target.value)} aria-label="Filtrar por gôndola">
            <option value="">Todas as gôndolas</option>
            {shelves.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>
      <section className="catalog-list" aria-live="polite">
        {products.length === 0 ? (
          <div className="empty-state card">Nenhum produto encontrado com esses filtros.</div>
        ) : (
          products.map((product) => <CatalogProductCard key={product.id} product={product} onOpen={onOpenProduct} />)
        )}
      </section>
    </>
  );
}

function CatalogProductCard({ product, onOpen }: { product: CatalogProduct; onOpen: (product: CatalogProduct) => void }) {
  const imageSource = product.image_file?.trim()
    ? `${import.meta.env.BASE_URL}${product.image_file.trim()}`
    : null;
  return (
    <button className="catalog-product card" onClick={() => onOpen(product)} aria-label={`Abrir ficha de ${product.product_name}`}>
      <div className="catalog-product-image">
        {imageSource ? (
          <img src={imageSource} alt="" />
        ) : (
          <>
            <ImageOff size={24} />
            <span>Sem imagem</span>
          </>
        )}
      </div>
      <div className="catalog-product-info">
        <div className="catalog-product-topline">
          <span className="eyebrow blue">{product.shelf}</span>
          <span className="image-status">{product.image_status || 'Sem status'}</span>
        </div>
        <h2>{product.product_name}</h2>
        <p>{product.brand}</p>
        <small>ID: {product.id}</small>
      </div>
    </button>
  );
}

function CatalogDetailScreen({ product, onBack }: { product: CatalogProduct; onBack: () => void }) {
  const [detail, setDetail] = useState<ProductDetail>(() => getProductDetail(product.id));
  const [editingStock, setEditingStock] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SAÍDA' | 'AJUSTE' | 'REPOSIÇÃO'>('ENTRADA');
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementNotes, setMovementNotes] = useState('');
  const [lotForm, setLotForm] = useState({ lotNumber: '', manufactureDate: '', expiryDate: '', receivedQuantity: '', remainingQuantity: '', supplier: '', notes: '' });
  const imageSource = product.image_file?.trim() ? `${import.meta.env.BASE_URL}${product.image_file.trim()}` : null;
  const technical = detail.technical;
  const safeNote = 'Informação não verificada — consultar a bula ou o farmacêutico.';
  const technicalValue = (value: string) => value.trim() || safeNote;
  const saveStock = (field: 'stockQuantity' | 'minimumStock', value: string) => {
    const number = value === '' ? null : Math.max(0, Number(value));
    const next = { ...detail, [field]: Number.isNaN(number) ? null : number };
    next.stockStatus = calculateStockStatus(next.stockQuantity, next.minimumStock);
    setDetail(saveProductDetail(next));
  };
  const saveMovement = () => {
    const quantity = Number(movementQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setDetail(addProductMovement(detail, { type: movementType, quantity, notes: movementNotes }));
    setMovementQuantity('');
    setMovementNotes('');
  };
  const saveLot = () => {
    if (!lotForm.lotNumber.trim()) return;
    setDetail(addProductLot(detail, {
      lotNumber: lotForm.lotNumber.trim(),
      manufactureDate: lotForm.manufactureDate,
      expiryDate: lotForm.expiryDate,
      receivedQuantity: lotForm.receivedQuantity ? Number(lotForm.receivedQuantity) : null,
      remainingQuantity: lotForm.remainingQuantity ? Number(lotForm.remainingQuantity) : null,
      receivedAt: new Date().toISOString(),
      supplier: lotForm.supplier.trim(),
      notes: lotForm.notes.trim(),
    }));
    setLotForm({ lotNumber: '', manufactureDate: '', expiryDate: '', receivedQuantity: '', remainingQuantity: '', supplier: '', notes: '' });
  };

  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={18} /> Voltar ao catálogo</button>
      <section className="product-detail-hero card">
        <button className="product-detail-image" onClick={() => imageSource && setShowImage(true)} aria-label="Ampliar foto do produto">
          {imageSource ? <img src={imageSource} alt={product.product_name} /> : <><ImageOff size={30} /><span>Sem imagem</span></>}
        </button>
        <div className="product-detail-title">
          <span className="eyebrow blue">{product.shelf} • {product.id}</span>
          <h1>{product.product_name}</h1>
          <p>{product.brand}</p>
          <StatusPill tone={detail.stockStatus === 'DISPONÍVEL' ? 'success' : 'attention'}>{detail.stockStatus}</StatusPill>
        </div>
      </section>

      <section className="detail-actions">
        <button className="secondary-button" onClick={() => setEditingStock((value) => !value)}>{editingStock ? 'Concluir edição' : 'Editar estoque'}</button>
        <span className="detail-role">Perfil: Repositor</span>
      </section>

      <details className="detail-section card" open>
        <summary>Informações do produto</summary>
        <div className="detail-grid">
          {[
            ['Categoria', technicalValue(technical.category)],
            ['Composição / princípio ativo', technicalValue(technical.composition)],
            ['Concentração', technicalValue(technical.concentration)],
            ['Apresentação', technicalValue(technical.presentation)],
            ['Forma farmacêutica', technicalValue(technical.pharmaceuticalForm)],
            ['Tamanho da embalagem', technicalValue(technical.packageSize)],
            ['Código de barras', product.barcode_sku || technicalValue(technical.barcode)],
            ['Registro Anvisa', technicalValue(technical.anvisaRegistration)],
            ['Gôndola / posição', product.shelf],
          ].map(([label, value]) => <div className="detail-field" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      </details>

      <details className="detail-section card">
        <summary>Informações para atendimento</summary>
        <div className="detail-copy">
          {[
            ['Para que serve e indicações', technical.purpose || technical.indications],
            ['Benefícios e diferenças entre versões', technical.benefits || technical.differences],
            ['Como usar e administração', technical.usage || technical.dosage],
            ['Contraindicações e cuidados', technical.contraindications || technical.warnings],
            ['Interações e efeitos adversos', technical.interactions || technical.adverseEffects],
            ['Orientação ao cliente', technical.customerSummary],
          ].map(([label, value]) => <div key={label}><h3>{label}</h3><p>{technicalValue(value)}</p></div>)}
          <p className="safety-note"><ShieldCheck size={17} /> Esta ficha não diagnostica nem prescreve. Encaminhe dúvidas ao farmacêutico e consulte a bula oficial.</p>
        </div>
      </details>

      <details className="detail-section card" open>
        <summary>Estoque e reposição</summary>
        <div className="stock-summary">
          <div><span>Quantidade atual</span>{editingStock ? <input type="number" min="0" value={detail.stockQuantity ?? ''} onChange={(event) => saveStock('stockQuantity', event.target.value)} /> : <strong>{detail.stockQuantity ?? 'Não informada'}</strong>}</div>
          <div><span>Estoque mínimo</span>{editingStock ? <input type="number" min="0" value={detail.minimumStock ?? ''} onChange={(event) => saveStock('minimumStock', event.target.value)} /> : <strong>{detail.minimumStock ?? 'Não informado'}</strong>}</div>
          <div><span>Necessária para reposição</span><strong>{detail.replenishmentQuantity ?? 'Não informada'}</strong></div>
          <div><span>Localização</span><strong>{product.shelf}</strong></div>
        </div>
        {editingStock && <div className="movement-form">
          <h3>Registrar movimentação</h3>
          <select value={movementType} onChange={(event) => setMovementType(event.target.value as typeof movementType)}><option>ENTRADA</option><option>SAÍDA</option><option>AJUSTE</option><option>REPOSIÇÃO</option></select>
          <input type="number" min="1" value={movementQuantity} onChange={(event) => setMovementQuantity(event.target.value)} placeholder="Quantidade" />
          <input value={movementNotes} onChange={(event) => setMovementNotes(event.target.value)} placeholder="Observação (opcional)" />
          <button className="primary-button" onClick={saveMovement}>Salvar movimentação</button>
        </div>}
        {detail.movements.length > 0 && <div className="movement-list">{detail.movements.slice().reverse().map((movement) => <div key={movement.id}><strong>{movement.type} • {movement.quantity}</strong><span>{new Date(movement.date).toLocaleString('pt-BR')} • {movement.user}</span></div>)}</div>}
      </details>

      <details className="detail-section card" open>
        <summary>Lotes, fabricação e validade</summary>
        <div className="lot-list">
          {detail.lots.length === 0 ? <p className="muted">Nenhum lote registrado. As datas devem ser copiadas da embalagem ou do recebimento.</p> : detail.lots.slice().sort((a, b) => (a.expiryDate || '9999-12-31').localeCompare(b.expiryDate || '9999-12-31')).map((lot) => {
            const incomplete = !lot.manufactureDate || !lot.expiryDate || lot.remainingQuantity === null;
            return <div className={`lot-card ${lot.status === 'VENCIDO' || lot.status === 'BLOQUEADO' || incomplete ? 'lot-alert' : ''}`} key={lot.id}><strong>Lote {lot.lotNumber}</strong><span>Fabricação: {lot.manufactureDate || 'Não informada'}</span><span>Validade: {lot.expiryDate || 'Não informada'}</span><span>Restante: {lot.remainingQuantity ?? 'Não informado'} • {incomplete ? 'INFORMAÇÕES INCOMPLETAS' : lot.status}</span></div>;
          })}
        </div>
        {editingStock && <div className="lot-form">
          <h3>Adicionar lote</h3>
          <input value={lotForm.lotNumber} onChange={(event) => setLotForm({ ...lotForm, lotNumber: event.target.value })} placeholder="Número do lote *" />
          <div className="date-row"><input type="date" value={lotForm.manufactureDate} onChange={(event) => setLotForm({ ...lotForm, manufactureDate: event.target.value })} aria-label="Data de fabricação" /><input type="date" value={lotForm.expiryDate} onChange={(event) => setLotForm({ ...lotForm, expiryDate: event.target.value })} aria-label="Data de validade" /></div>
          <div className="date-row"><input type="number" min="0" value={lotForm.receivedQuantity} onChange={(event) => setLotForm({ ...lotForm, receivedQuantity: event.target.value })} placeholder="Quantidade recebida" /><input type="number" min="0" value={lotForm.remainingQuantity} onChange={(event) => setLotForm({ ...lotForm, remainingQuantity: event.target.value })} placeholder="Quantidade restante" /></div>
          <input value={lotForm.supplier} onChange={(event) => setLotForm({ ...lotForm, supplier: event.target.value })} placeholder="Fornecedor (opcional)" />
          <input value={lotForm.notes} onChange={(event) => setLotForm({ ...lotForm, notes: event.target.value })} placeholder="Observações" />
          <button className="secondary-button" onClick={saveLot}>Salvar lote</button>
        </div>}
      </details>

      <details className="detail-section card">
        <summary>Fontes e revisão</summary>
        <div className="detail-copy"><p><strong>Situação:</strong> {technical.verificationStatus}</p><p><strong>Fonte:</strong> {technical.sourceName || safeNote}</p><p><strong>Última verificação:</strong> {technical.lastVerifiedAt || safeNote}</p><p><strong>Responsável:</strong> {technical.reviewedBy || safeNote}</p></div>
      </details>

      {showImage && imageSource && <div className="image-lightbox" role="dialog" aria-label="Foto ampliada" onClick={() => setShowImage(false)}><img src={imageSource} alt={product.product_name} /></div>}
    </>
  );
}

function formatConferenceDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

function HistoryScreen({ onBack }: { onBack: () => void }) {
  const records = getConferences();
  const totals = {
    total: records.length,
    correct: records.filter((record) => record.result === 'CORRETO').length,
    incorrect: records.filter((record) => record.result === 'INCORRETO').length,
    absent: records.filter((record) => record.result === 'AUSENTE').length,
  };

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={18} /> Voltar ao leitor
      </button>
      <section className="page-heading">
        <div>
          <span className="eyebrow blue">HISTÓRICO LOCAL</span>
          <h1>Conferências registradas</h1>
          <p>Veja os últimos registros salvos neste dispositivo.</p>
        </div>
        <StatusPill tone="attention">Local</StatusPill>
      </section>
      <section className="card history-summary">
        <div className="summary-item">
          <strong>{totals.total}</strong>
          <span>registros</span>
        </div>
        <div className="summary-item">
          <strong>{totals.correct}</strong>
          <span>corretos</span>
        </div>
        <div className="summary-item">
          <strong>{totals.incorrect}</strong>
          <span>divergências</span>
        </div>
        <div className="summary-item">
          <strong>{totals.absent}</strong>
          <span>ausências</span>
        </div>
      </section>
      <section className="card history-card">
        {records.length === 0 ? (
          <p className="muted">Nenhuma conferência foi registrada ainda.</p>
        ) : (
          <div className="history-list">
            {records.map((record) => (
              <article className="history-item" key={record.id}>
                <div>
                  <span className="eyebrow">
                    {record.gondola ?? 'Gôndola'} • {formatConferenceDate(record.date)}
                  </span>
                  <h3>{record.expected ?? 'Conferência sem produto esperado'}</h3>
                  <p>
                    Encontrado: <strong>{record.found ?? 'Não informado'}</strong>
                  </p>
                  {record.observation && <small>{record.observation}</small>}
                </div>
                <StatusPill tone={record.result === 'CORRETO' ? 'success' : 'attention'}>
                  {record.result === 'CORRETO'
                    ? 'CORRETO'
                    : record.result === 'INCORRETO'
                      ? 'INCORRETO'
                      : 'AUSENTE'}
                </StatusPill>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('reader');
  const [scanner, setScanner] = useState<'qr' | 'barcode'>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gondola, setGondola] = useState<Gondola>();
  const [message, setMessage] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product>();
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<CatalogProduct>();

  const showMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(''), 3500);
  };

  const navigate = (value: Screen) => {
    setMenuOpen(false);
    setScreen(value);
  };

  const openCatalogProduct = (product: CatalogProduct) => {
    setSelectedCatalogProduct(product);
    navigate('catalog-detail');
  };

  const locate = (value: string) => {
    const found = findGondolaByCode(value);
    if (!found) {
      showMessage('Gôndola não encontrada. O código não corresponde a uma posição cadastrada.');
      return;
    }

    setScannedProduct(undefined);
    setGondola(found);
    navigate('shelf');
    showMessage('Gôndola localizada!');
  };

  const record = (found: Product | undefined, result: Result, observation: string) => {
    saveConference({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      user: 'Repositor',
      gondola: gondola?.id,
      shelf: gondola?.shelf,
      expected: gondola?.product.name,
      found: found?.name,
      result,
      observation,
      status: 'REGISTRADA',
      expectedProduct: gondola?.product,
      foundProduct: found,
    });
    setScannedProduct(undefined);
    setScreen('reader');
    setGondola(undefined);
    showMessage('Conferência registrada com sucesso!');
  };

  const bottomNav = (
    <nav className="bottom-nav app-bottom-nav">
      <a
        className={screen === 'reader' ? 'active' : ''}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate('reader');
        }}
      >
        <ScanLine size={20} />
        Leitor
      </a>
      <a
        className={screen === 'history' ? 'active' : ''}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate('history');
        }}
      >
        <History size={20} />
        Histórico
      </a>
      <a
        className={screen === 'catalog' || screen === 'catalog-detail' ? 'active' : ''}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate('catalog');
        }}
      >
        <PackageSearch size={20} />
        Produtos
      </a>
      <a
        className="inactive"
        href="#"
        onClick={(event) => event.preventDefault()}
      >
        <Search size={20} />
        Buscar
      </a>
    </nav>
  );

  return (
    <div className="app-shell">
      <Header onMenu={() => setMenuOpen((value) => !value)} />

      {menuOpen && (
        <div className="side-menu">
          <button onClick={() => setMenuOpen(false)}>
            <X size={18} /> Fechar menu
          </button>
          {[
            ['Dashboard', 'reader'],
            ['Leitor de Gôndola', 'reader'],
            ['Gôndolas', 'reader'],
            ['Produtos', 'catalog'],
            ['Conferências', 'history'],
            ['Histórico', 'history'],
            ['Ocorrências', 'history'],
            ['Relatórios', 'history'],
          ].map(([item, nextScreen]) => (
            <button
              key={item}
              onClick={() => {
                navigate(nextScreen as Screen);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {message && (
        <div className="toast">
          <Check size={17} />
          {message}
        </div>
      )}

      <main className="app-main">
        {screen === 'reader' && <Reader onScan={() => setScanner('qr')} onSearch={locate} />}
        {screen === 'shelf' && gondola && (
          <Shelf
            data={gondola}
            onBack={() => navigate('reader')}
            onProduct={() => navigate('product')}
            onError={showMessage}
          />
        )}
        {screen === 'product' && gondola && (
          <ProductScreen
            expected={gondola.product}
            initialFound={scannedProduct}
            onBack={() => navigate('shelf')}
            onScanner={() => setScanner('barcode')}
            onFinish={record}
          />
        )}
        {screen === 'history' && <HistoryScreen onBack={() => navigate('reader')} />}
        {screen === 'catalog' && <CatalogScreen onBack={() => navigate('reader')} onOpenProduct={openCatalogProduct} />}
        {screen === 'catalog-detail' && selectedCatalogProduct && (
          <CatalogDetailScreen product={selectedCatalogProduct} onBack={() => navigate('catalog')} />
        )}
      </main>

      {bottomNav}

      {scanner === 'qr' && (
        <QRScanner
          onClose={() => setScanner(undefined)}
          onDetected={(value) => {
            setScanner(undefined);
            locate(value);
          }}
        />
      )}
      {scanner === 'barcode' && (
        <BarcodeScanner
          onClose={() => setScanner(undefined)}
          onDetected={(value) => {
            setScanner(undefined);
            const product = findProductByCode(value);
            if (product && gondola) {
              setScannedProduct(product);
              setScreen('product');
            } else {
              showMessage('Código de barras inválido ou produto não cadastrado.');
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
