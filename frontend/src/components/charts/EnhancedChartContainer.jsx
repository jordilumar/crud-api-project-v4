import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function EnhancedChartContainer({ 
  data, 
  title, 
  loading, 
  animationClass = 'animate-fade-up',
  itemsPerView = 15
}) {
  const [startIndex, setStartIndex] = useState(0);
  
  if (loading) {
    return (
      <div className="text-center text-muted">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p>Cargando datos de ventas...</p>
      </div>
    );
  }

  // Si hay muchos elementos, limitamos la vista
  const hasMultiplePages = data.labels && data.labels.length > itemsPerView;
  
  // Crear una versión filtrada de los datos si es necesario
  let visibleData = data;
  if (hasMultiplePages) {
    const endIndex = Math.min(startIndex + itemsPerView, data.labels.length);
    visibleData = {
      labels: data.labels.slice(startIndex, endIndex),
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.slice(startIndex, endIndex)
      }))
    };
  }
  
  // Configuración mejorada para mostrar todas las etiquetas
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 75,
          minRotation: 45,
          font: {
            size: 10,
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const handlePrevious = () => {
    setStartIndex(Math.max(0, startIndex - itemsPerView));
  };

  const handleNext = () => {
    setStartIndex(Math.min(data.labels.length - itemsPerView, startIndex + itemsPerView));
  };
  
  return (
    <div className={`bg-white p-4 rounded shadow ${animationClass}`}>
      {title && <h3 className="text-secondary mb-3">{title}</h3>}
      
      {/* Navegación si hay múltiples páginas */}
      {hasMultiplePages && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerView, data.labels.length)} de {data.labels.length} modelos
          </span>
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={handlePrevious}
              disabled={startIndex === 0}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={handleNext}
              disabled={startIndex + itemsPerView >= data.labels.length}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div style={{ height: '60vh', maxHeight: '600px' }}>
        <Bar data={visibleData} options={options} />
      </div>
    </div>
  );
}