import { useState, useEffect } from 'react';
import { Search, Eye, Car, History, Plus, Edit, Trash2 } from 'lucide-react';
import { vehiclesService } from '../services/vehiclesService';
import { clientsService } from '../services/clientsService';
import { reportsService } from '../services/reportsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Pagination from '../components/ui/Pagination';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    modelYear: new Date().getFullYear(),
    clientId: '',
  });

  useEffect(() => {
    loadVehicles();
    loadClients();
  }, [currentPage, searchQuery]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(searchQuery && { q: searchQuery }),
      };
      const response = await vehiclesService.getAll(params);
      setVehicles(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsService.getAll({ size: 100 });
      const clientsList = response.data.content || [];
      console.log('Clientes cargados:', clientsList);
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Error al cargar los clientes. Por favor, recarga la página.');
    }
  };

  const handleViewHistory = async (vehicle) => {
    try {
      setSelectedVehicle(vehicle);
      const history = await reportsService.vehicleHistory(vehicle.licensePlate);
      setVehicleHistory(history.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Error loading vehicle history:', error);
      alert('Error al cargar el historial del vehículo');
    }
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setFormData({
      brand: '',
      model: '',
      licensePlate: '',
      modelYear: new Date().getFullYear(),
      clientId: '',
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      modelYear: vehicle.modelYear || new Date().getFullYear(),
      clientId: vehicle.clientId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleDelete = async (plate) => {
    if (window.confirm('¿Estás seguro de eliminar este vehículo?')) {
      try {
        await vehiclesService.delete(plate);
        loadVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        const errorMessage = error.response?.data?.message || 'Error al eliminar el vehículo';
        alert(errorMessage);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        brand: formData.brand,
        model: formData.model,
        licensePlate: formData.licensePlate,
        modelYear: parseInt(formData.modelYear),
      };

      if (selectedVehicle) {
        // Editar vehículo existente
        await vehiclesService.update(selectedVehicle.licensePlate, dataToSend);
      } else {
        // Crear nuevo vehículo
        if (formData.clientId) {
          // Si se seleccionó un cliente, crear el vehículo asociado directamente
          await clientsService.addVehicle(formData.clientId, dataToSend);
        } else {
          // Si no hay cliente, crear vehículo sin asociar
          await vehiclesService.create(dataToSend);
        }
      }
      
      setIsFormModalOpen(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      let errorMessage = 'Error al guardar el vehículo';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.validationErrors) {
          errorMessage = `Errores de validación: ${JSON.stringify(data.validationErrors)}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      licensePlate: '',
      modelYear: new Date().getFullYear(),
      clientId: '',
    });
    setSelectedVehicle(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Vehículos</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Consulta el historial y la información de los vehículos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Vehículo
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por placa, marca o modelo..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="input pl-10"
          />
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
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                        No hay vehículos registrados
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {vehicle.licensePlate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{vehicle.brand}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{vehicle.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{vehicle.modelYear || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">
                            {vehicle.clientName || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewHistory(vehicle)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Ver historial"
                            >
                              <History className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.licensePlate)}
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
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Marca"
            name="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
            maxLength={60}
          />
          <FormInput
            label="Modelo"
            name="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
            maxLength={60}
          />
          <FormInput
            label="Placa"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
            required
            maxLength={15}
            disabled={!!selectedVehicle}
          />
          <FormInput
            label="Año del Modelo"
            name="modelYear"
            type="number"
            value={formData.modelYear}
            onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
            required
            min={1900}
            max={new Date().getFullYear() + 1}
          />
          {!selectedVehicle && (
            <FormSelect
              label="Cliente (Opcional)"
              name="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={[
                { value: '', label: 'Sin cliente' },
                ...clients.map((c) => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName}`,
                })),
              ]}
              placeholder="Seleccionar cliente"
            />
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsFormModalOpen(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedVehicle ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setVehicleHistory(null);
        }}
        title={`Historial - ${selectedVehicle?.licensePlate || ''}`}
        size="xl"
      >
        {vehicleHistory && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Marca</label>
                <p className="mt-1 text-sm text-secondary-900">{vehicleHistory.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Modelo</label>
                <p className="mt-1 text-sm text-secondary-900">{vehicleHistory.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Año</label>
                <p className="mt-1 text-sm text-secondary-900">{vehicleHistory.modelYear || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Total de Órdenes</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {vehicleHistory.totalOrders || 0}
                </p>
              </div>
            </div>

            {vehicleHistory.orders && vehicleHistory.orders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Órdenes de Trabajo
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {vehicleHistory.orders.map((order, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-secondary-900">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                            {formatPrice(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Vehicles;

