const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Journey = sequelize.define('Journey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    timetable_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'timetables',
        key: 'id'
      }
    },
    transport_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transports',
        key: 'id'
      }
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id'
      }
    },
    journey_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    departure_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrival_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'boarding', 'departed', 'delayed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    available_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    booked_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    held_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    delay_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'journeys',
    indexes: [
      { fields: ['timetable_id'] },
      { fields: ['transport_id'] },
      { fields: ['route_id'] },
      { fields: ['journey_date'] },
      { fields: ['status'] }
    ]
  });

  return Journey;
};
