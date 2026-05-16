import React, { useState, useEffect } from 'react';
import { Armchair, User, RotateCcw, Navigation, Train, Plane, Ship, Anchor, Gamepad2, Trophy, Radio, MapPin, Zap, Disc3 } from 'lucide-react';
import { useBooking } from '../../../contexts/BookingContext';

interface SeatSelectorProps {
  sittingPlan?: string;
  sittingLength?: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  occupiedSeats?: string[];
  heldSeats?: string[];
  frontPosition?: 'top' | 'left' | 'right';
  typeSlug?: string;
}

const generateRowLabel = (index: number): string => {
  // Excel-like column naming: A-Z, AA-AZ, BA-BZ, ..., ZA-ZZ, AAA-AAZ, etc.
  let label = '';
  let num = index;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  while (num >= 0) {
    label = chars[num % 26] + label;
    num = Math.floor(num / 26) - 1;
  }
  
  return label;
};

const getFrontVisual = (typeSlug?: string): React.ReactNode => {
  const iconSize = 48;
  const baseClass = 'text-blue-600 dark:text-blue-400';
  
  // Transport types with steering wheel visuals
  if (typeSlug?.includes('bus') || typeSlug?.includes('minibus') || typeSlug?.includes('mini_bus') || typeSlug?.includes('safari')) {
    return (
      <div className="flex flex-col items-center gap-2">
        <User className={`w-8 h-8 ${baseClass}`} />
        <RotateCcw className={`w-8 h-8 ${baseClass}`} />
      </div>
    );
  }
  
  // Train
  if (typeSlug?.includes('train')) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Radio className={`w-10 h-10 ${baseClass}`} />
        <Train className={`w-10 h-10 ${baseClass}`} />
      </div>
    );
  }
  
  // Airplane
  if (typeSlug?.includes('aeroplane') || typeSlug?.includes('airplane') || typeSlug?.includes('air')) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Plane className={`w-10 h-10 ${baseClass}`} />
        <Zap className={`w-6 h-6 ${baseClass}`} />
      </div>
    );
  }
  
  // Boat/Ship with navigation wheel
  if (typeSlug?.includes('boat') || typeSlug?.includes('ship') || typeSlug?.includes('ferry') || typeSlug?.includes('water')) {
    return (
      <div className="flex flex-col items-center gap-2">
        <User className={`w-8 h-8 ${baseClass}`} />
        <Disc3 className={`w-10 h-10 ${baseClass}`} />
      </div>
    );
  }
  
  // Facility types
  
  // Stadium/Sports
  if (typeSlug?.includes('stadium') || typeSlug?.includes('sports') || typeSlug?.includes('field')) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className={`w-10 h-10 ${baseClass}`} />
        <div className="w-12 h-8 bg-green-500 rounded-lg border-2 border-green-600"></div>
      </div>
    );
  }
  
  // Cinema/Entertainment
  if (typeSlug?.includes('cinema') || typeSlug?.includes('theater') || typeSlug?.includes('theatre') || typeSlug?.includes('entertainment')) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 bg-purple-500 rounded border-2 border-purple-600 flex items-center justify-center">
          <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
        </div>
        <Zap className={`w-6 h-6 text-yellow-500`} />
      </div>
    );
  }
  
  // Event
  if (typeSlug?.includes('event')) {
    return (
      <div className="flex items-center gap-3">
        <MapPin className={`w-8 h-8 text-red-500`} />
        <Zap className={`w-8 h-8 text-yellow-500`} />
      </div>
    );
  }
  
  // Outdoor
  if (typeSlug?.includes('outdoor') || typeSlug?.includes('camping') || typeSlug?.includes('park')) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-600"></div>
        <MapPin className={`w-8 h-8 text-green-600`} />
      </div>
    );
  }
  
  // Housing/Accommodation
  if (typeSlug?.includes('housing') || typeSlug?.includes('hotel') || typeSlug?.includes('accommodation')) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
        <div className="w-8 h-8 border-2 border-blue-600 rounded-t-lg"></div>
      </div>
    );
  }
  
  // Default fallback
  return (
    <Armchair className={`w-10 h-10 ${baseClass}`} />
  );
};

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  sittingPlan,
  sittingLength,
  selectedSeats,
  onSeatsChange,
  occupiedSeats = [],
  heldSeats = [],
  frontPosition = 'top',
  typeSlug,
}) => {
  const { remoteHeldSeats } = useBooking();
  const [seats, setSeats] = useState<string[][]>([]);
  const [lockedSeats, setLockedSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const plan = (sittingPlan || '2-2')
      .split('-')
      .map(Number)
      .filter((value) => !Number.isNaN(value) && value > 0);
    const normalizedPlan = plan.length > 0 ? plan : [2, 2];
    const rowsCount = sittingLength && sittingLength > 0 ? sittingLength : Math.max(6, normalizedPlan.reduce((sum, value) => sum + value, 0) * 5);
    const rows: string[][] = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let row = 0; row < rowsCount; row++) {
      const rowSeats: string[] = [];
      let seatNumber = 1;

      normalizedPlan.forEach((section, sectionIndex) => {
        for (let i = 0; i < section; i++) {
          rowSeats.push(`${letters[row]}${seatNumber++}`);
        }
        if (sectionIndex < normalizedPlan.length - 1) {
          rowSeats.push('aisle');
        }
      });

      rows.push(rowSeats);
    }

    setSeats(rows);
  }, [sittingPlan, sittingLength]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      const timer = setTimeout(() => {
        setLockedSeats(new Set(selectedSeats));
      }, 300000);

      return () => clearTimeout(timer);
    }
  }, [selectedSeats]);

  const handleSeatClick = (seat: string) => {
    if (seat === 'A1' || occupiedSeats.includes(seat) || heldSeats.includes(seat) || lockedSeats.has(seat) || remoteHeldSeats.has(seat)) return;

    if (selectedSeats.includes(seat)) {
      onSeatsChange(selectedSeats.filter(s => s !== seat));
    } else {
      onSeatsChange([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat: string) => {
    if (seat === 'aisle') return '';
    if (seat === 'A1') return 'bg-yellow-500 cursor-not-allowed';
    if (occupiedSeats.includes(seat)) return 'bg-red-500 cursor-not-allowed';
    if (heldSeats.includes(seat) || remoteHeldSeats.has(seat)) return 'bg-orange-400 cursor-not-allowed';
    if (selectedSeats.includes(seat)) return 'bg-green-500 cursor-pointer';
    return 'bg-blue-500 hover:bg-blue-600 cursor-pointer';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Your Seats</h2>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-400 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Held</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Driver</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex w-full justify-center">
        <div className={`w-full max-w-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center ${
          frontPosition === 'left'
            ? 'justify-start'
            : frontPosition === 'right'
            ? 'justify-end'
            : 'justify-center'
        }`}>
          <div className="text-center">
            {getFrontVisual(typeSlug)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div>
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-2 mb-3">
                <span className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">
                  {generateRowLabel(rowIndex)}
                </span>
                {row.map((seat, seatIndex) => (
                  seat === 'aisle' ? (
                    <div key={seatIndex} className="w-12"></div>
                  ) : (
                    <button
                      key={seatIndex}
                      onClick={() => handleSeatClick(seat)}
                      disabled={occupiedSeats.includes(seat) || seat === 'A1' || heldSeats.includes(seat) || remoteHeldSeats.has(seat)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all ${getSeatColor(seat)}`}
                      title={seat}
                    >
                      {seat === 'A1' ? (
                        <User className="w-6 h-6" />
                      ) : (
                        <Armchair className="w-6 h-6" />
                      )}
                    </button>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You have 5 minutes to complete your booking. Your selected seats will be released after this time.
          </p>
        </div>
      )}
    </div>
  );
};
