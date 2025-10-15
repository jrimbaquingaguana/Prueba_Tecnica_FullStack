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
import { WiThermometer, WiHumidity } from "react-icons/wi"; 
import { FaTemperatureHigh, FaTemperatureLow } from "react-icons/fa"; 


// Modal informativo
function InfoModal({ title, message, onClose, theme }) {
  const modalBg = theme === 'dark' ? '#2c2c2c' : '#fff';
  const modalColor = theme === 'dark' ? '#fff' : '#000';
  

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog" style={{ borderRadius: '20px', overflow: 'hidden' }}>
         <div className="modal-content" style={{ backgroundColor: modalBg, color: modalColor }}>
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
  const theme = useSelector((state) => state.theme.mode);
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
  const cardTextColor = theme === 'dark' ? '#fff' : '#000';

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

  // Estilos del botón "Crear sensor"
  const createButtonStyle = {
    backgroundColor: theme === 'dark' ? '#2563eb' : '#e871acff',
    borderColor: theme === 'dark' ? '#2563eb' : '#eeaaccff',
    color: '#fff',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  };

  const getButtonHoverColors = () =>
    theme === 'dark'
      ? { bg: '#1e40af', border: '#1e40af' }
      : { bg: '#db2777', border: '#db2777' };

  const handleMouseEnter = (e) => {
    const { bg, border } = getButtonHoverColors();
    e.target.style.backgroundColor = bg;
    e.target.style.borderColor = border;
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = theme === 'dark' ? '#2563eb' : '#ec4899';
    e.target.style.borderColor = theme === 'dark' ? '#2563eb' : '#ec4899';
    e.target.style.transform = 'scale(1)';
  };

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

  // Estilos dinámicos para input y select
  const inputStyle = {
    width: '200px',
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f0f0f0',
    color: theme === 'dark' ? '#fff' : '#000',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
    borderRadius: '4px',
    paddingLeft: '8px',
  };

  const selectStyle = {
    width: '150px',
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f0f0f0',
    color: theme === 'dark' ? '#fff' : '#000',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
    borderRadius: '4px',
  };

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '1rem' }}>
      {/* Barra superior */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="region-select" className="fw-bold" style={{ color: cardTextColor }}>
            Filtrar por región:
          </label>
          <select
            id="region-select"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="form-select"
            style={selectStyle}
          >
            <option value="">Todas</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Crear Sensor */}
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
          style={inputStyle}
        />
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredSensors.length === 0 && (
        <div
          className={`alert alert-warning text-center`}
          style={{ color: theme === 'dark' ? '#fff' : '#000', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff' }}
        >
          No se encontró ningún sensor con ese nombre o criterio de búsqueda.
        </div>
      )}

      {/* Tarjetas por región */}
      {regions.map((region) => {
        const sensorsInRegion = filteredSensors.filter(([_, s]) => s.region === region);
        if (sensorsInRegion.length === 0) return null;
        return (
          <div key={region} className="mb-4">
            <h4 className="border-bottom pb-1" style={{ color: cardTextColor  }}>
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
                          Eliminar
                        </button>
                      </div>

                      <div className="d-flex justify-content-around mb-2">
                        <div style={{ width: 60 , marginTop:10}}>
                          <CircularProgressbar
                            value={sensor.temp}
                            maxValue={50}
                            text={`${sensor.temp}°C`}
                            styles={buildStyles({
                              pathColor: getTemperatureColor(sensor.temp),
                              textColor: cardTextColor,
                              trailColor: theme === 'dark' ? '#555' : '#e0e0e0',
                            })}
                          />
                        </div>
                        <div style={{ width: 60,marginTop:10 }}>
                          <CircularProgressbar
                            value={sensor.hum}
                            maxValue={100}
                            text={`${sensor.hum}%`}
                            styles={buildStyles({
                              pathColor: '#4dabf7',
                              textColor: cardTextColor,
                              trailColor: theme === 'dark' ? '#555' : '#e0e0e0',
                            })}
                          />
                        </div>
                      </div>

                      <div style={{ width: '100%', height: 80,  marginLeft: -40 , marginTop:10 }}>
                        <ResponsiveContainer width="110%" height="100%">
                          <AreaChart data={chartData}>
                            <XAxis dataKey="timestampFormatted" hide />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? 'rgba(44,44,44,0.9)' : 'rgba(255,255,255,0.9)', // fondo semi-transparente
                                border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                                color: cardTextColor,
                                borderRadius: '12px', // bordes redondeados
                                 padding: '10px',
                              }}
                              itemStyle={{ color: cardTextColor }}
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
                              fill={theme === 'dark' ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}
                            />
                            <Area
                              type="monotone"
                              dataKey="hum"
                              stroke="#4dabf7"
                              fill={theme === 'dark' ? 'rgba(77,171,247,0.2)' : 'rgba(77,171,247,0.2)'}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div
                        className="mt-2"
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          justifyContent: 'center', // centra verticalmente si hay altura definida
                          alignItems: 'center', // centra horizontalmente todo el bloque
                          textAlign: 'center', // centra texto dentro de los <p>
                        }}
                      >
                        {/* Promedio */}
                        <p
                          className="mb-0"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            justifyContent: 'center', // centra íconos y texto en la fila
                          }}
                        >
                          <WiThermometer size={20} color="#4caf50" /> 
                          Prom: <span style={{ fontWeight: '700' }}>{stats.avgTemp}°C</span> / 
                          <WiHumidity size={20} color="#4dabf7" /> <span style={{ fontWeight: '700' }}>{stats.avgHum}%</span>
                        </p>

                        {/* Máximo */}
                        <p
                          className="mb-0"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            justifyContent: 'center',
                          }}
                        >
                          <FaTemperatureHigh size={20} color="#f44336" /> 
                          Máx: <span style={{ fontWeight: '700' }}>{stats.maxTemp}°C</span> / 
                          <WiHumidity size={20} color="#4dabf7" /> <span style={{ fontWeight: '700' }}>{stats.maxHum}%</span>
                        </p>

                        {/* Mínimo */}
                        <p
                          className="mb-0"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            justifyContent: 'center',
                          }}
                        >
                          <FaTemperatureLow size={20} color="#ff9800" /> 
                          Mín: <span style={{ fontWeight: '700' }}>{stats.minTemp}°C</span> / 
                          <WiHumidity size={20} color="#4dabf7" /> <span style={{ fontWeight: '700' }}>{stats.minHum}%</span>
                        </p>
                      </div>






                      <div className="text-center mt-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          style={{
                            color: theme === 'dark' ? '#fff' : '#000',
                            borderColor: theme === 'dark' ? '#2563eb' : '#0d6efd',
                          }}
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
          theme={theme}
        />
      )}
      {showConfirmHideModal && (
        <Confirmacion
          sensorName={sensorToHide}
          onConfirm={hideSensor}
          onCancel={() => setShowConfirmHideModal(false)}
          theme={theme}
        />
      )}
      {showInfoModal && (
        <InfoModal
          title="Aviso"
          message="No se puede crear más servicios, todos los sensores están activos"
          onClose={() => setShowInfoModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

