import { apiClient } from './apiClient';

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  categoryBreakdown?: Array<{ name: string; value: number }>;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface TopItem {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

export const getBookingAnalytics = async (fromDate?: string, toDate?: string): Promise<BookingAnalytics> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await apiClient.get(`/reports/bookings/analytics?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    throw error;
  }
};

export const getRevenueTrend = async (fromDate?: string, toDate?: string, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<RevenueTrendData[]> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('groupBy', groupBy);
    
    const response = await apiClient.get(`/reports/revenue-trend?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    throw error;
  }
};

export const getTopItems = async (fromDate?: string, toDate?: string, limit: number = 10): Promise<{ topRoutes: TopItem[]; topActivities: TopItem[] }> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/reports/top-items?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top items:', error);
    throw error;
  }
};
