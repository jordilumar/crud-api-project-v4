import React from "react";
import { Routes, Route } from "react-router-dom";
import SalesCharts from "./pages/SalesCharts";
import FavoritesPage from "./components/FavoritesPage";
import Home from "./pages/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useAuth } from "./context/AuthContext";

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
import "./App.css";

function App() {
  const { token } = useAuth();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/annual-sales/:model?" element={<SalesCharts />} />
        <Route path="/favorites" element={<FavoritesPage />} />
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
  );
}

export default App;
