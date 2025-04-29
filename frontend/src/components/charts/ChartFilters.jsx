import React from 'react';

export default function ChartFilters({ activeChart, onChartChange }) {
  const chartTypes = [
    { 
      id: 'year', 
      label: 'Ventas Totales por Año',
      color: 'rgba(255, 159, 64, 0.7)' 
    },
    { 
      id: 'country', 
      label: 'Ventas Totales por País',
      color: 'rgba(153, 102, 255, 0.7)' 
    },
    { 
      id: 'models', 
      label: 'Modelos Más Vendidos',
      color: 'rgba(75, 192, 192, 0.7)' 
    },
  ];

  return (
    <div className="d-flex justify-content-center gap-3 mb-4">
      {chartTypes.map(chart => (
        <button
          key={chart.id}
          className={`btn ${activeChart === chart.id ? 'text-white' : ''}`}
          style={{
            backgroundColor: activeChart === chart.id ? chart.color : 'transparent',
            borderColor: chart.color,
            color: activeChart === chart.id ? '#fff' : chart.color,
          }}
          onClick={() => onChartChange(chart.id)}
        >
          {chart.label}
        </button>
      ))}
    </div>
  );
}