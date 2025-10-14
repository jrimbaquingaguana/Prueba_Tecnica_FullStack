import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { setTheme } from '../redux/themeSlice';
import { useNavigate } from 'react-router-dom';
import defaultPhoto from '../assets/login.jpg';
import { FiLogOut, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import Select from 'react-select';
import '../styles/Dashboard.css';

export default function SidebarLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: <FiSun style={{ marginRight: 5 }} /> },
    { value: 'dark', label: 'Oscuro', icon: <FiMoon style={{ marginRight: 5 }} /> },
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

        <div className="menu mt-3">
          <button className="btn" onClick={() => navigate('/dashboard')}>
            Servicios
          </button>
        </div>

        <div className="theme-selector mt-4">
          <label className="fw-bold mb-1">Tema:</label>
          <Select
            options={themeOptions}
            value={themeOptions.find((opt) => opt.value === theme)}
            onChange={(selected) => dispatch(setTheme(selected.value))}
            formatOptionLabel={formatOptionLabel}
            classNamePrefix="react-select"
            styles={customStyles}
          />
        </div>

        <div className="logout mt-auto d-flex flex-column gap-2">
          <button className="btn" onClick={() => navigate('/perfil')}>
            Perfil
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
