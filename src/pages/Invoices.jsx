import { useState, useEffect } from 'react';
import { Plus, Search, Eye, FileText, DollarSign } from 'lucide-react';
import { invoicesService } from '../services/invoicesService';
import { ordersService } from '../services/ordersService';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

const INVOICE_STATUSES = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'ISSUED', label: 'Emitida' },
  { value: 'PAID', label: 'Pagada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await invoicesService.getAll(params);
      setInvoices(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await ordersService.getAll({ size: 100, status: 'COMPLETED' });
      setOrders(response.data.content || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleGenerateFromOrder = async (orderId) => {
    if (window.confirm('¿Generar factura desde esta orden?')) {
      try {
        await invoicesService.generateFromOrder(orderId);
        loadInvoices();
        alert('Factura generada exitosamente');
      } catch (error) {
        console.error('Error generating invoice:', error);
        alert('Error al generar la factura');
      }
    }
  };

  const handleView = async (invoice) => {
    try {
      const fullInvoice = await invoicesService.getById(invoice.id);
      setSelectedInvoice(fullInvoice.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error loading invoice details:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-secondary-100 text-secondary-800',
      ISSUED: 'bg-primary-100 text-primary-800',
      PAID: 'bg-success-100 text-success-800',
      CANCELLED: 'bg-secondary-100 text-secondary-800',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Facturas</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Gestiona las facturas del taller
        </p>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Filtrar por Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="input"
            >
              <option value="">Todos</option>
              {INVOICE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fecha Emisión
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                        No hay facturas registradas
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {invoice.number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {INVOICE_STATUSES.find((s) => s.value === invoice.status)?.label ||
                              invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {formatPrice(invoice.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {formatPrice(invoice.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">
                            {invoice.issueDate
                              ? new Date(invoice.issueDate).toLocaleDateString('es-ES')
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Generar Factura desde Orden
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-secondary-500">
                        No hay órdenes completadas disponibles
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {order.licensePlate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {formatPrice(order.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleGenerateFromOrder(order.id)}
                            className="btn btn-primary text-sm"
                          >
                            Generar Factura
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Factura"
        size="xl"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Número</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedInvoice.number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Estado</label>
                <p className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      selectedInvoice.status
                    )}`}
                  >
                    {INVOICE_STATUSES.find((s) => s.value === selectedInvoice.status)?.label ||
                      selectedInvoice.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Total</label>
                <p className="mt-1 text-sm text-secondary-900">{formatPrice(selectedInvoice.total)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Saldo</label>
                <p className="mt-1 text-sm text-secondary-900">{formatPrice(selectedInvoice.balance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha de Emisión</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {selectedInvoice.issueDate
                    ? new Date(selectedInvoice.issueDate).toLocaleDateString('es-ES')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha de Vencimiento</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {selectedInvoice.dueDate
                    ? new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;

