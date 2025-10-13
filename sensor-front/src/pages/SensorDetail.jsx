import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'react-circular-progressbar/dist/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarLayout from './SidebarLayout';
import { updateSensor } from '../redux/sensorsSlice';

export default function DetalleSensor() {
  const { sensorName: paramName } = useParams();
  const dispatch = useDispatch();
  const sensorsFromRedux = useSelector(state => state.sensors);

  const [expanded, setExpanded] = useState(false);

  const sensors = Object.keys(sensorsFromRedux).length
    ? sensorsFromRedux
    : JSON.parse(localStorage.getItem('sensors') || '{}');

  const sensor = sensors[paramName];

  useEffect(() => {
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socket.on('sensor-data', (data) => dispatch(updateSensor(data)));
    return () => socket.disconnect();
  }, [dispatch]);

  if (!sensor) {
    return (
      <SidebarLayout>
        <div className="container text-center mt-5">
          <h3>Sensor no encontrado</h3>
        </div>
      </SidebarLayout>
    );
  }

  const getTemperatureColor = (temp) => {
    if (temp >= 22 && temp <= 27) return '#4caf50'; // óptima
    if (temp < 22) return '#ff9800'; // baja
    return '#f44336'; // alta
  };

  // Usar todo el historial
  const displayedHistory = expanded
    ? sensor.history.slice().reverse()
    : sensor.history.slice(-5).reverse();

  // Datos para el gráfico
  let chartData = sensor.history.map(h => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    temp: h.temp,
    hum: h.hum
  }));

  return (
    <SidebarLayout>
      <h3>Detalles del sensor: {paramName}</h3>
      <p><strong>Región:</strong> {sensor.region}</p>

      <div className="d-flex justify-content-around my-4">
        <div style={{ width: 150 }}>
          <CircularProgressbar 
            value={sensor.temp} 
            maxValue={50} 
            text={`${sensor.temp}°C`}
            styles={buildStyles({ pathColor: getTemperatureColor(sensor.temp), textColor:'#000' })}
          />
          <p className="text-center">Temperatura</p>
        </div>
        <div style={{ width: 150 }}>
          <CircularProgressbar 
            value={sensor.hum} 
            maxValue={100} 
            text={`${sensor.hum}%`}
            styles={buildStyles({ pathColor: '#4dabf7', textColor:'#000' })}
          />
          <p className="text-center">Humedad</p>
        </div>
      </div>

      <hr />

      <h5>Historial reciente</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Temperatura</th>
            <th>Humedad</th>
            <th>Fecha y hora</th>
          </tr>
        </thead>
        <tbody>
          {displayedHistory.map((h, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td style={{ color: getTemperatureColor(h.temp) }}>{h.temp}°C</td>
              <td>{h.hum}%</td>
              <td>{new Date(h.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sensor.history.length > 5 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Mostrar menos ▲' : 'Mostrar más ▼'}
          </button>
        </div>
      )}

      <hr />

      <h5>Gráfico de evolución</h5>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="temp" stroke="#f44336" name="Temperatura (°C)" />
            <Line type="monotone" dataKey="hum" stroke="#4dabf7" name="Humedad (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SidebarLayout>
  );
}
