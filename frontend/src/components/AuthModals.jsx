import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Check, Info, User } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Link } from 'react-router-dom';

export function LoginModal({ show, onHide, onLogin, switchToRegister }) {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="fs-5">Iniciar Sesión</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <LoginForm onLogin={onLogin} />
        <div className="d-flex justify-content-center mt-3">
          <Button variant="link" size="sm" onClick={switchToRegister} className="p-0">
            ¿No tienes cuenta? Regístrate
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export function RegisterModal({ show, onHide, onRegister, switchToLogin }) {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="fs-5">Crear Cuenta</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <RegisterForm onRegister={onRegister} />
        <div className="d-flex justify-content-center mt-3">
          <Button variant="link" size="sm" onClick={switchToLogin} className="p-0">
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export function LoginSuccessModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <Check className="me-2" size={24} /> ¡Bienvenido!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Has iniciado sesión correctamente. Ahora puedes acceder a todas las
        funcionalidades.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onHide}>
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function RegisterSuccessModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <Check className="me-2" size={24} /> ¡Registro Exitoso!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Te has registrado correctamente y ya has iniciado sesión.</p>
        <p>
          ¡Bienvenido a Car Manager! Ya puedes empezar a gestionar tus coches.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onHide}>
          Comenzar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function LogoutModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <Info className="me-2" size={24} /> Sesión Cerrada
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Has cerrado sesión correctamente. ¡Hasta pronto!
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function ProfileModal({ show, onHide, username }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <User className="me-2" size={24} /> Mi Perfil
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3">
          <div
            className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center"
            style={{ width: "80px", height: "80px" }}
          >
            <User size={40} className="text-secondary" />
          </div>
        </div>

        <div className="mb-3">
          <h5 className="mb-3">Información de usuario</h5>
          <p>
            <strong>Usuario:</strong> {username}
          </p>
          <p>
            <strong>Fecha de registro:</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mb-3">
          <h5 className="mb-3">Actividad</h5>
          <p>
            <strong>Coches favoritos:</strong>{" "}
            <Link to="/favorites" onClick={onHide}>
              Ver favoritos
            </Link>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}