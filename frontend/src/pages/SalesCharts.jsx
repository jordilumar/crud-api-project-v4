// Importaciones necesarias desde React y librerías externas
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Para obtener parámetros de la URL (ej. modelo)
import { Bar } from 'react-chartjs-2'; // Componente de gráfico de barras de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'; // Elementos que debemos registrar en Chart.js
import { ArrowLeft } from 'lucide-react'; // Ícono de flecha
import { createIcons, icons } from 'lucide';
import { useNavigate } from 'react-router-dom'; // Para navegar entre rutas
import Modal from 'react-bootstrap/Modal'; // Modal de Bootstrap
import Button from 'react-bootstrap/Button'; // Botón de Bootstrap
import '../styles/animations.css';

// Registramos los componentes de Chart.js que vamos a usar
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Componente principal
export default function SalesCharts({ initialViewAnnualSales = false }) {
  // Extraemos el modelo desde la URL (si se pasa)
  const { model } = useParams();
  const navigate = useNavigate();

  // Estados
  const [sales, setSales] = useState([]); // Ventas del modelo seleccionado
  const [loading, setLoading] = useState(true); // Mostrar spinner de carga
  const [viewAnnualSales, setViewAnnualSales] = useState(initialViewAnnualSales); // Ver resumen general o individual
  const [showModal, setShowModal] = useState(false); // Controla si se muestra el modal
  const [models, setModels] = useState([]); // Lista de modelos disponibles
  const [selectedModel, setSelectedModel] = useState(model || ''); // Modelo actualmente seleccionado
  const [topModels, setTopModels] = useState([]); // Modelos más vendidos
  const [salesByYear, setSalesByYear] = useState([]); // Ventas agrupadas por año
  const [salesByCountry, setSalesByCountry] = useState([]); // Ventas agrupadas por país
  const [activeChart, setActiveChart] = useState('year'); // Estado para el gráfico activo
  const [animationClass, setAnimationClass] = useState('animate-fade-up'); // Clase de animación

  createIcons({ icons });

  // useEffect que se dispara cuando cambia el modo de vista o el modelo seleccionado
  useEffect(() => {
    if (viewAnnualSales) {
      // Cargar datos generales si se activa la vista de ventas generales
      fetchAnnualSales();
      fetchTopModels();
      fetchTotalSalesByYear();
    } else if (selectedModel) {
      // Cargar datos del modelo seleccionado si se activa la vista de ventas por modelo
      fetchModelSales(selectedModel);
    }
  }, [viewAnnualSales, selectedModel]); // Asegurarse de que este efecto se ejecute al cambiar `viewAnnualSales` o `selectedModel`

  // Carga los modelos disponibles (para el modal)
  useEffect(() => {
    fetchAvailableModels();
  }, []);

  // Llama al backend para obtener ventas de un modelo específico y las agrupa por año
  const fetchModelSales = async (model) => {
    try {
      setLoading(true);
      const res = await fetch(`/sales?model=${model}`);
      const data = await res.json();

      // Agrupar por año y sumar las unidades vendidas
      const grouped = {};
      data.data.forEach((item) => {
        const year = item.year;
        const units = item.units_sold;
        grouped[year] = (grouped[year] || 0) + units;
      });

      const processedData = Object.entries(grouped).map(([year, units]) => ({ year, units }));
      setSales(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar ventas del modelo:', error);
      setLoading(false);
    }
  };

  // Llama al backend para obtener ventas por país
  const fetchAnnualSales = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/annual');
      const data = await res.json();
      const processedData = data.map((item) => ({
        country: item.country,
        units: item.total_units,
      }));
      setSalesByCountry(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar ventas anuales:', error);
      setLoading(false);
    }
  };

  // Llama al backend para obtener todos los modelos
  const fetchAvailableModels = async () => {
    try {
      const res = await fetch('/cars');
      const data = await res.json();
      const uniqueModels = [...new Set(data.data.map((car) => car.model))];
      setModels(uniqueModels);
    } catch (error) {
      console.error('Error al cargar modelos disponibles:', error);
    }
  };

  // Llama al backend para obtener ventas totales por año
  const fetchTotalSalesByYear = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/total-by-year');
      const data = await res.json();
      const processedData = data.map((item) => ({
        year: item.year,
        units: item.total_units,
      }));
      setSalesByYear(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar las ventas totales por año:', error);
      setLoading(false);
    }
  };

  // Llama al backend para obtener los modelos más vendidos
  const fetchTopModels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/top-models');
      const data = await res.json();
      const processedData = data.map((item) => ({
        model: item.model,
        units: item.total_units,
      }));
      setTopModels(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los modelos más vendidos:', error);
      setLoading(false);
    }
  };

  // Datos del gráfico de modelos más vendidos
  const topModelsData = {
    labels: topModels.map((m) => m.model),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: topModels.map((m) => m.units),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  // Datos del gráfico de ventas por año
  const salesByYearData = {
    labels: salesByYear.map((y) => y.year),
    datasets: [
      {
        label: 'Unidades vendidas por año',
        data: salesByYear.map((y) => y.units),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  // Datos del gráfico de ventas por país
  const salesByCountryData = {
    labels: salesByCountry.map((c) => c.country),
    datasets: [
      {
        label: 'Unidades vendidas por país',
        data: salesByCountry.map((c) => c.units),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  // Datos del gráfico de ventas del modelo actual
  const modelSalesData = {
    labels: sales.map((s) => s.year),
    datasets: [
      {
        label: `Unidades vendidas (${selectedModel})`,
        data: sales.map((s) => s.units),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  // Configuración general del gráfico
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
      },
    },
  };

  // Cuando el usuario selecciona un modelo desde el modal
  const handleModelSelection = (model) => {
    setSelectedModel(model);
    setViewAnnualSales(false);
    setShowModal(false);
  };

  // Función para cambiar el gráfico con animación
  const handleChartChange = (chart) => {
    setAnimationClass('animate-fade-up'); // Reinicia la animación
    setActiveChart(chart); // Cambia el gráfico activo
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Encabezado de la sección */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <i className="bi bi-bar-chart-fill me-2" datalucide="badge-euro"></i> Página de Ventas
        </h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center shadow-sm hover-scale"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="me-2" size={18} />
            Volver al garaje
          </button>
          <button
            className={`btn ${viewAnnualSales ? 'btn-outline-success' : 'btn-outline-primary'} d-flex align-items-center shadow-sm hover-scale`}
            onClick={() => {
              if (viewAnnualSales) {
                setShowModal(true); // Mostrar modal para seleccionar modelo
              } else {
                setViewAnnualSales(true); // Cambiar a vista general
                setSelectedModel(''); // Limpiar modelo seleccionado
              }
            }}
          >
            {viewAnnualSales ? 'Ver Ventas por Modelo' : 'Ventas Generales'}
          </button>
        </div>
      </div>

      {/* Mostrar filtros solo si no se está viendo un modelo específico */}
      {!selectedModel && (
        <div className="d-flex justify-content-center gap-3 mb-4">
          <button
            className={`btn ${activeChart === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleChartChange('year')}
          >
            Ventas Totales p/Año
          </button>
          <button
            className={`btn ${activeChart === 'country' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleChartChange('country')}
          >
            Ventas Totales por País
          </button>
          <button
            className={`btn ${activeChart === 'models' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleChartChange('models')}
          >
            Modelos Más Vendidos
          </button>
        </div>
      )}

      {/* Mostrar spinner mientras se carga */}
      {loading ? (
        <div className="text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Cargando datos de ventas...</p>
        </div>
      ) : (
        <div>
          {!viewAnnualSales && selectedModel ? (
            <>
              <h3 className="text-secondary mb-3">Ventas del Modelo: {selectedModel}</h3>
              <div className="bg-white p-4 rounded shadow animate-fade-up mb-4">
                <Bar data={modelSalesData} options={{ ...chartOptions, title: { text: `Ventas del Modelo: ${selectedModel}` } }} />
              </div>
            </>
          ) : (
            <>
              <div className={`bg-white p-4 rounded shadow ${animationClass}`}>
                {activeChart === 'year' && <Bar data={salesByYearData} options={{ responsive: true }} />}
                {activeChart === 'country' && <Bar data={salesByCountryData} options={{ responsive: true }} />}
                {activeChart === 'models' && <Bar data={topModelsData} options={{ responsive: true }} />}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal para elegir modelo */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Modelo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Elige un modelo para ver sus ventas:</p>
          <div className="list-group">
            {models.map((model) => (
              <button
                key={model}
                className="list-group-item list-group-item-action"
                onClick={() => handleModelSelection(model)}
              >
                {model}
              </button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
