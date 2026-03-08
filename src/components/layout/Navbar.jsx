import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, Home, Users, Car, FileText, UserCheck, Settings, Package, Truck, Receipt, BarChart3, Lock, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/authService';
import ChangePasswordModal from '../ChangePasswordModal';
import RegisterAdminModal from '../RegisterAdminModal';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'Home' },
    { name: 'Clientes', href: '/clients', icon: 'Users' },
    { name: 'Vehículos', href: '/vehicles', icon: 'Car' },
    { name: 'Órdenes', href: '/orders', icon: 'FileText' },
    { name: 'Mecánicos', href: '/mechanics', icon: 'UserCheck' },
    { name: 'Servicios', href: '/services', icon: 'Settings' },
    { name: 'Repuestos', href: '/parts', icon: 'Package' },
    { name: 'Proveedores', href: '/suppliers', icon: 'Truck' },
    { name: 'Facturas', href: '/invoices', icon: 'Receipt' },
    { name: 'Reportes', href: '/reports', icon: 'BarChart' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fila superior: logo + botones de acción */}
        <div className="flex justify-between items-center h-14 border-b border-secondary-100">
          <Link to="/" className="flex items-center">
            <Wrench className="h-6 w-6 text-primary-500" />
            <span className="ml-2 text-xl font-bold text-secondary-900">Motor Plus</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="Registrar nuevo administrador"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Nuevo Admin
            </button>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="Cambiar contraseña"
            >
              <Lock className="h-4 w-4 mr-1" />
              Contraseña
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="mr-1">→</span>
              Salir
            </button>
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {/* Fila inferior: links de navegación */}
        <div className="hidden sm:flex sm:space-x-6 h-10 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 hover:text-secondary-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 hover:text-secondary-800"
            >
              <span className="mr-1">→</span>
              Salir
            </button>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <RegisterAdminModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </nav>
  );
};

export default Navbar;

