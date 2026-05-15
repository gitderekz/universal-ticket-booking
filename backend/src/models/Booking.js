const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    booking_type: {
      type: DataTypes.ENUM('transport', 'facility'),
      allowNull: false,
      defaultValue: 'transport'
    },
    journey_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'journeys',
        key: 'id'
      }
    },
    activity_instance_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'activity_instances',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'holding', 'confirmed', 'cancelled', 'refunded', 'completed', 'expired'),
      allowNull: false,
      defaultValue: 'pending'
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    currency_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'currencies',
        key: 'id'
      }
    },
    exchange_rate_snapshot: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
      defaultValue: 1.0
    },
    passenger_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'bookings',
    indexes: [
      { fields: ['booking_code'] },
      { fields: ['user_id'] },
      { fields: ['company_id'] },
      { fields: ['status'] },
      { fields: ['journey_id'] },
      { fields: ['activity_instance_id'] },
      { fields: ['currency_id'] }
    ]
  });

  return Booking;
};
