import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function ChartContainer({ 
  data, 
  title, 
  loading, 
  animationClass = 'animate-fade-up'
}) {
  if (loading) {
    return (
      <div className="text-center text-muted">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p>Cargando datos de ventas...</p>
      </div>
    );
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
          autoSkip: false,      // Desactivar el auto-skip de etiquetas
          maxRotation: 90,      // Rotar etiquetas verticalmente
          minRotation: 45,      // Rotación mínima
          font: {
            size: 9,            // Tamaño de fuente más pequeño
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
  
  return (
    <div className={`bg-white p-4 rounded shadow ${animationClass}`}>
      {title && <h3 className="text-secondary mb-3">{title}</h3>}
      <div style={{ height: '60vh', maxHeight: '600px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}