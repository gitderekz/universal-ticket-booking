import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { SeatSelector } from '../../components/booking/SeatSelector';
import { PaymentModal } from '../../components/booking/PaymentModal';
import { apiClient } from '../../../services/apiClient';
import { ArrowRight, ArrowLeft, Film, Calendar, Clock, Users, MapPin } from 'lucide-react';

const frontPositions: Record<'transport' | 'facility' | 'events', 'top' | 'left' | 'right'> = {
  transport: 'right',
  facility: 'top',
  events: 'top',
};

type Step = 'facility' | 'activity' | 'datetime' | 'seats' | 'details' | 'payment';

export const FacilityBooking: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { category } = useParams();

  const [currentStep, setCurrentStep] = useState<Step>('facility');
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<string[]>([]);
  const [seatAvailabilityLoading, setSeatAvailabilityLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load facilities, companies, activities, and activity instances from public endpoints
        const [facilitiesRes, companiesRes, activitiesRes, instancesRes] = await Promise.all([
          apiClient.get('/facilities'),
          apiClient.get('/companies'),
          apiClient.get('/activities'),
          apiClient.get('/activity-instances')
        ]);
        
        setFacilities(facilitiesRes.data?.facilities || facilitiesRes.data || []);
        setCompanies(companiesRes.data?.companies || companiesRes.data || []);
        setActivities(activitiesRes.data?.activities || activitiesRes.data || []);
        setTimetables(instancesRes.data?.activityInstances || instancesRes.data || []);
      } catch (error) {
        console.error('Error loading facility booking data:', error);
      }
    };
    loadData();
  }, []);

  const facility = selectedFacility ? facilities.find(f => f.id === selectedFacility) : null;
  const activity = selectedActivity ? activities.find(a => a.id === selectedActivity) : null;
  const timetable = selectedTimetable ? timetables.find(tt => tt.id === selectedTimetable) : null;
  const company = facility ? companies.find(c => c.id === (facility.company_id || facility.companyId)) || facility.Company : null;

  const formatTime = (dateTime: string | Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const filteredFacilities = category
    ? facilities.filter(f => 
        f.FacilityType?.category === category || 
        f.FacilityType?.slug === category ||
        f.category === category
      )
    : facilities;

  const activityPrice = parseFloat(activity?.base_price || activity?.price || '0') || 0;
  const totalPrice = activityPrice * selectedSeats.length;

  const loadSeatAvailability = async (activityInstanceId: string) => {
    setSeatAvailabilityLoading(true);
    try {
      const response = await apiClient.get('/seat-holds/availability', {
        params: { activity_instance_id: activityInstanceId }
      });
      const seatMap = response.data?.seatMap || [];
      setOccupiedSeats(seatMap.filter((seat: any) => seat.status === 'booked').map((seat: any) => seat.code));
      setHeldSeats(seatMap.filter((seat: any) => seat.status === 'held').map((seat: any) => seat.code));
    } catch (error) {
      console.error('Failed to load facility seat availability:', error);
      setOccupiedSeats([]);
      setHeldSeats([]);
    } finally {
      setSeatAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTimetable) {
      loadSeatAvailability(selectedTimetable);
    } else {
      setOccupiedSeats([]);
      setHeldSeats([]);
    }
  }, [selectedTimetable]);

  const getTitle = () => {
    try {
      if (currentStep === 'facility') return selectedFacility ? (facility?.name || t('booking.selectFacility')) : t('booking.selectFacility');
      if (currentStep === 'activity') return selectedActivity ? (activity?.name || 'Choose Activity') : `Choose activity for ${facility?.name || ''}`;
      if (currentStep === 'datetime') return selectedTimetable ? `When: ${new Date(timetable?.start_at || timetable?.date || '').toLocaleDateString()}` : t('booking.selectDateTime') || 'Choose Date & Time';
      if (currentStep === 'seats') return `Select seats${activity ? ` for ${activity.name}` : ''}`;
      if (currentStep === 'details') return 'Personal Details';
    } catch (e) {
      return t('booking.selectFacility');
    }
    return t('booking.selectFacility');
  };

  const reserveSelectedSeats = async () => {
    if (!selectedTimetable || selectedSeats.length === 0) return;
    try {
      await apiClient.post('/seat-holds/hold', {
        activity_instance_id: selectedTimetable,
        seat_codes: selectedSeats
      });
      await loadSeatAvailability(selectedTimetable);
    } catch (error) {
      console.error('Unable to reserve selected seats:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    if (currentStep === 'facility' && selectedFacility) setCurrentStep('activity');
    else if (currentStep === 'activity' && selectedActivity) setCurrentStep('datetime');
    else if (currentStep === 'datetime' && selectedTimetable) setCurrentStep('seats');
    else if (currentStep === 'seats' && selectedSeats.length > 0) {
      try {
        await reserveSelectedSeats();
        setCurrentStep('details');
      } catch (error) {
        alert('Some seats are no longer available. Please choose different seats.');
      }
    } else if (currentStep === 'details') setShowPayment(true);
  };

  const handleBack = () => {
    if (currentStep === 'activity') setCurrentStep('facility');
    else if (currentStep === 'datetime') setCurrentStep('activity');
    else if (currentStep === 'seats') setCurrentStep('datetime');
    else if (currentStep === 'details') setCurrentStep('seats');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'entertainment': return '🎬';
      case 'sports': return '🏟️';
      case 'events': return '🎪';
      case 'outdoor': return '🌳';
      case 'housing': return '🏠';
      default: return '🎫';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {getTitle()}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className={currentStep === 'facility' ? 'text-blue-500 font-medium' : ''}>1. Facility</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'activity' ? 'text-blue-500 font-medium' : ''}>2. Activity</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'datetime' ? 'text-blue-500 font-medium' : ''}>3. Date & Time</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'seats' ? 'text-blue-500 font-medium' : ''}>4. Seats</span>
          <ArrowRight className="w-4 h-4" />
          <span className={currentStep === 'details' ? 'text-blue-500 font-medium' : ''}>5. Details</span>
        </div>
      </div>

      {currentStep === 'facility' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => {
            const company = companies.find(c => c.id === (fac.company_id || fac.companyId)) || fac.Company;
            const categoryType = fac.category || fac.FacilityType?.slug || '';
            const facilityType = fac.FacilityType?.name || 'Facility';
            return (
              <button
                key={fac.id}
                onClick={() => setSelectedFacility(fac.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                  selectedFacility === fac.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-4xl mb-3">{getCategoryIcon(categoryType)}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{fac.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{company?.name}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Type: {facilityType}</p>
                  <p>Capacity: {fac.capacity} seats</p>
                  <p>Price: {formatPrice(parseFloat(fac.base_price || '0'))}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {currentStep === 'activity' && facility && (
        <div className="space-y-4">
          {activities.filter(a => (a.facility_id || a.facilityId) === facility.id).map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedActivity(act.id)}
              className={`w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                selectedActivity === act.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-3xl">
                    {act.activity_type === 'event' || act.type === 'event' ? '🎭' : act.activity_type === 'session' || act.type === 'session' ? '📺' : '🎪'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      {act.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {act.description}
                    </p>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                      {act.activity_type || act.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-500">{formatPrice(parseFloat(act.base_price || act.price || '0'))}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">per seat</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentStep === 'datetime' && activity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timetables.filter(tt => (tt.activityId || tt.activity_id) === activity.id).map((tt) => (
            <button
              key={tt.id}
              onClick={() => setSelectedTimetable(tt.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-left border-2 transition-all ${
                selectedTimetable === tt.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(tt.start_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatTime(tt.start_at)} - {formatTime(tt.end_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {tt.available_slots || tt.total_slots} seats available
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentStep === 'seats' && facility && (
        <div>
          <SeatSelector
            sittingPlan={facility.sittingPlan || facility.seatLayout?.pattern}
            sittingLength={facility.sittingLength ?? facility.seatLayout?.rows ?? 0}
            selectedSeats={selectedSeats}
            onSeatsChange={setSelectedSeats}
            occupiedSeats={occupiedSeats}
            heldSeats={heldSeats}
            frontPosition={frontPositions.facility}
            typeSlug={facility.category || facility.FacilityType?.category}
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
                <p className="text-3xl font-bold text-purple-500">{formatPrice(totalPrice)}</p>
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
        {currentStep !== 'facility' && (
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
            (currentStep === 'facility' && !selectedFacility) ||
            (currentStep === 'activity' && !selectedActivity) ||
            (currentStep === 'datetime' && !selectedTimetable) ||
            (currentStep === 'seats' && selectedSeats.length === 0)
          }
          className="ml-auto flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 'details' ? t('booking.proceedToPayment') : t('common.next')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          amount={totalPrice}
          onClose={() => setShowPayment(false)}
          onSubmit={async () => {
            try {
              const bookingItems = selectedSeats.map((seatCode) => ({
                passenger_name: passengerDetails.fullName || 'Guest',
                passenger_type: 'adult',
                unit_price: activityPrice,
                item_code: seatCode,
                details: {
                  facility: facility?.name,
                  activity: activity?.name,
                  session: timetable?.start_at || timetable?.date
                }
              }));

              const bookingData = {
                activity_instance_id: selectedTimetable,
                booking_type: 'facility',
                seat_codes: selectedSeats,
                items: bookingItems,
                total_amount: totalPrice,
                passenger_count: selectedSeats.length,
                contact_name: passengerDetails.fullName,
                contact_phone: passengerDetails.phone,
                contact_email: passengerDetails.email,
                notes: `ID: ${passengerDetails.idNumber}`
              };

              await apiClient.post('/bookings', bookingData);
              setShowPayment(false);
              navigate('/tickets');
            } catch (error) {
              console.error('Facility booking failed:', error);
              alert('Booking failed. Please try again.');
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};
