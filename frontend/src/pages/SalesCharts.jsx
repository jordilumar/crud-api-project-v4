import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesDetail({ initialViewAnnualSales = false }) {
  const { model } = useParams();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewAnnualSales, setViewAnnualSales] = useState(initialViewAnnualSales);
  const [showModal, setShowModal] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(model || '');
  const [topModels, setTopModels] = useState([]);
  const [salesByYear, setSalesByYear] = useState([]);
  const [salesByCountry, setSalesByCountry] = useState([]);

  useEffect(() => {
    if (viewAnnualSales) {
      // Solo cargar todos los gráficos si NO estás en modo modelo individual
      if (!model) {
        fetchAnnualSales();
        fetchTopModels();
        fetchTotalSalesByYear();
      }
    } else if (selectedModel) {
      fetchModelSales(selectedModel);
    }
  }, [viewAnnualSales, selectedModel]);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchModelSales = async (model) => {
    try {
      setLoading(true);
      const res = await fetch(`/sales?model=${model}`);
      const data = await res.json();

      // Agrupar ventas del modelo por año y sumar unidades
      const grouped = {};

      data.data.forEach((item) => {
        const year = item.year;
        const units = item.units_sold;

        if (grouped[year]) {
          grouped[year] += units;
        } else {
          grouped[year] = units;
        }
      });

      const processedData = Object.entries(grouped).map(([year, units]) => ({
        year,
        units,
      }));

      setSales(processedData);


      setSales(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar ventas del modelo:', error);
      setLoading(false);
    }
  };

  const fetchAnnualSales = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/annual');
      const data = await res.json();

      // Procesar los datos para el gráfico
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


  const fetchTotalSalesByYear = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/total-by-year');
      const data = await res.json();

      // Procesar los datos para el gráfico
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

  const fetchTopModels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/sales/top-models');
      const data = await res.json();

      // Procesar los datos para el gráfico
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

  const topModelsData = {
    labels: topModels.map((m) => m.model || "Modelo desconocido"),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: topModels.map((m) => m.units),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  const salesByYearData = {
    labels: salesByYear.map((y) => y.year || "Año desconocido"),
    datasets: [
      {
        label: 'Unidades vendidas por año',
        data: salesByYear.map((y) => y.units),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  const salesByCountryData = {
    labels: salesByCountry.map((c) => c.country || "País desconocido"),
    datasets: [
      {
        label: 'Unidades vendidas por país',
        data: salesByCountry.map((c) => c.units),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  const modelSalesData = {
    labels: sales.map((s) => s.year || "Año desconocido"),
    datasets: [
      {
        label: `Unidades vendidas (${selectedModel})`,
        data: sales.map((s) => s.units),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 5,
      },
    ],
  };

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

  const handleModelSelection = (model) => {
    setSelectedModel(model);
    setViewAnnualSales(false);
    setShowModal(false);
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Título + botones */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-3 mb-md-0">📊 Ventas</h2>
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
                setShowModal(true);
              } else {
                setViewAnnualSales(true);
              }
            }}
          >
            {viewAnnualSales ? 'Ver Ventas por Modelo' : ' Ventas Generales'}
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Cargando datos de ventas...</p>
        </div>
      ) : (
        <div>
          {/* Si estás viendo un modelo específico */}
          {!viewAnnualSales && selectedModel ? (
            <>
              <h3 className="text-secondary mb-3">Ventas del Modelo: {selectedModel}</h3>
              <div className="bg-white p-4 rounded shadow animate-fade-up mb-4">
                <Bar data={modelSalesData} options={{ ...chartOptions, title: { text: `Ventas del Modelo: ${selectedModel}` } }} />
              </div>
            </>
          ) : (
            <>
              {/* Gráfico de ventas totales por año */}
              <h3 className="text-secondary mb-3">Ventas Totales por Año</h3>
              <div className="bg-white p-4 rounded shadow animate-fade-up mb-4">
                <Bar data={salesByYearData} options={{ ...chartOptions, title: { text: 'Ventas Totales por Año' } }} />
              </div>

              {/* Gráfico de ventas totales por país */}
              <h3 className="text-secondary mb-3">Ventas Totales por País</h3>
              <div className="bg-white p-4 rounded shadow animate-fade-up mb-4">
                <Bar data={salesByCountryData} options={{ ...chartOptions, title: { text: 'Ventas Totales por País' } }} />
              </div>

              {/* Gráfico de modelos más vendidos */}
              <h3 className="text-secondary mb-3">Modelos Más Vendidos</h3>
              <div className="bg-white p-4 rounded shadow animate-fade-up">
                <Bar data={topModelsData} options={{ ...chartOptions, title: { text: 'Modelos Más Vendidos' } }} />
              </div>
            </>
          )}
        </div>
      )}


      {/* Modal para seleccionar modelo */}
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
