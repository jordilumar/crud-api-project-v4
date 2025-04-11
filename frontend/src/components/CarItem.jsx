import { useNavigate } from 'react-router-dom';
import { BarChart } from 'lucide-react';
import { Pencil, Trash } from 'lucide-react'

export default function CarItem({ car, index, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="card car-card">
      <div className="card-body">
        <h5 className="card-title">
          {car.make} {car.model} <span className="car-year">{car.year}</span>
        </h5>
        <p className="card-text features-preview">
          <strong>Características:</strong> {car.features?.join(', ')}
        </p>

        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between">
            <button className="btn btn-sm btn-outline-primary w-50" onClick={() => onEdit(car, index)}>
              <Pencil size={18} />  Editar
            </button>
            <button className="btn btn-sm btn-outline-danger w-50" onClick={() => onDelete(car)}>
              <Trash size={18} /> Borrar
            </button>
          </div>
          <button
            className="btn btn-sm btn-outline-success w-100"
            onClick={() => navigate(`/sales/${car.model.toLowerCase()}`)} // Convierte el modelo a minúsculas
          >
            <BarChart size={16} className="me-1" />
            Ver Ventas
          </button>
        </div>
      </div>
    </div>
  );
}
