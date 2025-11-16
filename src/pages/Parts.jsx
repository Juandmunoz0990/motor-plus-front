import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { partsService } from '../services/partsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormTextarea from '../components/ui/FormTextarea';
import Pagination from '../components/ui/Pagination';

const Parts = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    unitPrice: '',
    stock: '',
    active: true,
  });
  const [movementData, setMovementData] = useState({
    type: 'IN',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    loadParts();
  }, [currentPage, searchQuery]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(searchQuery && { q: searchQuery }),
      };
      const response = await partsService.getAll(params);
      setParts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPart) {
        await partsService.update(selectedPart.id, formData);
      } else {
        await partsService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      loadParts();
    } catch (error) {
      console.error('Error saving part:', error);
      alert('Error al guardar el repuesto');
    }
  };

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    try {
      await partsService.createMovement(selectedPart.id, {
        ...movementData,
        quantity: parseInt(movementData.quantity),
      });
      setIsMovementModalOpen(false);
      setMovementData({ type: 'IN', quantity: '', notes: '' });
      loadParts();
    } catch (error) {
      console.error('Error creating movement:', error);
      alert('Error al registrar el movimiento');
    }
  };

  const handleEdit = (part) => {
    setSelectedPart(part);
    setFormData({
      name: part.name || '',
      sku: part.sku || '',
      description: part.description || '',
      unitPrice: part.unitPrice || '',
      stock: part.stock || '',
      active: part.active !== undefined ? part.active : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este repuesto?')) {
      try {
        await partsService.delete(id);
        loadParts();
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('Error al eliminar el repuesto');
      }
    }
  };

  const handleMovement = (part) => {
    setSelectedPart(part);
    setIsMovementModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', description: '', unitPrice: '', stock: '', active: true });
    setSelectedPart(null);
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
          <h1 className="text-3xl font-bold text-secondary-900">Repuestos</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Gestiona el inventario de repuestos
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
          Nuevo Repuesto
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
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
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stock
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
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                        No hay repuestos registrados
                      </td>
                    </tr>
                  ) : (
                    parts.map((part) => (
                      <tr key={part.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {part.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{part.sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {formatPrice(part.unitPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                part.stock < 10
                                  ? 'text-accent-600'
                                  : part.stock < 50
                                  ? 'text-secondary-600'
                                  : 'text-success-600'
                              }`}
                            >
                              {part.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              part.active
                                ? 'bg-success-100 text-success-800'
                                : 'bg-secondary-100 text-secondary-800'
                            }`}
                          >
                            {part.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleMovement(part)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Registrar movimiento"
                            >
                              <Package className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(part)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(part.id)}
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
        title={selectedPart ? 'Editar Repuesto' : 'Nuevo Repuesto'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
          <FormTextarea
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormInput
            label="Precio Unitario"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
          <FormInput
            label="Stock Inicial"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
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
              {selectedPart ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Registrar Movimiento de Inventario"
        size="md"
      >
        <form onSubmit={handleMovementSubmit}>
          <div className="mb-4">
            <label className="label">Tipo de Movimiento</label>
            <select
              value={movementData.type}
              onChange={(e) => setMovementData({ ...movementData, type: e.target.value })}
              className="input"
              required
            >
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
          </div>
          <FormInput
            label="Cantidad"
            name="quantity"
            type="number"
            min="1"
            value={movementData.quantity}
            onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
            required
          />
          <FormTextarea
            label="Notas"
            name="notes"
            value={movementData.notes}
            onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parts;

