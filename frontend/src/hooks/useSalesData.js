import { useState, useEffect } from 'react';
import * as salesApi from '../services/salesApi';

export function useSalesData(model) {
  const [salesData, setSalesData] = useState({
    modelSales: [],
    salesByYear: [],
    salesByCountry: [],
    topModels: [],
    availableModels: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (model) {
          // Fetch data for specific model
          const modelData = await salesApi.getModelSales(model);
          setSalesData(prev => ({ ...prev, modelSales: modelData }));
        } else {
          // Fetch general sales data
          const [yearData, countryData, topModelsData] = await Promise.all([
            salesApi.getSalesByYear(),
            salesApi.getAnnualSales(),
            salesApi.getTopModels()
          ]);
          
          setSalesData(prev => ({
            ...prev, 
            salesByYear: yearData,
            salesByCountry: countryData,
            topModels: topModelsData
          }));
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [model]);
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await salesApi.getAvailableModels();
        setSalesData(prev => ({ ...prev, availableModels: models }));
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
  }, []);
  
  return { salesData, loading };
}