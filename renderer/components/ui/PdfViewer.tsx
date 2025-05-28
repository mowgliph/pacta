import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuración de PDF.js con worker local
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

// Versión de PDF.js
console.log('Versión de PDF.js:', pdfjs.version);

interface PdfViewerProps {
  fileUrl: string;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, onDownload, onPrint, className = '' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Error al cargar el documento: ' + error.message);
  };

  const onDocumentError = (error: Error) => {
    setError('Error al procesar el documento: ' + error.message);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barra de navegación */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={() => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1)}
              disabled={numPages === 0 || pageNumber === 1}
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg">
              Página {pageNumber} de {numPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={() => setPageNumber(pageNumber < numPages ? pageNumber + 1 : numPages)}
              disabled={numPages === 0 || pageNumber === numPages}
            >
              Siguiente
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={onDownload}
              disabled={error !== null}
            >
              Descargar
            </button>
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={onPrint}
              disabled={error !== null}
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-red-700 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Visualizador de PDF */}
      <div className="h-full w-full overflow-auto">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onError={onDocumentError}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  );
};
