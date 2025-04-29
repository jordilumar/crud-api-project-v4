import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function ModelSelectionModal({ 
  show, 
  onHide, 
  models = [], 
  onModelSelect 
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Modelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Elige un modelo para ver sus ventas:</p>
        <div className="list-group">
          {models.map((model) => (
            <button
              key={model}
              className="list-group-item list-group-item-action"
              onClick={() => onModelSelect(model)}
            >
              {model}
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}