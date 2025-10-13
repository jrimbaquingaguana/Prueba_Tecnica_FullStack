import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { setTheme } from '../redux/themeSlice';
import { useNavigate } from 'react-router-dom';
import defaultPhoto from '../assets/login.jpg';
import { FiLogOut, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import Card from '../components/Card';
import '../styles/Dashboard.css';
import Select from 'react-select';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const themeOptions = [
    { value: 'auto', label: 'Automático', icon: <FiMonitor style={{ marginRight: 5 }} /> },
    { value: 'light', label: 'Claro', icon: <FiSun style={{ marginRight: 5 }} /> },
    { value: 'dark', label: 'Oscuro', icon: <FiMoon style={{ marginRight: 5 }} /> },
  ];

  const customStyles = {
    control: (provided) => ({ ...provided, backgroundColor: 'white', color: 'black', minHeight: '35px' }),
    singleValue: (provided, state) => {
      const option = themeOptions.find(opt => opt.value === state.getValue()[0]?.value);
      return { ...provided, display: 'flex', alignItems: 'center', color: 'black' };
    },
    option: (provided, state) => ({ ...provided, display: 'flex', alignItems: 'center', backgroundColor: state.isFocused ? '#e0e0e0' : 'white', color: 'black' }),
    menu: (provided) => ({ ...provided, backgroundColor: 'white' }),
  };

  // Render custom option para mostrar icono
  const formatOptionLabel = ({ label, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {icon} <span>{label}</span>
    </div>
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="user-info">
          <img src={user?.photo || defaultPhoto} alt="Foto de usuario" className="user-photo" />
          <h5 className="user-name">{user?.name || 'Usuario'}</h5>
          <p className="user-role">{user?.role || 'Rol'}</p>
        </div>

        <div className="menu mt-3">
          <button className="btn" onClick={() => navigate('/servicios')}>Servicios</button>
        </div>

        <div className="theme-selector mt-4">
          <label className="fw-bold mb-1">Tema:</label>
          <Select
            options={themeOptions}
            value={themeOptions.find(opt => opt.value === theme)}
            onChange={(selected) => dispatch(setTheme(selected.value))}
            formatOptionLabel={formatOptionLabel}
            classNamePrefix="react-select"
            styles={customStyles}
          />
        </div>

        <div className="logout mt-auto d-flex flex-column gap-2">
          <button className="btn" onClick={() => navigate('/perfil')}>Perfil</button>
          <button className="btn logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Card />
      </main>
    </div>
  );
}
