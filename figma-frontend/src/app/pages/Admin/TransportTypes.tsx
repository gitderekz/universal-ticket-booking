// figma-frontend/src/app/pages/Admin/TransportTypes.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Bus, Edit, Trash2, Search, AlertTriangle, X, Plane, Ship, Train, Car } from 'lucide-react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import { getTransportTypes, createTransportType, updateTransportType, deleteTransportType } from '../../../services/adminService';

interface TransportType {
  id: string;
  name: string;
  slug: string;
  category: 'land' | 'air' | 'water';
  description: string;
  requires_routes: boolean;
  requires_layout: boolean;
  active: boolean;
  transport_count?: number;
}

const CATEGORY_ICONS = {
  land: Bus,
  air: Plane,
  water: Ship,
};

const CATEGORY_COLORS = {
  land: 'from-blue-500 to-cyan-600',
  air: 'from-purple-500 to-pink-600',
  water: 'from-emerald-500 to-teal-600',
};

export const TransportTypesPage = () => {
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<TransportType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TransportType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'land' as 'land' | 'air' | 'water',
    description: '',
    requires_routes: true,
    requires_layout: true,
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTransportTypes();
  }, []);

  const loadTransportTypes = async () => {
    try {
      const data = await getTransportTypes();
      setTransportTypes(data.transport_types || []);
    } catch (error) {
      console.error('Error loading transport types:', error);
      toast.error('Unable to load transport types');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
  };

  const filteredTypes = transportTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (type?: TransportType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        slug: type.slug,
        category: type.category,
        description: type.description || '',
        requires_routes: type.requires_routes,
        requires_layout: type.requires_layout,
        active: type.active,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        slug: '',
        category: 'land',
        description: '',
        requires_routes: true,
        requires_layout: true,
        active: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      };

      if (editingType) {
        const updated = await updateTransportType(editingType.id, payload);
        setTransportTypes(prev => prev.map(t => t.id === updated.transport_type.id ? updated.transport_type : t));
        
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated transport type: ${formData.name}`,
          module: 'transport_types',
          status: 'success',
        });

        toast.success('Transport type updated successfully');
      } else {
        const created = await createTransportType(payload);
        setTransportTypes(prev => [created.transport_type, ...prev]);
        
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created transport type: ${formData.name}`,
          module: 'transport_types',
          status: 'success',
        });

        toast.success('Transport type created successfully');
      }

      setShowModal(false);
      setEditingType(null);
    } catch (error: any) {
      console.error('Error saving transport type:', error);
      toast.error(error.response?.data?.message || 'Unable to save transport type');
    }
  };

  const handleDelete = async (type: TransportType) => {
    if (type.transport_count && type.transport_count > 0) {
      toast.error(`Cannot delete - ${type.transport_count} transports use this type`);
      return;
    }

    try {
      await deleteTransportType(type.id);
      setTransportTypes(prev => prev.filter(t => t.id !== type.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted transport type: ${type.name}`,
        module: 'transport_types',
        status: 'warning',
      });

      setDeleteConfirm(null);
      toast.success('Transport type deleted successfully');
    } catch (error: any) {
      console.error('Error deleting transport type:', error);
      toast.error(error.response?.data?.message || 'Unable to delete transport type');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transport Types</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage transport categories and configurations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Transport Type
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transport types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTypes.map((type, index) => {
            const Icon = CATEGORY_ICONS[type.category];
            const gradient = CATEGORY_COLORS[type.category];
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{type.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{type.slug}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full capitalize">
                    {type.category}
                  </span>
                </div>

                {type.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{type.description}</p>
                )}

                <div className="space-y-1 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requires Routes:</span>
                    <span className={type.requires_routes ? 'text-green-600' : 'text-red-600'}>
                      {type.requires_routes ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requires Layout:</span>
                    <span className={type.requires_layout ? 'text-green-600' : 'text-red-600'}>
                      {type.requires_layout ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {type.transport_count !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transports:</span>
                      <span className="font-bold">{type.transport_count}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(type)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(type)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal - similar structure to previous pages */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingType ? 'Edit Transport Type' : 'Add Transport Type'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ ...formData, name, slug: generateSlug(name) });
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="e.g., Safari Car"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 font-mono"
                    placeholder="e.g., safari_car"
                  />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  >
                    <option value="land">Land</option>
                    <option value="air">Air</option>
                    <option value="water">Water</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="Description of this transport type"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requires_routes}
                      onChange={(e) => setFormData({ ...formData, requires_routes: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Requires Routes</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requires_layout}
                      onChange={(e) => setFormData({ ...formData, requires_layout: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Requires Seat Layout</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingType ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Delete Transport Type</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};