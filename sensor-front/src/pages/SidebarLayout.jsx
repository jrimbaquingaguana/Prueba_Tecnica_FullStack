import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import defaultPhoto from '../assets/login.jpg';
import { FiLogOut } from 'react-icons/fi';
import '../styles/Dashboard.css';

export default function SidebarLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="user-info">
          <img
            src={user?.photo || defaultPhoto}
            alt="Foto de usuario"
            className="user-photo"
          />
          <h5 className="user-name">{user?.name || 'Usuario'}</h5>
          <p className="user-role">{user?.role || 'Rol'}</p>
        </div>

        <div className="menu">
          <button className="btn" onClick={() => navigate('/dashboard')}>Servicios</button>
        </div>

        <div className="logout">
          <button className="btn logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
