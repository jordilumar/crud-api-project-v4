import React from 'react';
import { BarChart } from 'lucide-react';

export default function SalesButton({ onClick }) {
  return (
    <button
      className="btn btn-success d-flex align-items-center text-white"
      onClick={onClick}
      title="Ver estadísticas de ventas"
    >
      <BarChart className="me-2" size={18} />
      Ventas
    </button>
  );
}