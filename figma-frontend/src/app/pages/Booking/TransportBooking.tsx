import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { mockTransports, mockRoutes, mockTimetables, mockCompanies } from '../../../data/mockData';
import { SeatSelector } from '../../components/booking/SeatSelector';
import { PaymentModal } from '../../components/booking/PaymentModal';
import { ArrowRight, ArrowLeft, Bus, Calendar, MapPin, Clock, Users } from 'lucide-react';

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

  const transport = selectedTransport ? mockTransports.find(t => t.id === selectedTransport) : null;
  const route = selectedRoute ? mockRoutes.find(r => r.id === selectedRoute) : null;
  const timetable = selectedTimetable ? mockTimetables.find(tt => tt.id === selectedTimetable) : null;
  const company = transport ? mockCompanies.find(c => c.id === transport.companyId) : null;

  const calculatePrice = () => {
    if (!route) return 0;
    const startIdx = route.stations.findIndex(s => s.name === startStation);
    const endIdx = route.stations.findIndex(s => s.name === endStation);
    if (startIdx === -1 || endIdx === -1) return route.price;
    return route.stations[endIdx].price - (startIdx > 0 ? route.stations[startIdx - 1].price : 0);
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
          {mockTransports
            .filter(t => allowedTypes.length === 0 || allowedTypes.includes(t.type))
            .map((transport) => {
            const company = mockCompanies.find(c => c.id === transport.companyId);
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
                  <p>Type: {t(`transportTypes.${transport.type}`)}</p>
                  <p>Capacity: {transport.capacity} seats</p>
                  <p>Layout: {transport.sittingPlan}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {currentStep === 'route' && transport && (
        <div className="space-y-4">
          {mockRoutes.filter(r => r.transportId === transport.id).map((route) => (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRoute(route.id);
                setStartStation(route.startLocation);
                setEndStation(route.endLocation);
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
                      {route.startLocation} → {route.endLocation}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {route.stations.length} stations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">{formatPrice(route.price)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {route.stations.map((station) => (
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
          ))}
        </div>
      )}

      {currentStep === 'datetime' && route && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockTimetables.filter(tt => tt.routeId === route.id).map((timetable) => (
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
                  <span className="font-bold text-gray-900 dark:text-white">{timetable.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {timetable.startTime} - {timetable.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {timetable.availableSeats} seats available
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
            sittingPlan={transport.sittingPlan}
            sittingLength={transport.sittingLength}
            selectedSeats={selectedSeats}
            onSeatsChange={setSelectedSeats}
            occupiedSeats={['A1', 'B3', 'C2']}
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
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="tel"
              placeholder="Phone"
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="ID Number"
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
          onSuccess={() => navigate('/tickets')}
        />
      )}
    </div>
  );
};
