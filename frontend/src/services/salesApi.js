/**
 * API service for sales data
 */

// Fetch sales data for a specific model
export const getModelSales = async (model) => {
  try {
    const res = await fetch(`/sales?model=${model}`);
    const data = await res.json();
    
    // Group by year and sum units sold
    const grouped = {};
    data.data.forEach((item) => {
      const year = item.year;
      const units = item.units_sold;
      grouped[year] = (grouped[year] || 0) + units;
    });
    
    return Object.entries(grouped).map(([year, units]) => ({ year, units }));
  } catch (error) {
    console.error('Error fetching model sales:', error);
    throw error;
  }
};

// Fetch sales by country
export const getAnnualSales = async () => {
  try {
    const res = await fetch('/sales/annual');
    const data = await res.json();
    return data.map(item => ({
      country: item.country,
      units: item.total_units
    }));
  } catch (error) {
    console.error('Error fetching annual sales:', error);
    throw error;
  }
};

// Fetch available car models
export const getAvailableModels = async () => {
  try {
    const initialRes = await fetch('/cars?page=1&limit=1');
    const initialData = await initialRes.json();
    const totalCars = initialData.total;
    
    const res = await fetch(`/cars?limit=${totalCars}`);
    const data = await res.json();
    
    return [...new Set(data.data.map(car => car.model))];
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
};

// Fetch sales totals by year
export const getSalesByYear = async () => {
  try {
    const res = await fetch('/sales/total-by-year');
    const data = await res.json();
    return data.map(item => ({
      year: item.year,
      units: item.total_units
    }));
  } catch (error) {
    console.error('Error fetching sales by year:', error);
    throw error;
  }
};

// Fetch top selling models
export const getTopModels = async () => {
  try {
    const res = await fetch('/sales/top-models');
    const data = await res.json();
    return data.map(item => ({
      model: item.model,
      units: item.total_units
    }));
  } catch (error) {
    console.error('Error fetching top models:', error);
    throw error;
  }
};