import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DetalleSensor from './pages/SensorDetail';
import './App.css';

function App() {
  const theme = useSelector((state) => state.theme.mode); // obtiene el tema de Redux

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

    const cleanup = applyTheme(theme);
    return cleanup;
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/detalle/:sensorName" element={<DetalleSensor />} />
    </Routes>
  );
}

export default App;
