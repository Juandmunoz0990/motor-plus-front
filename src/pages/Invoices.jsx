import { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, ArrowRight } from 'lucide-react';
import { invoicesService } from '../services/invoicesService';
import { ordersService } from '../services/ordersService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Pagination from '../components/ui/Pagination';

const INVOICE_STATUSES = [
  { value: 'DRAFT',     label: 'Borrador' },
  { value: 'ISSUED',    label: 'Emitida' },
  { value: 'PAID',      label: 'Pagada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const STATUS_TRANSITIONS = {
  DRAFT:     ['ISSUED', 'CANCELLED'],
  ISSUED:    ['PAID', 'CANCELLED'],
  PAID:      [],
  CANCELLED: [],
};

const PAYMENT_METHODS = [
  { value: 'CASH',     label: 'Efectivo' },
  { value: 'CARD',     label: 'Tarjeta' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'OTHER',    label: 'Otro' },
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
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [invoicePayments, setInvoicePayments] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({ amount: '', method: 'CASH', reference: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 20, ...(statusFilter && { status: statusFilter }) };
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

  const loadInvoiceDetail = async (invoiceId) => {
    setDetailLoading(true);
    try {
      const [linesRes, paymentsRes] = await Promise.all([
        invoicesService.getLines(invoiceId),
        invoicesService.getPayments(invoiceId),
      ]);
      setInvoiceLines(linesRes.data.content || linesRes.data || []);
      setInvoicePayments(paymentsRes.data.content || paymentsRes.data || []);
    } catch (error) {
      console.error('Error loading invoice detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleView = async (invoice) => {
    try {
      const fullInvoice = await invoicesService.getById(invoice.id);
      setSelectedInvoice(fullInvoice.data);
      setInvoiceLines([]);
      setInvoicePayments([]);
      setIsViewModalOpen(true);
      await loadInvoiceDetail(invoice.id);
    } catch (error) {
      console.error('Error loading invoice details:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedInvoice) return;
    setStatusLoading(true);
    try {
      const updated = await invoicesService.update(selectedInvoice.id, { status: newStatus });
      const refreshed = updated.data || { ...selectedInvoice, status: newStatus };
      setSelectedInvoice(refreshed);
      loadInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar el estado');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGenerateFromOrder = async (orderId) => {
    if (window.confirm('¿Generar factura desde esta orden?')) {
      try {
        await invoicesService.generateFromOrder(orderId);
        loadInvoices();
        loadOrders();
        alert('Factura generada exitosamente');
      } catch (error) {
        alert(error.response?.data?.message || 'Error al generar la factura');
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaymentLoading(true);
    try {
      await invoicesService.addPayment(selectedInvoice.id, {
        amount: parseFloat(paymentFormData.amount),
        method: paymentFormData.method,
        reference: paymentFormData.reference || null,
      });
      setIsPaymentModalOpen(false);
      setPaymentFormData({ amount: '', method: 'CASH', reference: '' });
      // Recargar factura y pagos
      const [fullInvoice] = await Promise.all([
        invoicesService.getById(selectedInvoice.id),
        loadInvoiceDetail(selectedInvoice.id),
      ]);
      setSelectedInvoice(fullInvoice.data);
      loadInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRemovePayment = async (paymentId) => {
    if (!window.confirm('¿Eliminar este pago?')) return;
    try {
      await invoicesService.removePayment(selectedInvoice.id, paymentId);
      const [fullInvoice] = await Promise.all([
        invoicesService.getById(selectedInvoice.id),
        loadInvoiceDetail(selectedInvoice.id),
      ]);
      setSelectedInvoice(fullInvoice.data);
      loadInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar el pago');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT:     'bg-secondary-100 text-secondary-800',
      ISSUED:    'bg-primary-100 text-primary-800',
      PAID:      'bg-success-100 text-success-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.DRAFT;
  };

  const getStatusLabel = (status) => {
    return INVOICE_STATUSES.find((s) => s.value === status)?.label || status;
  };

  const nextStatuses = selectedInvoice ? (STATUS_TRANSITIONS[selectedInvoice.status] || []) : [];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Facturas</h1>
        <p className="mt-2 text-sm text-secondary-600">Gestiona las facturas del taller</p>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Filtrar por Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              className="input"
            >
              <option value="">Todos</option>
              {INVOICE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
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
          {/* Tabla de facturas */}
          <div className="card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Saldo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Fecha Emisión</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Acciones</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {formatPrice(invoice.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {formatPrice(invoice.balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatDate(invoice.issueDate)}
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
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>

          {/* Generar factura desde orden */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Generar Factura desde Orden</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Placa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Acción</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {order.licensePlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={() => handleGenerateFromOrder(order.id)} className="btn btn-primary text-sm">
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

      {/* Modal detalle de factura */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedInvoice(null); }}
        title={`Factura ${selectedInvoice?.number || ''}`}
        size="xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Info general */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Número</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedInvoice.number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Estado</label>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                  {nextStatuses.map((next) => (
                    <button
                      key={next}
                      onClick={() => handleStatusChange(next)}
                      disabled={statusLoading}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-secondary-300 text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {getStatusLabel(next)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Total</label>
                <p className="mt-1 text-sm font-semibold text-secondary-900">{formatPrice(selectedInvoice.total)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Saldo Pendiente</label>
                <p className={`mt-1 text-sm font-semibold ${selectedInvoice.balance > 0 ? 'text-red-600' : 'text-success-600'}`}>
                  {formatPrice(selectedInvoice.balance)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha de Emisión</label>
                <p className="mt-1 text-sm text-secondary-900">{formatDate(selectedInvoice.issueDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha de Vencimiento</label>
                <p className="mt-1 text-sm text-secondary-900">{formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Líneas de factura */}
                <div>
                  <h3 className="text-md font-semibold text-secondary-900 mb-3">Líneas de Factura</h3>
                  {invoiceLines.length === 0 ? (
                    <p className="text-sm text-secondary-500">No hay líneas registradas.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200 text-sm">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Tipo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Descripción</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-secondary-500 uppercase">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {invoiceLines.map((line, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-secondary-500">{line.type}</td>
                              <td className="px-4 py-2 text-secondary-900">{line.description || '-'}</td>
                              <td className="px-4 py-2 text-right font-medium text-secondary-900">{formatPrice(line.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold text-secondary-900">Pagos Registrados</h3>
                    {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="btn btn-primary text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Registrar Pago
                      </button>
                    )}
                  </div>
                  {invoicePayments.length === 0 ? (
                    <p className="text-sm text-secondary-500">No hay pagos registrados.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200 text-sm">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Fecha</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Método</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Referencia</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-secondary-500 uppercase">Monto</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {invoicePayments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-4 py-2 text-secondary-500">{formatDate(payment.paymentDate)}</td>
                              <td className="px-4 py-2 text-secondary-900">
                                {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || payment.method}
                              </td>
                              <td className="px-4 py-2 text-secondary-500">{payment.reference || '-'}</td>
                              <td className="px-4 py-2 text-right font-medium text-success-700">{formatPrice(payment.amount)}</td>
                              <td className="px-4 py-2 text-right">
                                {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => handleRemovePayment(payment.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Eliminar pago"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal registrar pago */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setPaymentFormData({ amount: '', method: 'CASH', reference: '' }); }}
        title="Registrar Pago"
        size="md"
      >
        <form onSubmit={handleAddPayment}>
          <FormInput
            label="Monto"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={paymentFormData.amount}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
            required
          />
          <FormSelect
            label="Método de Pago"
            name="method"
            value={paymentFormData.method}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, method: e.target.value })}
            options={PAYMENT_METHODS}
          />
          <FormInput
            label="Referencia (opcional)"
            name="reference"
            value={paymentFormData.reference}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, reference: e.target.value })}
            placeholder="Nº transferencia, recibo, etc."
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { setIsPaymentModalOpen(false); setPaymentFormData({ amount: '', method: 'CASH', reference: '' }); }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={paymentLoading} className="btn btn-primary">
              {paymentLoading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;
