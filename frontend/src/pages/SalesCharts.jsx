// Importaciones necesarias desde React y librerías externas
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EnhancedChartContainer from '../components/charts/EnhancedChartContainer';
import ChartFilters from '../components/charts/ChartFilters';
import ModelSelectionModal from '../components/modals/ModelSelectionModal';
import { useSalesData } from '../hooks/useSalesData';
import { prepareChartData } from '../utils/chartDataHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../styles/animations.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesCharts() {
  // URL params and navigation
  const { model } = useParams();
  const navigate = useNavigate();
  
  // Local state
  const [selectedModel, setSelectedModel] = useState(model || '');
  const [activeChart, setActiveChart] = useState('year');
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-fade-up');
  
  // Custom hook for data fetching
  const { salesData, loading } = useSalesData(selectedModel);
  
  // Computed properties
  const isViewingModel = selectedModel !== '';
  
  // Event handlers
  const handleChartChange = (chartType) => {
    setAnimationClass('animate-fade-up');
    setActiveChart(chartType);
  };
  
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setShowModal(false);
    navigate(`/annual-sales/${model}`);
  };
  
  const handleResetModel = () => {
    setSelectedModel('');
    navigate('/annual-sales');
  };
  
  // Prepare chart data based on active chart/model
  const chartData = isViewingModel
    ? prepareChartData('model', salesData.modelSales, selectedModel)
    : prepareChartData(activeChart, 
        activeChart === 'year' ? salesData.salesByYear :
        activeChart === 'country' ? salesData.salesByCountry : 
        salesData.topModels
      );
      
  return (
    <div className="container py-5 animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <i className="bi bi-bar-chart-fill me-2"></i> Página de Ventas
        </h1>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center shadow-sm hover-scale"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="me-2" size={18} />
            Volver
          </button>
          
          <button
            className={`btn ${!isViewingModel ? 'btn-outline-success' : 'btn-outline-primary'} shadow-sm hover-scale`}
            onClick={isViewingModel ? handleResetModel : () => setShowModal(true)}
          >
            {isViewingModel ? 'Ventas Generales' : 'Ver Ventas por Modelo'}
          </button>
        </div>
      </div>

      {/* Chart filters (only shown when not viewing specific model) */}
      {!isViewingModel && (
        <ChartFilters 
          activeChart={activeChart} 
          onChartChange={handleChartChange} 
        />
      )}

      {/* Chart display - Usar el contenedor mejorado */}
      <EnhancedChartContainer
        data={chartData}
        title={isViewingModel ? `Ventas del Modelo: ${selectedModel}` : undefined}
        loading={loading}
        animationClass={animationClass}
        // Ajustar según la cantidad de datos
        itemsPerView={isViewingModel ? 12 : 15}
      />

      {/* Model selection modal */}
      <ModelSelectionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        models={salesData.availableModels}
        onModelSelect={handleModelSelect}
      />
    </div>
  );
}
