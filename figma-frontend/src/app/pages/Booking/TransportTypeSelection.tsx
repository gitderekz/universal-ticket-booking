import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bus, Ship, Plane, Train, Car } from 'lucide-react';
import apiClient from '../../../services/apiClient';

const transportTypeMeta: Record<string, { icon: JSX.Element; color: string; description: string }> = {
  bus: {
    icon: <Bus className="w-12 h-12" />,
    color: 'from-blue-500 to-blue-600',
    description: 'Long distance buses and mini buses'
  },
  mini_bus: {
    icon: <Bus className="w-12 h-12" />,
    color: 'from-blue-500 to-blue-600',
    description: 'Shuttle and minibus services'
  },
  safari_car: {
    icon: <Car className="w-12 h-12" />,
    color: 'from-green-500 to-green-600',
    description: 'Safari tours and 4x4 vehicles'
  },
  train: {
    icon: <Train className="w-12 h-12" />,
    color: 'from-purple-500 to-purple-600',
    description: 'Railway services across the country'
  },
  boat: {
    icon: <Ship className="w-12 h-12" />,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Boat services'
  },
  ferry: {
    icon: <Ship className="w-12 h-12" />,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Ferries and marine routes'
  },
  ship: {
    icon: <Ship className="w-12 h-12" />,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Large passenger ships'
  },
  airplane: {
    icon: <Plane className="w-12 h-12" />,
    color: 'from-red-500 to-red-600',
    description: 'Domestic and regional flights'
  }
};

export const TransportTypeSelection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transportTypes, setTransportTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransportTypes = async () => {
      try {
        const response = await apiClient.get('/transports/types');
        setTransportTypes(response.data.transport_types || []);
      } catch (error) {
        console.error('Failed to load transport types', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransportTypes();
  }, []);

  const handleSelect = (transportType: string) => {
    navigate(`/bookings/transport/${transportType}`);
  };

  const cards = transportTypes.length > 0
    ? transportTypes.map((type) => ({
      id: type.slug,
      icon: transportTypeMeta[type.slug]?.icon || <Bus className="w-12 h-12" />,
      title: type.name,
      description: type.description || transportTypeMeta[type.slug]?.description || '',
      color: transportTypeMeta[type.slug]?.color || 'from-blue-500 to-blue-600',
      count: type.transport_count || 0
    }))
    : [
      {
        id: 'bus',
        icon: <Bus className="w-12 h-12" />,
        title: t('transportTypes.bus'),
        description: 'Long distance buses and mini buses',
        color: 'from-blue-500 to-blue-600',
        count: 0
      }
    ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('booking.selectTransport')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred mode of transport
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all text-left"
          >
            <div className={`bg-gradient-to-r ${type.color} w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
              {type.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {type.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {type.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {type.count} available
              </span>
              <span className="text-blue-500 font-medium group-hover:translate-x-2 transition-transform inline-block">
                Select →
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Need Help Choosing?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-medium mb-1">🚌 Buses - Best for:</p>
            <p className="text-gray-600 dark:text-gray-400">Budget travel, city-to-city routes, regular schedules</p>
          </div>
          <div>
            <p className="font-medium mb-1">🚗 Safari Cars - Best for:</p>
            <p className="text-gray-600 dark:text-gray-400">Group tours, wildlife safaris, off-road adventures</p>
          </div>
          <div>
            <p className="font-medium mb-1">🚂 Trains - Best for:</p>
            <p className="text-gray-600 dark:text-gray-400">Long distance, scenic routes, comfort travel</p>
          </div>
          <div>
            <p className="font-medium mb-1">⛴️ Water Transport - Best for:</p>
            <p className="text-gray-600 dark:text-gray-400">Island hopping, coastal routes, ferry services</p>
          </div>
        </div>
      </div>
    </div>
  );
};
