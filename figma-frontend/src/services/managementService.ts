import apiClient from './apiClient';

export interface RouteStation {
  id: string;
  name: string;
  city?: string;
  order?: number;
  price?: number;
  isBreakStop?: boolean;
}

export interface RouteItem {
  id: string;
  name: string;
  description?: string;
  base_price?: number;
  distance_km?: number;
  status?: string;
  transport?: {
    id: string;
    name: string;
    category?: string;
    slug?: string;
  };
  originStation?: {
    id: string;
    name: string;
    city?: string;
  };
  destinationStation?: {
    id: string;
    name: string;
    city?: string;
  };
  RouteStations?: Array<{ id: string; station?: { id: string; name: string; city?: string }; order?: number }>;
}

export interface ActivityItem {
  id: string;
  facility_id?: string;
  facility?: {
    id: string;
    name: string;
  };
  name: string;
  description?: string;
  activity_type?: string;
  duration_minutes?: number;
  max_participants?: number;
  base_price?: number;
  category?: string;
  status?: string;
  requirements?: string;
}

export interface TimetableItem {
  id: string;
  route_id?: string;
  transport_id?: string;
  journey_date: string;
  departure_at: string;
  arrival_at: string;
  available_seats: number;
  Route?: {
    id: string;
    name: string;
    base_price?: number;
    originStation?: {
      id: string;
      name: string;
      city?: string;
    };
    destinationStation?: {
      id: string;
      name: string;
      city?: string;
    };
  };
  Transport?: {
    id: string;
    name: string;
    capacity?: number;
    registration_number?: string;
    TransportType?: {
      name: string;
    };
  };
  Timetable?: {
    id: string;
    departure_time: string;
    arrival_time: string;
  };
}

export const getRoutes = async () => {
  const response = await apiClient.get<{ routes: RouteItem[] }>('/routes');
  return response.data.routes;
};

export const getActivities = async () => {
  const response = await apiClient.get<{ activities: ActivityItem[] }>('/activities');
  return response.data.activities;
};

export const getTimetables = async (routeId?: string, transportId?: string) => {
  const params = new URLSearchParams();
  if (routeId) params.append('route_id', routeId);
  if (transportId) params.append('transport_id', transportId);
  
  const response = await apiClient.get<{ journeys: TimetableItem[] }>(`/journeys/by-route?${params}`);
  return response.data.journeys;
};

export const managementService = {
  getRoutes,
  getActivities,
  getTimetables,
};
