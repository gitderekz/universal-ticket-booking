// figma-frontend/src/app/pages/Admin/FacilitiesPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getFacilities, getCompanies, getFacilityTypes, createFacility, updateFacility, deleteFacility, Company } from '../../../services/adminService';
import { Plus, Warehouse, Edit, Trash2, Search, AlertTriangle, X, Film, Trophy, Calendar, TreePine, Home, Music, Building2, Utensils, Tent, Hotel, Sparkles } from 'lucide-react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

// Facility categories from seed data
const FACILITY_CATEGORIES = [
  { value: 'entertainment', label: 'Entertainment', icon: Film, color: 'purple' },
  { value: 'sports', label: 'Sports', icon: Trophy, color: 'red' },
  { value: 'events', label: 'Events', icon: Calendar, color: 'pink' },
  { value: 'outdoor', label: 'Outdoor', icon: TreePine, color: 'green' },
  { value: 'housing', label: 'Housing', icon: Home, color: 'orange' },
];

interface FacilityType {
  id: string;
  name: string;
  slug: string;
  category: string;
}

const getCategoryIcon = (category: string) => {
  const found = FACILITY_CATEGORIES.find(c => c.value === category);
  if (found) return found.icon;
  return Warehouse;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'entertainment': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    case 'sports': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    case 'events': return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300';
    case 'outdoor': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    case 'housing': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
  }
};

export const FacilitiesPage = () => {
  const { t } = useTranslation();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [facilities, setFacilities] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    facilityTypeSlug: 'movie_theatre',
    category: 'entertainment',
    description: '',
    location: '{}',
    capacity: 0,
    base_price: 0,
    sittingPlan: '3-3',
    sittingLength: 10,
    status: 'active' as 'pending' | 'active' | 'suspended' | 'inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facilityData, companyData, facilityTypesData] = await Promise.all([
          getFacilities(1, 100, ''),
          getCompanies(1, 100, ''),
          getFacilityTypes(), // Use the service method
        ]);
        setFacilities(facilityData.facilities || []);
        setCompanies(companyData.companies || []);
        setFacilityTypes(facilityTypesData.facility_types || []);
      } catch (error) {
        console.error('Failed to load facilities or companies', error);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);


  const calculateCapacity = (plan: string, length: number) => {
    if (plan === 'open' || plan === 'rooms' || plan === 'tents' || plan === 'safari_vehicle' || plan === 'hiking_group') {
      return 0; // These don't use seat-based capacity
    }
    const seats = plan.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    return seats * length;
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facility.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || facility.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: facilities.length,
    entertainment: facilities.filter(f => f.category === 'entertainment').length,
    sports: facilities.filter(f => f.category === 'sports').length,
    events: facilities.filter(f => f.category === 'events').length,
    outdoor: facilities.filter(f => f.category === 'outdoor').length,
    housing: facilities.filter(f => f.category === 'housing').length,
  };

  const handleOpenModal = (facility?: any) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        companyId: facility.company_id || '',
        facilityTypeSlug: facility.FacilityType?.slug || 'movie_theatre',
        category: facility.category || 'entertainment',
        description: facility.description || '',
        location: JSON.stringify(facility.location || {}),
        capacity: facility.capacity || 0,
        base_price: facility.base_price || 0,
        sittingPlan: facility.sittingPlan || '3-3',
        sittingLength: facility.sittingLength || 10,
        status: facility.status || 'active',
      });
    } else {
      setEditingFacility(null);
      setFormData({
        name: '',
        companyId: companies.filter(c => c.category === 'facility')[0]?.id || '',
        facilityTypeSlug: 'movie_theatre',
        category: 'entertainment',
        description: '',
        location: '{}',
        capacity: 100,
        base_price: 10000,
        sittingPlan: '3-3',
        sittingLength: 10,
        status: 'active',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Facility name is required';
    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.facilityTypeSlug) newErrors.facilityTypeSlug = 'Facility type is required';
    if (formData.capacity <= 0 && formData.sittingPlan !== 'open' && formData.sittingPlan !== 'rooms') {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Calculate capacity from sitting plan if not manually set
    let capacity = formData.capacity;
    if (capacity === 0 && formData.sittingPlan && formData.sittingPlan !== 'open' && formData.sittingPlan !== 'rooms') {
      capacity = calculateCapacity(formData.sittingPlan, formData.sittingLength);
    }

    try {
      const facilityType = facilityTypes.find(ft => ft.slug === formData.facilityTypeSlug);
      if (!facilityType) {
        toast.error('Invalid facility type');
        return;
      }

      const payload = {
        company_id: formData.companyId,
        facility_type_id: facilityType.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: JSON.parse(formData.location),
        capacity,
        base_price: formData.base_price,
        sittingPlan: formData.sittingPlan,
        sittingLength: formData.sittingLength,
        status: formData.status
      };

      if (editingFacility) {
        const updated = await updateFacility(editingFacility.id, payload);
        setFacilities(prev => prev.map(f => f.id === updated.id ? updated : f));

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated facility: ${formData.name}`,
          module: 'facilities',
          status: 'success',
          details: `Category: ${formData.category}, Type: ${formData.facilityTypeSlug}`,
        });

        toast.success('Facility updated successfully');
      } else {
        const created = await createFacility(payload);
        setFacilities(prev => [created, ...prev]);

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created facility: ${formData.name}`,
          module: 'facilities',
          status: 'success',
          details: `Category: ${formData.category}, Type: ${formData.facilityTypeSlug}`,
        });

        toast.success('Facility created successfully');
      }

      setShowModal(false);
      setEditingFacility(null);
    } catch (error: any) {
      console.error('Error saving facility:', error);
      toast.error(error.response?.data?.message || 'Unable to save facility');
    }
  };

  const handleDelete = async (facility: any) => {
    try {
      await deleteFacility(facility.id);
      setFacilities(prev => prev.filter(f => f.id !== facility.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted facility: ${facility.name}`,
        module: 'facilities',
        status: 'warning',
        details: `Category: ${facility.category}`,
      });

      setDeleteConfirm(null);
      toast.success('Facility deleted successfully');
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      toast.error(error.response?.data?.message || 'Unable to delete facility');
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
            {t('nav.facilities')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage cinemas, stadiums, hotels, and event venues
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Facility
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg"
        >
          <p className="text-xs opacity-90 mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white shadow-lg"
        >
          <p className="text-xs opacity-90 mb-1">Entertainment</p>
          <p className="text-2xl font-bold">{stats.entertainment}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-white shadow-lg"
        >
          <p className="text-xs opacity-90 mb-1">Sports</p>
          <p className="text-2xl font-bold">{stats.sports}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 rounded-xl text-white shadow-lg"
        >
          <p className="text-xs opacity-90 mb-1">Events</p>
          <p className="text-2xl font-bold">{stats.events}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg"
        >
          <p className="text-xs opacity-90 mb-1">Outdoor</p>
          <p className="text-2xl font-bold">{stats.outdoor}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') + ' facilities...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </motion.button>
            {FACILITY_CATEGORIES.map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFacilities.map((facility, index) => {
            const company = companies.find(c => c.id === facility.company_id) || facility.Company;
            const Icon = getCategoryIcon(facility.category || 'entertainment');
            return (
              <motion.div
                key={facility.id}
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
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{facility.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(facility.category)}`}>
                    {FACILITY_CATEGORIES.find(c => c.value === facility.category)?.label || facility.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-bold text-gray-900 dark:text-white">{facility.FacilityType?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {facility.capacity ? `${facility.capacity} seats` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Base Price</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      TSh {facility.base_price?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className={`font-bold ${
                      facility.status === 'active' ? 'text-green-600' :
                      facility.status === 'pending' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {facility.status || 'active'}
                    </p>
                  </div>
                </div>

                {facility.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {facility.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(facility)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(facility)}
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
                  {editingFacility ? 'Edit Facility' : 'Add New Facility'}
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
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Cinema Hall 1"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Company</option>
                    {companies.filter(c => c.category === 'facility').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {FACILITY_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Facility Type *
                  </label>
                  <select
                    value={formData.facilityTypeSlug}
                    onChange={(e) => setFormData({ ...formData, facilityTypeSlug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {facilityTypes.map(type => (
                      <option key={type.slug} value={type.slug}>{type.name}</option>
                    ))}
                  </select>
                  {errors.facilityTypeSlug && <p className="text-red-500 text-sm mt-1">{errors.facilityTypeSlug}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Facility description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Price (TZS) *
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity (or leave empty for auto-calc)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0 for auto-calculation"
                  />
                  {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sitting Plan
                  </label>
                  <input
                    type="text"
                    value={formData.sittingPlan}
                    onChange={(e) => setFormData({ ...formData, sittingPlan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 3-3, open, rooms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Rows
                  </label>
                  <input
                    type="number"
                    value={formData.sittingLength}
                    onChange={(e) => setFormData({ ...formData, sittingLength: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location (JSON)
                  </label>
                  <textarea
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{"address": "Street Name", "city": "Dar es Salaam"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {formData.sittingPlan && formData.sittingPlan !== 'open' && formData.sittingPlan !== 'rooms' && formData.capacity === 0 && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Calculated capacity: <strong>{calculateCapacity(formData.sittingPlan, formData.sittingLength)} seats</strong>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingFacility ? 'Update' : 'Create'}
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
                  Delete Facility
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
// import { getFacilities, getCompanies, createFacility, updateFacility, deleteFacility, Company } from '../../../services/adminService';
// import { Plus, Warehouse, Edit, Trash2, Search, AlertTriangle, X, Film, Trophy, Calendar, TreePine, Home } from 'lucide-react';
// import { useSystemLogs } from '../../../contexts/SystemLogsContext';
// import { useAuth } from '../../../contexts/AuthContext';
// import { toast } from 'sonner';

// const getCategoryIcon = (category: string) => {
//   switch (category) {
//     case 'entertainment': return Film;
//     case 'sports': return Trophy;
//     case 'events': return Calendar;
//     case 'outdoor': return TreePine;
//     case 'housing': return Home;
//     default: return Warehouse;
//   }
// };

// const getCategoryColor = (category: string) => {
//   switch (category) {
//     case 'entertainment': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
//     case 'sports': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
//     case 'events': return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300';
//     case 'outdoor': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
//     case 'housing': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
//     default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
//   }
// };

// export const FacilitiesPage = () => {
//   const { t } = useTranslation();
//   const { addLog } = useSystemLogs();
//   const { user } = useAuth();

//   const [facilities, setFacilities] = useState<any[]>([]);
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState<string>('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editingFacility, setEditingFacility] = useState<any | null>(null);
//   const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     companyId: '',
//     category: 'entertainment' as Facility['category'],
//     type: 'movie_theatre' as Facility['type'],
//     sittingPlan: '',
//     sittingLength: 0,
//     capacity: 0,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const categories = ['entertainment', 'sports', 'events', 'outdoor', 'housing'];

//   const filteredFacilities = facilities.filter(facility => {
//     const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = filterCategory === 'all' || facility.category === filterCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const stats = {
//     total: facilities.length,
//     entertainment: facilities.filter(f => f.category === 'entertainment').length,
//     sports: facilities.filter(f => f.category === 'sports').length,
//     events: facilities.filter(f => f.category === 'events').length,
//   };

//   const handleOpenModal = (facility?: any) => {
//     if (facility) {
//       setEditingFacility(facility);
//       setFormData({
//         name: facility.name,
//         companyId: facility.company_id || '',
//         category: facility.category || 'entertainment',
//         type: facility.type || 'movie_theatre',
//         sittingPlan: facility.sittingPlan || '',
//         sittingLength: facility.sittingLength || 0,
//         capacity: facility.capacity || 0,
//       });
//     } else {
//       setEditingFacility(null);
//       setFormData({
//         name: '',
//         companyId: companies[0]?.id || '',
//         category: 'entertainment',
//         type: 'movie_theatre',
//         sittingPlan: '3-3',
//         sittingLength: 15,
//         capacity: 90,
//       });
//     }
//     setErrors({});
//     setShowModal(true);
//   };

//   const calculateCapacity = (plan: string, length: number) => {
//     const seats = plan.split('-').reduce((sum, val) => sum + parseInt(val || '0'), 0);
//     return seats * length;
//   };

//   useEffect(() => {
//     const loadFacilities = async () => {
//       try {
//         const facilityData = await getFacilities(1, 100, '');
//         setFacilities(facilityData.facilities || []);
//         const companyData = await getCompanies(1, 100, '');
//         setCompanies(companyData.companies || []);
//       } catch (error) {
//         console.error('Failed to load facilities or companies', error);
//       }
//     };
//     loadFacilities();
//   }, []);

//   const handleSave = async () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) newErrors.name = 'Facility name is required';
//     if (!formData.companyId) newErrors.companyId = 'Company is required';
//     if (!formData.sittingPlan.trim()) newErrors.sittingPlan = 'Sitting plan is required';
//     if (formData.sittingLength <= 0) newErrors.sittingLength = 'Number of rows must be greater than 0';

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const capacity = calculateCapacity(formData.sittingPlan, formData.sittingLength);

//     try {
//       if (editingFacility) {
//         const payload = {
//           company_id: formData.companyId,
//           facility_type_slug: formData.type,
//           name: formData.name,
//           description: (editingFacility as any).description || '',
//           location: (editingFacility as any).location || {},
//           capacity,
//           base_price: (editingFacility as any).base_price || 0,
//           sittingPlan: formData.sittingPlan,
//           sittingLength: formData.sittingLength,
//           features: (editingFacility as any).features || {},
//           images: (editingFacility as any).images || [],
//           status: 'active'
//         };
//         const updated = await updateFacility(editingFacility.id, payload);
//         setFacilities(prev => prev.map(f => f.id === updated.id ? updated : f));

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Updated facility: ${formData.name}`,
//           module: 'facilities',
//           status: 'success',
//           details: `Category: ${formData.category}, Type: ${formData.type}, Capacity: ${capacity}`,
//         });

//         toast.success('Facility updated successfully');
//       } else {
//         const payload = {
//           company_id: formData.companyId,
//           facility_type_slug: formData.type,
//           name: formData.name,
//           description: '',
//           location: {},
//           capacity,
//           base_price: 0,
//           sittingPlan: formData.sittingPlan,
//           sittingLength: formData.sittingLength,
//           features: {},
//           images: [],
//           status: 'active'
//         };
//         const created = await createFacility(payload);
//         setFacilities(prev => [created, ...prev]);

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Created facility: ${formData.name}`,
//           module: 'facilities',
//           status: 'success',
//           details: `Category: ${formData.category}, Type: ${formData.type}, Capacity: ${capacity}`,
//         });

//         toast.success('Facility created successfully');
//       }

//       setShowModal(false);
//       setEditingFacility(null);
//     } catch (error) {
//       console.error('Error saving facility:', error);
//       toast.error('Unable to save facility');
//     }
//   };

//   const handleDelete = async (facility: Facility) => {
//     try {
//       await deleteFacility(facility.id);
//       setFacilities(prev => prev.filter(f => f.id !== facility.id));

//       addLog({
//         userId: user?.id || '',
//         userName: user?.fullName || '',
//         action: `Deleted facility: ${facility.name}`,
//         module: 'facilities',
//         status: 'warning',
//         details: `Category: ${facility.category}, Type: ${facility.type}`,
//       });

//       setDeleteConfirm(null);
//       toast.success('Facility deleted successfully');
//     } catch (error) {
//       console.error('Error deleting facility:', error);
//       toast.error('Unable to delete facility');
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
//             {t('nav.facilities')}
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Manage cinemas, stadiums, and event venues
//           </p>
//         </div>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => handleOpenModal()}
//           className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
//         >
//           <Plus className="w-5 h-5" />
//           Add Facility
//         </motion.button>
//       </motion.div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Total Facilities</p>
//           <p className="text-3xl font-bold">{stats.total}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Entertainment</p>
//           <p className="text-3xl font-bold">{stats.entertainment}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Sports</p>
//           <p className="text-3xl font-bold">{stats.sports}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Events</p>
//           <p className="text-3xl font-bold">{stats.events}</p>
//         </motion.div>
//       </div>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//         className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
//       >
//         <div className="flex flex-col gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder={t('common.search') + ' facilities...'}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//             />
//           </div>
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setFilterCategory('all')}
//               className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
//                 filterCategory === 'all'
//                   ? 'bg-purple-600 text-white'
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//               }`}
//             >
//               All
//             </motion.button>
//             {categories.map((category) => (
//               <motion.button
//                 key={category}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setFilterCategory(category)}
//                 className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
//                   filterCategory === category
//                     ? 'bg-purple-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 {t(`categories.${category}`)}
//               </motion.button>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Facilities Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <AnimatePresence mode="popLayout">
//           {filteredFacilities.map((facility, index) => {
//             const company = companies.find(c => c.id === facility.company_id) || facility.Company;
//             const Icon = getCategoryIcon(facility.category || 'entertainment');
//             return (
//               <motion.div
//                 key={facility.id}
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
//                       className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
//                     >
//                       <Icon className="w-6 h-6 text-white" />
//                     </motion.div>
//                     <div>
//                       <h3 className="font-bold text-gray-900 dark:text-white">{facility.name}</h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">{company?.name}</p>
//                     </div>
//                   </div>
//                   <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(facility.category)}`}>
//                     {t(`categories.${facility.category}`)}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{facility.FacilityType?.name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{facility.capacity ?? 'N/A'} seats</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Layout</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{facility.sittingPlan}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Rows</p>
//                     <p className="font-bold text-gray-900 dark:text-white">{facility.sittingLength}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleOpenModal(facility)}
//                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
//                   >
//                     <Edit className="w-4 h-4" />
//                     Edit
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setDeleteConfirm(facility)}
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
//                   {editingFacility ? 'Edit Facility' : 'Add New Facility'}
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
//                     Facility Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., Cinema Hall 3"
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
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
//                     Category
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value as Facility['category'] })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     {categories.map(cat => (
//                       <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Type
//                   </label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) => setFormData({ ...formData, type: e.target.value as Facility['type'] })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     <option value="movie_theatre">Movie Theatre</option>
//                     <option value="stadium">Stadium</option>
//                     <option value="conference_hall">Conference Hall</option>
//                     <option value="arena">Arena</option>
//                     <option value="park">Park</option>
//                     <option value="hotel_room">Hotel Room</option>
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
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., 3-3"
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
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="e.g., 15"
//                   />
//                   {errors.sittingLength && <p className="text-red-500 text-sm mt-1">{errors.sittingLength}</p>}
//                 </div>

//                 <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
//                     className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                   >
//                     {editingFacility ? 'Update' : 'Create'}
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
//                   Delete Facility
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
