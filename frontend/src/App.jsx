import React from "react";
import { Routes, Route } from "react-router-dom";
import SalesCharts from "./pages/SalesCharts";
import AnnualSalesCharts from "./pages/SalesCharts";
import FavoritesPage from "./components/FavoritesPage";
import Home from "./pages/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import CarDetail from './pages/CarDetail';
import { useAuth, AuthProvider } from "./context/AuthContext";
import { CarsProvider } from './context/CarsContext';
import MyBookings from './components/MyBookings';
import AdminBookings from './components/AdminBookings';

// Importaciones de CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/base.css";
import "./styles/navbar.css";
import "./styles/car-list.css";
import "./styles/pagination.css";
import "./styles/animations.css";
import "./styles/buttons.css";
import "./styles/cards.css";
import "./styles/search-bar.css";
import "./styles/features-preview.css";
import "./styles/admin-bookings.css";
import "./App.css";

function App() {
  const { token } = useAuth();

  return (
    <AuthProvider>
      <CarsProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sales/:model" element={<SalesCharts />} />
            <Route path="/annual-sales" element={<AnnualSalesCharts />} />
            <Route path="/annual-sales/:model" element={<AnnualSalesCharts />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cars/:carId" element={<CarDetail />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route
              path="/login"
              element={
                <div>
                  {!token ? (
                    <>
                      <LoginForm onLogin={() => {}} />
                      <RegisterForm onRegister={() => {}} />
                    </>
                  ) : (
                    <div>Bienvenido a la aplicación</div>
                  )}
                </div>
              }
            />
          </Routes>
        </div>
      </CarsProvider>
    </AuthProvider>
  );
}

export default App;
