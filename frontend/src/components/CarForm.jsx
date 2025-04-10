import { useEffect, useState } from 'react';
import { Save, PlusCircle } from 'lucide-react';

export default function CarForm({ onSubmit, editingCar }) {
  const [car, setCar] = useState({
    make: '',
    model: '',
    year: '',
    features: '',
  });

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

    const preparedCar = {
      id: editingCar ? editingCar.id : Date.now(),
      make: car.make.trim(),
      model: car.model.trim(),
      year: parseInt(car.year),
      features: car.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
    };

    onSubmit(preparedCar);
    setCar({ make: '', model: '', year: '', features: '' });
  };

  return (
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
  );
}
