// figma-frontend/src/app/pages/Staff/SeatLayouts.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Layout, Edit, Trash2, Search, AlertTriangle, X, Bus, Building2 } from 'lucide-react';
import { getTransports, getFacilities } from '../../../services/adminService';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import { getSeatLayouts, createSeatLayout, updateSeatLayout, deleteSeatLayout } from '../../../services/adminService';

interface SeatLayout {
  id: string;
  layoutable_id: string;
  layoutable_type: 'transport' | 'facility';
  layout_type: string;
  pattern: string;
  rows: number;
  total_units: number;
  config: any;
  status: string;
}

export const SeatLayoutsPage = () => {
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [layouts, setLayouts] = useState<SeatLayout[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transport' | 'facility'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLayout, setEditingLayout] = useState<SeatLayout | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SeatLayout | null>(null);

  const [formData, setFormData] = useState({
    layoutable_id: '',
    layoutable_type: 'transport' as 'transport' | 'facility',
    pattern: '2-2',
    rows: 10,
    layout_type: 'seat',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [layoutsRes, transportsData, facilitiesData] = await Promise.all([
        getSeatLayouts(),
        getTransports(1, 100, ''),
        getFacilities(1, 100, ''),
      ]);
      setLayouts(layoutsRes.seat_layouts || []);
      setTransports(transportsData.transports || []);
      setFacilities(facilitiesData.facilities || []);
    } catch (error) {
      console.error('Error loading seat layouts:', error);
      toast.error('Unable to load seat layouts');
    }
  };

  const calculateTotalUnits = (pattern: string, rows: number) => {
    const seatsPerRow = pattern.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    return seatsPerRow * rows;
  };

  const getLayoutableName = (layout: SeatLayout) => {
    if (layout.layoutable_type === 'transport') {
      const transport = transports.find(t => t.id === layout.layoutable_id);
      return transport?.name || 'Unknown Transport';
    } else {
      const facility = facilities.find(f => f.id === layout.layoutable_id);
      return facility?.name || 'Unknown Facility';
    }
  };

  const filteredLayouts = layouts.filter(layout => {
    const name = getLayoutableName(layout).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || layout.layoutable_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (layout?: SeatLayout) => {
    if (layout) {
      setEditingLayout(layout);
      setFormData({
        layoutable_id: layout.layoutable_id,
        layoutable_type: layout.layoutable_type,
        pattern: layout.pattern,
        rows: layout.rows,
        layout_type: layout.layout_type,
      });
    } else {
      setEditingLayout(null);
      setFormData({
        layoutable_id: '',
        layoutable_type: 'transport',
        pattern: '2-2',
        rows: 10,
        layout_type: 'seat',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.layoutable_id) newErrors.layoutable_id = 'Please select a transport or facility';
    if (!formData.pattern) newErrors.pattern = 'Pattern is required';
    if (formData.rows <= 0) newErrors.rows = 'Rows must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const totalUnits = calculateTotalUnits(formData.pattern, formData.rows);
    const config = {
      layout_pattern: formData.pattern,
      rows: formData.rows,
      seats_per_row: formData.pattern.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0),
    };

    try {
      const payload = {
        ...formData,
        total_units: totalUnits,
        config,
        status: 'active',
      };

      if (editingLayout) {
        const updated = await updateSeatLayout(editingLayout.id, payload);
        setLayouts(prev => prev.map(l => l.id === updated.seat_layout.id ? updated.seat_layout : l));

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated seat layout for ${getLayoutableName(editingLayout)}`,
          module: 'seat_layouts',
          status: 'success',
        });

        toast.success('Seat layout updated successfully');
      } else {
        const created = await createSeatLayout(payload);
        setLayouts(prev => [created.seat_layout, ...prev]);

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created seat layout for ${getLayoutableName(created.seat_layout)}`,
          module: 'seat_layouts',
          status: 'success',
        });

        toast.success('Seat layout created successfully');
      }

      setShowModal(false);
      setEditingLayout(null);
    } catch (error: any) {
      console.error('Error saving seat layout:', error);
      toast.error(error.response?.data?.message || 'Unable to save seat layout');
    }
  };

  const handleDelete = async (layout: SeatLayout) => {
    try {
      await deleteSeatLayout(layout.id);
      setLayouts(prev => prev.filter(l => l.id !== layout.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted seat layout for ${getLayoutableName(layout)}`,
        module: 'seat_layouts',
        status: 'warning',
      });

      setDeleteConfirm(null);
      toast.success('Seat layout deleted successfully');
    } catch (error: any) {
      console.error('Error deleting seat layout:', error);
      toast.error(error.response?.data?.message || 'Unable to delete seat layout');
    }
  };

  const renderSeatMap = (pattern: string, rows: number) => {
    const columns = pattern.split('-').map(Number);
    const maxCols = Math.max(...columns);
    
    return (
      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-x-auto">
        <div className="text-xs text-center mb-1">Front</div>
        {Array.from({ length: Math.min(rows, 5) }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 mb-1">
            {Array.from({ length: maxCols }).map((_, colIdx) => {
              let isSeat = false;
              let colSum = 0;
              for (const section of columns) {
                if (colIdx < colSum + section) {
                  isSeat = true;
                  break;
                }
                colSum += section;
              }
              return (
                <div
                  key={colIdx}
                  className={`w-5 h-5 rounded text-xs flex items-center justify-center ${
                    isSeat ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {isSeat && (rowIdx + 1)}
                </div>
              );
            })}
          </div>
        ))}
        {rows > 5 && <div className="text-center text-xs text-gray-500 mt-1">... and {rows - 5} more rows</div>}
        <div className="text-xs text-center mt-1">Rear</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seat Layouts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage seating configurations for transports and facilities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Layout
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search layouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'transport', 'facility'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredLayouts.map((layout, index) => {
            const name = getLayoutableName(layout);
            const Icon = layout.layoutable_type === 'transport' ? Bus : Building2;
            const totalSeats = calculateTotalUnits(layout.pattern, layout.rows);
            
            return (
              <motion.div
                key={layout.id}
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
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{layout.layoutable_type}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {layout.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Pattern</p>
                    <p className="font-mono font-bold">{layout.pattern}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rows</p>
                    <p className="font-bold">{layout.rows}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Seats</p>
                    <p className="font-bold text-blue-600">{totalSeats}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm capitalize">{layout.layout_type}</p>
                  </div>
                </div>

                {renderSeatMap(layout.pattern, layout.rows)}

                <div className="flex items-center gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(layout)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(layout)}
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingLayout ? 'Edit Seat Layout' : 'Add Seat Layout'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.layoutable_type}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        layoutable_type: e.target.value as 'transport' | 'facility',
                        layoutable_id: '',
                      });
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transport">Transport</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.layoutable_type === 'transport' ? 'Transport *' : 'Facility *'}
                  </label>
                  <select
                    value={formData.layoutable_id}
                    onChange={(e) => setFormData({ ...formData, layoutable_id: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {formData.layoutable_type}</option>
                    {(formData.layoutable_type === 'transport' ? transports : facilities).map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {errors.layoutable_id && <p className="text-red-500 text-sm mt-1">{errors.layoutable_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seat Pattern *
                  </label>
                  <input
                    type="text"
                    value={formData.pattern}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g., 2-2, 3-2, 2-2-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: numbers separated by dashes (e.g., 2-2 for aisle seats)</p>
                  {errors.pattern && <p className="text-red-500 text-sm mt-1">{errors.pattern}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Rows *
                  </label>
                  <input
                    type="number"
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  {errors.rows && <p className="text-red-500 text-sm mt-1">{errors.rows}</p>}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Total seats: <strong>{calculateTotalUnits(formData.pattern, formData.rows)} seats</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingLayout ? 'Update' : 'Create'}
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
                <h3 className="text-xl font-bold">Delete Seat Layout</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the seat layout for <strong>{getLayoutableName(deleteConfirm)}</strong>?
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