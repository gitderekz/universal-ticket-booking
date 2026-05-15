import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useBooking } from '../../../contexts/BookingContext';
import { journeyService, Journey, SeatAvailability } from '../../../services/journeyService';
import { paymentService } from '../../../services/paymentService';
import { SeatSelector } from '../../components/booking/SeatSelector';
import { PaymentModal } from '../../components/booking/PaymentModal';
import { ArrowRight, ArrowLeft, Bus, Calendar, MapPin, Clock, Users, Loader2 } from 'lucide-react';

type Step = 'search' | 'journey' | 'seats' | 'details' | 'payment';

interface PassengerDetail {
  passenger_name: string;
  passenger_type: 'adult' | 'child' | 'infant' | 'senior';
}

export const TransportBookingAPI: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();
  const { selectJourney, selectSeats, holdSeats, createBooking: contextCreateBooking } = useBooking();

  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [journeyDate, setJourneyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [availability, setAvailability] = useState<SeatAvailability | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [holdLoading, setHoldLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // Passenger details
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Search for journeys
  const handleSearchJourneys = async () => {
    setSearchLoading(true);
    try {
      const result = await journeyService.searchJourneys({
        journey_date: journeyDate,
        limit: 20,
      });
      setJourneys(result.journeys);
      setCurrentStep('journey');
    } catch (error) {
      console.error('Error searching journeys:', error);
      alert('Failed to search journeys. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Select journey and load availability
  const handleSelectJourney = async (journey: Journey) => {
    try {
      selectJourney(journey.id);
      setSelectedJourney(journey);
      const avail = await journeyService.getAvailability(journey.id);
      setAvailability(avail);
      setSelectedSeats([]);
      setPassengerDetails([]);
      setCurrentStep('seats');
    } catch (error) {
      console.error('Error loading journey availability:', error);
      alert('Failed to load journey details. Please try again.');
    }
  };

  // Hold seats
  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    setHoldLoading(true);
    try {
      await holdSeats(selectedSeats);
      setPassengerDetails(
        selectedSeats.map((_, idx) => ({
          passenger_name: '',
          passenger_type: 'adult',
        }))
      );
      setCurrentStep('details');
    } catch (error) {
      console.error('Error holding seats:', error);
      alert('Failed to hold seats. They may have been taken. Please try again.');
    } finally {
      setHoldLoading(false);
    }
  };

  // Calculate total price
  const totalPrice = selectedJourney && selectedSeats.length > 0 
    ? (selectedJourney as any).price * selectedSeats.length 
    : 0;

  // Process payment
  const handleProcessPayment = async (paymentPayload: {
    method: 'mobile' | 'card' | 'bank';
    provider: string;
    phoneNumber?: string;
  }) => {
    try {
      const booking = await contextCreateBooking({
        booking_type: 'transport',
        items: passengerDetails,
        total_amount: totalPrice,
        currency_id: currency?.id || null,
        passenger_count: selectedSeats.length,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        notes: `Payment via ${paymentPayload.provider}`,
      });

      const paymentResult = await paymentService.processPayment({
        booking_id: booking.id,
        method: paymentPayload.method,
        provider: paymentPayload.provider,
        amount: totalPrice,
        phone_number: paymentPayload.phoneNumber,
      } as any);

      if (paymentResult.payment.status === 'completed') {
        navigate(`/tickets/${booking.booking_code}`);
      } else if (paymentResult.payment.status === 'processing') {
        alert('Payment is processing. Please complete the payment on your phone.');
        navigate(`/tickets/${booking.booking_code}`);
      } else {
        alert('Payment failed. Please try again.');
        setShowPayment(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const handleNext = async () => {
    if (currentStep === 'search' && journeyDate) {
      await handleSearchJourneys();
    } else if (currentStep === 'journey' && selectedJourney) {
      await handleSelectJourney(selectedJourney);
    } else if (currentStep === 'seats' && selectedSeats.length > 0) {
      await handleHoldSeats();
    } else if (currentStep === 'details') {
      setShowPayment(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 'journey') {
      setCurrentStep('search');
      setJourneys([]);
    } else if (currentStep === 'seats') {
      setCurrentStep('journey');
      setSelectedJourney(null);
      setAvailability(null);
    } else if (currentStep === 'details') {
      setCurrentStep('seats');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('booking.selectTransport')}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <span className={currentStep === 'search' ? 'text-blue-500 font-medium' : ''}>1. {t('common.search')}</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'journey' ? 'text-blue-500 font-medium' : ''}>2. {t('booking.selectJourney')}</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'seats' ? 'text-blue-500 font-medium' : ''}>3. {t('booking.seats')}</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'details' ? 'text-blue-500 font-medium' : ''}>4. {t('booking.details')}</span>
        </div>
      </div>

      {/* Search Step */}
      {currentStep === 'search' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('common.search')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Journey Date
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Journey Selection Step */}
      {currentStep === 'journey' && (
        <div className="space-y-4">
          {journeys.length === 0 && !searchLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">{t('booking.noJourneys')}</p>
            </div>
          )}
          {journeys.map((journey) => (
            <button
              key={journey.id}
              onClick={() => handleSelectJourney(journey)}
              className={`w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                selectedJourney?.id === journey.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Bus className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {journey.journey_date} {journey.departure_at}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {journey.available_units} seats available
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">{formatPrice((journey as any).price || 0)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Seat Selection Step */}
      {currentStep === 'seats' && selectedJourney && availability && (
        <div>
          <SeatSelector
            sittingPlan="2-2"
            sittingLength={10}
            selectedSeats={selectedSeats}
            onSeatsChange={setSelectedSeats}
            occupiedSeats={Object.entries(availability.seat_map)
              .filter(([_, status]) => status === 'booked')
              .map(([code, _]) => code)}
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

      {/* Passenger Details Step */}
      {currentStep === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Passenger & Contact Details</h2>
          
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white col-span-full"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Passenger Details</h3>
            <div className="space-y-4">
              {passengerDetails.map((detail, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="text"
                    placeholder={`Passenger ${idx + 1} Name`}
                    value={detail.passenger_name}
                    onChange={(e) => {
                      const updated = [...passengerDetails];
                      updated[idx].passenger_name = e.target.value;
                      setPassengerDetails(updated);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={detail.passenger_type}
                    onChange={(e) => {
                      const updated = [...passengerDetails];
                      updated[idx].passenger_type = e.target.value as any;
                      setPassengerDetails(updated);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant">Infant</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Total Amount:</strong> {formatPrice(totalPrice)}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {currentStep !== 'search' && (
          <button
            onClick={handleBack}
            disabled={searchLoading || holdLoading}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back')}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={
            searchLoading || holdLoading ||
            (currentStep === 'search' && !journeyDate) ||
            (currentStep === 'journey' && !selectedJourney) ||
            (currentStep === 'seats' && selectedSeats.length === 0) ||
            (currentStep === 'details' && (!contactName || !contactEmail || !contactPhone || passengerDetails.some(p => !p.passenger_name)))
          }
          className="ml-auto flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searchLoading || holdLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {currentStep === 'details' ? t('booking.proceedToPayment') : t('common.next')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          amount={totalPrice}
          onClose={() => setShowPayment(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </div>
  );
};

export default TransportBookingAPI;
