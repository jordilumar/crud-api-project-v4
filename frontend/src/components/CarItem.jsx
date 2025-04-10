import { useNavigate } from 'react-router-dom';
import { BarChart } from 'lucide-react';

export default function CarItem({ car, index, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="card car-card">
      <div className="card-body">
        <h5 className="card-title">
          {car.make} {car.model} <span className="badge bg-secondary">{car.year}</span>
        </h5>
        <p className="card-text features-preview">
          <strong>Características:</strong> {car.features?.join(', ')}
        </p>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(car, index)}>
            ✏️ Editar
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(car.id)}>
            🗑️ Borrar
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => navigate(`/sales/${car.model.toLowerCase()}`)}
          >
            <BarChart size={16} className="me-1" />
            Ver ventas
          </button>
        </div>
      </div>
    </div>
  );
}
