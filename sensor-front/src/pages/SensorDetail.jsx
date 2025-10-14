import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'react-circular-progressbar/dist/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarLayout from './SidebarLayout';
import { updateSensor } from '../redux/sensorsSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function DetalleSensor() {
  const { sensorName: paramName } = useParams();
  const dispatch = useDispatch();
  const sensorsFromRedux = useSelector(state => state.sensors);
  const theme = useSelector(state => state.theme.mode);

  const [expanded, setExpanded] = useState(false);

  const sensors = Object.keys(sensorsFromRedux).length
    ? sensorsFromRedux
    : JSON.parse(localStorage.getItem('sensors') || '{}');

  const sensor = sensors[paramName];

  const chartRef = useRef();
  const tableRef = useRef();

  useEffect(() => {
    if (sensorsFromRedux && Object.keys(sensorsFromRedux).length > 0) {
      localStorage.setItem('sensors', JSON.stringify(sensorsFromRedux));
    }
  }, [sensorsFromRedux]);

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

  // 🎨 Colores dinámicos
  const getTemperatureColor = (temp) => {
    if (temp >= 22 && temp <= 27) return '#4caf50';
    if (temp < 22) return '#ff9800';
    return '#f44336';
  };
  const user = useSelector((state) => state.auth.user); // obtiene el usuario desde Redux

  const textColor = theme === 'dark' ? '#fff' : '#000';
  const trailColor = theme === 'dark' ? '#6c757d' : '#e0e0e0';
  const tableBg = theme === 'dark' ? '#212529' : '#fff';
  const tableTextColor = theme === 'dark' ? '#fff' : '#000';
  const tableBorder = theme === 'dark' ? '#495057' : '#dee2e6';

  // 🎨 Botón principal: azul oscuro o rosado claro
  const buttonStyle = {
    backgroundColor: theme === 'dark' ? '#2563eb' : 'rgb(251, 238, 251)',
    color: theme === 'dark' ? '#fff' : '#000',
    border: 'none',
    transition: 'all 0.3s ease',
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#db2777';
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = theme === 'dark' ? '#2563eb' : '#ec4899';
    e.target.style.transform = 'scale(1)';
  };

  const displayedHistory = expanded
    ? sensor.history.slice().reverse()
    : sensor.history.slice(-5).reverse();

  const chartData = sensor.history.map(h => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    temp: h.temp,
    hum: h.hum
  }));

  const downloadPDF = async () => {
  try {
    if (!chartRef.current) throw new Error("Gráfico no disponible");

    const pdf = new jsPDF('p', 'pt', 'a4');

    // Contenedor temporal en modo claro fijo
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';

    // Título
    const title = document.createElement('h2');
    title.innerText = `Reporte Sensor: ${paramName}`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    container.appendChild(title);

    // Información general
    const info = document.createElement('div');
    info.style.marginBottom = '20px';
    info.innerHTML = `
      <p><strong>Región:</strong> ${sensor.region}</p>
      <p><strong>Temperatura actual:</strong> ${sensor.temp}°C</p>
      <p><strong>Humedad actual:</strong> ${sensor.hum}%</p>
      <p><strong>Descargado por:</strong> ${user?.name || 'Desconocido'} (${user?.role || 'Rol'})</p>
    `;
    container.appendChild(info);

    // Tabla con color alternado suave
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
    table.style.backgroundColor = '#ffffff';
    table.style.color = '#000000';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['#', 'Temperatura', 'Humedad', 'Fecha y hora'].forEach(text => {
      const th = document.createElement('th');
      th.innerText = text;
      th.style.padding = '8px';
      th.style.border = '1px solid #dee2e6';
      th.style.backgroundColor = '#e6f0ff'; // color suave para encabezado
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sensor.history.slice().reverse().forEach((h, i) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff'; // alternado suave
      const cells = [
        i + 1,
        `${h.temp}°C`,
        `${h.hum}%`,
        new Date(h.timestamp).toLocaleString()
      ];
      cells.forEach(cellText => {
        const td = document.createElement('td');
        td.innerText = cellText;
        td.style.padding = '8px';
        td.style.border = '1px solid #dee2e6';
        td.style.color = '#000000'; // siempre negro
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    document.body.appendChild(container);

    // Convertir contenedor a imagen
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 30, 30, 540, (canvas.height * 540) / canvas.width);

    // Gráfico
    const chartCanvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const chartImg = chartCanvas.toDataURL('image/png');
    pdf.addPage();
    pdf.addImage(chartImg, 'PNG', 30, 30, 540, (chartCanvas.height * 540) / chartCanvas.width);

    pdf.save(`${paramName}_metricas.pdf`);
    document.body.removeChild(container);

  } catch (err) {
    alert('No se pudo descargar el PDF: ' + err.message);
    console.error(err);
  }
};




  return (
    <SidebarLayout>
      <div className="d-flex justify-content-between align-items-center">
        <h3 style={{ color: textColor }}>Detalles del sensor: {paramName}</h3>
        <button
          className="btn"
          onClick={downloadPDF}
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Descargar Métricas
        </button>
      </div>

      <p style={{ color: textColor }}>
        <strong>Región:</strong> {sensor.region}
      </p>

      <div className="d-flex justify-content-around my-4 flex-wrap gap-3">
        <div style={{ width: 150 }}>
          <CircularProgressbar
            value={sensor.temp}
            maxValue={50}
            text={`${sensor.temp}°C`}
            styles={buildStyles({
              pathColor: getTemperatureColor(sensor.temp),
              textColor,
              trailColor,
            })}
          />
          <p className="text-center" style={{ color: tableTextColor }}>Temperatura</p>
        </div>
        <div style={{ width: 150 }}>
          <CircularProgressbar
            value={sensor.hum}
            maxValue={100}
            text={`${sensor.hum}%`}
            styles={buildStyles({
              pathColor: '#4dabf7',
              textColor,
              trailColor,
            })}
          />
          <p className="text-center" style={{ color: tableTextColor }}>Humedad</p>
        </div>
      </div>

      <hr style={{ borderColor: tableBorder }} />

      <h5 style={{ color: tableTextColor }}>Historial reciente</h5>
      <div ref={tableRef} style={{ overflowX: 'auto' }}>
        <table
          className="shadow-sm rounded"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: tableBg,
            color: tableTextColor,
            border: `1px solid ${tableBorder}`,
            minWidth: 600,
          }}
        >
          <thead
            style={{
              backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
              color: tableTextColor,
            }}
          >
            <tr>
              <th style={{ padding: '10px', borderBottom: `1px solid ${tableBorder}` }}>#</th>
              <th style={{ padding: '10px', borderBottom: `1px solid ${tableBorder}` }}>Temperatura</th>
              <th style={{ padding: '10px', borderBottom: `1px solid ${tableBorder}` }}>Humedad</th>
              <th style={{ padding: '10px', borderBottom: `1px solid ${tableBorder}` }}>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {displayedHistory.map((h, i) => {
              const rowBg = theme === 'dark'
                ? i % 2 === 0 ? '#2c3036' : '#212529'
                : i % 2 === 0 ? '#fefefe' : '#f8f9fa';
              return (
                <tr
                  key={i}
                  style={{
                    backgroundColor: rowBg,
                    borderBottom: `1px solid ${tableBorder}`,
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3a3f45' : '#e9ecef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = rowBg}
                >
                  <td style={{ padding: '10px' }}>{i + 1}</td>
                  <td style={{ padding: '10px', color: getTemperatureColor(h.temp) }}>{h.temp}°C</td>
                  <td style={{ padding: '10px' }}>{h.hum}%</td>
                  <td style={{ padding: '10px' }}>{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>



      {sensor.history.length > 5 && (
        <div className="text-center mb-3">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setExpanded(!expanded)}
            style={{
              color: theme === 'dark' ? '#fff' : '#000',
              borderColor: theme === 'dark' ? '#2563eb' : '#ec4899',
            }}
          >
            {expanded ? 'Mostrar menos ▲' : 'Mostrar más ▼'}
          </button>
        </div>
      )}

      <hr style={{ borderColor: tableBorder }} />

      <h5 style={{ color: tableTextColor }}>Gráfico de evolución</h5>
      <div
          ref={chartRef}
          className="rounded shadow-sm p-3"
          style={{
            width: '100%',
            height: 320,
            backgroundColor: 'transparent', // 🔹 sin fondo
          }}
      >
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="timestamp" stroke={tableTextColor} />
            <YAxis stroke={tableTextColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: tableBg,
                borderColor: tableBorder,
                color: tableTextColor,
              }}
            />
            <Legend
              wrapperStyle={{ color: tableTextColor }}
              verticalAlign="top"
              height={36}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#f44336"
              name="Temperatura (°C)"
            />
            <Line
              type="monotone"
              dataKey="hum"
              stroke="#4dabf7"
              name="Humedad (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SidebarLayout>
  );
}
