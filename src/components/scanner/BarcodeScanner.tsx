import { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

export function BarcodeScanner({ onClose, onDetected }: { onClose: () => void; onDetected: (value: string) => void }) {
  const [state, setState] = useState('Preparando câmera...');
  useEffect(() => {
    let scanner: Html5Qrcode | undefined;
    try {
      scanner = new Html5Qrcode('barcode-scanner', {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
      });
      void scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 110 } },
          (value) => {
            setState('Código de barras identificado!');
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
      setState('Não foi possível preparar a câmera.');
    }
    return () => {
      try {
        void scanner?.stop().catch(() => undefined);
      } catch {
        // The camera may not have started before the component unmounts.
      }
    };
  }, [onDetected]);
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="scanner-modal"><div className="scanner-head"><div><span className="eyebrow light">LEITOR DE PRODUTO</span><h2>Escanear código de barras</h2></div><button className="close-button" onClick={onClose} aria-label="Fechar"><X /></button></div><div className="camera-view"><div id="barcode-scanner" /><div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /></div></div><p className="scan-hint">{state}</p></div></div>;
}
