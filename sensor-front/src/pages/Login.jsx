import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/authSlice';
import loginImg from '../assets/login.jpg';
import '../styles/Login.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    dispatch(loginUser({ username, password }));
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña aún no implementada.');
  };

  useEffect(() => {
    if (user) {
      // Redirige al dashboard si el login es exitoso
      navigate('/dashboard');
    }
    if (error) {
      // Muestra un mensaje de error si falla
      setErrorMessage(error);
    }
  }, [user, error, navigate]);

  return (
    <div className="login-container">
      <div className="card shadow p-4 login-card">
        <div className="text-center mb-4">
          {/* Solo mostramos la foto por defecto al iniciar sesión */}
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
            />
            <div className="text-start mt-1">
              <button
                type="button"
                className="btn btn-link forgot-password p-0"
                onClick={handleForgotPassword}
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
      </div>
    </div>
  );
}
