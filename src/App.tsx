import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Bell,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Grid2X2,
  History,
  Menu,
  PackageSearch,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

type Screen = 'reader' | 'shelf' | 'product';
type CheckState = 'idle' | 'correct' | 'wrong' | 'missing';

const product = {
  name: 'Neosaldina',
  active: 'Dipirona 300mg + Cafeína 50mg',
  presentation: 'Comprimido • 4 drágeas',
  code: '7891000001234',
  price: 'R$ 12,90',
};

function Brand() {
  return (
    <div className="brand" aria-label="Drogarias Maxi Popular">
      <div className="brand-mark">M</div>
      <div>
        <strong>DROGARIAS</strong>
        <b>MAXI POPULAR</b>
      </div>
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar">
      <Brand />
      <div className="topbar-actions">
        <button className="icon-button notification" aria-label="Notificações">
          <Bell size={19} />
          <span />
        </button>
        <button className="profile" aria-label="Perfil do usuário"><UserRound size={19} /></button>
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      </div>
    </header>
  );
}

function ScannerModal({ onClose, onDetected }: { onClose: () => void; onDetected: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<'loading' | 'ready' | 'denied'>('loading');

  useEffect(() => {
    let stream: MediaStream | undefined;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((value) => {
        stream = value;
        setCameraState('ready');
        if (videoRef.current) videoRef.current.srcObject = value;
      })
      .catch(() => setCameraState('denied'));
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Leitor de QR Code">
      <div className="scanner-modal">
        <div className="scanner-head">
          <div><span className="eyebrow light">LEITOR DE GÔNDOLA</span><h2>Escanear QR Code</h2></div>
          <button className="close-button" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="camera-view">
          {cameraState === 'ready' && <video ref={videoRef} autoPlay playsInline muted />}
          {cameraState === 'denied' && <div className="camera-message"><Camera size={34} /><strong>Câmera não autorizada</strong><span>Permita o acesso à câmera para continuar.</span></div>}
          {cameraState === 'loading' && <div className="camera-message"><ScanLine className="spin" size={34} /><span>Iniciando câmera...</span></div>}
          <div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /></div>
        </div>
        <p className="scan-hint">Posicione o QR Code dentro da área</p>
        <button className="demo-scan" onClick={onDetected}><Check size={17} /> Simular leitura da gôndola 03</button>
      </div>
    </div>
  );
}

function StatusPill({ children, tone = 'success' }: { children: React.ReactNode; tone?: 'success' | 'attention' }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

function Reader({ onScan }: { onScan: () => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">OPERAÇÃO DE LOJA</span><h1>Olá, Repositor!</h1><p>Vamos deixar cada produto no lugar certo?</p></div>
        <div className="hero-spark"><Sparkles size={20} /></div>
      </section>
      <section className="scan-card card">
        <div className="section-title"><div><span className="eyebrow blue">COMECE POR AQUI</span><h2>Identifique a gôndola</h2></div><div className="step-count">01 <span>/ 03</span></div></div>
        <p className="muted">Aponte a câmera para o QR Code da prateleira para identificar o local e conferir os produtos.</p>
        <div className="qr-illustration"><ScanLine size={52} strokeWidth={1.5} /><span>QR CODE</span></div>
        <button className="primary-button" onClick={onScan}><Camera size={20} /> Ler QR Code <ChevronRight size={19} /></button>
        <div className="manual-divider"><span>ou digite o código manualmente</span></div>
        <div className="manual-row"><div className="input-wrap"><Barcode size={19} /><input placeholder="Código da gôndola" aria-label="Código da gôndola" /></div><button className="secondary-button" onClick={onScan}>Buscar</button></div>
      </section>
      <section className="benefits">
        {[[ShieldCheck, 'PRECISÃO', 'Produto no lugar certo'], [ScanLine, 'AGILIDADE', 'Conferência rápida'], [ClipboardCheck, 'CONFORMIDADE', 'Menos erros na gôndola'], [Grid2X2, 'CONTROLE', 'Visibilidade da operação']].map(([Icon, title, text]) => {
          const BenefitIcon = Icon as typeof ShieldCheck;
          return <div className="benefit" key={title as string}><BenefitIcon size={20} /><strong>{title as string}</strong><span>{text as string}</span></div>;
        })}
      </section>
    </>
  );
}

function Shelf({ onBack, onProduct }: { onBack: () => void; onProduct: () => void }) {
  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={18} /> Voltar ao leitor</button>
      <section className="page-heading"><div><span className="eyebrow blue">FICHA DA GÔNDOLA</span><h1>Gôndola 03</h1><p>Prateleira 02 <span>•</span> Setor de Analgésicos</p></div><StatusPill>Local conferido</StatusPill></section>
      <section className="expected-card card"><div className="expected-image"><PackageSearch size={42} /><span>IMAGEM<br />DO PRODUTO</span></div><div className="expected-info"><span className="eyebrow">PRODUTO ESPERADO</span><h2>{product.name}</h2><p>{product.active}</p><div className="product-meta"><span>Apresentação<strong>{product.presentation}</strong></span><span>Preço<strong>{product.price}</strong></span></div></div></section>
      <section className="card checklist-card"><div className="section-title"><div><span className="eyebrow blue">CONFERÊNCIA VISUAL</span><h2>O que deve estar na gôndola</h2></div><span className="check-score">6/6</span></div><div className="check-list">{['Produto correto', 'Marca correta', 'Apresentação correta', 'Preço correto', 'Etiqueta de preço visível', 'QR Code ativo'].map((item) => <div className="check-item" key={item}><span><Check size={15} /></span>{item}<b>OK</b></div>)}</div></section>
      <section className="reference card"><div className="reference-photo"><div className="shelf-stripe yellow" /><div className="shelf-boxes"><i /><i /><i /><i /><i /></div><div className="shelf-stripe blue-stripe" /></div><div><span className="eyebrow">REFERÊNCIA VISUAL</span><h3>Foto da gôndola</h3><p className="muted">Use a imagem para encontrar a posição correta.</p></div></section>
      <button className="primary-button full" onClick={onProduct}><ClipboardCheck size={20} /> Conferir produto encontrado <ChevronRight size={19} /></button>
    </>
  );
}

function Product({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<CheckState>('idle');
  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={18} /> Ficha da gôndola</button>
      <section className="page-heading"><div><span className="eyebrow blue">CONFERÊNCIA DO PRODUTO</span><h1>Produto encontrado</h1><p>Gôndola 03 <span>•</span> Prateleira 02</p></div></section>
      <section className="barcode-card card"><div className="barcode-icon"><Barcode size={32} /></div><div><h2>Escaneie o código de barras</h2><p className="muted">Compare o item encontrado com o produto esperado.</p></div><button className="secondary-button" onClick={() => setState('correct')}><Camera size={18} /> Escanear</button></section>
      <section className="compare card"><span className="eyebrow blue">PRODUTO ESPERADO</span><div className="compare-product"><div className="product-thumb"><PackageSearch size={28} /></div><div><h2>{product.name}</h2><p>{product.active}</p><strong>{product.code}</strong></div><StatusPill>Esperado</StatusPill></div>{state !== 'idle' && <div className={`result ${state}`}><div className="result-icon">{state === 'correct' ? <Check /> : <AlertCircle />}</div><div><h3>{state === 'correct' ? 'Produto correto' : state === 'wrong' ? 'Produto incorreto' : 'Produto não encontrado'}</h3><p>{state === 'correct' ? 'Este produto corresponde ao item esperado para esta posição.' : 'Confira o produto e registre a ocorrência.'}</p></div></div>}</section>
      {state === 'idle' && <div className="choice-list"><button onClick={() => setState('correct')}><Check /><span><strong>Produto correto</strong><small>Corresponde ao item esperado</small></span><ChevronRight /></button><button onClick={() => setState('wrong')}><AlertCircle /><span><strong>Produto incorreto</strong><small>Encontrado outro produto</small></span><ChevronRight /></button><button onClick={() => setState('missing')}><X /><span><strong>Produto ausente</strong><small>O item não está nesta posição</small></span><ChevronRight /></button></div>}
      {state !== 'idle' && <button className="primary-button full" onClick={onBack}><ClipboardCheck size={20} /> Registrar conferência</button>}
    </>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('reader');
  const [scanner, setScanner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="app-shell"><Header onMenu={() => setMenuOpen((value) => !value)} />{menuOpen && <div className="side-menu"><button onClick={() => setMenuOpen(false)}><X size={18} /> Fechar menu</button>{['Dashboard', 'Leitor de Gôndola', 'Gôndolas', 'Produtos', 'Conferências', 'Histórico', 'Ocorrências', 'Relatórios'].map((item) => <a key={item} href="#">{item}</a>)}</div>}<main>{screen === 'reader' && <Reader onScan={() => setScanner(true)} />}{screen === 'shelf' && <Shelf onBack={() => setScreen('reader')} onProduct={() => setScreen('product')} />}{screen === 'product' && <Product onBack={() => setScreen('shelf')} />}</main>{screen === 'reader' && <nav className="bottom-nav"><a className="active"><ScanLine size={20} />Leitor</a><a><History size={20} />Histórico</a><a><Search size={20} />Buscar</a></nav>}{scanner && <ScannerModal onClose={() => setScanner(false)} onDetected={() => { setScanner(false); setScreen('shelf'); }} />}</div>;
}

export default App;
