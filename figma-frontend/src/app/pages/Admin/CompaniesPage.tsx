// figma-frontend/src/app/pages/Admin/CompaniesPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getCompanies, createCompany, updateCompany, deleteCompany, Company } from '../../../services/adminService';
import { Plus, Building2, Edit, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

export const CompaniesPage = () => {
  const { t } = useTranslation();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transport' | 'facility'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'transport' as 'transport' | 'facility',
    description: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const response = await getCompanies(1, 100, '');
        setCompanies(response.companies || []);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast.error('Unable to load companies');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || company.category === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: companies.length,
    transport: companies.filter(c => c.category === 'transport').length,
    facility: companies.filter(c => c.category === 'facility').length,
  };

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        category: company.category as 'transport' | 'facility',
        description: company.description || '',
        email: company.contact_email || '',
        phone: company.contact_phone || '',
        address: company.address || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        category: 'transport',
        description: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingCompany) {
        const updated = await updateCompany(editingCompany.id, {
          name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.phone,
          address: formData.address,
          status: 'active',
          category: formData.category,
          description: formData.description,
        });

        setCompanies(prev => prev.map(c =>
          c.id === updated.id ? { ...c, ...updated } : c
        ));

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated company: ${formData.name}`,
          module: 'companies',
          status: 'success',
          details: `Category: ${formData.category}`,
        });

        toast.success('Company updated successfully');
      } else {
        const created = await createCompany({
          name: formData.name,
          slug: generateSlug(formData.name), // Add this!
          contact_email: formData.email,
          contact_phone: formData.phone,
          address: formData.address,
          category: formData.category,
          description: formData.description,
          status: 'active',
        });

        setCompanies(prev => [created, ...prev]);

        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created company: ${formData.name}`,
          module: 'companies',
          status: 'success',
          details: `Category: ${formData.category}`,
        });

        toast.success('Company created successfully');
      }

      setShowModal(false);
      setEditingCompany(null);
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.response?.data?.message || 'Unable to save company');
    }
  };

  const handleDelete = async (company: Company) => {
    try {
      await deleteCompany(company.id);
      setCompanies(prev => prev.filter(c => c.id !== company.id));

      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted company: ${company.name}`,
        module: 'companies',
        status: 'warning',
        details: `Category: ${company.category}`,
      });

      setDeleteConfirm(null);
      toast.success('Company deleted successfully');
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast.error(error.response?.data?.message || 'Unable to delete company');
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
            {t('nav.companies')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all registered companies
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Total Companies</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Transport Companies</p>
          <p className="text-3xl font-bold">{stats.transport}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
        >
          <p className="text-sm opacity-90 mb-1">Facility Companies</p>
          <p className="text-3xl font-bold">{stats.facility}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') + ' companies...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'transport', 'facility'] as const).map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
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
                    <Building2 className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{company.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      company.category === 'transport'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    }`}>
                      {company.category}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {company.description || 'No description provided'}
              </p>
              {(company.contact_email || company.contact_phone) && (
                <div className="mb-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {company.contact_email && <p>📧 {company.contact_email}</p>}
                  {company.contact_phone && <p>📞 {company.contact_phone}</p>}
                </div>
              )}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenModal(company)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(company)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
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
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter company name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Type *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'transport' | 'facility' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="transport">Transport Company</option>
                    <option value="facility">Facility Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter company description"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+255 XXX XXX XXX"
                  />
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
                    {editingCompany ? 'Update' : 'Create'}
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
                  Delete Company
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
// import { getCompanies, createCompany, updateCompany, deleteCompany, Company } from '../../../services/adminService';
// import { Plus, Building2, Edit, Trash2, Search, AlertTriangle, X } from 'lucide-react';
// import { useSystemLogs } from '../../../contexts/SystemLogsContext';
// import { useAuth } from '../../../contexts/AuthContext';
// import { toast } from 'sonner';

// export const CompaniesPage = () => {
//   const { t } = useTranslation();
//   const { addLog } = useSystemLogs();
//   const { user } = useAuth();

//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<'all' | 'transport' | 'facility'>('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editingCompany, setEditingCompany] = useState<Company | null>(null);
//   const [deleteConfirm, setDeleteConfirm] = useState<Company | null>(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     category: 'transport' as 'transport' | 'facility',
//     description: '',
//     email: '',
//     phone: '',
//     address: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const loadCompanies = async () => {
//       setLoading(true);
//       try {
//         const response = await getCompanies(1, 100, '');
//         setCompanies(response.companies || []);
//       } catch (error) {
//         console.error('Error loading companies:', error);
//         toast.error('Unable to load companies');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCompanies();
//   }, []);

//   const filteredCompanies = companies.filter(company => {
//     const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (company.description || '').toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = filterType === 'all' || company.category === filterType;
//     return matchesSearch && matchesType;
//   });

//   const stats = {
//     total: companies.length,
//     transport: companies.filter(c => c.category === 'transport').length,
//     facility: companies.filter(c => c.category === 'facility').length,
//   };

//   const handleOpenModal = (company?: Company) => {
//     if (company) {
//       setEditingCompany(company);
//       setFormData({
//         name: company.name,
//         category: company.category as 'transport' | 'facility',
//         description: company.description || '',
//         email: company.contact_email || '',
//         phone: company.contact_phone || '',
//         address: '',
//       });
//     } else {
//       setEditingCompany(null);
//       setFormData({
//         name: '',
//         category: 'transport',
//         description: '',
//         email: '',
//         phone: '',
//         address: '',
//       });
//     }
//     setErrors({});
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) newErrors.name = 'Company name is required';
//     if (!formData.description.trim()) newErrors.description = 'Description is required';

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       if (editingCompany) {
//         const updated = await updateCompany(editingCompany.id, {
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           address: formData.address,
//           status: 'active',
//           category: formData.category,
//         });

//         setCompanies(prev => prev.map(c =>
//           c.id === updated.id ? { ...c, ...updated } : c
//         ));

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Updated company: ${formData.name}`,
//           module: 'companies',
//           status: 'success',
//           details: `Category: ${formData.category}, Description: ${formData.description}`,
//         });

//         toast.success('Company updated successfully');
//       } else {
//         const created = await createCompany({
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           address: formData.address,
//           category: formData.category,
//           status: 'active',
//         });

//         setCompanies(prev => [created, ...prev]);

//         addLog({
//           userId: user?.id || '',
//           userName: user?.fullName || '',
//           action: `Created company: ${formData.name}`,
//           module: 'companies',
//           status: 'success',
//           details: `Category: ${formData.category}, Description: ${formData.description}`,
//         });

//         toast.success('Company created successfully');
//       }

//       setShowModal(false);
//       setEditingCompany(null);
//     } catch (error) {
//       console.error('Error saving company:', error);
//       toast.error('Unable to save company');
//     }
//   };

//   const handleDelete = async (company: Company) => {
//     try {
//       await deleteCompany(company.id);
//       setCompanies(prev => prev.filter(c => c.id !== company.id));

//       addLog({
//         userId: user?.id || '',
//         userName: user?.fullName || '',
//         action: `Deleted company: ${company.name}`,
//         module: 'companies',
//         status: 'warning',
//         details: `Category: ${company.category}`,
//       });

//       setDeleteConfirm(null);
//       toast.success('Company deleted successfully');
//     } catch (error) {
//       console.error('Error deleting company:', error);
//       toast.error('Unable to delete company');
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
//             {t('nav.companies')}
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Manage all registered companies
//           </p>
//         </div>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => handleOpenModal()}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//         >
//           <Plus className="w-5 h-5" />
//           Add Company
//         </motion.button>
//       </motion.div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Total Companies</p>
//           <p className="text-3xl font-bold">{stats.total}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Transport Companies</p>
//           <p className="text-3xl font-bold">{stats.transport}</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
//         >
//           <p className="text-sm opacity-90 mb-1">Facility Companies</p>
//           <p className="text-3xl font-bold">{stats.facility}</p>
//         </motion.div>
//       </div>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
//       >
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder={t('common.search') + ' companies...'}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//             />
//           </div>
//           <div className="flex gap-2">
//             {(['all', 'transport', 'facility'] as const).map((category) => (
//               <motion.button
//                 key={category}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setFilterType(category)}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   filterType === category
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
//               </motion.button>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Companies Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <AnimatePresence mode="popLayout">
//           {filteredCompanies.map((company, index) => (
//             <motion.div
//               key={company.id}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ delay: index * 0.05 }}
//               whileHover={{ y: -4 }}
//               className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <motion.div
//                     whileHover={{ rotate: 360 }}
//                     transition={{ duration: 0.5 }}
//                     className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
//                   >
//                     <Building2 className="w-6 h-6 text-white" />
//                   </motion.div>
//                   <div>
//                     <h3 className="font-bold text-gray-900 dark:text-white">{company.name}</h3>
//                     <span className={`text-xs px-2 py-1 rounded-full ${
//                       company.category === 'transport'
//                         ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
//                         : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
//                     }`}>
//                       {company.category}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
//                 {company.description}
//               </p>
//               <div className="flex items-center gap-2">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => handleOpenModal(company)}
//                   className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
//                 >
//                   <Edit className="w-4 h-4" />
//                   Edit
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setDeleteConfirm(company)}
//                   className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   Delete
//                 </motion.button>
//               </div>
//             </motion.div>
//           ))}
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
//               className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {editingCompany ? 'Edit Company' : 'Add New Company'}
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
//                     Company Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="Enter company name"
//                   />
//                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Type
//                   </label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) => setFormData({ ...formData, type: e.target.value as 'transport' | 'facility' })}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     <option value="transport">Transport</option>
//                     <option value="facility">Facility</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Description
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     rows={3}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="Enter company description"
//                   />
//                   {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
//                     {editingCompany ? 'Update' : 'Create'}
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
//                   Delete Company
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
