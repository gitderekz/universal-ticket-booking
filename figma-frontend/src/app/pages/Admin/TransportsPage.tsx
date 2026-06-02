// figma-frontend/src/app/pages/Admin/TransportsPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getTransports, getCompanies, getTransportTypes, createTransport, updateTransport, deleteTransport, Company, Transport } from '../../../services/adminService';
import { Plus, Bus, Edit, Trash2, Search, AlertTriangle, X, Plane, Ship, Train, Car, Sailboat } from 'lucide-react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

// Get transport types from the backend
interface TransportType {
  id: string;
  name: string;
  slug: string;
  category: string;
}

const getTransportIcon = (typeSlug: string) => {
  switch (typeSlug) {
    case 'aeroplane': return Plane;
    case 'ferry':
    case 'ship': return Ship;
    case 'boat': return Sailboat;
    case 'train': return Train;
    case 'safari_car': return Car;
    default: return Bus;
  }
};

export const TransportsPage = () => {
  const { t } = useTranslation();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [transports, setTransports] = useState<Transport[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Transport | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    transportTypeSlug: 'bus',
    registrationNumber: '',
    description: '',
    sittingPlan: '2-2',
    sittingLength: 10,
    capacity: 40,
    status: 'active' as 'draft' | 'active' | 'maintenance' | 'retired',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transportData, companyData, transportTypesData] = await Promise.all([
          getTransports(1, 100, ''),
          getCompanies(1, 100, ''),
          getTransportTypes(), // Use the service method instead of direct fetch
        ]);
        setTransports(transportData.transports || []);
        setCompanies(companyData.companies || []);
        setTransportTypes(transportTypesData.transport_types || []);
      } catch (error) {
        console.error('Failed to load transports or companies', error);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);


  const calculateCapacity = (plan: string, length: number) => {
    const seats = plan.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    return seats * length;
  };

  const filteredTransports = transports.filter(transport => {
    const matchesSearch = transport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transport.registration_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const transportType = transport.TransportType?.slug || transport.transport_type_id || '';
    const matchesType = filterType === 'all' || transportType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: transports.length,
    active: transports.filter(t => t.status === 'active').length,
    totalCapacity: transports.reduce((sum, t) => sum + (t.capacity || 0), 0),
  };

  const handleOpenModal = (transport?: Transport) => {
    if (transport) {
      setEditingTransport(transport);
      setFormData({
        name: transport.name,
        companyId: transport.company_id,
        transportTypeSlug: transport.TransportType?.slug || 'bus',
        registrationNumber: transport.registration_number || '',
        description: transport.description || '',
        sittingPlan: transport.sittingPlan || '2-2',
        sittingLength: transport.sittingLength || 10,
        capacity: transport.capacity || 40,
        status: (transport.status as any) || 'active',
      });
    } else {
      setEditingTransport(null);
      setFormData({
        name: '',
        companyId: companies[0]?.id || '',
        transportTypeSlug: 'bus',
        registrationNumber: '',
        description: '',
        sittingPlan: '2-2',
        sittingLength: 10,
        capacity: 40,
        status: 'active',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Transport name is required';
    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.sittingPlan.trim()) newErrors.sittingPlan = 'Sitting plan is required';
    if (formData.sittingLength <= 0) newErrors.sittingLength = 'Number of rows must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const capacity = calculateCapacity(formData.sittingPlan, formData.sittingLength);

    try {
      // Find transport type ID from slug
      const transportType = transportTypes.find(tt => tt.slug === formData.transportTypeSlug);
      if (!transportType) {
        toast.error('Invalid transport type');
        return;
      }

      if (editingTransport) {
        const payload = {
          company_id: formData.companyId,
          transport_type_id: transportType.id,
          name: formData.name,
          registration_number: formData.registrationNumber,
          capacity,
          description: formData.description,
          sittingPlan: formData.sittingPlan,
          sittingLength: formData.sittingLength,
          status: formData.status
        };
        const updated = await updateTransport(editingTransport.id, payload);
        setTransports(prev => prev.map(t => t.id === updated.id ? updated : t));

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated transport: ${formData.name}`,
          module: 'transports',
          status: 'success',
          details: `Type: ${formData.transportTypeSlug}, Capacity: ${capacity} seats`,
        });

        toast.success('Transport updated successfully');
      } else {
        const payload = {
          company_id: formData.companyId,
          transport_type_id: transportType.id,
          name: formData.name,
          registration_number: formData.registrationNumber,
          capacity,
          description: formData.description,
          sittingPlan: formData.sittingPlan,
          sittingLength: formData.sittingLength,
          status: formData.status
        };
        const created = await createTransport(payload);
        setTransports(prev => [created, ...prev]);

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created transport: ${formData.name}`,
          module: 'transports',
          status: 'success',
          details: `Type: ${formData.transportTypeSlug}, Capacity: ${capacity} seats`,
        });

        toast.success('Transport created successfully');
      }

      setShowModal(false);
      setEditingTransport(null);
    } catch (error: any) {
      console.error('Error saving transport:', error);
      toast.error(error.response?.data?.message || 'Unable to save transport');
    }
  };

  const handleDelete = async (transport: Transport) => {
    try {
      await deleteTransport(transport.id);
      setTransports(prev => prev.filter(t => t.id !== transport.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted transport: ${transport.name}`,
        module: 'transports',
        status: 'warning',
        details: `Registration: ${transport.registration_number}`,
      });

      setDeleteConfirm(null);
      toast.success('Transport deleted successfully');
    } catch (error: any) {
      console.error('Error deleting transport:', error);
      toast.error(error.response?.data?.message || 'Unable to delete transport');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.transports')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage transport fleet and configurations
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Transport
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Total Transports</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Active Fleet</p>
          <p className="text-3xl font-bold">{stats.active}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Total Capacity</p>
          <p className="text-3xl font-bold">{stats.totalCapacity}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') + ' transports...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </motion.button>
            {transportTypes.map((type) => (
              <motion.button
                key={type.slug}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type.slug)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === type.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type.name}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Transports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTransports.map((transport, index) => {
            const company = companies.find(c => c.id === transport.company_id) || transport.Company;
            const transportType = transport.TransportType;
            const Icon = getTransportIcon(transportType?.slug || 'bus');
            return (
              <motion.div
                key={transport.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{transport.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company?.name || 'Unknown company'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    {transportType?.name || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                    <p className="font-bold text-gray-900 dark:text-white">{transport.capacity || 0} seats</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registration</p>
                    <p className="font-bold text-gray-900 dark:text-white">{transport.registration_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Layout</p>
                    <p className="font-bold text-gray-900 dark:text-white">{transport.sittingPlan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className={`font-bold ${
                      transport.status === 'active' ? 'text-green-600' :
                      transport.status === 'maintenance' ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {transport.status || 'active'}
                    </p>
                  </div>
                </div>
                
                {transport.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {transport.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(transport)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(transport)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTransport ? 'Edit Transport' : 'Add New Transport'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transport Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Express 001"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company *
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Company</option>
                    {companies.filter(c => c.category === 'transport').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transport Type *
                  </label>
                  <select
                    value={formData.transportTypeSlug}
                    onChange={(e) => setFormData({ ...formData, transportTypeSlug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {transportTypes.map(type => (
                      <option key={type.slug} value={type.slug}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., T-001-KLM"
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Transport description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sitting Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.sittingPlan}
                    onChange={(e) => setFormData({ ...formData, sittingPlan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 2-2"
                  />
                  {errors.sittingPlan && <p className="text-red-500 text-sm mt-1">{errors.sittingPlan}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Rows *
                  </label>
                  <input
                    type="number"
                    value={formData.sittingLength}
                    onChange={(e) => setFormData({ ...formData, sittingLength: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 10"
                  />
                  {errors.sittingLength && <p className="text-red-500 text-sm mt-1">{errors.sittingLength}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Calculated capacity: <strong>{calculateCapacity(formData.sittingPlan, formData.sittingLength)} seats</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTransport ? 'Update' : 'Create'}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Transport
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};








// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { useTranslation } from 'react-i18next';
// import { getTransports, getCompanies, createTransport, updateTransport, deleteTransport, Company, Transport } from '../../../services/adminService';
// import { Plus, Bus, Edit, Trash2, Search, AlertTriangle, X, Plane, Ship, Train } from 'lucide-react';
// import { useSystemLogs } from '../../../contexts/SystemLogsContext';
// import { useAuth } from '../../../contexts/AuthContext';
// import { toast } from 'sonner';

// const getTransportIcon = (type: string) => {
//   switch (type) {
//     case 'airplane': return Plane;
//     case 'ferry':
//     case 'ship':
//     case 'boat': return Ship;
//     case 'train': return Train;
//     default: return Bus;
//   }
// };

// export const TransportsPage = () => {
//   const { t } = useTranslation();
//   const { addLog } = useSystemLogs();
//   const { user } = useAuth();

//   const [transports, setTransports] = useState<Transport[]>([]);
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<string>('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
//   const [deleteConfirm, setDeleteConfirm] = useState<Transport | null>(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     companyId: '',
//     type: 'bus' as string,
//     sittingPlan: '',
//     sittingLength: 0,
//     capacity: 0,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const transportTypes = ['bus', 'mini_bus', 'safari_car', 'train', 'airplane', 'ferry', 'ship', 'boat'];

//   const filteredTransports = transports.filter(transport => {
//     const matchesSearch = transport.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const transportTypeSlug = transport.TransportType?.slug || transport.transport_type_id || '';
//     const matchesType = filterType === 'all' || transportTypeSlug === filterType;
//     return matchesSearch && matchesType;
//   });

//   const stats = {
//     total: transports.length,
//     active: transports.filter(t => t.status === 'active').length,
//     totalCapacity: transports.reduce((sum, t) => sum + (t.capacity || 0), 0),
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const transportData = await getTransports(1, 100, '');
//         setTransports(transportData.transports || []);
//         const companyData = await getCompanies(1, 100, '');
//         setCompanies(companyData.companies || []);
//       } catch (error) {
//         console.error('Failed to load transports or companies', error);
//       }
//     };
//     loadData();
//   }, []);

//   const handleOpenModal = (transport?: Transport) => {
//     if (transport) {
//       setEditingTransport(transport);
//       setFormData({
//         name: transport.name,
//         companyId: transport.company_id,
//         type: transport.type || transport.TransportType?.slug || 'bus',
//         sittingPlan: transport.sittingPlan || '',
//         sittingLength: transport.sittingLength || 0,
//         capacity: transport.capacity || 0,
//       });
//     } else {
//       setEditingTransport(null);
//       setFormData({
//         name: '',
//         companyId: companies[0]?.id || '',
//         type: 'bus',
//         sittingPlan: '2-2',
//         sittingLength: 10,
//         capacity: 40,
//       });
//     }
//     setErrors({});
//     setShowModal(true);
//   };

//   const calculateCapacity = (plan: string, length: number) => {
//     const seats = plan.split('-').reduce((sum, val) => sum + parseInt(val || '0'), 0);
//     return seats * length;
//   };

//   const handleSave = async () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) newErrors.name = 'Transport name is required';
//     if (!formData.companyId) newErrors.companyId = 'Company is required';
//     if (!formData.sittingPlan.trim()) newErrors.sittingPlan = 'Sitting plan is required';
//     if (formData.sittingLength <= 0) newErrors.sittingLength = 'Number of rows must be greater than 0';

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const capacity = calculateCapacity(formData.sittingPlan, formData.sittingLength);

//     try {
//       if (editingTransport) {
//         const payload = {
//           company_id: formData.companyId,
//           transport_type_slug: formData.type,
//           name: formData.name,
//           registration_number: (editingTransport as any).registration_number || '',
//           capacity,
//           description: (editingTransport as any).description || '',
//           sittingPlan: formData.sittingPlan,
//           sittingLength: formData.sittingLength,
//           status: 'active'
//         };
//         const updated = await updateTransport(editingTransport.id, payload);
//         setTransports(prev => prev.map(t => t.id === updated.id ? updated : t));

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Updated transport: ${formData.name}`,
//           module: 'transports',
//           status: 'success',
//           details: `Type: ${formData.type}, Capacity: ${capacity} seats`,
//         });

//         toast.success('Transport updated successfully');
//       } else {
//         const payload = {
//           company_id: formData.companyId,
//           transport_type_slug: formData.type,
//           name: formData.name,
//           registration_number: '',
//           capacity,
//           description: '',
//           sittingPlan: formData.sittingPlan,
//           sittingLength: formData.sittingLength,
//           status: 'active'
//         };
//         const created = await createTransport(payload);
//         setTransports(prev => [created, ...prev]);

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Created transport: ${formData.name}`,
//           module: 'transports',
//           status: 'success',
//           details: `Type: ${formData.type}, Capacity: ${capacity} seats`,
//         });

//         toast.success('Transport created successfully');
//       }

//       setShowModal(false);
//       setEditingTransport(null);
//     } catch (error) {
//       console.error('Error saving transport:', error);
//       toast.error('Unable to save transport');
//     }
//   };

//   const handleDelete = async (transport: Transport) => {
//     try {
//       await deleteTransport(transport.id);
//       setTransports(prev => prev.filter(t => t.id !== transport.id));

//       addLog({
//         userId: user?.id || '',
//         userName: user?.fullName || '',
//         action: `Deleted transport: ${transport.name}`,
//         module: 'transports',
//         status: 'warning',
//         details: `Type: ${transport.type}, Capacity: ${transport.capacity}`,
//       });

//       setDeleteConfirm(null);
//       toast.success('Transport deleted successfully');
//     } catch (error) {
//       console.error('Error deleting transport:', error);
//       toast.error('Unable to delete transport');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-center justify-between"
//       >
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             {t('nav.transports')}
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Manage transport fleet and configurations
//           </p>
//         </div>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => handleOpenModal()}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//         >
//           <Plus className="w-5 h-5" />
//           Add Transport
//         </motion.button>
//       </motion.div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Total Transports</p>
//           <p className="text-3xl font-bold">{stats.total}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Active Fleet</p>
//           <p className="text-3xl font-bold">{stats.active}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Total Capacity</p>
//           <p className="text-3xl font-bold">{stats.totalCapacity}</p>
//         </motion.div>
//       </div>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
//       >
//         <div className="flex flex-col gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder={t('common.search') + ' transports...'}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//             />
//           </div>
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setFilterType('all')}
//               className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
//                 filterType === 'all'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//               }`}
//             >
//               All
//             </motion.button>
//             {transportTypes.map((type) => (
//               <motion.button
//                 key={type}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setFilterType(type)}
//                 className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
//                   filterType === type
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 {t(`transportTypes.${type}`)}
//               </motion.button>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Transports Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <AnimatePresence mode="popLayout">
//           {filteredTransports.map((transport, index) => {
//             const company = companies.find(c => c.id === transport.company_id) || transport.Company;
//             const transportTypeName = transport.TransportType?.name || 'Unknown';
//             const transportTypeSlug = transport.TransportType?.slug || 'bus';
//             const Icon = getTransportIcon(transportTypeSlug);
//             return (
//               <motion.div
//                 key={transport.id}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ delay: index * 0.05 }}
//                 whileHover={{ y: -4 }}
//                 className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <motion.div
//                       whileHover={{ rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                       className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
//                     >
//                       <Icon className="w-6 h-6 text-white" />
//                     </motion.div>
//                     <div>
//                       <h3 className="font-bold text-gray-900 dark:text-white">{transport.name}</h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">{company?.name || 'Unknown company'}</p>
//                     </div>
//                   </div>
//                   <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
//                     {transportTypeName}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{transport.capacity || 0} seats</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Registration</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{transport.registration_number || '-'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
//                     <p className="font-bold text-green-600">{transport.status || 'active'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{transportTypeSlug}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleOpenModal(transport)}
//                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
//                   >
//                     <Edit className="w-4 h-4" />
//                     Edit
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setDeleteConfirm(transport)}
//                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     Delete
//                   </motion.button>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </div>

//       {/* Add/Edit Modal */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {editingTransport ? 'Edit Transport' : 'Add New Transport'}
//                 </h2>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Transport Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., Express 001"
//                   />
//                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Company
//                   </label>
//                   <select
//                     value={formData.companyId}
//                     onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     <option value="">Select Company</option>
//                     {companies.map(c => (
//                       <option key={c.id} value={c.id}>{c.name}</option>
//                     ))}
//                   </select>
//                   {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Type
//                   </label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) => setFormData({ ...formData, type: e.target.value as Transport['type'] })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     {transportTypes.map(type => (
//                       <option key={type} value={type}>{t(`transportTypes.${type}`)}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Sitting Plan
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.sittingPlan}
//                     onChange={(e) => setFormData({ ...formData, sittingPlan: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., 2-2"
//                   />
//                   {errors.sittingPlan && <p className="text-red-500 text-sm mt-1">{errors.sittingPlan}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Number of Rows
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.sittingLength}
//                     onChange={(e) => setFormData({ ...formData, sittingLength: parseInt(e.target.value) || 0 })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., 10"
//                   />
//                   {errors.sittingLength && <p className="text-red-500 text-sm mt-1">{errors.sittingLength}</p>}
//                 </div>

//                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                   <p className="text-sm text-gray-700 dark:text-gray-300">
//                     Calculated capacity: <strong>{calculateCapacity(formData.sittingPlan, formData.sittingLength)} seats</strong>
//                   </p>
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSave}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     {editingTransport ? 'Update' : 'Create'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {deleteConfirm && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setDeleteConfirm(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
//             >
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
//                   <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//                   Delete Transport
//                 </h3>
//               </div>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setDeleteConfirm(null)}
//                   className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDelete(deleteConfirm)}
//                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
