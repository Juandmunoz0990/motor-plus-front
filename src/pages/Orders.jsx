import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle, Wrench, UserCheck, Package, Users } from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { clientsService } from '../services/clientsService';
import { servicesService } from '../services/servicesService';
import { mechanicsService } from '../services/mechanicsService';
import { partsService } from '../services/partsService';
import { supervisionsService } from '../services/supervisionsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import FormTextarea from '../components/ui/FormTextarea';
import Pagination from '../components/ui/Pagination';

const ORDER_STATUSES = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isSupervisionModalOpen, setIsSupervisionModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);
  const [supervisions, setSupervisions] = useState([]);
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [parts, setParts] = useState([]);
  const [supervisionFormData, setSupervisionFormData] = useState({
    supervisorId: '',
    supervisadoId: '',
    notes: '',
  });
  const [itemFormData, setItemFormData] = useState({
    serviceId: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    mechanicId: '',
    estimatedHours: 0,
  });
  const [partFormData, setPartFormData] = useState({
    partId: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [formData, setFormData] = useState({
    clientId: '',
    licensePlate: '',
    status: 'DRAFT',
    description: '',
    total: 0,
  });

  useEffect(() => {
    loadOrders();
    loadClients();
    loadServices();
    loadMechanics();
    loadParts();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await ordersService.getAll(params);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsService.getAll({ size: 100 });
      setClients(response.data.content || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadVehicles = async (clientId) => {
    if (!clientId) {
      setVehicles([]);
      return;
    }
    try {
      const response = await clientsService.getVehicles(clientId, { size: 100 });
      // El endpoint devuelve una respuesta paginada (Page)
      const vehiclesList = response.data?.content || response.data || [];
      console.log('Vehículos cargados para cliente:', clientId, vehiclesList);
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      console.error('Error details:', error.response?.data);
      setVehicles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        description: formData.description?.trim() || null,
      };
      
      if (selectedOrder) {
        await ordersService.update(selectedOrder.id, dataToSend);
      } else {
        await ordersService.create(dataToSend);
      }
      setIsModalOpen(false);
      resetForm();
      loadOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      let errorMessage = 'Error al guardar la orden';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.validationErrors) {
          errorMessage = `Errores de validación: ${JSON.stringify(data.validationErrors)}`;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = `${data.error}: ${data.message || 'Error desconocido'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    const clientId = order.clientId || '';
    setFormData({
      clientId: clientId,
      licensePlate: order.licensePlate || '',
      status: order.status || 'DRAFT',
      description: order.description || '',
      total: order.total || 0,
    });
    if (clientId) {
      loadVehicles(clientId);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta orden?')) {
      try {
        await ordersService.delete(id);
        loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error al eliminar la orden');
      }
    }
  };

  const loadServices = async () => {
    try {
      const response = await servicesService.getAll({ size: 100, active: true });
      setServices(response.data.content || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadMechanics = async () => {
    try {
      const response = await mechanicsService.getAll({ size: 100, active: true });
      setMechanics(response.data.content || []);
    } catch (error) {
      console.error('Error loading mechanics:', error);
    }
  };

  const loadParts = async () => {
    try {
      const response = await partsService.getAll({ size: 100, active: true });
      setParts(response.data.content || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const loadOrderItems = async (orderId) => {
    try {
      const response = await ordersService.getItems(orderId, { size: 100 });
      const items = response.data.content || [];
      setOrderItems(items);
      
      // Cargar asignaciones y repuestos para cada item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const [assignmentsRes, partsRes] = await Promise.all([
              ordersService.getAssignments(orderId, item.id, { size: 100 }),
              ordersService.getItemParts(orderId, item.id, { size: 100 }),
            ]);
            return {
              ...item,
              assignments: assignmentsRes.data.content || [],
              parts: partsRes.data.content || [],
            };
          } catch (error) {
            console.error(`Error loading details for item ${item.id}:`, error);
            return {
              ...item,
              assignments: [],
              parts: [],
            };
          }
        })
      );
      setItemsWithDetails(itemsWithDetails);
    } catch (error) {
      console.error('Error loading order items:', error);
      setOrderItems([]);
      setItemsWithDetails([]);
    }
  };

  const loadSupervisions = async (orderId) => {
    try {
      const response = await supervisionsService.getAll({ orderId, size: 100 });
      setSupervisions(response.data.content || []);
    } catch (error) {
      console.error('Error loading supervisions:', error);
      setSupervisions([]);
    }
  };

  const handleView = async (order) => {
    try {
      console.log('Loading order details for:', order.id);
      // Primero establecer la orden seleccionada para que el modal tenga datos
      setSelectedOrder(order);
      setIsViewModalOpen(true);
      
      // Luego cargar los datos completos en segundo plano
      try {
        const fullOrder = await ordersService.getById(order.id);
        setSelectedOrder(fullOrder.data);
        await loadOrderItems(order.id);
        await loadSupervisions(order.id);
      } catch (loadError) {
        console.error('Error loading order details:', loadError);
        // No cerrar el modal si hay error, solo mostrar un mensaje
        alert('Error al cargar algunos detalles: ' + (loadError.response?.data?.message || loadError.message));
      }
    } catch (error) {
      console.error('Error opening modal:', error);
      alert('Error al abrir los detalles de la orden: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddItem = (order) => {
    setSelectedOrder(order);
    setItemFormData({
      serviceId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedService = services.find(s => s.id === itemFormData.serviceId);
      const dataToSend = {
        serviceId: itemFormData.serviceId,
        description: itemFormData.description || null,
        quantity: parseInt(itemFormData.quantity),
        unitPrice: itemFormData.unitPrice || (selectedService ? selectedService.price : 0),
      };
      await ordersService.addItem(selectedOrder.id, dataToSend);
      setIsItemModalOpen(false);
      await loadOrderItems(selectedOrder.id);
      loadOrders(); // Recargar para actualizar el total
      alert('Item agregado exitosamente');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error al agregar el item');
    }
  };

  const handleAddAssignment = (item) => {
    setSelectedItem(item);
    setAssignmentFormData({
      mechanicId: '',
      estimatedHours: 0,
    });
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        mechanicId: assignmentFormData.mechanicId,
        estimatedHours: parseInt(assignmentFormData.estimatedHours) || null,
      };
      await ordersService.addAssignment(selectedOrder.id, selectedItem.id, dataToSend);
      setIsAssignmentModalOpen(false);
      await loadOrderItems(selectedOrder.id);
      alert('Mecánico asignado exitosamente');
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Error al asignar el mecánico');
    }
  };

  const handleAddPart = (item) => {
    setSelectedItem(item);
    setPartFormData({
      partId: '',
      quantity: 1,
      unitPrice: 0,
    });
    setIsPartModalOpen(true);
  };

  const handlePartSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedPart = parts.find(p => p.id === partFormData.partId);
      const dataToSend = {
        partId: partFormData.partId,
        quantity: parseInt(partFormData.quantity),
        unitPrice: partFormData.unitPrice || (selectedPart ? selectedPart.unitPrice : 0),
      };
      await ordersService.addItemPart(selectedOrder.id, selectedItem.id, dataToSend);
      setIsPartModalOpen(false);
      await loadOrderItems(selectedOrder.id);
      loadOrders(); // Recargar para actualizar el total
      loadParts(); // Recargar para actualizar stock
      alert('Repuesto agregado exitosamente');
    } catch (error) {
      console.error('Error adding part:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al agregar el repuesto';
      alert(errorMessage);
    }
  };

  const handleAddSupervision = () => {
    setSupervisionFormData({
      supervisorId: '',
      supervisadoId: '',
      notes: '',
    });
    setIsSupervisionModalOpen(true);
  };

  const handleSupervisionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (supervisionFormData.supervisorId === supervisionFormData.supervisadoId) {
        alert('El supervisor y el supervisado no pueden ser la misma persona');
        return;
      }
      const dataToSend = {
        supervisorId: supervisionFormData.supervisorId,
        supervisadoId: supervisionFormData.supervisadoId,
        orderId: selectedOrder.id,
        notes: supervisionFormData.notes,
      };
      await supervisionsService.create(dataToSend);
      setIsSupervisionModalOpen(false);
      await loadSupervisions(selectedOrder.id);
      alert('Supervisión creada exitosamente');
    } catch (error) {
      console.error('Error creating supervision:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la supervisión';
      alert(errorMessage);
    }
  };

  const handleDeleteSupervision = async (supervisorId, supervisadoId, orderId) => {
    if (!confirm('¿Estás seguro de eliminar esta supervisión?')) return;
    try {
      await supervisionsService.delete(supervisorId, supervisadoId, orderId);
      await loadSupervisions(selectedOrder.id);
      alert('Supervisión eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting supervision:', error);
      alert('Error al eliminar la supervisión');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersService.changeStatus(id, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({ clientId: '', licensePlate: '', status: 'DRAFT', description: '', total: 0 });
    setSelectedOrder(null);
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
      SCHEDULED: 'bg-primary-100 text-primary-800',
      IN_PROGRESS: 'bg-accent-100 text-accent-800',
      COMPLETED: 'bg-success-100 text-success-800',
      CANCELLED: 'bg-secondary-100 text-secondary-800',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Órdenes de Trabajo</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Gestiona las órdenes de trabajo del taller
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Orden
        </button>
      </div>

      <div className="card mb-6">
        <FormSelect
          label="Filtrar por Estado"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(0);
          }}
          options={[{ value: '', label: 'Todos' }, ...ORDER_STATUSES]}
        />
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
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-secondary-500">
                        No hay órdenes registradas
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
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {ORDER_STATUSES.find((s) => s.value === order.status)?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {formatPrice(order.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">
                            {new Date(order.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(order)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Ver detalles"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(order)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {order.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                className="text-success-600 hover:text-success-900"
                                title="Completar"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-accent-600 hover:text-accent-900"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
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
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedOrder ? 'Editar Orden' : 'Nueva Orden'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <FormSelect
            label="Cliente"
            name="clientId"
            value={formData.clientId}
            onChange={(e) => {
              const newClientId = e.target.value;
              setFormData({ ...formData, clientId: newClientId, licensePlate: '' });
              loadVehicles(newClientId);
            }}
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            required
          />
          {formData.clientId && vehicles.length > 0 ? (
            <FormSelect
              label="Placa del Vehículo"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              options={vehicles.map((v) => ({
                value: v.licensePlate,
                label: `${v.licensePlate} - ${v.brand} ${v.model}`,
              }))}
              required
            />
          ) : formData.clientId ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Placa del Vehículo <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ingrese la placa del vehículo"
                required
              />
              <p className="mt-1 text-sm text-secondary-500">
                Este cliente no tiene vehículos registrados. Ingrese la placa manualmente.
              </p>
            </div>
          ) : (
            <FormInput
              label="Placa del Vehículo"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              required
            />
          )}
          <FormSelect
            label="Estado"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={ORDER_STATUSES}
            required
          />
          <FormTextarea
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedOrder ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setOrderItems([]);
          setItemsWithDetails([]);
        }}
        title="Detalles de la Orden"
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Placa</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedOrder.licensePlate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Estado</label>
                <p className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {ORDER_STATUSES.find((s) => s.value === selectedOrder.status)?.label ||
                      selectedOrder.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Total</label>
                <p className="mt-1 text-sm text-secondary-900 font-semibold">{formatPrice(selectedOrder.total)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            {selectedOrder.description && (
              <div>
                <label className="text-sm font-medium text-secondary-700">Descripción</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedOrder.description}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Items de Servicio</h3>
                <button
                  onClick={() => handleAddItem(selectedOrder)}
                  className="btn btn-primary text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Item
                </button>
              </div>
              {orderItems.length === 0 ? (
                <p className="text-sm text-secondary-500 text-center py-4">
                  No hay items agregados a esta orden
                </p>
              ) : (
                <div className="space-y-3">
                  {itemsWithDetails.map((item) => {
                    const service = services.find(s => s.id === item.serviceId);
                    return (
                      <div key={item.id} className="border rounded-lg p-4 bg-secondary-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-secondary-900">
                              {service?.name || 'Servicio'}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-secondary-600 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-secondary-900">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {item.quantity} x {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Mostrar asignaciones */}
                        {item.assignments && item.assignments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-secondary-200">
                            <p className="text-xs font-medium text-secondary-700 mb-2">Mecánicos Asignados:</p>
                            <div className="space-y-1">
                              {item.assignments.map((assignment) => {
                                const mechanic = mechanics.find(m => m.id === assignment.mechanicId);
                                return (
                                  <div key={assignment.mechanicId} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1">
                                    <span className="text-secondary-700">
                                      <UserCheck className="h-3 w-3 inline mr-1" />
                                      {mechanic ? `${mechanic.firstName} ${mechanic.lastName}` : 'Mecánico'}
                                    </span>
                                    {assignment.estimatedHours && (
                                      <span className="text-secondary-500">
                                        {assignment.estimatedHours} hrs
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar repuestos */}
                        {item.parts && item.parts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-secondary-200">
                            <p className="text-xs font-medium text-secondary-700 mb-2">Repuestos:</p>
                            <div className="space-y-1">
                              {item.parts.map((part) => {
                                const partInfo = parts.find(p => p.id === part.partId);
                                return (
                                  <div key={part.partId} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1">
                                    <span className="text-secondary-700">
                                      <Package className="h-3 w-3 inline mr-1" />
                                      {partInfo ? `${partInfo.name} (${partInfo.sku})` : 'Repuesto'}
                                    </span>
                                    <span className="text-secondary-500">
                                      {part.quantity} x {formatPrice(part.unitPrice)} = {formatPrice(part.quantity * part.unitPrice)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAddAssignment(item)}
                            className="btn btn-secondary text-xs flex items-center"
                            title="Asignar mecánico"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Asignar Mecánico
                          </button>
                          <button
                            onClick={() => handleAddPart(item)}
                            className="btn btn-secondary text-xs flex items-center"
                            title="Agregar repuesto"
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Agregar Repuesto
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sección de Supervisiones */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Supervisiones de Mecánicos</h3>
                <button
                  onClick={handleAddSupervision}
                  className="btn btn-primary text-sm flex items-center"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Agregar Supervisión
                </button>
              </div>
              {supervisions.length === 0 ? (
                <p className="text-sm text-secondary-500 text-center py-4">
                  No hay supervisiones registradas para esta orden
                </p>
              ) : (
                <div className="space-y-3">
                  {supervisions.map((supervision, index) => {
                    const supervisor = mechanics.find(m => m.id === supervision.supervisorId);
                    const supervisado = mechanics.find(m => m.id === supervision.supervisadoId);
                    return (
                      <div key={index} className="border rounded-lg p-4 bg-secondary-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-secondary-900">
                              <Users className="h-4 w-4 inline mr-1" />
                              {supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Supervisor'} 
                              {' → '}
                              {supervisado ? `${supervisado.firstName} ${supervisado.lastName}` : 'Supervisado'}
                            </p>
                            {supervision.notes && (
                              <p className="text-xs text-secondary-600 mt-1">{supervision.notes}</p>
                            )}
                            <p className="text-xs text-secondary-500 mt-1">
                              {new Date(supervision.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteSupervision(supervision.supervisorId, supervision.supervisadoId, supervision.orderId)}
                            className="text-accent-600 hover:text-accent-900 ml-2"
                            title="Eliminar supervisión"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para agregar Item */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Agregar Item de Servicio"
        size="lg"
      >
        <form onSubmit={handleItemSubmit}>
          <FormSelect
            label="Servicio"
            name="serviceId"
            value={itemFormData.serviceId}
            onChange={(e) => {
              const service = services.find(s => s.id === e.target.value);
              setItemFormData({
                ...itemFormData,
                serviceId: e.target.value,
                unitPrice: service ? service.price : 0,
              });
            }}
            options={services.map((s) => ({
              value: s.id,
              label: `${s.name} - ${formatPrice(s.price)}`,
            }))}
            required
          />
          <FormInput
            label="Cantidad"
            name="quantity"
            type="number"
            value={itemFormData.quantity}
            onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
            required
            min={1}
          />
          <FormInput
            label="Precio Unitario"
            name="unitPrice"
            type="number"
            step="0.01"
            value={itemFormData.unitPrice}
            onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value })}
            required
            min={0}
          />
          <FormTextarea
            label="Descripción (Opcional)"
            name="description"
            value={itemFormData.description}
            onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para asignar Mecánico */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Asignar Mecánico"
        size="md"
      >
        <form onSubmit={handleAssignmentSubmit}>
          <FormSelect
            label="Mecánico"
            name="mechanicId"
            value={assignmentFormData.mechanicId}
            onChange={(e) => setAssignmentFormData({ ...assignmentFormData, mechanicId: e.target.value })}
            options={mechanics.map((m) => ({
              value: m.id,
              label: `${m.firstName} ${m.lastName}${m.specialization ? ` - ${m.specialization}` : ''}`,
            }))}
            required
          />
          <FormInput
            label="Horas Estimadas (Opcional)"
            name="estimatedHours"
            type="number"
            value={assignmentFormData.estimatedHours}
            onChange={(e) => setAssignmentFormData({ ...assignmentFormData, estimatedHours: e.target.value })}
            min={0}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Asignar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para agregar Repuesto */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title="Agregar Repuesto"
        size="md"
      >
        <form onSubmit={handlePartSubmit}>
          <FormSelect
            label="Repuesto"
            name="partId"
            value={partFormData.partId}
            onChange={(e) => {
              const part = parts.find(p => p.id === e.target.value);
              setPartFormData({
                ...partFormData,
                partId: e.target.value,
                unitPrice: part ? part.unitPrice : 0,
              });
            }}
            options={parts.filter(p => p.active && p.stock > 0).map((p) => ({
              value: p.id,
              label: `${p.name} (${p.sku}) - ${formatPrice(p.unitPrice)} - Stock disponible: ${p.stock}`,
            }))}
            required
          />
          <FormInput
            label="Cantidad"
            name="quantity"
            type="number"
            value={partFormData.quantity}
            onChange={(e) => setPartFormData({ ...partFormData, quantity: e.target.value })}
            required
            min={1}
          />
          <FormInput
            label="Precio Unitario"
            name="unitPrice"
            type="number"
            step="0.01"
            value={partFormData.unitPrice}
            onChange={(e) => setPartFormData({ ...partFormData, unitPrice: e.target.value })}
            required
            min={0}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsPartModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para agregar Supervisión */}
      <Modal
        isOpen={isSupervisionModalOpen}
        onClose={() => setIsSupervisionModalOpen(false)}
        title="Agregar Supervisión"
        size="md"
      >
        <form onSubmit={handleSupervisionSubmit}>
          <FormSelect
            label="Supervisor (Mecánico con experiencia)"
            name="supervisorId"
            value={supervisionFormData.supervisorId}
            onChange={(e) => setSupervisionFormData({ ...supervisionFormData, supervisorId: e.target.value })}
            options={mechanics.filter(m => m.active).map((m) => ({
              value: m.id,
              label: `${m.firstName} ${m.lastName}${m.specialization ? ` - ${m.specialization}` : ''}`,
            }))}
            required
            placeholder="Seleccionar supervisor"
          />
          <FormSelect
            label="Supervisado (Mecánico que recibe supervisión)"
            name="supervisadoId"
            value={supervisionFormData.supervisadoId}
            onChange={(e) => setSupervisionFormData({ ...supervisionFormData, supervisadoId: e.target.value })}
            options={mechanics.filter(m => m.active && m.id !== supervisionFormData.supervisorId).map((m) => ({
              value: m.id,
              label: `${m.firstName} ${m.lastName}${m.specialization ? ` - ${m.specialization}` : ''}`,
            }))}
            required
            placeholder="Seleccionar supervisado"
          />
          <FormTextarea
            label="Notas de Supervisión"
            name="notes"
            value={supervisionFormData.notes}
            onChange={(e) => setSupervisionFormData({ ...supervisionFormData, notes: e.target.value })}
            required
            placeholder="Registre observaciones o instrucciones de la supervisión..."
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsSupervisionModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Supervisión
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;

