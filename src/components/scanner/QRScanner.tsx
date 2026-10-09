import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export function QRScanner({ onClose, onDetected }: { onClose: () => void; onDetected: (value: string) => void }) {
  const [state, setState] = useState('Preparando câmera...');
  useEffect(() => {
    let scanner: Html5Qrcode | undefined;
    try {
      scanner = new Html5Qrcode('qr-scanner', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      void scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 170 } },
          (value) => {
            setState('QR Code identificado!');
            onDetected(value);
            try {
              void scanner?.stop().catch(() => undefined);
            } catch {
              // The scanner can already be stopped when a result closes the modal.
            }
          },
          () => undefined,
        )
        .catch(() => setState('Não foi possível acessar a câmera. Verifique a permissão do navegador.'));
    } catch {
      setState('Não foi possível preparar a câmera. Use o QR de demonstração.');
    }
    return () => {
      try {
        void scanner?.stop().catch(() => undefined);
      } catch {
        // The camera may not have started before the component unmounts.
      }
    };
  }, [onDetected]);
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="scanner-modal"><div className="scanner-head"><div><span className="eyebrow light">LEITOR DE GÔNDOLA</span><h2>Escanear QR Code</h2></div><button className="close-button" onClick={onClose} aria-label="Fechar"><X /></button></div><div className="camera-view"><div id="qr-scanner" /><div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /></div></div><p className="scan-hint">{state}</p><button className="demo-scan" onClick={() => onDetected('GONDOLA-03-PRATELEIRA-02')}><Check size={17} /> Usar QR de demonstração</button></div></div>;
}
