import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import { mechanicsService } from '../services/mechanicsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormTextarea from '../components/ui/FormTextarea';
import Pagination from '../components/ui/Pagination';

const Mechanics = () => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    phone: '',
    active: true,
  });

  useEffect(() => {
    loadMechanics();
  }, [currentPage, searchQuery, specializationFilter]);

  const loadMechanics = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(searchQuery && { q: searchQuery }),
        ...(specializationFilter && { specialization: specializationFilter }),
      };
      const response = await mechanicsService.getAll(params);
      setMechanics(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMechanic) {
        await mechanicsService.update(selectedMechanic.id, formData);
      } else {
        await mechanicsService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      loadMechanics();
    } catch (error) {
      console.error('Error saving mechanic:', error);
      alert('Error al guardar el mecánico');
    }
  };

  const handleEdit = (mechanic) => {
    setSelectedMechanic(mechanic);
    setFormData({
      firstName: mechanic.firstName || '',
      lastName: mechanic.lastName || '',
      specialization: mechanic.specialization || '',
      phone: mechanic.phone || '',
      active: mechanic.active !== undefined ? mechanic.active : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este mecánico?')) {
      try {
        await mechanicsService.delete(id);
        loadMechanics();
      } catch (error) {
        console.error('Error deleting mechanic:', error);
        alert('Error al eliminar el mecánico');
      }
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', specialization: '', phone: '', active: true });
    setSelectedMechanic(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Mecánicos</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Gestiona los mecánicos del taller
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
          Nuevo Mecánico
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
              type="text"
              placeholder="Filtrar por especialización..."
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
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
                      Especialización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {mechanics.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-secondary-500">
                        No hay mecánicos registrados
                      </td>
                    </tr>
                  ) : (
                    mechanics.map((mechanic) => (
                      <tr key={mechanic.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {mechanic.firstName} {mechanic.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">
                            {mechanic.specialization || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{mechanic.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              mechanic.active
                                ? 'bg-success-100 text-success-800'
                                : 'bg-secondary-100 text-secondary-800'
                            }`}
                          >
                            {mechanic.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(mechanic)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(mechanic.id)}
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
        title={selectedMechanic ? 'Editar Mecánico' : 'Nuevo Mecánico'}
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
            label="Especialización"
            name="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="Ej: Mecánica general, Electricidad, Latonería, Pintura..."
          />
          <FormInput
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-secondary-900">
              Activo
            </label>
          </div>
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
              {selectedMechanic ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Mechanics;

