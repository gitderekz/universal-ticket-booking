import { apiClient } from './apiClient';

export interface SystemLog {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  action: string;
  module: string;
  status: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  details?: string;
  ip_address?: string | null;
  mac_address?: string | null;
  User?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SystemLogResponse {
  logs: SystemLog[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export const getSystemLogs = async (
  page = 1,
  limit = 15,
  search = '',
  status: string = 'all',
  module: string = 'all'
): Promise<SystemLogResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (module) params.append('module', module);
  const response = await apiClient.get(`/admin/system-logs?${params.toString()}`);
  return response.data;
};

export const clearSystemLogs = async (): Promise<void> => {
  await apiClient.delete('/admin/system-logs');
};
