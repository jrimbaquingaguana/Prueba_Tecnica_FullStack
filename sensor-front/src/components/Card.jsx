import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSensor } from '../redux/sensorsSlice';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import 'react-circular-progressbar/dist/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Card.css';
import Sensores from '../modal/Sensores';
import Confirmacion from '../modal/Confirmacion';

// Modal informativo
function InfoModal({ title, message, onClose }) {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Formateo de fecha
const formatDate = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleString();
};

export default function Card() {
  const dispatch = useDispatch();
  const sensors = useSelector((state) => state.sensors);
  const theme = useSelector((state) => state.theme.mode); // ✅ Obtener tema del store Redux
  const navigate = useNavigate();

  const [hiddenSensors, setHiddenSensors] = useState(() => {
    const saved = localStorage.getItem('hiddenSensors');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterRegion, setFilterRegion] = useState('');
  const [search, setSearch] = useState('');
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const [sensorToHide, setSensorToHide] = useState(null);
  const [showConfirmHideModal, setShowConfirmHideModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Conexión con socket.io
  useEffect(() => {
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socket.on('sensor-data', (data) => dispatch(updateSensor(data)));
    return () => socket.disconnect();
  }, [dispatch]);

  // Guardar sensores ocultos en localStorage
  useEffect(() => {
    localStorage.setItem('hiddenSensors', JSON.stringify(hiddenSensors));
  }, [hiddenSensors]);

  // Color del texto dinámico según el tema
  const cardTextColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--card-text-color')
    .trim();

  // Colores por temperatura
  const getTemperatureColor = (temp) => {
    if (temp >= 22 && temp <= 27) return '#4caf50';
    if (temp < 22) return '#ff9800';
    return '#f44336';
  };

  // Calcular estadísticas de sensores
  const calculateStats = (history) => {
    if (!history || history.length === 0)
      return { avgTemp: 0, avgHum: 0, maxTemp: 0, maxHum: 0, minTemp: 0, minHum: 0 };
    const temps = history.map((h) => h.temp);
    const hums = history.map((h) => h.hum);
    const avgTemp = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 100) / 100;
    const avgHum = Math.round((hums.reduce((a, b) => a + b, 0) / hums.length) * 100) / 100;
    return {
      avgTemp,
      avgHum,
      maxTemp: Math.max(...temps),
      maxHum: Math.max(...hums),
      minTemp: Math.min(...temps),
      minHum: Math.min(...hums),
    };
  };

  // 🎨 Estilos del botón "Crear sensor" según el tema
  const createButtonStyle = {
    backgroundColor: theme === 'dark' ? '#2563eb' : '#ec4899',
    borderColor: theme === 'dark' ? '#2563eb' : '#ec4899',
    color: '#fff',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  };


  // Efecto hover
  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#db2777'; // tono más fuerte
    e.target.style.borderColor = theme === 'dark' ? '#1e40af' : '#db2777';
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = theme === 'dark' ? '#2563eb' : '#ec4899';
    e.target.style.borderColor = theme === 'dark' ? '#2563eb' : '#ec4899';
    e.target.style.transform = 'scale(1)';
  };

  // Funciones para ocultar/mostrar sensores
  const confirmHideSensor = (name) => {
    setSensorToHide(name);
    setShowConfirmHideModal(true);
  };

  const hideSensor = () => {
    if (sensorToHide) {
      setHiddenSensors((prev) => [...prev, sensorToHide]);
      setSensorToHide(null);
      setShowConfirmHideModal(false);
    }
  };

  const showSensor = (name) => setHiddenSensors((prev) => prev.filter((n) => n !== name));

  const handleShowCreateModal = () => {
    hiddenSensors.length === 0 ? setShowInfoModal(true) : setShowHiddenModal(true);
  };

  // Filtros de regiones
  const regions = [...new Set(Object.values(sensors).map((s) => s.region || 'N/A'))];

  const filteredSensors = Object.entries(sensors).filter(
    ([name, sensor]) =>
      !hiddenSensors.includes(name) &&
      (filterRegion === '' || sensor.region === filterRegion) &&
      (search === '' || name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '1rem' }}>
      {/* Barra superior */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="region-select" className="fw-bold">
            Filtrar por región:
          </label>
          <select
            id="region-select"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="form-select"
            style={{ width: '150px' }}
          >
            <option value="">Todas</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Botón dinámico */}
        <button
          className="btn"
          onClick={handleShowCreateModal}
          style={createButtonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Crear sensor
        </button>

        <input
          type="text"
          placeholder="Buscar sensor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ width: '200px' }}
        />
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredSensors.length === 0 && (
        <div className="alert alert-warning text-center">
          No se encontró ningún sensor con ese nombre o criterio de búsqueda.
        </div>
      )}

      {/* Tarjetas por región */}
      {regions.map((region) => {
        const sensorsInRegion = filteredSensors.filter(([_, s]) => s.region === region);
        if (sensorsInRegion.length === 0) return null;
        return (
          <div key={region} className="mb-4">
            <h4 className="border-bottom pb-1" style={{ color: cardTextColor }}>
              {region}
            </h4>
            <div className="row">
              {sensorsInRegion.map(([name, sensor]) => {
                const stats = calculateStats(sensor.history);
                const chartData = sensor.history.map((h) => ({
                  ...h,
                  timestampFormatted: formatDate(h.timestamp),
                }));

                return (
                  <div key={name} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                    <div
                      className="sensor-card p-2"
                      style={{
                        borderTop: `4px solid ${getTemperatureColor(sensor.temp)}`,
                        fontSize: '0.8rem',
                        color: cardTextColor,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 style={{ color: cardTextColor }}>{name}</h6>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmHideSensor(name)}
                        >
                          Ocultar
                        </button>
                      </div>

                      {/* Indicadores circulares */}
                      <div className="d-flex justify-content-around mb-2">
                        <div style={{ width: 60 }}>
                          <CircularProgressbar
                            value={sensor.temp}
                            maxValue={50}
                            text={`${sensor.temp}°C`}
                            styles={buildStyles({
                              pathColor: getTemperatureColor(sensor.temp),
                              textColor: cardTextColor,
                              trailColor: '#e0e0e0',
                            })}
                          />
                        </div>
                        <div style={{ width: 60 }}>
                          <CircularProgressbar
                            value={sensor.hum}
                            maxValue={100}
                            text={`${sensor.hum}%`}
                            styles={buildStyles({
                              pathColor: '#4dabf7',
                              textColor: cardTextColor,
                              trailColor: '#e0e0e0',
                            })}
                          />
                        </div>
                      </div>

                      {/* Gráfico de área */}
                      <div style={{ width: '100%', height: 80 }}>
                        <ResponsiveContainer>
                          <AreaChart data={chartData}>
                            <XAxis dataKey="timestampFormatted" hide />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name) =>
                                name === 'temp'
                                  ? [`${value}°C`, 'Temperatura']
                                  : [`${value}%`, 'Humedad']
                              }
                              labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Area
                              type="monotone"
                              dataKey="temp"
                              stroke={getTemperatureColor(sensor.temp)}
                              fill="rgba(244,67,54,0.2)"
                            />
                            <Area
                              type="monotone"
                              dataKey="hum"
                              stroke="#4dabf7"
                              fill="rgba(77,171,247,0.2)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Estadísticas */}
                      <div className="mt-1">
                        <p className="mb-0" style={{ color: cardTextColor }}>
                          Prom: {stats.avgTemp}°C / {stats.avgHum}%
                        </p>
                        <p className="mb-0" style={{ color: cardTextColor }}>
                          Máx: {stats.maxTemp}°C / {stats.maxHum}%
                        </p>
                        <p className="mb-0" style={{ color: cardTextColor }}>
                          Mín: {stats.minTemp}°C / {stats.minHum}%
                        </p>
                      </div>

                      {/* Botón detalles */}
                      <div className="text-center mt-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => navigate(`/detalle/${encodeURIComponent(name)}`)}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Modales */}
      {showHiddenModal && (
        <Sensores
          hiddenSensors={hiddenSensors}
          showSensor={showSensor}
          onClose={() => setShowHiddenModal(false)}
        />
      )}
      {showConfirmHideModal && (
        <Confirmacion
          sensorName={sensorToHide}
          onConfirm={hideSensor}
          onCancel={() => setShowConfirmHideModal(false)}
        />
      )}
      {showInfoModal && (
        <InfoModal
          title="Aviso"
          message="No se puede crear más servicios, todos los sensores están activos"
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
}
