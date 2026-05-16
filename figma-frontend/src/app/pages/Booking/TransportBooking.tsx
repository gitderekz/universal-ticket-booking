import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { SeatSelector } from '../../components/booking/SeatSelector';
import { PaymentModal } from '../../components/booking/PaymentModal';
import { getRoutes, getTimetables } from '../../../services/managementService';
import { journeyService } from '../../../services/journeyService';
import { bookingService, seatHoldService } from '../../../services/bookingService';
import apiClient from '../../../services/apiClient';
import { ArrowRight, ArrowLeft, Bus, Calendar, MapPin, Clock, Users } from 'lucide-react';

const frontPositions: Record<'transport' | 'facility' | 'events', 'top' | 'left' | 'right'> = {
  transport: 'left',
  facility: 'top',
  events: 'top',
};

type Step = 'transport' | 'route' | 'datetime' | 'seats' | 'details' | 'payment';

export const TransportBooking: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { transportType } = useParams();
  const location = useLocation();
  const allowedTypes = location.state?.types || [];

  const [currentStep, setCurrentStep] = useState<Step>('transport');
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [startStation, setStartStation] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [transports, setTransports] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<string[]>([]);
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: ''
  });

  // Derived state
  const transport = selectedTransport ? transports.find(t => t.id === selectedTransport) : null;
  const route = selectedRoute ? routes.find(r => r.id === selectedRoute) : null;
  const timetable = selectedTimetable ? timetables.find(tt => tt.id === selectedTimetable) : null;
  const company = transport ? companies.find(c => c.id === (transport.company_id || transport.companyId)) || transport.Company : null;

  const transportTypeLabel = transport?.TransportType?.name || transport?.type || transportType || 'Unknown';
  const transportSittingPlan = transport?.sittingPlan || transport?.seatLayout?.pattern || '2-2';
  const transportSittingLength = transport?.sittingLength ?? transport?.seatLayout?.rows ?? Math.max(6, Math.ceil((transport?.capacity || 50) / 4));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transportsRes, routesRes, companiesRes] = await Promise.all([
          apiClient.get('/transports', { params: { transport_type_slug: transportType } }),
          getRoutes(),
          apiClient.get('/companies')
        ]);
        const transportsData = transportsRes.data.transports || transportsRes.data.data || [];
        const companiesData = companiesRes.data.companies || companiesRes.data.data || [];
        setTransports(transportsData);
        setRoutes(routesRes || []);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error loading booking data:', error);
      }
    };
    loadData();
  }, [transportType]);

  useEffect(() => {
    const loadTimetables = async () => {
      if (selectedRoute && selectedTransport) {
        try {
          const timetablesRes = await getTimetables(selectedRoute, selectedTransport);
          setTimetables(timetablesRes || []);
        } catch (error) {
          console.error('Error loading timetables:', error);
          setTimetables([]);
        }
      } else {
        setTimetables([]);
      }
    };
    loadTimetables();
  }, [selectedRoute, selectedTransport]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedTimetable) {
        setBookedSeats([]);
        setHeldSeats([]);
        return;
      }

      try {
        const availability = await journeyService.getAvailability(selectedTimetable);
        const booked = availability?.seatMap?.filter((seat: any) => seat.status === 'booked').map((seat: any) => seat.code) || [];
        const held = availability?.seatMap?.filter((seat: any) => seat.status === 'held').map((seat: any) => seat.code) || [];
        setBookedSeats(booked);
        setHeldSeats(held);
      } catch (error) {
        console.error('Error loading journey availability:', error);
        setBookedSeats([]);
        setHeldSeats([]);
      }
    };
    loadAvailability();
  }, [selectedTimetable]);

  const calculatePrice = () => {
    if (!route) return 0;
    const routeStations = (route.RouteStations?.map((rs: any) => rs.station).filter(Boolean) || route.stations || []);
    const startIdx = routeStations.findIndex((s: any) => s.name === startStation);
    const endIdx = routeStations.findIndex((s: any) => s.name === endStation);
    const routePrice = route.base_price || route.price || 0;
    if (startIdx === -1 || endIdx === -1) return routePrice;
    return routePrice;
  };

  const totalPrice = calculatePrice() * selectedSeats.length;

  const handleNext = () => {
    if (currentStep === 'transport' && selectedTransport) setCurrentStep('route');
    else if (currentStep === 'route' && selectedRoute) setCurrentStep('datetime');
    else if (currentStep === 'datetime' && selectedTimetable) setCurrentStep('seats');
    else if (currentStep === 'seats' && selectedSeats.length > 0) setCurrentStep('details');
    else if (currentStep === 'details') setShowPayment(true);
  };

  const handleBack = () => {
    if (currentStep === 'route') setCurrentStep('transport');
    else if (currentStep === 'datetime') setCurrentStep('route');
    else if (currentStep === 'seats') setCurrentStep('datetime');
    else if (currentStep === 'details') setCurrentStep('seats');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('booking.selectTransport')}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className={currentStep === 'transport' ? 'text-blue-500 font-medium' : ''}>1. Transport</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'route' ? 'text-blue-500 font-medium' : ''}>2. Route</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'datetime' ? 'text-blue-500 font-medium' : ''}>3. Date & Time</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'seats' ? 'text-blue-500 font-medium' : ''}>4. Seats</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'details' ? 'text-blue-500 font-medium' : ''}>5. Details</span>
        </div>
      </div>

      {currentStep === 'transport' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transports
            .filter(t => true) // Temporarily show all transports for debugging
            .map((transport) => {
            const company = companies.find(c => c.id === (transport.company_id || transport.companyId)) || transport.Company;
            return (
              <button
                key={transport.id}
                onClick={() => setSelectedTransport(transport.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                  selectedTransport === transport.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Bus className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{transport.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{company?.name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Type: {transportTypeLabel}</p>
                  <p>Capacity: {transport.capacity} seats</p>
                  <p>Layout: {transportSittingPlan}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {currentStep === 'route' && transport && (
        <div className="space-y-4">
          {routes.filter(r => (r.transport_id || r.transportId) === transport.id).map((route) => {
            const routeStations = (route.RouteStations?.map((rs: any) => rs.station).filter(Boolean) || route.stations || []);
            const fallbackStations = routeStations.length > 0 ? routeStations : [
              { id: `${route.id}-origin`, name: route.originStation?.name || 'Origin' },
              { id: `${route.id}-destination`, name: route.destinationStation?.name || 'Destination' }
            ];
            const startLoc = route.startLocation || route.originStation?.name || 'Unknown';
            const endLoc = route.endLocation || route.destinationStation?.name || 'Unknown';
            const routePrice = route.base_price || route.price || 0;
            return (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRoute(route.id);
                setStartStation(startLoc);
                setEndStation(endLoc);
              }}
              className={`w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                selectedRoute === route.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {startLoc} → {endLoc}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fallbackStations.length} stations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">{formatPrice(routePrice)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {fallbackStations.map((station: any) => (
                  <span
                    key={station.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      station.isBreakStop
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {station.name}
                  </span>
                ))}
              </div>
            </button>
          );
          })}
        </div>
      )}

      {currentStep === 'datetime' && route && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timetables.map((timetable) => (
            <button
              key={timetable.id}
              onClick={() => setSelectedTimetable(timetable.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                selectedTimetable === timetable.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(timetable.journey_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {timetable.Timetable?.departure_time} - {timetable.Timetable?.arrival_time}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {timetable.available_seats} seats available
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentStep === 'seats' && transport && (
        <div>
          <SeatSelector
            sittingPlan={transportSittingPlan}
            sittingLength={transportSittingLength}
            selectedSeats={selectedSeats}
            onSeatsChange={setSelectedSeats}
            occupiedSeats={bookedSeats}
            heldSeats={heldSeats}
            frontPosition={frontPositions.transport}
            typeSlug={transportType}
          />
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.selectedSeats')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedSeats.join(', ') || 'None'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400">{t('booking.totalPrice')}</p>
                <p className="text-3xl font-bold text-blue-500">{formatPrice(totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={passengerDetails.fullName}
              onChange={(e) => setPassengerDetails(prev => ({ ...prev, fullName: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={passengerDetails.email}
              onChange={(e) => setPassengerDetails(prev => ({ ...prev, email: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={passengerDetails.phone}
              onChange={(e) => setPassengerDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="ID Number"
              value={passengerDetails.idNumber}
              onChange={(e) => setPassengerDetails(prev => ({ ...prev, idNumber: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        {currentStep !== 'transport' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back')}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={
            (currentStep === 'transport' && !selectedTransport) ||
            (currentStep === 'route' && !selectedRoute) ||
            (currentStep === 'datetime' && !selectedTimetable) ||
            (currentStep === 'seats' && selectedSeats.length === 0)
          }
          className="ml-auto flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 'details' ? t('booking.proceedToPayment') : t('common.next')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          amount={totalPrice}
          onClose={() => setShowPayment(false)}
          onSubmit={async (paymentPayload) => {
            try {
              // First hold the seats
              await seatHoldService.holdSeats(selectedTimetable, selectedSeats);
              
              // Create booking items for each seat
              const bookingItems = selectedSeats.map(seatCode => ({
                passenger_name: passengerDetails.fullName,
                passenger_type: 'adult',
                unit_price: calculatePrice(),
                seat_code: seatCode
              }));
              
              // Create the booking
              const bookingData = {
                journey_id: selectedTimetable,
                seat_codes: selectedSeats,
                booking_type: 'transport',
                items: bookingItems,
                total_amount: totalPrice,
                passenger_count: selectedSeats.length,
                contact_name: passengerDetails.fullName,
                contact_phone: passengerDetails.phone,
                contact_email: passengerDetails.email,
                notes: `ID: ${passengerDetails.idNumber}`
              };
              
              await bookingService.createBooking(bookingData);
              
              // Simulate payment processing
              await new Promise((resolve) => setTimeout(resolve, 2000));
              
              setShowPayment(false);
              navigate('/tickets');
            } catch (error) {
              console.error('Booking creation failed:', error);
              alert('Booking failed. Please try again.');
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};
