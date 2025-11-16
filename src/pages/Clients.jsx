import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Car } from 'lucide-react';
import { clientsService } from '../services/clientsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormTextarea from '../components/ui/FormTextarea';
import Pagination from '../components/ui/Pagination';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadClients();
  }, [currentPage, searchQuery, emailFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(searchQuery && { q: searchQuery }),
        ...(emailFilter && { email: emailFilter }),
      };
      const response = await clientsService.getAll(params);
      setClients(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await clientsService.update(selectedClient.id, formData);
      } else {
        await clientsService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientsService.delete(id);
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleView = async (client) => {
    try {
      const [fullClient, vehicles] = await Promise.all([
        clientsService.getById(client.id),
        clientsService.getVehicles(client.id, { size: 100 })
      ]);
      setSelectedClient({
        ...fullClient.data,
        vehicles: vehicles.data.content || []
      });
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error loading client details:', error);
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setSelectedClient(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Clientes</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Gestiona los clientes del taller
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
          Nuevo Cliente
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              placeholder="Filtrar por email..."
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="input"
            />
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
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-secondary-500">
                        No hay clientes registrados
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {client.firstName} {client.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{client.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{client.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">
                            {formatDate(client.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(client)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Ver detalles"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
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

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <FormInput
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <FormInput
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              {selectedClient ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Ver Detalles */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Cliente"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Nombre</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Email</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedClient.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Teléfono</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedClient.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Fecha de Registro</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {formatDate(selectedClient.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-semibold text-secondary-900 mb-3">Vehículos del Cliente</h3>
              {selectedClient.vehicles && selectedClient.vehicles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">
                          Placa
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">
                          Marca
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">
                          Modelo
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">
                          Año
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {selectedClient.vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="px-4 py-2 text-sm text-secondary-900">
                            {vehicle.licensePlate}
                          </td>
                          <td className="px-4 py-2 text-sm text-secondary-500">
                            {vehicle.brand}
                          </td>
                          <td className="px-4 py-2 text-sm text-secondary-500">
                            {vehicle.model}
                          </td>
                          <td className="px-4 py-2 text-sm text-secondary-500">
                            {vehicle.modelYear || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-secondary-500">No hay vehículos registrados para este cliente</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;

