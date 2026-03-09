import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users,
  FileText,
  Package,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { clientsService } from '../services/clientsService';
import { ordersService } from '../services/ordersService';
import { partsService } from '../services/partsService';
import { invoicesService } from '../services/invoicesService';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, onClick }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    accent: 'bg-accent-50 text-accent-600',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <div
      className={`card transition-shadow ${onClick ? 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary-200' : 'hover:shadow-md'}`}
      onClick={onClick}
    >
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

const ORDER_COLORS = {
  DRAFT: '#94a3b8',
  SCHEDULED: '#60a5fa',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#f87171',
};

const ORDER_LABELS = {
  DRAFT: 'Borrador',
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
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
  const [ordersByStatus, setOrdersByStatus] = useState([]);
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

        const statuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        const statusResults = await Promise.all(
          statuses.map((status) => ordersService.getAll({ size: 1, status }))
        );

        const statusCounts = statuses.map((status, i) => ({
          status,
          label: ORDER_LABELS[status],
          count: statusResults[i].data.totalElements || 0,
        }));

        const pendingOrders =
          (statusResults[0].data.totalElements || 0) +
          (statusResults[1].data.totalElements || 0) +
          (statusResults[2].data.totalElements || 0);
        const completedOrders = statusResults[3].data.totalElements || 0;

        setStats({
          clients: clientsRes.data.totalElements || 0,
          orders: ordersRes.data.totalElements || 0,
          parts: partsRes.data.totalElements || 0,
          invoices: invoicesRes.data.totalElements || 0,
          pendingOrders,
          completedOrders,
        });
        setOrdersByStatus(statusCounts.filter((s) => s.count > 0));
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Clientes"
          value={stats.clients}
          icon={Users}
          color="primary"
          onClick={() => navigate('/clients')}
        />
        <StatCard
          title="Total Órdenes"
          value={stats.orders}
          icon={FileText}
          color="secondary"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Repuestos"
          value={stats.parts}
          icon={Package}
          color="success"
          onClick={() => navigate('/parts')}
        />
        <StatCard
          title="Facturas"
          value={stats.invoices}
          icon={Receipt}
          color="accent"
          onClick={() => navigate('/invoices')}
        />
        <StatCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          icon={Clock}
          color="accent"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Órdenes Completadas"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="success"
          onClick={() => navigate('/orders')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Bar chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Órdenes por Estado
          </h2>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersByStatus} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [value, 'Cantidad']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={ORDER_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Distribución de Órdenes
          </h2>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ label, percent }) =>
                    `${label} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={ORDER_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
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
            <div
              className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors"
              onClick={() => navigate('/orders')}
            >
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
