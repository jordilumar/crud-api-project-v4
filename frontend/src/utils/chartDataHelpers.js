export const prepareChartData = (type, data, selectedModel = '') => {
  switch (type) {
    case 'model':
      return {
        labels: data.map(s => s.year),
        datasets: [{
          label: `Unidades vendidas (${selectedModel})`,
          data: data.map(s => s.units),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderRadius: 5,
        }]
      };
      
    case 'year':
      return {
        labels: data.map(y => y.year),
        datasets: [{
          label: 'Unidades vendidas por año',
          data: data.map(y => y.units),
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderRadius: 5,
        }]
      };
      
    case 'country':
      return {
        labels: data.map(c => c.country),
        datasets: [{
          label: 'Unidades vendidas por país',
          data: data.map(c => c.units),
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderRadius: 5,
        }]
      };
      
    case 'models':
      return {
        labels: data.map(m => m.model),
        datasets: [{
          label: 'Unidades vendidas',
          data: data.map(m => m.units),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderRadius: 5,
        }]
      };
      
    default:
      return { labels: [], datasets: [] };
  }
};