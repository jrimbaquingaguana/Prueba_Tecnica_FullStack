import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Tema desde Redux (por defecto oscuro)
  const themeFromRedux = useSelector((state) => state.theme.mode);
  const theme = themeFromRedux || 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar contraseña');
      }

      setSuccessMessage('✅ Contraseña actualizada con éxito. Redirigiendo al login...');
      setTimeout(() => navigate('/'), 2000); // Redirige después de 2s
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme === 'dark'
      ? 'linear-gradient(180deg, #1a1a1a, #333)'
      : 'linear-gradient(135deg, #f5f7fa, #e4e9f0)',
    padding: '1rem',
    transition: 'background 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    borderRadius: '8px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: theme === 'dark'
      ? '0 0 10px rgba(0,0,0,0.7)'
      : '0 0 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
    backgroundColor: theme === 'dark' ? '#3c3c3c' : '#f9f9f9',
    color: theme === 'dark' ? '#fff' : '#000',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: theme === 'dark' ? '#2563eb' : '#f472b6',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
  };

  const messageStyle = {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '5px',
    color: theme === 'dark' ? '#fff' : '#000',
    backgroundColor: successMessage
      ? theme === 'dark' ? '#065f46' : '#d1fae5'
      : theme === 'dark' ? '#b91c1c' : '#fee2e2',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '20px' }}>Restablecer contraseña</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </form>

        {successMessage && <div style={messageStyle}>{successMessage}</div>}
        {errorMessage && !successMessage && <div style={messageStyle}>{errorMessage}</div>}

        {/* Placeholder dinámico */}
        <style>
          {`
            input::placeholder {
              color: ${theme === 'dark' ? '#ccc' : '#888'};
              opacity: 1;
            }
          `}
        </style>
      </div>
    </div>
  );
}
