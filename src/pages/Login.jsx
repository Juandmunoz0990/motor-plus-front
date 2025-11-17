import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate('/');
    } catch (err) {
      // Manejo de errores más detallado
      if (err.response) {
        // Error del servidor
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 500) {
          // Error interno del servidor (problema de base de datos, etc.)
          setError('Error del servidor. Por favor, verifica que la base de datos esté configurada correctamente.');
          console.error('Error del servidor:', errorData);
        } else if (status === 401) {
          // No autorizado
          setError('Usuario o contraseña incorrectos');
        } else if (status === 404) {
          // Endpoint no encontrado
          setError('El servicio de autenticación no está disponible');
        } else {
          // Otros errores
          setError(errorData?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
      } else if (err.request) {
        // Error de conexión
        setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
        console.error('Error de conexión:', err.message);
      } else {
        // Otro tipo de error
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
        console.error('Error:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <Wrench className="h-10 w-10 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Motor Plus</h1>
            <p className="text-secondary-600">Sistema de Gestión de Taller</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

