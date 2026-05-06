const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SeatHold = sequelize.define('SeatHold', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
      allowNull: true
    },
    seat_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    held_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('holding', 'released', 'converted', 'expired'),
      allowNull: false,
      defaultValue: 'holding'
    }
  }, {
    tableName: 'seat_holds',
    indexes: [
      { fields: ['journey_id'] },
      { fields: ['seat_code'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['expires_at'] }
    ]
  });

  return SeatHold;
};
