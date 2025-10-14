import React from 'react';
import { useSelector } from 'react-redux';
import defaultPhoto from '../assets/login.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Perfil.css';

export default function PerfilModal({ show, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);

  if (!show || !user) return null;

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '12px',
          boxShadow: theme === 'dark' ? '0 0 20px rgba(255,255,255,0.1)' : '0 0 20px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}
          style={{ borderRadius: '12px', padding: '1rem' }}
        >
          <div className="modal-header border-0">
            <h5 className="modal-title">Perfil de Usuario</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center">
            <img
              src={user.photo || defaultPhoto}
              alt="Foto de usuario"
              className="rounded-circle mb-3"
              style={{ width: '120px', height: '120px', objectFit: 'cover', border: `2px solid ${theme === 'dark' ? '#fff' : '#000'}` }}
            />
            <h4 className="mb-1">{user.name}</h4>
            <p className="mb-1"><strong>Rol:</strong> {user.role}</p>
            <p className="mb-1"><strong>Correo:</strong> {user.email}</p>
          </div>

          <div className="modal-footer border-0 justify-content-center">
            <button className="btn btn-primary px-4" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
