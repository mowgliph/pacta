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
    >
      <div className="bg-white p-8 rounded shadow-lg relative">
        <h2 className="text-title mb-4">{title}</h2>
        {children}
        <button
          id="close-modal"
          className="bg-error-red text-white p-2 rounded absolute top-2 right-2"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default ModalComponent;