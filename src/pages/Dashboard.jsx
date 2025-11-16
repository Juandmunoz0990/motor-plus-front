import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Package, 
  Receipt, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { clientsService } from '../services/clientsService';
import { ordersService } from '../services/ordersService';
import { partsService } from '../services/partsService';
import { invoicesService } from '../services/invoicesService';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    accent: 'bg-accent-50 text-accent-600',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-success-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0,
    orders: 0,
    parts: 0,
    invoices: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, ordersRes, partsRes, invoicesRes] = await Promise.all([
          clientsService.getAll({ size: 1 }),
          ordersService.getAll({ size: 1 }),
          partsService.getAll({ size: 1 }),
          invoicesService.getAll({ size: 1 }),
        ]);

        // Obtener órdenes pendientes y completadas
        const allOrders = await ordersService.getAll({ size: 100 });
        const pendingOrders = allOrders.data.content?.filter(
          (order) => order.status === 'DRAFT' || order.status === 'IN_PROGRESS'
        ).length || 0;
        const completedOrders = allOrders.data.content?.filter(
          (order) => order.status === 'COMPLETED'
        ).length || 0;

        setStats({
          clients: clientsRes.data.totalElements || 0,
          orders: ordersRes.data.totalElements || 0,
          parts: partsRes.data.totalElements || 0,
          invoices: invoicesRes.data.totalElements || 0,
          pendingOrders,
          completedOrders,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Resumen general del sistema Motor Plus
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Clientes"
          value={stats.clients}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Órdenes Activas"
          value={stats.orders}
          icon={FileText}
          color="secondary"
        />
        <StatCard
          title="Repuestos"
          value={stats.parts}
          icon={Package}
          color="success"
        />
        <StatCard
          title="Facturas"
          value={stats.invoices}
          icon={Receipt}
          color="accent"
        />
        <StatCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          icon={Clock}
          color="accent"
        />
        <StatCard
          title="Órdenes Completadas"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/orders')}
              className="w-full btn btn-primary text-left"
            >
              + Nueva Orden
            </button>
            <button 
              onClick={() => navigate('/clients')}
              className="w-full btn btn-secondary text-left"
            >
              + Nuevo Cliente
            </button>
            <button 
              onClick={() => navigate('/services')}
              className="w-full btn btn-secondary text-left"
            >
              + Nuevo Servicio
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Estado del Sistema
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                <span className="text-sm font-medium text-success-900">
                  Sistema Operativo
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-900">
                  {stats.pendingOrders} Órdenes Requieren Atención
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

