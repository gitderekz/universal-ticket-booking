import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role?: string; // This will be derived from Roles
  status: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  Roles?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface Company {
  id: string;
  owner_id?: string | null;
  name: string;
  slug?: string;
  description: string;
  category: string;
  status: string;
  logo_url?: string | null;
  contact_email?: string;
  contact_phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transport {
  id: string;
  company_id: string;
  transport_type_id: string;
  name: string;
  registration_number: string;
  description?: string;
  capacity: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  Company?: Company;
  type?: string;
  sittingPlan?: string;
  sittingLength?: number;
  TransportType?: {
    id: string;
    name: string;
    slug: string;
    category?: string;
  };
}

export interface Facility {
  id: string;
  company_id: string;
  facility_type_id: string;
  name: string;
  slug?: string;
  description: string;
  location: Record<string, any>;
  capacity: number;
  base_price: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  Company?: Company;
  FacilityType?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalTransports: number;
  totalFacilities: number;
  activeBookings: number;
  totalRevenue: number;
}

// Users
export const getUsers = async (page = 1, limit = 10, search = '') => {
  const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createUser = async (userData: {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_slug: string;
  password: string;
  company_id?: string;
}) => {
  const response = await apiClient.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<{
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_slug: string;
  status: string;
  company_id?: string;
}>) => {
  const response = await apiClient.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

// Companies
export const getCompanies = async (page = 1, limit = 10, search = '') => {
  const response = await apiClient.get(`/admin/companies?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createCompany = async (companyData: {
  owner_id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category?: string;
  status?: string;
}) => {
  const response = await apiClient.post('/admin/companies', companyData);
  return response.data;
};

export const updateCompany = async (id: string, companyData: Partial<{
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  category: string;
}>) => {
  const response = await apiClient.put(`/admin/companies/${id}`, companyData);
  return response.data;
};

export const deleteCompany = async (id: number) => {
  const response = await apiClient.delete(`/admin/companies/${id}`);
  return response.data;
};

// Transports
export const getTransports = async (page = 1, limit = 10, search = '') => {
  const response = await apiClient.get(`/admin/transports?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createTransport = async (transportData: {
  company_id: string;
  transport_type_slug: string;
  name: string;
  registration_number: string;
  capacity: number;
  description?: string;
  status?: string;
}) => {
  const response = await apiClient.post('/admin/transports', transportData);
  return response.data;
};

export const updateTransport = async (id: string, transportData: Partial<{
  company_id: string;
  transport_type_slug: string;
  name: string;
  registration_number: string;
  capacity: number;
  description: string;
  status: string;
}>) => {
  const response = await apiClient.put(`/admin/transports/${id}`, transportData);
  return response.data;
};

export const deleteTransport = async (id: string) => {
  const response = await apiClient.delete(`/admin/transports/${id}`);
  return response.data;
};

// Facilities
export const getFacilities = async (page = 1, limit = 10, search = '') => {
  const response = await apiClient.get(`/admin/facilities?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createFacility = async (facilityData: {
  company_id: string;
  facility_type_slug: string;
  name: string;
  description: string;
  location?: Record<string, any>;
  capacity: number;
  base_price?: number;
  features?: Record<string, any>;
  images?: string[];
  status?: string;
}) => {
  const response = await apiClient.post('/admin/facilities', facilityData);
  return response.data;
};

export const updateFacility = async (id: string, facilityData: Partial<{
  company_id: string;
  facility_type_slug: string;
  name: string;
  description: string;
  location: Record<string, any>;
  capacity: number;
  base_price: number;
  features: Record<string, any>;
  images: string[];
  status: string;
}>) => {
  const response = await apiClient.put(`/admin/facilities/${id}`, facilityData);
  return response.data;
};

export const deleteFacility = async (id: number) => {
  const response = await apiClient.delete(`/admin/facilities/${id}`);
  return response.data;
};

// Stats
export const getAdminStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};