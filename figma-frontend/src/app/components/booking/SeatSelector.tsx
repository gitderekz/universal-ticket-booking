import React, { useState, useEffect } from 'react';
import { Armchair, User } from 'lucide-react';
import { useBooking } from '../../../contexts/BookingContext';

interface SeatSelectorProps {
  sittingPlan?: string;
  sittingLength?: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  occupiedSeats?: string[];
  heldSeats?: string[];
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  sittingPlan,
  sittingLength,
  selectedSeats,
  onSeatsChange,
  occupiedSeats = [],
  heldSeats = [],
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

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block">
        <div className="text-center text-gray-700 dark:text-gray-300 font-bold mb-2">
          Front / Driver
        </div>
        <div className="w-16 h-4 bg-gray-400 rounded-t-full mx-auto"></div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center gap-2 mb-3">
              <span className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">
                {String.fromCharCode(65 + rowIndex)}
              </span>
              {row.map((seat, seatIndex) => (
                seat === 'aisle' ? (
                  <div key={seatIndex} className="w-12"></div>
                ) : (
                  <button
                    key={seatIndex}
                    onClick={() => handleSeatClick(seat)}
                    disabled={occupiedSeats.includes(seat) || seat === 'A1' || remoteHeldSeats.has(seat)}
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
