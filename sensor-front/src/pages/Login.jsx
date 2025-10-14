import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/authSlice';
import loginImg from '../assets/login.jpg';
import axios from 'axios';
import '../styles/Login.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Recuperar contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fpMessage, setFpMessage] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  // Redirigir al dashboard si hay usuario
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Actualizar mensaje de error si cambia
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    dispatch(loginUser({ username, password }));
  };

  const handleForgotPassword = async () => {
    setFpMessage('');
    setFpLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/auth/forgot-password', { email });
      setFpMessage(res.data.message);
    } catch (err) {
      setFpMessage(err.response?.data?.message || 'Error enviando correo');
    }
    setFpLoading(false);
  };

  // Estilos
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      theme === 'dark'
        ? 'linear-gradient(180deg, #1a1a1a, #333)'
        : 'linear-gradient(135deg, #f5f7fa, #e4e9f0)',
    transition: 'background 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    borderRadius: '8px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow:
      theme === 'dark'
        ? '0 0 10px rgba(0,0,0,0.7)'
        : '0 0 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '10px 0',
    borderRadius: '5px',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
    backgroundColor: theme === 'dark' ? '#3c3c3c' : '#f9f9f9',
    color: theme === 'dark' ? '#fff' : '#000',
  };

  const buttonStyle = {
    padding: '8px 12px',
    marginRight: '8px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    backgroundColor: theme === 'dark' ? '#2563eb' : '#60a5fa',
  };

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
    color: theme === 'dark' ? '#fff' : '#000',
  };

  const messageStyle = {
    color: theme === 'dark' ? '#facc15' : '#dc2626',
    marginBottom: '10px',
  };

  const modalStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '300px',
    boxShadow: theme === 'dark' 
      ? '0 0 15px rgba(0,0,0,0.7)'
      : '0 0 15px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div className="text-center mb-4">
          <img
            src={loginImg}
            alt="Foto del usuario"
            className="rounded-circle login-photo"
          />
          <h4 className="mt-2">Iniciar Sesión</h4>
        </div>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <div className="text-start mt-1">
              <button
                type="button"
                className="btn btn-link forgot-password p-0"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                style={{ color: theme === 'dark' ? '#60a5fa' : '#60a5fa' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <button
              type="submit"
              className="btn btn-primary w-50"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        {/* Modal de recuperación */}
        {showForgotPassword && (
          <div style={modalStyle}>
            <div style={modalContentStyle}>
              <h5>Recuperar contraseña</h5>
              {fpMessage && <p style={messageStyle}>{fpMessage}</p>}
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={handleForgotPassword} disabled={fpLoading} style={buttonStyle}>
                  {fpLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
                <button onClick={() => setShowForgotPassword(false)} style={closeButtonStyle}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
