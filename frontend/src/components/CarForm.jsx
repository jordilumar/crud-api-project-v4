import { useEffect, useState } from 'react';
import { Save, PlusCircle } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function CarForm({ onSubmit, editingCar }) {
  const [car, setCar] = useState({
    make: '',
    model: '',
    year: '',
    features: '',
  });

  const [showErrorModal, setShowErrorModal] = useState(false); // Controla la visibilidad del modal
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error

  useEffect(() => {
    if (editingCar) {
      setCar({
        make: editingCar.make,
        model: editingCar.model,
        year: editingCar.year,
        features: editingCar.features?.join(', ') || '',
      });
    }
  }, [editingCar]);

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que la marca no contenga números
    if (/\d/.test(car.make)) {
      setErrorMessage('La marca no puede contener números. Por favor, corrige el error.');
      setShowErrorModal(true);
      return;
    }

    // Validar que la marca comience con una letra mayúscula
    if (!/^[A-Z]/.test(car.make)) {
      setErrorMessage('La marca debe comenzar con una letra mayúscula. Por favor, corrige el error.');
      setShowErrorModal(true);
      return;
    }

    // Validar que el año esté en el rango de 1900 a 2025
    const year = parseInt(car.year, 10);
    if (isNaN(year) || year < 1886 || year > 2025) {
      setErrorMessage('El año debe estar entre 1886 y 2025. Por favor, corrige el error.');
      setShowErrorModal(true);
      return;
    }

    const preparedCar = {
      id: editingCar ? editingCar.id : Date.now(),
      make: car.make.trim(),
      model: car.model.trim(),
      year: year,
      features: car.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
    };

    onSubmit(preparedCar);
    setCar({ make: '', model: '', year: '', features: '' });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="car-form">
        <h4 className="mb-4 text-primary">
          {editingCar ? (
            <>
              <Save className="me-2" />
              Editar Coche
            </>
          ) : (
            <>
              <PlusCircle className="me-2" />
              Añadir Coche
            </>
          )}
        </h4>

        <div className="form-floating mb-3">
          <input
            className="form-control"
            id="make"
            name="make"
            value={car.make}
            onChange={handleChange}
            required
          />
          <label htmlFor="make">Marca</label>
        </div>

        <div className="form-floating mb-3">
          <input
            className="form-control"
            id="model"
            name="model"
            value={car.model}
            onChange={handleChange}
            required
          />
          <label htmlFor="model">Modelo</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="number"
            className="form-control"
            id="year"
            name="year"
            value={car.year}
            onChange={handleChange}
            required
          />
          <label htmlFor="year">Año</label>
        </div>

        <div className="form-floating mb-4">
          <input
            className="form-control"
            id="features"
            name="features"
            value={car.features}
            onChange={handleChange}
          />
          <label htmlFor="features">Características (separadas por comas)</label>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          {editingCar ? '✅ Guardar Cambios' : '🚗 Añadir Coche'}
        </button>
      </form>

      {/* Modal de advertencia */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error en el Formulario</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowErrorModal(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
