import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Booking, BookingItem, SeatHold } from '../services/bookingService';
import { seatHoldService, bookingService } from '../services/bookingService';
import { journeyService } from '../services/journeyService';
import { initSocket, joinJourneyRoom, leaveJourneyRoom, onSeatsHeld, onSeatsReleased } from '../services/socketClient';

interface BookingContextType {
  currentBooking: Booking | null;
  selectedSeats: string[];
  selectedJourneyId: string | null;
  heldSeats: Map<string, SeatHold>;
  isLoadingSeats: boolean;
  
  // Actions
  selectJourney: (journeyId: string) => void;
  selectSeats: (seats: string[]) => void;
  holdSeats: (seatCodes: string[]) => Promise<void>;
  releaseSeats: (seatCodes: string[]) => Promise<void>;
  createBooking: (bookingData: any) => Promise<Booking>;
  clearSelection: () => void;
  
  // Real-time updates
  remoteHeldSeats: Map<string, any>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [heldSeats, setHeldSeats] = useState<Map<string, SeatHold>>(new Map());
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [remoteHeldSeats, setRemoteHeldSeats] = useState<Map<string, any>>(new Map());

  // Initialize socket on mount
  useEffect(() => {
    const socket = initSocket();

    // Listen for remote seat holds
    onSeatsHeld((data) => {
      console.log('Remote seats held:', data);
      setRemoteHeldSeats((prev) => {
        const updated = new Map(prev);
        data.seats.forEach((seat: string) => {
          updated.set(seat, data);
        });
        return updated;
      });
    });

    // Listen for remote seat releases
    onSeatsReleased((data) => {
      console.log('Remote seats released:', data);
      setRemoteHeldSeats((prev) => {
        const updated = new Map(prev);
        data.seats.forEach((seat: string) => {
          updated.delete(seat);
        });
        return updated;
      });
    });

    return () => {
      // Cleanup
    };
  }, []);

  const selectJourney = useCallback((journeyId: string) => {
    if (selectedJourneyId) {
      leaveJourneyRoom(selectedJourneyId);
    }
    setSelectedJourneyId(journeyId);
    joinJourneyRoom(journeyId);
    setSelectedSeats([]);
    setHeldSeats(new Map());
  }, [selectedJourneyId]);

  const selectSeats = useCallback((seats: string[]) => {
    setSelectedSeats(seats);
  }, []);

  const holdSeats = useCallback(
    async (seatCodes: string[]) => {
      if (!selectedJourneyId) {
        throw new Error('No journey selected');
      }

      setIsLoadingSeats(true);
      try {
        const result = await seatHoldService.holdSeats(selectedJourneyId, seatCodes);
        const seatHoldsMap = new Map(heldSeats);
        result.holds.forEach((hold) => {
          seatHoldsMap.set(hold.seat_code, hold);
        });
        setHeldSeats(seatHoldsMap);
      } finally {
        setIsLoadingSeats(false);
      }
    },
    [selectedJourneyId, heldSeats]
  );

  const releaseSeats = useCallback(
    async (seatCodes: string[]) => {
      if (!selectedJourneyId) {
        throw new Error('No journey selected');
      }

      try {
        await seatHoldService.releaseSeats(selectedJourneyId, seatCodes);
        const seatHoldsMap = new Map(heldSeats);
        seatCodes.forEach((code) => {
          seatHoldsMap.delete(code);
        });
        setHeldSeats(seatHoldsMap);
      } catch (error) {
        console.error('Failed to release seats:', error);
        throw error;
      }
    },
    [selectedJourneyId, heldSeats]
  );

  const createBooking = useCallback(
    async (bookingData: any) => {
      setIsLoadingSeats(true);
      try {
        const result = await bookingService.createBooking({
          ...bookingData,
          journey_id: selectedJourneyId || bookingData.journey_id,
          seat_codes: selectedSeats,
        });
        setCurrentBooking(result.booking);
        return result.booking;
      } finally {
        setIsLoadingSeats(false);
      }
    },
    [selectedJourneyId, selectedSeats]
  );

  const clearSelection = useCallback(() => {
    if (selectedJourneyId) {
      leaveJourneyRoom(selectedJourneyId);
    }
    setCurrentBooking(null);
    setSelectedSeats([]);
    setSelectedJourneyId(null);
    setHeldSeats(new Map());
  }, [selectedJourneyId]);

  const value: BookingContextType = {
    currentBooking,
    selectedSeats,
    selectedJourneyId,
    heldSeats,
    isLoadingSeats,
    remoteHeldSeats,
    selectJourney,
    selectSeats,
    holdSeats,
    releaseSeats,
    createBooking,
    clearSelection,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
