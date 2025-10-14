import React, { useRef, useState } from 'react'; // <-- agrega useState
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { setTheme } from '../redux/themeSlice';
import { useNavigate } from 'react-router-dom';
import defaultPhoto from '../assets/login.jpg';
import PerfilModal from '../modal/Perfil'; // asegúrate que exporte default

import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import Card from '../components/Card';
import '../styles/Dashboard.css';
import Select from 'react-select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPerfilModal, setShowPerfilModal] = useState(false);

  const { user } = useSelector(state => state.auth);
  const sensorsFromRedux = useSelector(state => state.sensors);
  const theme = useSelector(state => state.theme.mode);

  const sensors = Object.keys(sensorsFromRedux).length
    ? sensorsFromRedux
    : JSON.parse(localStorage.getItem('sensors') || '{}');

  const chartRefs = useRef({});
  Object.keys(sensors).forEach(name => {
    if (!chartRefs.current[name]) {
      chartRefs.current[name] = React.createRef();
    }
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: <FiSun style={{ marginRight: 5 }} /> },
    { value: 'dark', label: 'Oscuro', icon: <FiMoon style={{ marginRight: 5 }} /> }
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#343a40' : '#f0f0f0',
      color: theme === 'dark' ? '#fff' : '#000',
      minHeight: '35px',
      borderColor: theme === 'dark' ? '#fff' : '#000',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#000',
      display: 'flex',
      alignItems: 'center',
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: state.isFocused
        ? theme === 'dark'
          ? '#555'
          : '#e0e0e0'
        : theme === 'dark'
        ? '#343a40'
        : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
    }),
  };

  const formatOptionLabel = ({ label, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {icon} <span>{label}</span>
    </div>
  );

  const downloadPDF = async () => {
    try {
      if (!sensors || Object.keys(sensors).length === 0)
        throw new Error("No hay datos disponibles");

      const pdf = new jsPDF('p', 'pt', 'a4');
      const now = new Date();
      const formattedDate = now.toLocaleString();

      const addSensorToPDF = async (sensorName, sensor, pdfInstance) => {
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.backgroundColor = '#ffffff';

        const title = document.createElement('h2');
        title.innerText = `Sensor: ${sensorName} (Región: ${sensor.region})`;
        title.style.textAlign = 'center';
        title.style.color = '#1e3a8a';
        title.style.marginBottom = '10px';
        container.appendChild(title);

        const info = document.createElement('p');
        info.innerText = `Descargado por: ${user?.name || 'Usuario'} (${user?.role || 'Rol'}) - Fecha: ${formattedDate}`;
        info.style.textAlign = 'center';
        info.style.fontStyle = 'italic';
        info.style.marginBottom = '20px';
        info.style.color = '#000';
        container.appendChild(info);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '0';
        table.style.borderRadius = '8px';
        table.style.overflow = 'hidden';
        table.style.marginBottom = '20px';
        table.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['#', 'Temperatura', 'Humedad', 'Fecha y hora'].forEach(text => {
          const th = document.createElement('th');
          th.innerText = text;
          th.style.padding = '10px';
          th.style.backgroundColor = '#1e3a8a';
          th.style.color = '#fff';
          th.style.textAlign = 'center';
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        sensor.history.slice().reverse().forEach((h, i) => {
          const row = document.createElement('tr');
          row.style.backgroundColor = i % 2 === 0 ? '#f0f4ff' : '#ffffff';
          [i + 1, `${h.temp}°C`, `${h.hum}%`, new Date(h.timestamp).toLocaleString()]
            .forEach(cellText => {
              const td = document.createElement('td');
              td.innerText = cellText;
              td.style.padding = '8px';
              td.style.textAlign = 'center';
              td.style.borderBottom = '1px solid #ddd';
              td.style.color = '#000';
              row.appendChild(td);
            });
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);

        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        pdfInstance.addImage(imgData, 'PNG', 30, 30, 540, (canvas.height * 540) / canvas.width);
        document.body.removeChild(container);

        if (sensor.history.length > 0 && chartRefs.current[sensorName]?.current) {
          pdfInstance.addPage();
          const chartCanvas = await html2canvas(chartRefs.current[sensorName].current, { scale: 2, backgroundColor: '#ffffff' });
          const chartImg = chartCanvas.toDataURL('image/png');
          pdfInstance.addImage(chartImg, 'PNG', 30, 30, 540, (chartCanvas.height * 540) / chartCanvas.width);
        }
      };

      let first = true;
      for (const sensorName of Object.keys(sensors)) {
        const sensor = sensors[sensorName];
        if (!first) pdf.addPage();
        await addSensorToPDF(sensorName, sensor, pdf);
        first = false;
      }

      pdf.save(`sensors_report_${now.getTime()}.pdf`);
    } catch (err) {
      alert('No se pudo descargar el PDF: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className={`dashboard-container ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
      <aside className="sidebar">
        <div className="user-info">
          <img
            src={user?.photo || defaultPhoto}
            alt="Foto de usuario"
            className={`user-photo ${theme}-mode`}
          />
          <h5 className="user-name">{user?.name || 'Usuario'}</h5>
          <p className="user-role">{user?.role || 'Rol'}</p>
        </div>

        <div className="menu mt-3 d-flex flex-column gap-2">
          <button className="btn">Servicios</button>
          <button className="btn" onClick={downloadPDF}>Descargar datos</button>

        </div>

        <div className="theme-selector mt-4">
          <label className="fw-bold mb-1">Tema:</label>
          <Select
            options={themeOptions}
            value={themeOptions.find(opt => opt.value === theme)}
            onChange={(selected) => {
              dispatch(setTheme(selected.value));
              localStorage.setItem('theme', selected.value);
            }}
            formatOptionLabel={formatOptionLabel}
            classNamePrefix="react-select"
            styles={customStyles}
          />
        </div>

        
        <div className="logout mt-auto d-flex flex-column gap-2">
          <button className="btn logout-btn d-flex align-items-center gap-2" onClick={() => setShowPerfilModal(true)}>
             Perfil
          </button>
          <button className="btn logout-btn d-flex align-items-center gap-2" onClick={handleLogout}>
            <FiLogOut /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Card sensors={sensors} chartRefs={chartRefs.current} />
      </main>

      {/* Modal */}
      <PerfilModal show={showPerfilModal} onClose={() => setShowPerfilModal(false)} />
    </div>
  );
}
