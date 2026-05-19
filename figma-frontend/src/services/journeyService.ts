import apiClient from './apiClient';

export interface Journey {
  id: string;
  route_id: string;
  journey_date: string;
  departure_at: string;
  arrival_at: string;
  available_units: number;
  booked_units: number;
  held_units: number;
  status: string;
}

export interface SeatAvailability {
  journey_id: string;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  held_seats: number;
  seatMap?: any[];
  seat_map?: Record<string, string>;
}

export const journeyService = {
  searchJourneys: async (params: {
    origin_station_id?: string;
    destination_station_id?: string;
    journey_date: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get<{ journeys: Journey[]; total: number }>('/journeys/search', {
      params,
    });
    return response.data;
  },

  getJourney: async (id: string) => {
    const response = await apiClient.get<{ journey: Journey }>(`/journeys/${id}`);
    return response.data.journey;
  },

  getAvailability: async (journeyId: string) => {
    const response = await apiClient.get<SeatAvailability>(`/seat-holds/${journeyId}/availability`);
    return response.data;
  },
};
