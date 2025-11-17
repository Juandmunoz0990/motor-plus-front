import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, Home, Users, Car, FileText, UserCheck, Settings, Package, Truck, Receipt, BarChart3, Lock } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/authService';
import ChangePasswordModal from '../ChangePasswordModal';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
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
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-8">
              <div className="flex-shrink-0 flex items-center">
                <Wrench className="h-6 w-6 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-secondary-900">Motor Plus</span>
              </div>
            </Link>
            <div className="hidden sm:flex sm:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              className="inline-flex items-center px-3 py-2 border border-secondary-300 text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="Cambiar contraseña"
            >
              <Lock className="h-4 w-4 mr-1" />
              Contraseña
            </button>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-primary-500 text-sm leading-4 font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
    </nav>
  );
};

export default Navbar;

