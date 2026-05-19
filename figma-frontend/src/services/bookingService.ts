import apiClient from './apiClient';

export interface SeatHold {
  id: string;
  journey_id: string;
  seat_code: string;
  user_id: string;
  status: string;
  expires_at: string;
  start_station?: string;
  end_station?: string;
  occupied_segments?: string[];
  traveled_segment_count?: number;
}

export interface BookingItem {
  booking_id?: string;
  passenger_name: string;
  passenger_type: string;
  unit_price: number;
  seat_code?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  journey_id: string;
  status: string;
  total_amount: number;
  passenger_count: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  expires_at: string;
  SeatHolds?: SeatHold[];
  BookingItems?: BookingItem[];
}

export const seatHoldService = {
  holdSeats: async (
    journeyId: string | null,
    seatCodes: string[],
    startStation?: string,
    endStation?: string
  ) => {
    const response = await apiClient.post<{ holds: SeatHold[]; expires_at: string }>('/seat-holds/hold', {
      journey_id: journeyId,
      seat_codes: seatCodes,
      start_station: startStation,
      end_station: endStation
    });
    return response.data;
  },

  releaseSeats: async (journeyId: string, seatCodes: string[]) => {
    const response = await apiClient.post<{ released: number }>('/seat-holds/release', {
      journey_id: journeyId,
      seat_codes: seatCodes,
    });
    return response.data;
  },
};

export const bookingService = {
  listBookings: async () => {
    const response = await apiClient.get<{ bookings: Booking[] }>('/bookings');
    return response.data.bookings;
  },

  createBooking: async (bookingData: {
    journey_id?: string | null;
    activity_instance_id?: string | null;
    seat_codes: string[];
    booking_type?: string;
    start_station?: string;
    end_station?: string;
    occupied_segments?: string[];
    traveled_segment_count?: number;
    items: BookingItem[];
    total_amount: number;
    currency_id?: string;
    passenger_count: number;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post<{ booking: Booking; message: string }>('/bookings', bookingData);
    return response.data;
  },

  getBooking: async (bookingCode: string) => {
    const response = await apiClient.get<Booking>(`/bookings/${bookingCode}`);
    return response.data;
  },
};
