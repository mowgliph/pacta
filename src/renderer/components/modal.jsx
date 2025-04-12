import React from 'react';
import Modal from 'react-aria-modal';

const ModalComponent = ({ title, children, onClose }) => {
  return (
    <Modal
      titleText={title}
      onExit={onClose}
      getApplicationNode={() => document.getElementById('root')}
      initialFocus="#close-modal"
      underlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      focusDialog={true}
      restoreFocus={true}
      verticallyCenter={true}
      dialogId={`modal-${title.toLowerCase().replace(/\s+/g, '-')}`}
      aria-modal="true"
      aria-describedby="modal-description"
    >
      <div className="bg-white p-8 rounded shadow-lg relative" role="dialog">
        <h2 id="modal-title" className="text-title mb-4" aria-level="2">{title}</h2>
        <div id="modal-description">
          {children}
        </div>
        <button
          id="close-modal"
          className="bg-error-red text-white p-2 rounded absolute top-2 right-2"
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