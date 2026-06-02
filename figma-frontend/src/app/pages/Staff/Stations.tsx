// figma-frontend/src/app/pages/Staff/Stations.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MapPin, Edit, Trash2, Search, AlertTriangle, X, Navigation, Building2 } from 'lucide-react';
import { getCompanies, Company } from '../../../services/adminService';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import { getStations, createStation, updateStation, deleteStation } from '../../../services/adminService';

interface Station {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'origin' | 'destination' | 'intermediate' | 'terminal';
  facilities: any;
}

export const StationsPage = () => {
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Station | null>(null);

  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    code: '',
    description: '',
    address: '',
    city: '',
    country: 'Tanzania',
    latitude: 0,
    longitude: 0,
    type: 'intermediate' as Station['type'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stationsRes, companiesData] = await Promise.all([
        getStations(),
        getCompanies(1, 100, ''),
      ]);
      setStations(stationsRes.stations || []);
      setCompanies(companiesData.companies || []);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Unable to load stations');
    }
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (station.code && station.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (station.city && station.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: stations.length,
    terminals: stations.filter(s => s.type === 'terminal').length,
    origins: stations.filter(s => s.type === 'origin').length,
    destinations: stations.filter(s => s.type === 'destination').length,
  };

  const handleOpenModal = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        company_id: station.company_id,
        name: station.name,
        code: station.code || '',
        description: station.description || '',
        address: station.address || '',
        city: station.city || '',
        country: station.country || 'Tanzania',
        latitude: station.latitude || 0,
        longitude: station.longitude || 0,
        type: station.type,
      });
    } else {
      setEditingStation(null);
      setFormData({
        company_id: companies[0]?.id || '',
        name: '',
        code: '',
        description: '',
        address: '',
        city: '',
        country: 'Tanzania',
        latitude: 0,
        longitude: 0,
        type: 'intermediate',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 5);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Station name is required';
    if (!formData.company_id) newErrors.company_id = 'Company is required';
    if (!formData.city) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...formData,
        code: formData.code || generateCode(formData.name),
      };

      if (editingStation) {
        const updated = await updateStation(editingStation.id, payload);
        setStations(prev => prev.map(s => s.id === updated.station.id ? updated.station : s));

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated station: ${formData.name}`,
          module: 'stations',
          status: 'success',
        });

        toast.success('Station updated successfully');
      } else {
        const created = await createStation(payload);
        setStations(prev => [created.station, ...prev]);

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created station: ${formData.name}`,
          module: 'stations',
          status: 'success',
        });

        toast.success('Station created successfully');
      }

      setShowModal(false);
      setEditingStation(null);
    } catch (error: any) {
      console.error('Error saving station:', error);
      toast.error(error.response?.data?.message || 'Unable to save station');
    }
  };

  const handleDelete = async (station: Station) => {
    try {
      await deleteStation(station.id);
      setStations(prev => prev.filter(s => s.id !== station.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted station: ${station.name}`,
        module: 'stations',
        status: 'warning',
      });

      setDeleteConfirm(null);
      toast.success('Station deleted successfully');
    } catch (error: any) {
      console.error('Error deleting station:', error);
      toast.error(error.response?.data?.message || 'Unable to delete station');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage bus stops, train stations, ports, and airports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Station
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total Stations</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Terminals</p>
          <p className="text-3xl font-bold">{stats.terminals}</p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Origins</p>
          <p className="text-3xl font-bold">{stats.origins}</p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Destinations</p>
          <p className="text-3xl font-bold">{stats.destinations}</p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stations by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </motion.div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredStations.map((station, index) => {
            const company = companies.find(c => c.id === station.company_id);
            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{station.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{station.code}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    station.type === 'terminal' ? 'bg-purple-100 text-purple-700' :
                    station.type === 'origin' ? 'bg-green-100 text-green-700' :
                    station.type === 'destination' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {station.type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {company?.name || 'Unknown Company'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {station.city}, {station.country}
                  </p>
                  {station.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">📍 {station.address}</p>
                  )}
                  {(station.latitude || station.longitude) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      🗺️ {station.latitude}, {station.longitude}
                    </p>
                  )}
                </div>

                {station.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {station.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(station)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(station)}
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
                  {editingStation ? 'Edit Station' : 'Add New Station'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company *
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.company_id && <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Station Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ ...formData, name, code: generateCode(name) });
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="e.g., Dar es Salaam Central"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Station Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 font-mono"
                    placeholder="e.g., DSM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Station['type'] })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  >
                    <option value="origin">Origin</option>
                    <option value="destination">Destination</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="terminal">Terminal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="e.g., Dar es Salaam"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="e.g., Tanzania"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="Additional details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      placeholder="-6.7924"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      placeholder="39.2083"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingStation ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
                <h3 className="text-xl font-bold">Delete Station</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? Routes using this station will be affected.
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