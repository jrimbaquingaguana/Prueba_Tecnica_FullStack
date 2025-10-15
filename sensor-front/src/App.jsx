import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DetalleSensor from './pages/SensorDetail';
import ResetPassword from './modal/RecuperarContrasena';
import ManageUsers from './pages/ManageUsers'; // 🔹 Nueva página
import './App.css';

// Componente para proteger rutas
function PrivateRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const theme = useSelector((state) => state.theme.mode);

  // Aplica el tema globalmente
  useEffect(() => {
    const applyTheme = (mode) => {
      if (mode === 'auto') {
        const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.setAttribute(
          'data-theme',
          darkMediaQuery.matches ? 'dark' : 'light'
        );

        const listener = (e) => {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        };
        darkMediaQuery.addEventListener('change', listener);

        return () => darkMediaQuery.removeEventListener('change', listener);
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
    };

    const cleanup = applyTheme(theme || 'dark'); // por defecto oscuro
    return cleanup;
  }, [theme]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas privadas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/detalle/:sensorName"
        element={
          <PrivateRoute>
            <DetalleSensor />
          </PrivateRoute>
        }
      />
      {/* 🔹 Ruta para gestión de usuarios */}
      <Route
        path="/manage-users"
        element={
          <PrivateRoute>
            <ManageUsers />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
