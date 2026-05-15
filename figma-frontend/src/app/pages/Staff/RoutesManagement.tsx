import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getRoutes } from '../../../services/managementService';
import { getTransports } from '../../../services/adminService';
import { Plus, MapPin, Edit, Trash2, Search, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

export const RoutesManagement = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [routes, setRoutes] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    transportId: '',
    startLocation: '',
    endLocation: '',
    price: 0,
    parentRouteId: '',
    stations: [] as any[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredRoutes = routes.filter(route => {
    const start = (route.startLocation || route.originStation?.name || '').toLowerCase();
    const end = (route.endLocation || route.destinationStation?.name || '').toLowerCase();
    return start.includes(searchTerm.toLowerCase()) || end.includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: routes.length,
    mainRoutes: routes.filter(r => !r.parent_route_id).length,
    subRoutes: routes.filter(r => r.parent_route_id).length,
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [routeData, transportData] = await Promise.all([
          getRoutes(),
          getTransports(1, 100, ''),
        ]);
        setRoutes(routeData || []);
        setTransports(transportData.transports || []);
      } catch (error) {
        console.error('Failed to load routes or transports', error);
      }
    };
    load();
  }, []);

  const handleOpenModal = (route?: any) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        transportId: route.transport_id || route.transportId || '',
        startLocation: route.startLocation || route.originStation?.name || '',
        endLocation: route.endLocation || route.destinationStation?.name || '',
        price: route.base_price || route.price || 0,
        parentRouteId: route.parent_route_id || route.parentRouteId || '',
        stations: (route.RouteStations?.map((rs: any) => rs.station).filter(Boolean) || route.stations || []),
      });
    } else {
      setEditingRoute(null);
      setFormData({
        transportId: transports[0]?.id || '',
        startLocation: '',
        endLocation: '',
        price: 0,
        parentRouteId: '',
        stations: [],
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.transportId) newErrors.transportId = 'Transport is required';
    if (!formData.startLocation.trim()) newErrors.startLocation = 'Start location is required';
    if (!formData.endLocation.trim()) newErrors.endLocation = 'End location is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingRoute) {
      setRoutes(prev => prev.map(r =>
        r.id === editingRoute.id
          ? { ...r, ...formData }
          : r
      ));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Updated route: ${formData.startLocation} → ${formData.endLocation}`,
        module: 'routes',
        status: 'success',
        details: `Price: ${formatPrice(formData.price)}, Stations: ${formData.stations.length}`,
      });

      toast.success('Route updated successfully');
    } else {
      const newRoute: Route = {
        id: `route${Date.now()}`,
        ...formData,
        parentRouteId: formData.parentRouteId || undefined,
      };

      setRoutes(prev => [...prev, newRoute]);

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Created route: ${formData.startLocation} → ${formData.endLocation}`,
        module: 'routes',
        status: 'success',
        details: `Price: ${formatPrice(formData.price)}, Stations: ${formData.stations.length}`,
      });

      toast.success('Route created successfully');
    }

    setShowModal(false);
    setEditingRoute(null);
  };

  const handleDelete = (route: Route) => {
    setRoutes(prev => prev.filter(r => r.id !== route.id));

    addLog({
      userId: user?.id || '',
      userName: user?.fullName || '',
      action: `Deleted route: ${route.startLocation} → ${route.endLocation}`,
      module: 'routes',
      status: 'warning',
      details: `Price: ${formatPrice(route.price)}`,
    });

    setDeleteConfirm(null);
    toast.success('Route deleted successfully');
  };

  const addStation = () => {
    const newStation: Station = {
      id: `station${Date.now()}`,
      name: '',
      price: 0,
      order: formData.stations.length + 1,
      isBreakStop: false,
    };
    setFormData({ ...formData, stations: [...formData.stations, newStation] });
  };

  const updateStation = (index: number, field: keyof Station, value: any) => {
    const updatedStations = [...formData.stations];
    updatedStations[index] = { ...updatedStations[index], [field]: value };
    setFormData({ ...formData, stations: updatedStations });
  };

  const removeStation = (index: number) => {
    setFormData({
      ...formData,
      stations: formData.stations.filter((_, i) => i !== index),
    });
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
            {t('nav.routes')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage routes and station stops
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Route
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Total Routes</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Main Routes</p>
          <p className="text-3xl font-bold">{stats.mainRoutes}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Sub Routes</p>
          <p className="text-3xl font-bold">{stats.subRoutes}</p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search') + ' routes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </motion.div>

      {/* Routes List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRoutes.map((route, index) => {
            const transport = transports.find(t => t.id === (route.transport_id || route.transportId));
            const company = transport?.Company || null;
            const stations = (route.RouteStations?.map((rs: any) => rs.station).filter(Boolean) || route.stations || []);
            const startLocation = route.startLocation || route.originStation?.name || 'Unknown';
            const endLocation = route.endLocation || route.destinationStation?.name || 'Unknown';
            const routePrice = route.base_price || route.price || 0;
            const parentRouteId = route.parent_route_id || route.parentRouteId;

            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {startLocation} → {endLocation}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {company?.name || 'Unknown company'} • {transport?.name || 'Unknown transport'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{stations.length} stations</span>
                        <span>•</span>
                        <span>{stations.filter((s: any) => s?.isBreakStop).length} break stops</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(routePrice)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Full route</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {stations.map((station: any, stationIndex: number) => (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: stationIndex * 0.03 }}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          station.isBreakStop
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="font-medium">{stationIndex + 1}. {station.name}</div>
                        <div className="text-xs">{formatPrice(station.price)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {parentRouteId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>This is a sub-route</span>
                  </motion.div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(route)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Route
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(route)}
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingRoute ? 'Edit Route' : 'Create New Route'}
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
                    Transport
                  </label>
                  <select
                    value={formData.transportId}
                    onChange={(e) => setFormData({ ...formData, transportId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Transport</option>
                    {transports.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.TransportType?.slug || t.transport_type_id || 'unknown'}</option>
                    ))}
                  </select>
                  {errors.transportId && <p className="text-red-500 text-sm mt-1">{errors.transportId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Location
                    </label>
                    <input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Dar es Salaam"
                    />
                    {errors.startLocation && <p className="text-red-500 text-sm mt-1">{errors.startLocation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Location
                    </label>
                    <input
                      type="text"
                      value={formData.endLocation}
                      onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Mwanza"
                    />
                    {errors.endLocation && <p className="text-red-500 text-sm mt-1">{errors.endLocation}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Route Price (TZS)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="50000"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Route (Optional - for sub-routes)
                  </label>
                  <select
                    value={formData.parentRouteId}
                    onChange={(e) => setFormData({ ...formData, parentRouteId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">No - Main Route</option>
                    {routes.filter(r => r.id !== editingRoute?.id && !r.parent_route_id && !r.parentRouteId).map(r => (
                      <option key={r.id} value={r.id}>{r.startLocation || r.originStation?.name} → {r.endLocation || r.destinationStation?.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stations
                    </label>
                    <button
                      type="button"
                      onClick={addStation}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Station
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.stations.map((station, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={station.name}
                            onChange={(e) => updateStation(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Station name"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={station.price}
                              onChange={(e) => updateStation(index, 'price', parseInt(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              placeholder="Price"
                            />
                            <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600">
                              <input
                                type="checkbox"
                                checked={station.isBreakStop}
                                onChange={(e) => updateStation(index, 'isBreakStop', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Break</span>
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => removeStation(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                    {editingRoute ? 'Update Route' : 'Create Route'}
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
                  Delete Route
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete the route <strong>{deleteConfirm.startLocation} → {deleteConfirm.endLocation}</strong>? This action cannot be undone.
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
