// import React, { useState, useEffect } from 'react';
// import { Armchair, User, RotateCcw, Navigation, Train, Plane, Ship, Anchor, Gamepad2, Trophy, Radio, MapPin, Zap, Disc3 } from 'lucide-react';
// import { useBooking } from '../../../contexts/BookingContext';

// interface SeatSelectorProps {
//   sittingPlan?: string;
//   sittingLength?: number;
//   selectedSeats: string[];
//   onSeatsChange: (seats: string[]) => void;
//   occupiedSeats?: string[];
//   heldSeats?: string[];
//   frontPosition?: 'top' | 'left' | 'right';
//   typeSlug?: string;
// }

// const generateRowLabel = (index: number): string => {
//   // Excel-like column naming: A-Z, AA-AZ, BA-BZ, ..., ZA-ZZ, AAA-AAZ, etc.
//   let label = '';
//   let num = index;
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
//   while (num >= 0) {
//     label = chars[num % 26] + label;
//     num = Math.floor(num / 26) - 1;
//   }
  
//   return label;
// };

// const getFrontVisual = (typeSlug?: string): React.ReactNode => {
//   const iconSize = 48;
//   const baseClass = 'text-blue-600 dark:text-blue-400';
  
//   // Transport types with steering wheel visuals
//   if (typeSlug?.includes('bus') || typeSlug?.includes('minibus') || typeSlug?.includes('mini_bus') || typeSlug?.includes('safari')) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <User className={`w-8 h-8 ${baseClass}`} />
//         <RotateCcw className={`w-8 h-8 ${baseClass}`} />
//       </div>
//     );
//   }
  
//   // Train
//   if (typeSlug?.includes('train')) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <Radio className={`w-10 h-10 ${baseClass}`} />
//         <Train className={`w-10 h-10 ${baseClass}`} />
//       </div>
//     );
//   }
  
//   // Airplane
//   if (typeSlug?.includes('aeroplane') || typeSlug?.includes('airplane') || typeSlug?.includes('air')) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <Plane className={`w-10 h-10 ${baseClass}`} />
//         <Zap className={`w-6 h-6 ${baseClass}`} />
//       </div>
//     );
//   }
  
//   // Boat/Ship with navigation wheel
//   if (typeSlug?.includes('boat') || typeSlug?.includes('ship') || typeSlug?.includes('ferry') || typeSlug?.includes('water')) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <User className={`w-8 h-8 ${baseClass}`} />
//         <Disc3 className={`w-10 h-10 ${baseClass}`} />
//       </div>
//     );
//   }
  
//   // Facility types
  
//   // Stadium/Sports
//   if (typeSlug?.includes('stadium') || typeSlug?.includes('sports') || typeSlug?.includes('field')) {
//     return (
//       <div className="flex items-center gap-2">
//         <Trophy className={`w-10 h-10 ${baseClass}`} />
//         <div className="w-12 h-8 bg-green-500 rounded-lg border-2 border-green-600"></div>
//       </div>
//     );
//   }
  
//   // Cinema/Entertainment
//   if (typeSlug?.includes('cinema') || typeSlug?.includes('theater') || typeSlug?.includes('theatre') || typeSlug?.includes('entertainment')) {
//     return (
//       <div className="flex flex-col items-center gap-2">
//         <div className="w-8 h-8 bg-purple-500 rounded border-2 border-purple-600 flex items-center justify-center">
//           <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
//         </div>
//         <Zap className={`w-6 h-6 text-yellow-500`} />
//       </div>
//     );
//   }
  
//   // Event
//   if (typeSlug?.includes('event')) {
//     return (
//       <div className="flex items-center gap-3">
//         <MapPin className={`w-8 h-8 text-red-500`} />
//         <Zap className={`w-8 h-8 text-yellow-500`} />
//       </div>
//     );
//   }
  
//   // Outdoor
//   if (typeSlug?.includes('outdoor') || typeSlug?.includes('camping') || typeSlug?.includes('park')) {
//     return (
//       <div className="flex items-center gap-2">
//         <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-600"></div>
//         <MapPin className={`w-8 h-8 text-green-600`} />
//       </div>
//     );
//   }
  
//   // Housing/Accommodation
//   if (typeSlug?.includes('housing') || typeSlug?.includes('hotel') || typeSlug?.includes('accommodation')) {
//     return (
//       <div className="flex items-center gap-2">
//         <div className="w-8 h-8 border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
//           <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//         </div>
//         <div className="w-8 h-8 border-2 border-blue-600 rounded-t-lg"></div>
//       </div>
//     );
//   }
  
//   // Default fallback
//   return (
//     <Armchair className={`w-10 h-10 ${baseClass}`} />
//   );
// };

// export const SeatSelector: React.FC<SeatSelectorProps> = ({
//   sittingPlan,
//   sittingLength,
//   selectedSeats,
//   onSeatsChange,
//   occupiedSeats = [],
//   heldSeats = [],
//   frontPosition = 'top',
//   typeSlug,
// }) => {
//   const { remoteHeldSeats } = useBooking();
//   const [seats, setSeats] = useState<string[][]>([]);
//   const [lockedSeats, setLockedSeats] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     const plan = (sittingPlan || '2-2')
//       .split('-')
//       .map(Number)
//       .filter((value) => !Number.isNaN(value) && value > 0);
//     const normalizedPlan = plan.length > 0 ? plan : [2, 2];
//     const rowsCount = sittingLength && sittingLength > 0 ? sittingLength : Math.max(6, normalizedPlan.reduce((sum, value) => sum + value, 0) * 5);
//     const rows: string[][] = [];
//     const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

//     for (let row = 0; row < rowsCount; row++) {
//       const rowSeats: string[] = [];
//       let seatNumber = 1;

//       normalizedPlan.forEach((section, sectionIndex) => {
//         for (let i = 0; i < section; i++) {
//           rowSeats.push(`${letters[row]}${seatNumber++}`);
//         }
//         if (sectionIndex < normalizedPlan.length - 1) {
//           rowSeats.push('aisle');
//         }
//       });

//       rows.push(rowSeats);
//     }

//     setSeats(rows);
//   }, [sittingPlan, sittingLength]);

//   useEffect(() => {
//     if (selectedSeats.length > 0) {
//       const timer = setTimeout(() => {
//         setLockedSeats(new Set(selectedSeats));
//       }, 300000);

//       return () => clearTimeout(timer);
//     }
//   }, [selectedSeats]);

//   const handleSeatClick = (seat: string) => {
//     if (seat === 'A1' || occupiedSeats.includes(seat) || heldSeats.includes(seat) || lockedSeats.has(seat) || remoteHeldSeats.has(seat)) return;

//     if (selectedSeats.includes(seat)) {
//       onSeatsChange(selectedSeats.filter(s => s !== seat));
//     } else {
//       onSeatsChange([...selectedSeats, seat]);
//     }
//   };

//   const getSeatColor = (seat: string) => {
//     if (seat === 'aisle') return '';
//     if (seat === 'A1') return 'bg-yellow-500 cursor-not-allowed';
//     if (occupiedSeats.includes(seat)) return 'bg-red-500 cursor-not-allowed';
//     if (heldSeats.includes(seat) || remoteHeldSeats.has(seat)) return 'bg-orange-400 cursor-not-allowed';
//     if (selectedSeats.includes(seat)) return 'bg-green-500 cursor-pointer';
//     return 'bg-blue-500 hover:bg-blue-600 cursor-pointer';
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
//       <div className="mb-6">
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Your Seats</h2>
//         <div className="flex items-center gap-6 text-sm flex-wrap">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-blue-500 rounded"></div>
//             <span className="text-gray-700 dark:text-gray-300">Available</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-green-500 rounded"></div>
//             <span className="text-gray-700 dark:text-gray-300">Selected</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-red-500 rounded"></div>
//             <span className="text-gray-700 dark:text-gray-300">Occupied</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-orange-400 rounded"></div>
//             <span className="text-gray-700 dark:text-gray-300">Held</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-yellow-500 rounded"></div>
//             <span className="text-gray-700 dark:text-gray-300">Driver</span>
//           </div>
//         </div>
//       </div>

//       <div className="mb-6 flex w-full justify-center">
//         <div className={`w-full max-w-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center ${
//           frontPosition === 'left'
//             ? 'justify-start'
//             : frontPosition === 'right'
//             ? 'justify-end'
//             : 'justify-center'
//         }`}>
//           <div className="text-center">
//             {getFrontVisual(typeSlug)}
//           </div>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <div className="inline-block min-w-full">
//           <div>
//             {seats.map((row, rowIndex) => (
//               <div key={rowIndex} className="flex items-center justify-center gap-2 mb-3">
//                 <span className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">
//                   {generateRowLabel(rowIndex)}
//                 </span>
//                 {row.map((seat, seatIndex) => (
//                   seat === 'aisle' ? (
//                     <div key={seatIndex} className="w-12"></div>
//                   ) : (
//                     <button
//                       key={seatIndex}
//                       onClick={() => handleSeatClick(seat)}
//                       disabled={occupiedSeats.includes(seat) || seat === 'A1' || heldSeats.includes(seat) || remoteHeldSeats.has(seat)}
//                       className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all ${getSeatColor(seat)}`}
//                       title={seat}
//                     >
//                       {seat === 'A1' ? (
//                         <User className="w-6 h-6" />
//                       ) : (
//                         <Armchair className="w-6 h-6" />
//                       )}
//                     </button>
//                   )
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {selectedSeats.length > 0 && (
//         <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//           <p className="text-sm text-blue-800 dark:text-blue-300">
//             You have 5 minutes to complete your booking. Your selected seats will be released after this time.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

//figma-frontend/src/app/components/booking/SeatSelector.tsx
import React, { useState, useEffect } from 'react';
import {
  Armchair,
  User,
  RotateCcw,
  TrainFront,
  PlaneTakeoff,
  ShipWheel,
  BusFront,
  Trophy,
  MapPin,
  Trees,
  Hotel,
  Sparkles,
  Music4,
  Mic2,
  TentTree,
  Waves,
  Radio,
  Zap,
  Crown,
  Disc3,
} from 'lucide-react';

import { useBooking } from '../../../contexts/BookingContext';

interface SeatSelectorProps {
  sittingPlan?: string;
  sittingLength?: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  occupiedSeats?: string[];
  heldSeats?: string[];
  blockedSeats?: string[];
  frontPosition?: 'top' | 'left' | 'right';
  typeSlug?: string;
}

const generateRowLabel = (index: number): string => {
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
  const baseIcon =
    'text-indigo-600 dark:text-indigo-400 drop-shadow-sm';

  const wrapper =
    'w-28 h-28 rounded-3xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700 backdrop-blur-md flex items-center justify-center shadow-xl';

  // BUS / DRIVER
  if (
    typeSlug?.includes('bus') ||
    typeSlug?.includes('minibus') ||
    typeSlug?.includes('mini_bus') ||
    typeSlug?.includes('safari')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <BusFront className={`w-14 h-14 ${baseIcon}`} />
            <RotateCcw className="w-7 h-7 text-blue-500 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Driver Area
        </div>
      </div>
    );
  }

  // TRAIN
  if (typeSlug?.includes('train')) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <TrainFront className={`w-16 h-16 ${baseIcon}`} />
            <Radio className="w-6 h-6 text-cyan-500 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Operator Cabin
        </div>
      </div>
    );
  }

  // AIRPLANE / PILOT
  if (
    typeSlug?.includes('aeroplane') ||
    typeSlug?.includes('airplane') ||
    typeSlug?.includes('air')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <PlaneTakeoff className={`w-16 h-16 ${baseIcon}`} />
            <Zap className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Pilot Cockpit
        </div>
      </div>
    );
  }

  // SHIP / CAPTAIN
  if (
    typeSlug?.includes('boat') ||
    typeSlug?.includes('ship') ||
    typeSlug?.includes('ferry') ||
    typeSlug?.includes('water')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <ShipWheel className={`w-16 h-16 ${baseIcon}`} />
            <Waves className="w-6 h-6 text-sky-500 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Captain Deck
        </div>
      </div>
    );
  }

  // STADIUM / SPORTS
  if (
    typeSlug?.includes('stadium') ||
    typeSlug?.includes('sports') ||
    typeSlug?.includes('field')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <Trophy className="w-16 h-16 text-amber-500" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Main Arena
        </div>
      </div>
    );
  }

  // PERFORMANCE / CONCERT / CINEMA
  if (
    typeSlug?.includes('cinema') ||
    typeSlug?.includes('theater') ||
    typeSlug?.includes('theatre') ||
    typeSlug?.includes('concert') ||
    typeSlug?.includes('show') ||
    typeSlug?.includes('performance') ||
    typeSlug?.includes('event') ||
    typeSlug?.includes('entertainment')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <Mic2 className="w-16 h-16 text-fuchsia-500" />
            <Music4 className="w-7 h-7 text-pink-400 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Main Stage
        </div>
      </div>
    );
  }

  // OUTDOOR / PICNIC
  if (
    typeSlug?.includes('outdoor') ||
    typeSlug?.includes('camping') ||
    typeSlug?.includes('park') ||
    typeSlug?.includes('picnic')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <TentTree className="w-16 h-16 text-green-600 dark:text-green-400" />
            <Trees className="w-6 h-6 text-emerald-500 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Picnic Zone
        </div>
      </div>
    );
  }

  // HOTEL / ACCOMMODATION
  if (
    typeSlug?.includes('housing') ||
    typeSlug?.includes('hotel') ||
    typeSlug?.includes('accommodation')
  ) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={wrapper}>
          <div className="relative">
            <Hotel className={`w-16 h-16 ${baseIcon}`} />
            <Crown className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Reception Area
        </div>
      </div>
    );
  }

  // DEFAULT
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={wrapper}>
        <Armchair className={`w-16 h-16 ${baseIcon}`} />
      </div>

      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Front Area
      </div>
    </div>
  );
};

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  sittingPlan,
  sittingLength,
  selectedSeats,
  onSeatsChange,
  occupiedSeats = [],
  heldSeats = [],
  blockedSeats = [],
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
      .filter(
        (value) => !Number.isNaN(value) && value > 0
      );

    const normalizedPlan =
      plan.length > 0 ? plan : [2, 2];

    const rowsCount =
      sittingLength && sittingLength > 0
        ? sittingLength
        : Math.max(
            6,
            normalizedPlan.reduce(
              (sum, value) => sum + value,
              0
            ) * 5
          );

    const rows: string[][] = [];

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let row = 0; row < rowsCount; row++) {
      const rowSeats: string[] = [];
      let seatNumber = 1;

      normalizedPlan.forEach(
        (section, sectionIndex) => {
          for (let i = 0; i < section; i++) {
            rowSeats.push(
              `${letters[row]}${seatNumber++}`
            );
          }

          if (
            sectionIndex <
            normalizedPlan.length - 1
          ) {
            rowSeats.push('aisle');
          }
        }
      );

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
    if (
      seat === 'A1' ||
      occupiedSeats.includes(seat) ||
      heldSeats.includes(seat) ||
      blockedSeats.includes(seat) ||
      lockedSeats.has(seat) ||
      remoteHeldSeats.has(seat)
    )
      return;

    if (selectedSeats.includes(seat)) {
      onSeatsChange(
        selectedSeats.filter((s) => s !== seat)
      );
    } else {
      onSeatsChange([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat: string) => {
    if (seat === 'aisle') return '';

    if (seat === 'A1')
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg cursor-not-allowed';

    if (occupiedSeats.includes(seat))
      return 'bg-gradient-to-br from-red-500 to-rose-600 text-white cursor-not-allowed opacity-90';

    if (blockedSeats.includes(seat))
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-90';

    if (
      heldSeats.includes(seat) ||
      remoteHeldSeats.has(seat)
    )
      return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white cursor-not-allowed';

    if (selectedSeats.includes(seat))
      return 'bg-gradient-to-br from-emerald-500 to-green-600 text-white scale-105 shadow-xl ring-4 ring-green-200 dark:ring-green-900';

    return 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white hover:scale-105';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
          Select Your Seats
        </h2>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-4">

          {[
            {
              label: 'Available',
              color:
                'from-blue-500 to-indigo-600',
            },
            {
              label: 'Selected',
              color:
                'from-emerald-500 to-green-600',
            },
            {
              label: 'Occupied',
              color:
                'from-red-500 to-rose-600',
            },
            {
              label: 'Held',
              color:
                'from-orange-400 to-orange-500',
            },
            {
              label: 'Blocked',
              color: 'from-gray-400 to-gray-500'
            },
            {
              label: 'Driver/Pilot',
              color:
                'from-yellow-400 to-amber-500',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl"
            >
              <div
                className={`w-6 h-6 rounded-lg bg-gradient-to-br ${item.color}`}
              />

              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FRONT VISUAL */}
      <div className="mb-10 flex justify-center">
        <div
          className={`
            w-full
            max-w-3xl
            rounded-[32px]
            p-8
            bg-gradient-to-r
            from-blue-50
            via-indigo-50
            to-purple-50
            dark:from-blue-950/40
            dark:via-indigo-950/30
            dark:to-purple-950/30
            border
            border-blue-100
            dark:border-blue-900
            shadow-inner
            flex
            ${
              frontPosition === 'left'
                ? 'justify-start'
                : frontPosition === 'right'
                ? 'justify-end'
                : 'justify-center'
            }
          `}
        >
          {getFrontVisual(typeSlug)}
        </div>
      </div>

      {/* SEATS */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">

          {seats.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-2 mb-3"
            >

              {/* ROW LABEL */}
              <div className="w-10 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                {generateRowLabel(rowIndex)}
              </div>

              {/* ROW SEATS */}
              {row.map((seat, seatIndex) =>
                seat === 'aisle' ? (
                  <div
                    key={seatIndex}
                    className="w-10"
                  />
                ) : (
                  <button
                    key={seatIndex}
                    onClick={() =>
                      handleSeatClick(seat)
                    }
                    disabled={
                      occupiedSeats.includes(seat) ||
                      seat === 'A1' ||
                      heldSeats.includes(seat) ||
                      remoteHeldSeats.has(seat) ||
                      blockedSeats.includes(seat)
                    }
                    title={seat}
                    className={`
                      w-12
                      h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-200
                      shadow-md
                      hover:shadow-xl
                      ${getSeatColor(seat)}
                    `}
                  >
                    {seat === 'A1' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Armchair className="w-5 h-5" />
                    )}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER INFO */}
      {selectedSeats.length > 0 && (
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 p-5">

          <div className="flex items-start gap-3">

            <div className="p-2 rounded-xl bg-blue-500 text-white">
              <Zap className="w-5 h-5" />
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Seats Reserved Temporarily
              </h4>

              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                You have 5 minutes to complete your
                booking before the selected seats are
                automatically released.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};