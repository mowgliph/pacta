import React, { useCallback } from 'react';
import Modal from 'react-aria-modal';
import { cn } from "@/renderer/lib/utils";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialFocus?: string;
  className?: string;
}

const ModalComponent: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  initialFocus = "#close-modal",
  className
}) => {
  const getApplicationNode = useCallback(() => {
    const element = document.getElementById('root');
    if (!element) {
      throw new Error('Root element not found');
    }
    return element;
  }, []);

  return (
    <Modal
      titleText={title}
      onExit={onClose}
      getApplicationNode={getApplicationNode}
      initialFocus={initialFocus}
      underlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      mounted={true}
      dialogId={`modal-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div 
        className={cn(
          "bg-card p-8 rounded-lg shadow-lg relative",
          className
        )} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <h2 
          id="modal-title" 
          className="text-xl font-semibold mb-4"
        >
          {title}
        </h2>
        <div id="modal-description">
          {children}
        </div>
        <button
          id="close-modal"
          className="absolute top-2 right-2 p-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Cerrar</span>
        </button>
      </div>
    </Modal>
  );
};

export default ModalComponent;