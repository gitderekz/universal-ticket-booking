export interface Company {
  id: string;
  name: string;
  type: 'transport' | 'facility';
  logo?: string;
  description: string;
}

export interface Transport {
  id: string;
  companyId: string;
  name: string;
  type: 'safari_car' | 'mini_bus' | 'bus' | 'train' | 'airplane' | 'boat' | 'ferry' | 'ship';
  capacity: number;
  sittingPlan: string;
  sittingLength: number;
  image?: string;
}

export interface Facility {
  id: string;
  companyId: string;
  name: string;
  category: 'entertainment' | 'events' | 'outdoor' | 'housing' | 'sports';
  type: string;
  capacity: number;
  sittingPlan: string;
  sittingLength: number;
  image?: string;
}

export interface Route {
  id: string;
  transportId: string;
  startLocation: string;
  endLocation: string;
  price: number;
  parentRouteId?: string;
  stations: Station[];
}

export interface Station {
  id: string;
  name: string;
  price: number;
  isBreakStop: boolean;
  order: number;
}

export interface Activity {
  id: string;
  facilityId: string;
  name: string;
  type: 'event' | 'session' | 'programme';
  description: string;
  price: number;
  image?: string;
  duration?: string;
  ageRestriction?: string;
  language?: string;
  status: 'active' | 'inactive' | 'sold_out';
  date?: string;
  genre?: string;
}

export interface Timetable {
  id: string;
  routeId?: string;
  activityId?: string;
  transportId?: string;
  facilityId?: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSeats: number;
  status: 'active' | 'cancelled' | 'full' | 'completed';
}

export interface Booking {
  id: string;
  userId: string;
  timetableId: string;
  seats: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export const mockCompanies: Company[] = [
  { id: 'c1', name: 'Kilimanjaro Express', type: 'transport', description: 'Premium bus services across Tanzania' },
  { id: 'c2', name: 'Dar Es Salaam Cinemas', type: 'facility', description: 'Modern cinema experience' },
  { id: 'c3', name: 'Safari Adventures', type: 'transport', description: 'Safari car rentals and tours' },
  { id: 'c4', name: 'National Stadium', type: 'facility', description: 'Premier sports venue' },
  { id: 'c5', name: 'Tanzania Railways', type: 'transport', description: 'Central railway services' },
  { id: 'c6', name: 'Island Ferries', type: 'transport', description: 'Zanzibar and coastal ferry services' },
  { id: 'c7', name: 'Conference Center Arusha', type: 'facility', description: 'International conference facilities' },
  { id: 'c8', name: 'Precision Air', type: 'transport', description: 'Regional airline serving East Africa' },
  { id: 'c9', name: 'Coastal Aviation', type: 'transport', description: 'Safari and coastal flights' },
  { id: 'c10', name: 'Azam Marine', type: 'transport', description: 'High-speed ferry services' },
  { id: 'c11', name: 'Serengeti Safaris', type: 'transport', description: 'Premium safari tour operator' },
  { id: 'c12', name: 'Kenya Railways SGR', type: 'transport', description: 'Standard Gauge Railway services' },
  { id: 'c13', name: 'Cinemax Cinemas', type: 'facility', description: 'Luxury cinema chain' },
  { id: 'c14', name: 'Mlimani City Cinemas', type: 'facility', description: 'Shopping mall cinema complex' },
  { id: 'c15', name: 'Benjamin Mkapa Stadium', type: 'facility', description: 'National sports complex' },
  { id: 'c16', name: 'Uhuru Stadium', type: 'facility', description: 'Historic sports venue' },
  { id: 'c17', name: 'Serengeti Lodge & Spa', type: 'facility', description: 'Luxury safari lodge' },
  { id: 'c18', name: 'Zanzibar Beach Resort', type: 'facility', description: 'Beachfront accommodation' },
  { id: 'c19', name: 'Kilimanjaro Hotel', type: 'facility', description: 'Premium city hotel' },
  { id: 'c20', name: 'Arusha Conference Centre', type: 'facility', description: 'International events venue' },
  { id: 'c21', name: 'Ngorongoro Adventures', type: 'facility', description: 'Crater tours and camping' },
  { id: 'c22', name: 'Mount Meru Tours', type: 'facility', description: 'Trekking and hiking expeditions' },
  { id: 'c23', name: 'Saadani Safari Park', type: 'facility', description: 'Coastal safari experiences' },
  { id: 'c24', name: 'Nairobi Transit', type: 'transport', description: 'Cross-border bus services' },
  { id: 'c25', name: 'Lake Victoria Cruises', type: 'transport', description: 'Passenger and cargo ships' },
];

export const mockTransports: Transport[] = [
  // Buses
  { id: 't1', companyId: 'c1', name: 'Express 001', type: 'bus', capacity: 50, sittingPlan: '2-2', sittingLength: 12 },
  { id: 't2', companyId: 'c1', name: 'Luxury 002', type: 'bus', capacity: 40, sittingPlan: '2-1', sittingLength: 13 },
  { id: 't3', companyId: 'c24', name: 'Nairobi Express', type: 'bus', capacity: 45, sittingPlan: '2-2', sittingLength: 11 },
  { id: 't4', companyId: 'c24', name: 'Cross Border VIP', type: 'bus', capacity: 35, sittingPlan: '1-2', sittingLength: 11 },
  { id: 't5', companyId: 'c1', name: 'Scania Supreme', type: 'bus', capacity: 52, sittingPlan: '2-2', sittingLength: 13 },

  // Mini Buses
  { id: 't6', companyId: 'c1', name: 'Mini Express 003', type: 'mini_bus', capacity: 25, sittingPlan: '1-2', sittingLength: 8 },
  { id: 't7', companyId: 'c3', name: 'Safari Shuttle', type: 'mini_bus', capacity: 18, sittingPlan: '1-2', sittingLength: 6 },
  { id: 't8', companyId: 'c24', name: 'Urban Commuter', type: 'mini_bus', capacity: 20, sittingPlan: '2-2', sittingLength: 5 },

  // Safari Cars
  { id: 't9', companyId: 'c3', name: 'Safari Cruiser', type: 'safari_car', capacity: 7, sittingPlan: '1-2', sittingLength: 2 },
  { id: 't10', companyId: 'c11', name: 'Land Cruiser VX', type: 'safari_car', capacity: 8, sittingPlan: '2-2', sittingLength: 2 },
  { id: 't11', companyId: 'c11', name: 'Safari Ranger', type: 'safari_car', capacity: 6, sittingPlan: '1-2', sittingLength: 2 },
  { id: 't12', companyId: 'c3', name: 'Desert Explorer', type: 'safari_car', capacity: 7, sittingPlan: '1-2', sittingLength: 2 },

  // Trains
  { id: 't13', companyId: 'c5', name: 'Central Line Express', type: 'train', capacity: 200, sittingPlan: '3-2', sittingLength: 20 },
  { id: 't14', companyId: 'c5', name: 'Coastal Express', type: 'train', capacity: 180, sittingPlan: '3-2', sittingLength: 18 },
  { id: 't15', companyId: 'c12', name: 'SGR Madaraka', type: 'train', capacity: 300, sittingPlan: '3-2', sittingLength: 25 },
  { id: 't16', companyId: 'c12', name: 'SGR Intercity', type: 'train', capacity: 280, sittingPlan: '3-2', sittingLength: 24 },

  // Airplanes
  { id: 't17', companyId: 'c8', name: 'PA Boeing 737', type: 'airplane', capacity: 120, sittingPlan: '3-3', sittingLength: 20 },
  { id: 't18', companyId: 'c8', name: 'PA ATR 42', type: 'airplane', capacity: 48, sittingPlan: '2-2', sittingLength: 12 },
  { id: 't19', companyId: 'c9', name: 'Coastal Caravan', type: 'airplane', capacity: 12, sittingPlan: '1-1', sittingLength: 6 },
  { id: 't20', companyId: 'c9', name: 'Safari Air Cessna', type: 'airplane', capacity: 6, sittingPlan: '1-1', sittingLength: 3 },

  // Ferries
  { id: 't21', companyId: 'c6', name: 'Ocean Jet', type: 'ferry', capacity: 150, sittingPlan: '3-3', sittingLength: 15 },
  { id: 't22', companyId: 'c10', name: 'Azam Star', type: 'ferry', capacity: 200, sittingPlan: '4-4', sittingLength: 20 },
  { id: 't23', companyId: 'c10', name: 'Kilimanjaro IV', type: 'ferry', capacity: 180, sittingPlan: '3-4', sittingLength: 18 },
  { id: 't24', companyId: 'c6', name: 'Island Hopper', type: 'ferry', capacity: 100, sittingPlan: '3-3', sittingLength: 12 },

  // Ships
  { id: 't25', companyId: 'c25', name: 'MV Victoria', type: 'ship', capacity: 400, sittingPlan: '5-5', sittingLength: 40 },
  { id: 't26', companyId: 'c25', name: 'MV Nyanza', type: 'ship', capacity: 350, sittingPlan: '5-5', sittingLength: 35 },

  // Boats
  { id: 't27', companyId: 'c6', name: 'Speed Boat Alpha', type: 'boat', capacity: 30, sittingPlan: '2-2', sittingLength: 8 },
  { id: 't28', companyId: 'c10', name: 'Express Dhow', type: 'boat', capacity: 25, sittingPlan: '2-2', sittingLength: 7 },
  { id: 't29', companyId: 'c25', name: 'Lake Cruiser', type: 'boat', capacity: 40, sittingPlan: '2-3', sittingLength: 8 },
];

export const mockFacilities: Facility[] = [
  // Entertainment (Cinemas, Theaters)
  { id: 'f1', companyId: 'c2', name: 'Cinema Hall 1', category: 'entertainment', type: 'movie_theatre', capacity: 150, sittingPlan: '3-3', sittingLength: 25 },
  { id: 'f2', companyId: 'c2', name: 'Cinema Hall 2', category: 'entertainment', type: 'movie_theatre', capacity: 120, sittingPlan: '4-4', sittingLength: 15 },
  { id: 'f3', companyId: 'c13', name: 'Cinemax IMAX', category: 'entertainment', type: 'movie_theatre', capacity: 200, sittingPlan: '5-5', sittingLength: 20 },
  { id: 'f4', companyId: 'c13', name: 'Cinemax Premium', category: 'entertainment', type: 'movie_theatre', capacity: 80, sittingPlan: '2-2', sittingLength: 20 },
  { id: 'f5', companyId: 'c14', name: 'Mlimani Screen 1', category: 'entertainment', type: 'movie_theatre', capacity: 100, sittingPlan: '3-3', sittingLength: 17 },
  { id: 'f6', companyId: 'c14', name: 'Mlimani Screen 2', category: 'entertainment', type: 'movie_theatre', capacity: 90, sittingPlan: '3-3', sittingLength: 15 },

  // Sports (Stadiums, Arenas)
  { id: 'f7', companyId: 'c4', name: 'Main Arena', category: 'sports', type: 'stadium', capacity: 5000, sittingPlan: '10-10', sittingLength: 25 },
  { id: 'f8', companyId: 'c15', name: 'Benjamin Mkapa Field', category: 'sports', type: 'stadium', capacity: 60000, sittingPlan: '15-15', sittingLength: 100 },
  { id: 'f9', companyId: 'c16', name: 'Uhuru Ground', category: 'sports', type: 'stadium', capacity: 20000, sittingPlan: '12-12', sittingLength: 50 },
  { id: 'f10', companyId: 'c15', name: 'Sports Complex Indoor', category: 'sports', type: 'arena', capacity: 3000, sittingPlan: '8-8', sittingLength: 30 },
  { id: 'f11', companyId: 'c16', name: 'Basketball Court', category: 'sports', type: 'court', capacity: 500, sittingPlan: '5-5', sittingLength: 10 },

  // Events (Conference, Concert Halls)
  { id: 'f12', companyId: 'c7', name: 'Grand Conference Hall', category: 'events', type: 'conference_hall', capacity: 500, sittingPlan: '5-5', sittingLength: 50 },
  { id: 'f13', companyId: 'c20', name: 'Arusha Summit Hall', category: 'events', type: 'conference_hall', capacity: 800, sittingPlan: '8-8', sittingLength: 50 },
  { id: 'f14', companyId: 'c20', name: 'Business Meeting Room', category: 'events', type: 'meeting_room', capacity: 100, sittingPlan: '5-5', sittingLength: 10 },
  { id: 'f15', companyId: 'c7', name: 'Concert Arena', category: 'events', type: 'concert_hall', capacity: 2000, sittingPlan: '10-10', sittingLength: 50 },
  { id: 'f16', companyId: 'c13', name: 'Exhibition Center', category: 'events', type: 'exhibition_hall', capacity: 1000, sittingPlan: 'open', sittingLength: 0 },

  // Outdoor (Safari Parks, Mountains, Nature)
  { id: 'f17', companyId: 'c21', name: 'Ngorongoro Crater Tour', category: 'outdoor', type: 'safari_park', capacity: 50, sittingPlan: 'safari_vehicle', sittingLength: 0 },
  { id: 'f18', companyId: 'c22', name: 'Mount Meru Summit Trek', category: 'outdoor', type: 'mountain', capacity: 30, sittingPlan: 'hiking_group', sittingLength: 0 },
  { id: 'f19', companyId: 'c23', name: 'Saadani Beach Safari', category: 'outdoor', type: 'safari_park', capacity: 40, sittingPlan: 'safari_vehicle', sittingLength: 0 },
  { id: 'f20', companyId: 'c22', name: 'Kilimanjaro Marangu Route', category: 'outdoor', type: 'mountain', capacity: 60, sittingPlan: 'hiking_group', sittingLength: 0 },
  { id: 'f21', companyId: 'c21', name: 'Serengeti Migration Tour', category: 'outdoor', type: 'safari_park', capacity: 35, sittingPlan: 'safari_vehicle', sittingLength: 0 },
  { id: 'f22', companyId: 'c23', name: 'Selous Game Reserve', category: 'outdoor', type: 'safari_park', capacity: 25, sittingPlan: 'safari_vehicle', sittingLength: 0 },

  // Housing (Hotels, Lodges, Resorts)
  { id: 'f23', companyId: 'c17', name: 'Serengeti Luxury Lodge', category: 'housing', type: 'lodge', capacity: 40, sittingPlan: 'rooms', sittingLength: 0 },
  { id: 'f24', companyId: 'c18', name: 'Zanzibar Beach Bungalows', category: 'housing', type: 'resort', capacity: 60, sittingPlan: 'rooms', sittingLength: 0 },
  { id: 'f25', companyId: 'c19', name: 'Kilimanjaro Suites', category: 'housing', type: 'hotel', capacity: 100, sittingPlan: 'rooms', sittingLength: 0 },
  { id: 'f26', companyId: 'c17', name: 'Ngorongoro Crater Camp', category: 'housing', type: 'camp', capacity: 20, sittingPlan: 'tents', sittingLength: 0 },
  { id: 'f27', companyId: 'c18', name: 'Stone Town Hotel', category: 'housing', type: 'hotel', capacity: 50, sittingPlan: 'rooms', sittingLength: 0 },
  { id: 'f28', companyId: 'c19', name: 'Dar es Salaam Grand', category: 'housing', type: 'hotel', capacity: 150, sittingPlan: 'rooms', sittingLength: 0 },
];

export const mockRoutes: Route[] = [
  // Bus routes
  { id: 'r1', transportId: 't1', startLocation: 'Dar es Salaam', endLocation: 'Mwanza', price: 60000, stations: [
    { id: 's1', name: 'Pugu', price: 10000, isBreakStop: false, order: 1 },
    { id: 's2', name: 'Morogoro', price: 20000, isBreakStop: false, order: 2 },
    { id: 's3', name: 'Gairo', price: 30000, isBreakStop: true, order: 3 },
    { id: 's4', name: 'Dodoma', price: 40000, isBreakStop: false, order: 4 },
    { id: 's5', name: 'Singida', price: 50000, isBreakStop: false, order: 5 },
    { id: 's6', name: 'Mwanza', price: 60000, isBreakStop: false, order: 6 },
  ]},
  { id: 'r2', transportId: 't2', startLocation: 'Arusha', endLocation: 'Dar es Salaam', price: 50000, stations: [
    { id: 's7', name: 'Moshi', price: 10000, isBreakStop: false, order: 1 },
    { id: 's8', name: 'Same', price: 20000, isBreakStop: true, order: 2 },
    { id: 's9', name: 'Korogwe', price: 30000, isBreakStop: false, order: 3 },
    { id: 's10', name: 'Morogoro', price: 40000, isBreakStop: false, order: 4 },
    { id: 's11', name: 'Dar es Salaam', price: 50000, isBreakStop: false, order: 5 },
  ]},
  { id: 'r3', transportId: 't3', startLocation: 'Nairobi', endLocation: 'Arusha', price: 35000, stations: [
    { id: 's12', name: 'Namanga', price: 20000, isBreakStop: true, order: 1 },
    { id: 's13', name: 'Arusha', price: 35000, isBreakStop: false, order: 2 },
  ]},
  { id: 'r4', transportId: 't5', startLocation: 'Dodoma', endLocation: 'Mbeya', price: 40000, stations: [
    { id: 's14', name: 'Iringa', price: 25000, isBreakStop: true, order: 1 },
    { id: 's15', name: 'Mbeya', price: 40000, isBreakStop: false, order: 2 },
  ]},

  // Mini bus routes
  { id: 'r5', transportId: 't6', startLocation: 'Dar es Salaam', endLocation: 'Bagamoyo', price: 15000, stations: [
    { id: 's16', name: 'Tegeta', price: 8000, isBreakStop: false, order: 1 },
    { id: 's17', name: 'Bagamoyo', price: 15000, isBreakStop: false, order: 2 },
  ]},

  // Safari car routes
  { id: 'r6', transportId: 't9', startLocation: 'Arusha', endLocation: 'Serengeti', price: 250000, stations: [
    { id: 's18', name: 'Ngorongoro', price: 150000, isBreakStop: true, order: 1 },
    { id: 's19', name: 'Serengeti', price: 250000, isBreakStop: false, order: 2 },
  ]},
  { id: 'r7', transportId: 't10', startLocation: 'Arusha', endLocation: 'Ngorongoro', price: 180000, stations: [
    { id: 's20', name: 'Ngorongoro', price: 180000, isBreakStop: false, order: 1 },
  ]},

  // Train routes
  { id: 'r8', transportId: 't13', startLocation: 'Dar es Salaam', endLocation: 'Kigoma', price: 45000, stations: [
    { id: 's21', name: 'Morogoro', price: 15000, isBreakStop: false, order: 1 },
    { id: 's22', name: 'Dodoma', price: 25000, isBreakStop: true, order: 2 },
    { id: 's23', name: 'Tabora', price: 35000, isBreakStop: true, order: 3 },
    { id: 's24', name: 'Kigoma', price: 45000, isBreakStop: false, order: 4 },
  ]},
  { id: 'r9', transportId: 't15', startLocation: 'Nairobi', endLocation: 'Mombasa', price: 50000, stations: [
    { id: 's25', name: 'Athi River', price: 15000, isBreakStop: false, order: 1 },
    { id: 's26', name: 'Emali', price: 25000, isBreakStop: true, order: 2 },
    { id: 's27', name: 'Voi', price: 35000, isBreakStop: false, order: 3 },
    { id: 's28', name: 'Mombasa', price: 50000, isBreakStop: false, order: 4 },
  ]},

  // Airplane routes
  { id: 'r10', transportId: 't17', startLocation: 'Dar es Salaam', endLocation: 'Kilimanjaro', price: 180000, stations: [] },
  { id: 'r11', transportId: 't18', startLocation: 'Dar es Salaam', endLocation: 'Zanzibar', price: 120000, stations: [] },
  { id: 'r12', transportId: 't19', startLocation: 'Arusha', endLocation: 'Serengeti', price: 350000, stations: [] },

  // Ferry routes
  { id: 'r13', transportId: 't21', startLocation: 'Dar es Salaam', endLocation: 'Zanzibar', price: 35000, stations: [] },
  { id: 'r14', transportId: 't22', startLocation: 'Dar es Salaam', endLocation: 'Pemba', price: 50000, stations: [] },

  // Ship routes
  { id: 'r15', transportId: 't25', startLocation: 'Mwanza', endLocation: 'Bukoba', price: 30000, stations: [
    { id: 's29', name: 'Geita', price: 15000, isBreakStop: true, order: 1 },
    { id: 's30', name: 'Bukoba', price: 30000, isBreakStop: false, order: 2 },
  ]},

  // Boat routes
  { id: 'r16', transportId: 't27', startLocation: 'Zanzibar', endLocation: 'Prison Island', price: 25000, stations: [] },
];

export const mockActivities: Activity[] = [
  // Entertainment - Movies
  { id: 'a1', facilityId: 'f1', name: 'Avengers: Endgame', type: 'session', description: 'Marvel superhero movie', price: 12000, duration: '2h 30min', ageRestriction: 'PG-13', language: 'English', status: 'active', date: '2026-05-08', genre: 'Action' },
  { id: 'a2', facilityId: 'f1', name: 'Spider-Man: No Way Home', type: 'session', description: 'Action-packed superhero adventure', price: 12000, duration: '2h 28min', ageRestriction: 'PG-13', language: 'English', status: 'sold_out', date: '2026-05-10', genre: 'Action' },
  { id: 'a3', facilityId: 'f2', name: 'The Lion King', type: 'session', description: 'Disney animated classic', price: 10000, duration: '1h 58min', ageRestriction: 'G', language: 'English', status: 'active', date: '2026-05-09', genre: 'Animation' },
  { id: 'a4', facilityId: 'f3', name: 'Dune: Part Two', type: 'session', description: 'Epic sci-fi adventure', price: 15000, duration: '2h 46min', ageRestriction: 'PG-13', language: 'English', status: 'active', date: '2026-05-11', genre: 'Sci-Fi' },
  { id: 'a5', facilityId: 'f4', name: 'Oppenheimer', type: 'session', description: 'Historical drama', price: 13000, duration: '3h', ageRestriction: 'PG-13', language: 'English', status: 'active', date: '2026-05-12', genre: 'Drama' },
  { id: 'a6', facilityId: 'f5', name: 'Fast X', type: 'session', description: 'High-octane action thriller', price: 11000, duration: '2h 21min', ageRestriction: 'PG-13', language: 'English', status: 'active', date: '2026-05-13', genre: 'Action' },
  { id: 'a7', facilityId: 'f6', name: 'Barbie', type: 'session', description: 'Fantasy comedy adventure', price: 10000, duration: '1h 54min', ageRestriction: 'PG', language: 'English', status: 'active', date: '2026-05-14', genre: 'Comedy' },

  // Sports - Matches & Events
  { id: 'a8', facilityId: 'f7', name: 'Simba SC vs Young Africans', type: 'event', description: 'Premier league football match', price: 20000, duration: '2h', ageRestriction: 'All Ages', language: 'Swahili', status: 'active', date: '2026-05-12', genre: 'Sports' },
  { id: 'a9', facilityId: 'f8', name: 'Tanzania vs Kenya - Friendly', type: 'event', description: 'International football friendly', price: 25000, duration: '2h', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-15', genre: 'Sports' },
  { id: 'a10', facilityId: 'f9', name: 'Azam FC vs KMC', type: 'event', description: 'League championship match', price: 15000, duration: '2h', ageRestriction: 'All Ages', language: 'Swahili', status: 'active', date: '2026-05-16', genre: 'Sports' },
  { id: 'a11', facilityId: 'f10', name: 'East Africa Basketball Finals', type: 'event', description: 'Regional basketball championship', price: 18000, duration: '3h', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-18', genre: 'Sports' },
  { id: 'a12', facilityId: 'f11', name: 'Volleyball Championship', type: 'event', description: 'National volleyball tournament', price: 10000, duration: '4h', ageRestriction: 'All Ages', language: 'Swahili', status: 'active', date: '2026-05-19', genre: 'Sports' },

  // Events - Conferences & Concerts
  { id: 'a13', facilityId: 'f12', name: 'East Africa Tech Summit', type: 'event', description: 'Annual technology conference', price: 50000, duration: '3 days', ageRestriction: '18+', language: 'English', status: 'active', date: '2026-05-18', genre: 'Conference' },
  { id: 'a14', facilityId: 'f13', name: 'Business Leaders Forum', type: 'event', description: 'Executive networking event', price: 75000, duration: '2 days', ageRestriction: '18+', language: 'English', status: 'active', date: '2026-05-20', genre: 'Conference' },
  { id: 'a15', facilityId: 'f14', name: 'Startup Pitch Competition', type: 'event', description: 'Entrepreneurship showcase', price: 20000, duration: '1 day', ageRestriction: '18+', language: 'English', status: 'active', date: '2026-05-22', genre: 'Workshop' },
  { id: 'a16', facilityId: 'f15', name: 'Afrobeats Live Concert', type: 'event', description: 'Live music performance', price: 35000, duration: '4h', ageRestriction: '16+', language: 'English', status: 'active', date: '2026-05-25', genre: 'Concert' },
  { id: 'a17', facilityId: 'f15', name: 'Diamond Platnumz Concert', type: 'event', description: 'Bongo Flava superstar live', price: 40000, duration: '3h', ageRestriction: 'All Ages', language: 'Swahili', status: 'sold_out', date: '2026-05-28', genre: 'Concert' },
  { id: 'a18', facilityId: 'f16', name: 'Art & Culture Exhibition', type: 'programme', description: 'Contemporary African art showcase', price: 15000, duration: '7 days', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-06-01', genre: 'Cultural' },

  // Outdoor - Safari & Trekking
  { id: 'a19', facilityId: 'f17', name: 'Ngorongoro Crater Full Day Tour', type: 'programme', description: 'Wildlife safari experience', price: 200000, duration: '1 day', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-10', genre: 'Safari' },
  { id: 'a20', facilityId: 'f18', name: 'Mount Meru 4-Day Trek', type: 'programme', description: 'Guided mountain expedition', price: 480000, duration: '4 days', ageRestriction: '16+', language: 'English', status: 'active', date: '2026-05-15', genre: 'Safari' },
  { id: 'a21', facilityId: 'f19', name: 'Saadani Beach & Bush Safari', type: 'programme', description: 'Coastal wildlife adventure', price: 150000, duration: '2 days', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-17', genre: 'Safari' },
  { id: 'a22', facilityId: 'f20', name: 'Kilimanjaro Marangu Route 6-Day', type: 'programme', description: 'Summit Africa\'s highest peak', price: 960000, duration: '6 days', ageRestriction: '18+', language: 'English', status: 'active', date: '2026-05-20', genre: 'Safari' },
  { id: 'a23', facilityId: 'f21', name: 'Serengeti Migration 3-Day Tour', type: 'programme', description: 'Witness the great migration', price: 450000, duration: '3 days', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-22', genre: 'Safari' },
  { id: 'a24', facilityId: 'f22', name: 'Selous Boat Safari', type: 'programme', description: 'River wildlife exploration', price: 180000, duration: '2 days', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-25', genre: 'Safari' },

  // Housing - Hotel Stays
  { id: 'a25', facilityId: 'f23', name: 'Luxury Lodge Weekend Package', type: 'programme', description: 'Premium safari accommodation', price: 350000, duration: '2 nights', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-15', genre: 'Safari' },
  { id: 'a26', facilityId: 'f24', name: 'Beach Resort 5-Night Stay', type: 'programme', description: 'All-inclusive beachfront holiday', price: 480000, duration: '5 nights', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-18', genre: 'Safari' },
  { id: 'a27', facilityId: 'f25', name: 'City Hotel Business Package', type: 'programme', description: 'Executive accommodation', price: 150000, duration: '3 nights', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-20', genre: 'Conference' },
  { id: 'a28', facilityId: 'f26', name: 'Crater Camp Adventure', type: 'programme', description: 'Eco-camping experience', price: 120000, duration: '2 nights', ageRestriction: '16+', language: 'English', status: 'active', date: '2026-05-22', genre: 'Safari' },
  { id: 'a29', facilityId: 'f27', name: 'Stone Town Heritage Stay', type: 'programme', description: 'Cultural immersion hotel', price: 180000, duration: '3 nights', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-05-24', genre: 'Cultural' },
  { id: 'a30', facilityId: 'f28', name: 'Grand Hotel Week Special', type: 'programme', description: 'Luxury city accommodation', price: 420000, duration: '7 nights', ageRestriction: 'All Ages', language: 'English', status: 'active', date: '2026-06-01', genre: 'Conference' },
];

export const mockTimetables: Timetable[] = [
  // Transport schedules - Buses
  { id: 'tt1', routeId: 'r1', date: '2026-05-10', startTime: '06:00', endTime: '14:00', availableSeats: 50, status: 'active' },
  { id: 'tt2', routeId: 'r1', date: '2026-05-10', startTime: '14:00', endTime: '22:00', availableSeats: 48, status: 'active' },
  { id: 'tt3', routeId: 'r2', date: '2026-05-11', startTime: '08:00', endTime: '16:00', availableSeats: 40, status: 'active' },
  { id: 'tt4', routeId: 'r3', date: '2026-05-12', startTime: '07:00', endTime: '11:00', availableSeats: 45, status: 'active' },
  { id: 'tt5', routeId: 'r4', date: '2026-05-13', startTime: '09:00', endTime: '16:00', availableSeats: 52, status: 'active' },
  { id: 'tt6', routeId: 'r5', date: '2026-05-14', startTime: '10:00', endTime: '12:00', availableSeats: 25, status: 'active' },

  // Safari schedules
  { id: 'tt7', routeId: 'r6', date: '2026-05-15', startTime: '06:00', endTime: '18:00', availableSeats: 7, status: 'active' },
  { id: 'tt8', routeId: 'r7', date: '2026-05-16', startTime: '07:00', endTime: '14:00', availableSeats: 8, status: 'active' },

  // Train schedules
  { id: 'tt9', routeId: 'r8', date: '2026-05-10', startTime: '18:00', endTime: '08:00', availableSeats: 200, status: 'active' },
  { id: 'tt10', routeId: 'r9', date: '2026-05-11', startTime: '08:00', endTime: '13:00', availableSeats: 280, status: 'active' },

  // Flight schedules
  { id: 'tt11', routeId: 'r10', date: '2026-05-12', startTime: '10:00', endTime: '11:30', availableSeats: 120, status: 'active' },
  { id: 'tt12', routeId: 'r11', date: '2026-05-13', startTime: '14:00', endTime: '14:30', availableSeats: 48, status: 'active' },
  { id: 'tt13', routeId: 'r12', date: '2026-05-14', startTime: '07:00', endTime: '08:30', availableSeats: 12, status: 'active' },

  // Ferry schedules
  { id: 'tt14', routeId: 'r13', date: '2026-05-10', startTime: '09:00', endTime: '11:30', availableSeats: 150, status: 'active' },
  { id: 'tt15', routeId: 'r13', date: '2026-05-10', startTime: '15:00', endTime: '17:30', availableSeats: 150, status: 'active' },
  { id: 'tt16', routeId: 'r14', date: '2026-05-11', startTime: '08:00', endTime: '13:00', availableSeats: 200, status: 'active' },

  // Ship/Boat schedules
  { id: 'tt17', routeId: 'r15', date: '2026-05-12', startTime: '20:00', endTime: '08:00', availableSeats: 400, status: 'active' },
  { id: 'tt18', routeId: 'r16', date: '2026-05-13', startTime: '11:00', endTime: '13:00', availableSeats: 30, status: 'active' },

  // Activity schedules - Movies
  { id: 'tt19', activityId: 'a1', date: '2026-05-08', startTime: '18:00', endTime: '20:30', availableSeats: 140, status: 'active' },
  { id: 'tt20', activityId: 'a1', date: '2026-05-08', startTime: '21:00', endTime: '23:30', availableSeats: 150, status: 'active' },
  { id: 'tt21', activityId: 'a3', date: '2026-05-09', startTime: '14:00', endTime: '16:00', availableSeats: 120, status: 'active' },
  { id: 'tt22', activityId: 'a4', date: '2026-05-11', startTime: '19:30', endTime: '22:20', availableSeats: 200, status: 'active' },
  { id: 'tt23', activityId: 'a5', date: '2026-05-12', startTime: '20:00', endTime: '23:00', availableSeats: 80, status: 'active' },

  // Sports events
  { id: 'tt24', activityId: 'a8', date: '2026-05-12', startTime: '16:00', endTime: '18:00', availableSeats: 4850, status: 'sold_out' },
  { id: 'tt25', activityId: 'a9', date: '2026-05-15', startTime: '15:00', endTime: '17:00', availableSeats: 58000, status: 'active' },
  { id: 'tt26', activityId: 'a10', date: '2026-05-16', startTime: '17:00', endTime: '19:00', availableSeats: 18000, status: 'active' },

  // Conferences & Concerts
  { id: 'tt27', activityId: 'a13', date: '2026-05-18', startTime: '08:00', endTime: '18:00', availableSeats: 450, status: 'active' },
  { id: 'tt28', activityId: 'a16', date: '2026-05-25', startTime: '19:00', endTime: '23:00', availableSeats: 1800, status: 'active' },
  { id: 'tt29', activityId: 'a17', date: '2026-05-28', startTime: '20:00', endTime: '23:00', availableSeats: 0, status: 'sold_out' },

  // Safari & Outdoor
  { id: 'tt30', activityId: 'a19', date: '2026-05-10', startTime: '06:00', endTime: '18:00', availableSeats: 45, status: 'active' },
  { id: 'tt31', activityId: 'a21', date: '2026-05-17', startTime: '07:00', endTime: '17:00', availableSeats: 35, status: 'active' },
  { id: 'tt32', activityId: 'a23', date: '2026-05-22', startTime: '06:00', endTime: '18:00', availableSeats: 30, status: 'active' },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    userId: '1',
    timetableId: 'tt1',
    seats: ['A1', 'A2'],
    totalPrice: 120000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-05-05T10:30:00Z',
  },
];

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  status: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  details?: string;
}

export const mockSystemLogs: SystemLog[] = [
  { id: 'log1', userId: 'u1', userName: 'System Developer', action: 'Created new company', module: 'companies', status: 'success', timestamp: '2026-05-06T14:15:30Z', details: 'Company: Kilimanjaro Express, Type: transport' },
  { id: 'log2', userId: 'u3', userName: 'Baraka Mwenda', action: 'Updated transport status', module: 'transports', status: 'success', timestamp: '2026-05-06T14:22:15Z', details: 'Transport: Express 001, Status changed to active' },
  { id: 'log3', userId: 'u4', userName: 'Naomi Ochieng', action: 'Created new route', module: 'routes', status: 'success', timestamp: '2026-05-06T14:28:45Z', details: 'Route: Dar es Salaam → Mwanza, Price: TSh 120,000' },
  { id: 'log4', userId: 'u2', userName: 'Super Administrator', action: 'Added new user', module: 'users', status: 'success', timestamp: '2026-05-06T14:35:10Z', details: 'User: grace.kimani@gmail.com, Role: staff' },
  { id: 'log5', userId: 'u4', userName: 'Naomi Ochieng', action: 'Scheduled new timetable', module: 'timetables', status: 'success', timestamp: '2026-05-06T14:42:20Z', details: 'Route: Dar es Salaam → Mwanza, Departure: 08:00' },
  { id: 'log6', userId: 'u3', userName: 'Baraka Mwenda', action: 'Updated facility', module: 'facilities', status: 'success', timestamp: '2026-05-06T14:48:55Z', details: 'Facility: Dar Es Salaam Cinemas, Updated capacity to 120 seats' },
  { id: 'log7', userId: 'u4', userName: 'Naomi Ochieng', action: 'Created new activity', module: 'activities', status: 'success', timestamp: '2026-05-06T14:55:30Z', details: 'Activity: Avengers: Endgame, Price: TSh 12,000' },
  { id: 'log8', userId: 'u2', userName: 'Super Administrator', action: 'Generated revenue report', module: 'reports', status: 'info', timestamp: '2026-05-06T15:02:15Z', details: 'Monthly report for April 2026, Total revenue: TSh 45,680,000' },
  { id: 'log9', userId: 'u4', userName: 'Naomi Ochieng', action: 'Updated booking status', module: 'bookings', status: 'success', timestamp: '2026-05-06T15:08:40Z', details: 'Booking: BK-2026-001, Status changed to confirmed' },
  { id: 'log10', userId: 'u3', userName: 'Baraka Mwenda', action: 'Deleted old route', module: 'routes', status: 'warning', timestamp: '2026-05-06T15:15:25Z', details: 'Route: Dodoma → Morogoro has been permanently deleted' },
  { id: 'log11', userId: 'u1', userName: 'System', action: 'System backup initiated', module: 'system', status: 'info', timestamp: '2026-05-06T15:20:10Z', details: 'Daily automated backup started at 15:20' },
  { id: 'log12', userId: 'u2', userName: 'Super Administrator', action: 'Updated company settings', module: 'companies', status: 'success', timestamp: '2026-05-06T15:25:45Z', details: 'Company: Kilimanjaro Express, Updated contact information' },
  { id: 'log13', userId: 'u4', userName: 'Naomi Ochieng', action: 'Failed to update timetable', module: 'timetables', status: 'error', timestamp: '2026-05-06T15:30:20Z', details: 'Invalid time range: End time must be after start time' },
  { id: 'log14', userId: 'u3', userName: 'Baraka Mwenda', action: 'Suspended user account', module: 'users', status: 'warning', timestamp: '2026-05-06T15:35:55Z', details: 'User: test.user@example.com suspended due to multiple failed login attempts' },
  { id: 'log15', userId: 'u4', userName: 'Naomi Ochieng', action: 'Confirmed booking', module: 'bookings', status: 'success', timestamp: '2026-05-06T15:40:30Z', details: 'Booking: BK-2026-002, Payment received TSh 85,000' },
  { id: 'log16', userId: 'u2', userName: 'Super Administrator', action: 'Cleared system logs', module: 'system', status: 'info', timestamp: '2026-05-06T15:45:15Z', details: 'Cleared 1,245 log entries older than 30 days' },
  { id: 'log17', userId: 'u3', userName: 'Baraka Mwenda', action: 'Added new transport', module: 'transports', status: 'success', timestamp: '2026-05-06T15:50:40Z', details: 'Transport: Luxury Bus 002, Type: bus, Capacity: 45 seats' },
  { id: 'log18', userId: 'u4', userName: 'Naomi Ochieng', action: 'Updated activity price', module: 'activities', status: 'success', timestamp: '2026-05-06T15:55:25Z', details: 'Activity: Simba SC vs Young Africans, New price: TSh 20,000' },
  { id: 'log19', userId: 'u1', userName: 'System', action: 'Database maintenance completed', module: 'system', status: 'success', timestamp: '2026-05-06T16:00:00Z', details: 'Optimized 12 tables, freed 2.3 GB of space' },
  { id: 'log20', userId: 'u2', userName: 'Super Administrator', action: 'Failed to delete facility', module: 'facilities', status: 'error', timestamp: '2026-05-06T16:05:30Z', details: 'Cannot delete facility with active bookings' },
  { id: 'log21', userId: 'u3', userName: 'Baraka Mwenda', action: 'Updated route pricing', module: 'routes', status: 'success', timestamp: '2026-05-06T16:10:45Z', details: 'Route: Arusha → Moshi, Price updated from TSh 25,000 to TSh 28,000' },
  { id: 'log22', userId: 'u4', userName: 'Naomi Ochieng', action: 'Exported booking report', module: 'reports', status: 'info', timestamp: '2026-05-06T16:15:20Z', details: 'Exported 156 bookings for date range: May 1-6, 2026' },
  { id: 'log23', userId: 'u2', userName: 'Super Administrator', action: 'Changed user role', module: 'users', status: 'warning', timestamp: '2026-05-06T16:20:15Z', details: 'User: staff.member@example.com promoted from staff to company_admin' },
  { id: 'log24', userId: 'u1', userName: 'System', action: 'Security scan completed', module: 'system', status: 'info', timestamp: '2026-05-06T16:25:00Z', details: 'No vulnerabilities detected, all systems secure' },
  { id: 'log25', userId: 'u3', userName: 'Baraka Mwenda', action: 'Cancelled timetable', module: 'timetables', status: 'warning', timestamp: '2026-05-06T16:30:45Z', details: 'Timetable cancelled: Dar es Salaam → Dodoma, 2026-05-08 due to maintenance' },
];
