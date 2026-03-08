import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { suppliersService } from '../services/suppliersService';
import { partsService } from '../services/partsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Pagination from '../components/ui/Pagination';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierParts, setSupplierParts] = useState([]);
  const [partFormData, setPartFormData] = useState({
    partId: '',
    price: '',
    minQuantity: 1,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    active: true,
  });

  useEffect(() => {
    loadSuppliers();
    loadAllParts();
  }, [currentPage, searchQuery]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 20,
        ...(searchQuery && { q: searchQuery }),
      };
      const response = await suppliersService.getAll(params);
      setSuppliers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllParts = async () => {
    try {
      const response = await partsService.getAll({ size: 200 });
      setAllParts(response.data.content || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const loadSupplierParts = async (supplierId) => {
    try {
      const response = await suppliersService.getParts(supplierId, { size: 100 });
      setSupplierParts(response.data.content || []);
    } catch (error) {
      console.error('Error loading supplier parts:', error);
      setSupplierParts([]);
    }
  };

  const handleViewParts = async (supplier) => {
    setSelectedSupplier(supplier);
    await loadSupplierParts(supplier.id);
    setIsPartsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSupplier) {
        await suppliersService.update(selectedSupplier.id, formData);
      } else {
        await suppliersService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      const msg = error.response?.data?.message || 'Error al guardar el proveedor';
      alert(msg);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      active: supplier.active !== undefined ? supplier.active : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await suppliersService.delete(id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        const msg = error.response?.data?.message || 'Error al eliminar el proveedor';
        alert(msg);
      }
    }
  };

  const handleAddPart = () => {
    setPartFormData({ partId: '', price: '', minQuantity: 1 });
    setIsAddPartModalOpen(true);
  };

  const handleAddPartSubmit = async (e) => {
    e.preventDefault();
    try {
      await suppliersService.addPart(selectedSupplier.id, {
        partId: partFormData.partId,
        price: parseFloat(partFormData.price),
        minQuantity: parseInt(partFormData.minQuantity) || null,
      });
      setIsAddPartModalOpen(false);
      await loadSupplierParts(selectedSupplier.id);
    } catch (error) {
      console.error('Error adding part:', error);
      const msg = error.response?.data?.message || 'Error al agregar el repuesto';
      alert(msg);
    }
  };

  const handleRemovePart = async (partId) => {
    if (!window.confirm('¿Eliminar este repuesto del proveedor?')) return;
    try {
      await suppliersService.removePart(selectedSupplier.id, partId);
      await loadSupplierParts(selectedSupplier.id);
    } catch (error) {
      console.error('Error removing part:', error);
      const msg = error.response?.data?.message || 'Error al eliminar el repuesto';
      alert(msg);
    }
  };

  const getPartName = (partId) => {
    const part = allParts.find((p) => p.id === partId);
    return part ? `${part.name} (${part.sku})` : partId;
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', active: true });
    setSelectedSupplier(null);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  // Parts available to add: exclude ones already linked to this supplier
  const linkedPartIds = new Set(supplierParts.map((p) => p.partId));
  const availableParts = allParts.filter((p) => !linkedPartIds.has(p.id));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Proveedores</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Gestiona los proveedores de repuestos
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
          Nuevo Proveedor
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
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
                      Email
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
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-secondary-500">
                        No hay proveedores registrados
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {supplier.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{supplier.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-500">{supplier.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              supplier.active
                                ? 'bg-success-100 text-success-800'
                                : 'bg-secondary-100 text-secondary-800'
                            }`}
                          >
                            {supplier.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewParts(supplier)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Gestionar repuestos"
                            >
                              <Package className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(supplier)}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
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

      {/* Modal crear/editar proveedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
              {selectedSupplier ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal gestión de repuestos del proveedor */}
      <Modal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        title={`Repuestos de ${selectedSupplier?.name || ''}`}
        size="lg"
      >
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddPart}
            className="btn btn-primary text-sm flex items-center"
            disabled={availableParts.length === 0}
            title={availableParts.length === 0 ? 'Todos los repuestos ya están asociados' : ''}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Repuesto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                  Repuesto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                  Cant. Mínima
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {supplierParts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-secondary-500">
                    No hay repuestos asociados a este proveedor
                  </td>
                </tr>
              ) : (
                supplierParts.map((part) => (
                  <tr key={part.partId}>
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {getPartName(part.partId)}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {formatPrice(part.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-500">
                      {part.minQuantity ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemovePart(part.partId)}
                        className="text-accent-600 hover:text-accent-900"
                        title="Eliminar repuesto del proveedor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Modal agregar repuesto al proveedor */}
      <Modal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        title="Agregar Repuesto al Proveedor"
        size="md"
      >
        <form onSubmit={handleAddPartSubmit}>
          <FormSelect
            label="Repuesto"
            name="partId"
            value={partFormData.partId}
            onChange={(e) => setPartFormData({ ...partFormData, partId: e.target.value })}
            options={availableParts.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.sku})`,
            }))}
            required
          />
          <FormInput
            label="Precio del proveedor"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={partFormData.price}
            onChange={(e) => setPartFormData({ ...partFormData, price: e.target.value })}
            required
          />
          <FormInput
            label="Cantidad mínima de pedido (opcional)"
            name="minQuantity"
            type="number"
            min="1"
            value={partFormData.minQuantity}
            onChange={(e) => setPartFormData({ ...partFormData, minQuantity: e.target.value })}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddPartModalOpen(false)}
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
    </div>
  );
};

export default Suppliers;
