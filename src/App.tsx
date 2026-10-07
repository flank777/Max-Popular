import { useEffect, useMemo, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  AlertCircle, ArrowLeft, Barcode, Bell, Camera, Check, ChevronRight,
  ClipboardCheck, Grid2X2, History, Menu, PackageSearch, ScanLine, Search,
  ShieldCheck, Sparkles, UserRound, X,
} from 'lucide-react';

type Screen = 'reader' | 'shelf' | 'product';
type Result = 'CORRETO' | 'INCORRETO' | 'AUSENTE';
type Product = { code: string; name: string; active: string; presentation: string; manufacturer: string; price: string };
type Gondola = { id: string; shelf: string; sector: string; product: Product };

const products: Product[] = [
  { code: '7891000001234', name: 'Neosaldina', active: 'Dipirona 300mg + Cafeína 50mg', presentation: 'Comprimido • 4 drágeas', manufacturer: 'Takeda', price: 'R$ 12,90' },
  { code: '7891058001001', name: 'Dorflex', active: 'Dipirona + Orfenadrina + Cafeína', presentation: 'Comprimido • 10 unidades', manufacturer: 'Sanofi', price: 'R$ 9,90' },
  { code: '7896004800010', name: 'Paracetamol', active: 'Paracetamol 750mg', presentation: 'Comprimido • 20 unidades', manufacturer: 'Medley', price: 'R$ 8,50' },
  { code: '7896714210012', name: 'Dipirona', active: 'Dipirona monoidratada 500mg', presentation: 'Comprimido • 10 unidades', manufacturer: 'Neo Química', price: 'R$ 6,90' },
];

const gondolas: Gondola[] = [
  { id: '03', shelf: '02', sector: 'Analgésicos', product: products[0] },
  { id: '03', shelf: '03', sector: 'Analgésicos', product: products[1] },
  { id: '04', shelf: '01', sector: 'Higiene', product: products[2] },
  { id: '05', shelf: '01', sector: 'Medicamentos', product: products[3] },
  { id: '06', shelf: '02', sector: 'Vitaminas', product: products[0] },
];

function findGondola(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '');
  const match = normalized.match(/GONDOLA[-_]?(\d{1,2})[-_]?PRATELEIRA[-_]?(\d{1,2})|^(\d{1,2})[-_](\d{1,2})$/);
  if (!match) return undefined;
  const id = match[1] ?? match[3];
  const shelf = match[2] ?? match[4];
  return gondolas.find((item) => item.id === id.padStart(2, '0') && item.shelf === shelf.padStart(2, '0'));
}

function Brand() {
  return <div className="brand" aria-label="Drogarias Maxi Popular"><div className="brand-mark">M</div><div><strong>DROGARIAS</strong><b>MAXI POPULAR</b></div></div>;
}
function Header({ onMenu }: { onMenu: () => void }) {
  return <header className="topbar"><Brand /><div className="topbar-actions"><button className="icon-button notification" aria-label="Notificações"><Bell size={19} /><span /></button><button className="profile" aria-label="Perfil do usuário"><UserRound size={19} /></button><button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={22} /></button></div></header>;
}
function StatusPill({ children, tone = 'success' }: { children: React.ReactNode; tone?: 'success' | 'attention' }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

function ScannerModal({ mode, onClose, onDetected }: { mode: 'qr' | 'barcode'; onClose: () => void; onDetected: (value: string) => void }) {
  const [state, setState] = useState('Preparando câmera...');
  useEffect(() => {
    const id = `scanner-${mode}`;
    const formats = mode === 'qr' ? [Html5QrcodeSupportedFormats.QR_CODE] : [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.CODE_128];
    const scanner = new Html5Qrcode(id, { verbose: false, formatsToSupport: formats });
    scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 170 } }, (decoded) => {
      setState(mode === 'qr' ? 'QR Code identificado!' : 'Código de barras identificado!');
      onDetected(decoded);
      void scanner.stop().catch(() => undefined);
    }, () => undefined).catch(() => setState('Não foi possível acessar a câmera. Verifique a permissão do navegador.'));
    return () => { void scanner.stop().catch(() => undefined); };
  }, [mode, onDetected]);
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="scanner-modal"><div className="scanner-head"><div><span className="eyebrow light">{mode === 'qr' ? 'LEITOR DE GÔNDOLA' : 'LEITOR DE PRODUTO'}</span><h2>{mode === 'qr' ? 'Escanear QR Code' : 'Escanear código de barras'}</h2></div><button className="close-button" onClick={onClose} aria-label="Fechar"><X /></button></div><div className="camera-view"><div id={`scanner-${mode}`} /><div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /></div></div><p className="scan-hint">{state}</p>{mode === 'qr' && <button className="demo-scan" onClick={() => onDetected('GONDOLA-03-PRATELEIRA-02')}><Check size={17} /> Usar QR de demonstração</button>}</div></div>;
}

function Reader({ onScan, onSearch }: { onScan: () => void; onSearch: (value: string) => void }) {
  const [code, setCode] = useState('');
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">OPERAÇÃO DE LOJA</span><h1>Olá, Repositor!</h1><p>Vamos deixar cada produto no lugar certo?</p></div><div className="hero-spark"><Sparkles size={20} /></div></section><section className="scan-card card"><div className="section-title"><div><span className="eyebrow blue">COMECE POR AQUI</span><h2>Identifique a gôndola</h2></div><div className="step-count">01 <span>/ 03</span></div></div><p className="muted">Aponte a câmera para o QR Code da prateleira para identificar o local e conferir os produtos.</p><div className="qr-illustration"><ScanLine size={52} strokeWidth={1.5} /><span>QR CODE</span></div><button className="primary-button" onClick={onScan}><Camera size={20} /> Ler QR Code <ChevronRight size={19} /></button><div className="manual-divider"><span>ou digite o código manualmente</span></div><div className="manual-row"><div className="input-wrap"><Barcode size={19} /><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código da gôndola" aria-label="Código da gôndola" /></div><button className="secondary-button" onClick={() => onSearch(code)}>Buscar</button></div></section><section className="benefits">{[[ShieldCheck, 'PRECISÃO', 'Produto no lugar certo'], [ScanLine, 'AGILIDADE', 'Conferência rápida'], [ClipboardCheck, 'CONFORMIDADE', 'Menos erros na gôndola'], [Grid2X2, 'CONTROLE', 'Visibilidade da operação']].map(([Icon, title, text]) => { const BenefitIcon = Icon as typeof ShieldCheck; return <div className="benefit" key={title as string}><BenefitIcon size={20} /><strong>{title as string}</strong><span>{text as string}</span></div>; })}</section></>;
}

function Shelf({ data, onBack, onProduct, onError }: { data: Gondola; onBack: () => void; onProduct: () => void; onError: (message: string) => void }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [problem, setProblem] = useState(false);
  const [observation, setObservation] = useState('');
  const checks = ['Produto correto', 'Marca correta', 'Apresentação correta', 'Preço correto', 'Etiqueta de preço visível', 'QR Code ativo'];
  const toggle = (item: string) => setChecked((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={18} /> Voltar ao leitor</button><section className="page-heading"><div><span className="eyebrow blue">FICHA DA GÔNDOLA</span><h1>Gôndola {data.id}</h1><p>Prateleira {data.shelf} <span>•</span> Setor de {data.sector}</p></div><StatusPill>Local identificado</StatusPill></section><section className="expected-card card"><div className="expected-image"><PackageSearch size={42} /><span>IMAGEM<br />DO PRODUTO</span></div><div className="expected-info"><span className="eyebrow">PRODUTO ESPERADO</span><h2>{data.product.name}</h2><p>{data.product.active}</p><div className="product-meta"><span>Apresentação<strong>{data.product.presentation}</strong></span><span>Preço<strong>{data.product.price}</strong></span></div></div></section><section className="card checklist-card"><div className="section-title"><div><span className="eyebrow blue">CONFERÊNCIA VISUAL</span><h2>O que deve estar na gôndola</h2></div><span className="check-score">{checked.length}/6</span></div><div className="check-list">{checks.map((item) => <label className={`check-item interactive ${checked.includes(item) ? 'checked' : ''}`} key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} /><span><Check size={15} /></span>{item}<b>{checked.includes(item) ? 'OK' : 'PENDENTE'}</b></label>)}</div><label className="problem-toggle"><input type="checkbox" checked={problem} onChange={(event) => setProblem(event.target.checked)} /> Problema encontrado</label>{problem && <textarea value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Descreva o problema" aria-label="Descreva o problema" />}</section><section className="reference card"><div className="reference-photo"><div className="shelf-stripe yellow" /><div className="shelf-boxes"><i /><i /><i /><i /><i /></div><div className="shelf-stripe blue-stripe" /></div><div><span className="eyebrow">REFERÊNCIA VISUAL</span><h3>Foto da gôndola</h3><p className="muted">Use a imagem para encontrar a posição correta.</p></div></section><button className="primary-button full" onClick={() => { if (problem && !observation.trim()) { onError('Descreva o problema antes de continuar.'); return; } onProduct(); }}><ClipboardCheck size={20} /> Conferir produto encontrado <ChevronRight size={19} /></button></>;
}

function ProductScreen({ expected, initialFound, onBack, onScanner, onFinish }: { expected: Product; initialFound?: Product; onBack: () => void; onScanner: () => void; onFinish: (found: Product | undefined, result: Result, observation: string) => void }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Product | undefined>(initialFound);
  const [result, setResult] = useState<Result | undefined>(initialFound ? (initialFound.code === expected.code ? 'CORRETO' : 'INCORRETO') : undefined);
  const [observation, setObservation] = useState('');
  const matches = useMemo(() => products.filter((item) => `${item.name}${item.code}${item.active}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const select = (item: Product) => { setFound(item); setResult(item.code === expected.code ? 'CORRETO' : 'INCORRETO'); };
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={18} /> Ficha da gôndola</button><section className="page-heading"><div><span className="eyebrow blue">CONFERÊNCIA DO PRODUTO</span><h1>Produto encontrado</h1><p>Qual produto foi encontrado nesta posição?</p></div></section><section className="barcode-card card"><div className="barcode-icon"><Barcode size={32} /></div><div><h2>Escaneie o código de barras</h2><p className="muted">Compare o item encontrado com o produto esperado.</p></div><button className="secondary-button" onClick={onScanner}><Camera size={18} /> Escanear</button></section><section className="search-product card"><div className="input-wrap"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite o nome, código ou EAN" /></div>{query && <div className="product-results">{matches.map((item) => <button key={item.code} onClick={() => select(item)}><PackageSearch size={22} /><span><strong>{item.name}</strong><small>{item.presentation} • {item.code}</small></span><ChevronRight size={17} /></button>)}{matches.length === 0 && <p className="muted">Produto não encontrado.</p>}</div>}</section>{found && <section className="compare card"><span className="eyebrow blue">COMPARAÇÃO AUTOMÁTICA</span><div className="comparison-grid"><div><span className="eyebrow">PRODUTO ESPERADO</span><h2>{expected.name}</h2><p>{expected.active}</p></div><div className="comparison-equals">=</div><div><span className="eyebrow">PRODUTO ENCONTRADO</span><h2>{found.name}</h2><p>{found.active}</p></div></div><div className={`result ${result === 'CORRETO' ? 'correct' : 'wrong'}`}><div className="result-icon">{result === 'CORRETO' ? <Check /> : <AlertCircle />}</div><div><h3>{result === 'CORRETO' ? 'PRODUTO CORRETO' : 'PRODUTO INCORRETO'}</h3><p>{result === 'CORRETO' ? 'O produto está na posição correta.' : 'Este produto não corresponde ao produto cadastrado para esta posição.'}</p></div></div>{result === 'INCORRETO' && <div className="action-row"><button className="secondary-button" onClick={() => onFinish(found, result, observation)}>Registrar divergência</button><button className="primary-button" onClick={() => onFinish(found, result, observation)}>Corrigir localização</button></div>}{result === 'CORRETO' && <button className="primary-button full" onClick={() => onFinish(found, result, observation)}>Finalizar conferência</button>}</section>}{!found && <button className="absent-button" onClick={() => setResult('AUSENTE')}><X size={18} /> Produto não encontrado na prateleira</button>}{result === 'AUSENTE' && <section className="absent-card card"><div className="result missing"><div className="result-icon"><AlertCircle /></div><div><h3>PRODUTO AUSENTE</h3><p>O produto esperado não está nesta posição.</p></div></div><textarea value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Observação" aria-label="Observação da ausência" /><button className="primary-button full" onClick={() => onFinish(undefined, 'AUSENTE', observation)}>Registrar ausência</button></section>}</>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('reader');
  const [scanner, setScanner] = useState<'qr' | 'barcode'>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gondola, setGondola] = useState<Gondola>();
  const [message, setMessage] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product>();
  const showMessage = (value: string) => { setMessage(value); window.setTimeout(() => setMessage(''), 3500); };
  const locate = (value: string) => { const found = findGondola(value); if (!found) { showMessage('Gôndola não encontrada. O código não corresponde a uma posição cadastrada.'); return; } setGondola(found); setScreen('shelf'); showMessage('Gôndola localizada!'); };
  const record = (found: Product | undefined, result: Result, observation: string) => {
    const entry = { id: crypto.randomUUID(), date: new Date().toISOString(), user: 'Repositor', gondola: gondola?.id, shelf: gondola?.shelf, expected: gondola?.product.name, found: found?.name, result, observation, status: 'REGISTRADA' };
    const history = JSON.parse(localStorage.getItem('maxi-conferences') ?? '[]') as unknown[];
    localStorage.setItem('maxi-conferences', JSON.stringify([entry, ...history]));
    setScreen('reader'); setGondola(undefined); showMessage('Conferência registrada com sucesso!');
  };
  return <div className="app-shell"><Header onMenu={() => setMenuOpen((value) => !value)} />{menuOpen && <div className="side-menu"><button onClick={() => setMenuOpen(false)}><X size={18} /> Fechar menu</button>{['Dashboard', 'Leitor de Gôndola', 'Gôndolas', 'Produtos', 'Conferências', 'Histórico', 'Ocorrências', 'Relatórios'].map((item) => <a key={item} href="#">{item}</a>)}</div>}{message && <div className="toast"><Check size={17} />{message}</div>}<main>{screen === 'reader' && <Reader onScan={() => setScanner('qr')} onSearch={locate} />}{screen === 'shelf' && gondola && <Shelf data={gondola} onBack={() => setScreen('reader')} onProduct={() => setScreen('product')} onError={showMessage} />}{screen === 'product' && gondola && <ProductScreen expected={gondola.product} initialFound={scannedProduct} onBack={() => setScreen('shelf')} onScanner={() => setScanner('barcode')} onFinish={record} />}</main>{screen === 'reader' && <nav className="bottom-nav"><a className="active"><ScanLine size={20} />Leitor</a><a><History size={20} />Histórico</a><a><Search size={20} />Buscar</a></nav>}{scanner && <ScannerModal mode={scanner} onClose={() => setScanner(undefined)} onDetected={(value) => { setScanner(undefined); if (scanner === 'qr') locate(value); else { const product = products.find((item) => item.code === value); if (product && gondola) { setScannedProduct(product); setScreen('product'); } else showMessage('Código de barras inválido ou produto não cadastrado.'); } }} />}</div>;
}

export default App;
