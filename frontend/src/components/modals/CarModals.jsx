import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export function DeleteConfirmationModal({ show, onHide, car, onDelete }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar el coche{" "}
        <strong>
          {car?.make} {car?.model}
        </strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function CarCreationModal({ show, onHide, car }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>¡Coche Creado!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {car && (
          <div>
            <p>
              <strong>Marca:</strong> {car.make}
            </p>
            <p>
              <strong>Modelo:</strong> {car.model}
            </p>
            <p>
              <strong>Año:</strong> {car.year}
            </p>
            <p>
              <strong>Características:</strong>{" "}
              {car.features?.join(", ")}
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function CarEditModal({ show, onHide, car }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>¡Coche Editado!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {car && (
          <div>
            <p>
              <strong>Marca:</strong> {car.make}
            </p>
            <p>
              <strong>Modelo:</strong> {car.model}
            </p>
            <p>
              <strong>Año:</strong> {car.year}
            </p>
            <p>
              <strong>Características:</strong>{" "}
              {car.features?.join(", ")}
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}