import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-secondary-600">Verificando tu correo electrónico...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">¡Correo verificado!</h2>
            <p className="text-secondary-600 mb-6">Tu cuenta ha sido activada. Ya puedes iniciar sesión.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Ir al inicio de sesión
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Enlace inválido</h2>
            <p className="text-secondary-600 mb-6">El enlace de verificación es inválido o ya fue utilizado.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Ir al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
