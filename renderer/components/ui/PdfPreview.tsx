import { useState } from 'react';
import { Button } from './button';
import { PdfViewer } from './PdfViewer';

interface PdfPreviewProps {
  fileUrl: string;
  className?: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ fileUrl, className = '' }) => {
  const [showViewer, setShowViewer] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documento.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Vista Previa del PDF</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowViewer(!showViewer)}
          >
            {showViewer ? 'Ocultar Vista' : 'Mostrar Vista'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            Descargar
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {showViewer && (
        <div className="border rounded-lg overflow-hidden">
          <PdfViewer
            fileUrl={fileUrl}
            onDownload={handleDownload}
            onPrint={handlePrint}
            className="h-[600px]"
          />
        </div>
      )}
    </div>
  );
};
