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

export const createRoute = async (routeData: {
  company_id: string;
  transport_id: string;
  name: string;
  description?: string;
  origin_station_name?: string;
  destination_station_name?: string;
  base_price: number;
  distance_km?: number;
  status?: string;
  parent_route_id?: string;
  stations?: any[];
}) => {
  const response = await apiClient.post<{ route: RouteItem }>('/routes', routeData);
  return response.data.route;
};

export const updateRoute = async (id: string, routeData: Partial<{
  company_id: string;
  transport_id: string;
  name: string;
  description: string;
  origin_station_name: string;
  destination_station_name: string;
  base_price: number;
  distance_km: number;
  status: string;
  parent_route_id: string;
  stations: any[];
}>) => {
  const response = await apiClient.put<{ route: RouteItem }>(`/routes/${id}`, routeData);
  return response.data.route;
};

export const deleteRoute = async (id: string) => {
  const response = await apiClient.delete(`/routes/${id}`);
  return response.data;
};

export const getActivities = async () => {
  const response = await apiClient.get<{ activities: ActivityItem[] }>('/activities');
  return response.data.activities;
};

export const createActivity = async (activityData: {
  facility_id: string;
  name: string;
  description?: string;
  activity_type: string;
  duration_minutes?: number;
  max_participants?: number;
  base_price?: number;
  category?: string;
  requirements?: string;
  status?: string;
}) => {
  const response = await apiClient.post<{ activity: ActivityItem }>('/activities', activityData);
  return response.data.activity;
};

export const updateActivity = async (id: string, activityData: Partial<{
  facility_id: string;
  name: string;
  description: string;
  activity_type: string;
  duration_minutes: number;
  max_participants: number;
  base_price: number;
  category: string;
  requirements: string;
  status: string;
}>) => {
  const response = await apiClient.put<{ activity: ActivityItem }>(`/activities/${id}`, activityData);
  return response.data.activity;
};

export const deleteActivity = async (id: string) => {
  const response = await apiClient.delete(`/activities/${id}`);
  return response.data;
};

export const getTimetables = async (routeId?: string, transportId?: string) => {
  const params = new URLSearchParams();
  if (routeId) params.append('route_id', routeId);
  if (transportId) params.append('transport_id', transportId);
  
  const response = await apiClient.get<{ journeys: TimetableItem[] }>(`/journeys/by-route?${params}`);
  return response.data.journeys;
};

export const createJourney = async (journeyData: {
  timetable_id?: string;
  transport_id?: string;
  route_id: string;
  journey_date: string;
  departure_at: string;
  arrival_at: string;
  status?: string;
  available_seats: number;
  booked_seats?: number;
  held_seats?: number;
  delay_minutes?: number;
  cancellation_reason?: string;
}) => {
  const response = await apiClient.post<{ journey: TimetableItem }>('/journeys', journeyData);
  return response.data.journey;
};

export const updateJourney = async (id: string, journeyData: Partial<{
  timetable_id?: string;
  transport_id?: string;
  route_id?: string;
  journey_date?: string;
  departure_at?: string;
  arrival_at?: string;
  status?: string;
  available_seats?: number;
  booked_seats?: number;
  held_seats?: number;
  delay_minutes?: number;
  cancellation_reason?: string;
}>) => {
  const response = await apiClient.put<{ journey: TimetableItem }>(`/journeys/${id}`, journeyData);
  return response.data.journey;
};

export const deleteJourney = async (id: string) => {
  const response = await apiClient.delete(`/journeys/${id}`);
  return response.data;
};

export const getActivityInstances = async (activityId?: string, date?: string) => {
  const params = new URLSearchParams();
  if (activityId) params.append('activity_id', activityId);
  if (date) params.append('date', date);
  const response = await apiClient.get<{ activityInstances: TimetableItem[] }>(`/facilities/instances/list?${params}`);
  return response.data.activityInstances;
};

export const createActivityInstance = async (instanceData: {
  activity_id: string;
  facility_id: string;
  start_at: string;
  end_at: string;
  total_slots: number;
  available_slots: number;
  price_modifier?: number;
  special_notes?: string;
  status?: string;
}) => {
  const response = await apiClient.post<{ activityInstance: any }>('/facilities/instances', instanceData);
  return response.data.activityInstance;
};

export const updateActivityInstance = async (id: string, instanceData: Partial<{
  start_at?: string;
  end_at?: string;
  total_slots?: number;
  available_slots?: number;
  price_modifier?: number;
  special_notes?: string;
  status?: string;
}>) => {
  const response = await apiClient.put<{ activityInstance: any }>(`/facilities/instances/${id}`, instanceData);
  return response.data.activityInstance;
};

export const deleteActivityInstance = async (id: string) => {
  const response = await apiClient.delete(`/facilities/instances/${id}`);
  return response.data;
};

export const managementService = {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getTimetables,
  createJourney,
  updateJourney,
  deleteJourney,
  getActivityInstances,
  createActivityInstance,
  updateActivityInstance,
  deleteActivityInstance,
};
