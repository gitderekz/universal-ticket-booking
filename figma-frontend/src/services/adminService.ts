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
  roles?: Array<{
    id: string;
    name: string;
    slug: string;
    UserRole?: {
      company_id?: string;
    };
  }>;
  Roles?: Array<{
    id: string;
    name: string;
    slug: string;
    UserRole?: {
      company_id?: string;
    };
  }>;
  ownedCompanies?: Array<{
    id: string;
    name: string;
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

// Transport Types
export const getTransportTypes = async () => {
  const response = await apiClient.get('/transport-types');
  return response.data;
};

export const createTransportType = async (data: {
  name: string;
  slug: string;
  category: 'land' | 'air' | 'water';
  description?: string;
  requires_routes?: boolean;
  requires_layout?: boolean;
  active?: boolean;
}) => {
  const response = await apiClient.post('/transport-types', data);
  return response.data;
};

export const updateTransportType = async (id: string, data: any) => {
  const response = await apiClient.put(`/transport-types/${id}`, data);
  return response.data;
};

export const deleteTransportType = async (id: string) => {
  const response = await apiClient.delete(`/transport-types/${id}`);
  return response.data;
};

// Facility Types
export const getFacilityTypes = async () => {
  const response = await apiClient.get('/facility-types');
  return response.data;
};

export const createFacilityType = async (data: {
  name: string;
  slug: string;
  category: string;
  description?: string;
  active?: boolean;
}) => {
  const response = await apiClient.post('/facility-types', data);
  return response.data;
};

export const updateFacilityType = async (id: string, data: any) => {
  const response = await apiClient.put(`/facility-types/${id}`, data);
  return response.data;
};

export const deleteFacilityType = async (id: string) => {
  const response = await apiClient.delete(`/facility-types/${id}`);
  return response.data;
};

// Stations
export const getStations = async (params?: { company_id?: string; search?: string }) => {
  const response = await apiClient.get('/stations', { params });
  return response.data;
};

export const createStation = async (data: {
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  address?: string;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  type?: 'origin' | 'destination' | 'intermediate' | 'terminal';
}) => {
  const response = await apiClient.post('/stations', data);
  return response.data;
};

export const updateStation = async (id: string, data: any) => {
  const response = await apiClient.put(`/stations/${id}`, data);
  return response.data;
};

export const deleteStation = async (id: string) => {
  const response = await apiClient.delete(`/stations/${id}`);
  return response.data;
};

// Seat Layouts
export const getSeatLayouts = async (params?: { layoutable_type?: string; layoutable_id?: string }) => {
  const response = await apiClient.get('/seat-layouts', { params });
  return response.data;
};

export const createSeatLayout = async (data: {
  layoutable_id: string;
  layoutable_type: 'transport' | 'facility';
  pattern: string;
  rows: number;
  layout_type?: string;
}) => {
  const response = await apiClient.post('/seat-layouts', data);
  return response.data;
};

export const updateSeatLayout = async (id: string, data: any) => {
  const response = await apiClient.put(`/seat-layouts/${id}`, data);
  return response.data;
};

export const deleteSeatLayout = async (id: string) => {
  const response = await apiClient.delete(`/seat-layouts/${id}`);
  return response.data;
};

// Roles
export const getRoles = async () => {
  const response = await apiClient.get('/roles');
  return response.data;
};

export const createRole = async (data: { name: string; slug: string; description?: string }) => {
  const response = await apiClient.post('/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: any) => {
  const response = await apiClient.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await apiClient.delete(`/roles/${id}`);
  return response.data;
};

// Currencies
export const getCurrencies = async () => {
  const response = await apiClient.get('/currencies');
  return response.data;
};

export const createCurrency = async (data: {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_base?: boolean;
  active?: boolean;
}) => {
  const response = await apiClient.post('/currencies', data);
  return response.data;
};

export const updateCurrency = async (id: string, data: any) => {
  const response = await apiClient.put(`/currencies/${id}`, data);
  return response.data;
};

export const deleteCurrency = async (id: string) => {
  const response = await apiClient.delete(`/currencies/${id}`);
  return response.data;
};

// Journeys
// export const getJourneys = async (params?: { route_id?: string; status?: string; date?: string }) => {
//   const response = await apiClient.get('/journeys', { params });
//   return response.data;
// };
export const getJourneys = async (params?: { 
  route_id?: string; 
  transport_id?: string; 
  status?: string; 
  date?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/journeys', { params });
  // Return the full response which contains { journeys, total, limit, offset }
  return response.data;
};

export const getJourney = async (id: string) => {
  const response = await apiClient.get(`/journeys/${id}`);
  return response.data;
};

export const createJourney = async (data: {
  route_id: string;
  transport_id: string;
  journey_date: string;
  departure_at: string;
  arrival_at: string;
  available_seats: number;
  status?: string;
  delay_minutes?: number;
}) => {
  const response = await apiClient.post('/journeys', data);
  return response.data;
};

export const updateJourney = async (id: string, data: any) => {
  const response = await apiClient.put(`/journeys/${id}`, data);
  return response.data;
};

export const deleteJourney = async (id: string) => {
  const response = await apiClient.delete(`/journeys/${id}`);
  return response.data;
};