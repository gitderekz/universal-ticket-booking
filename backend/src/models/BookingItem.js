const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookingItem = sequelize.define('BookingItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    item_type: {
      type: DataTypes.ENUM('seat', 'spot', 'room', 'table', 'section'),
      allowNull: false,
      defaultValue: 'seat'
    },
    item_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    passenger_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passenger_type: {
      type: DataTypes.ENUM('adult', 'child', 'infant', 'senior'),
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'booking_items',
    indexes: [
      { fields: ['booking_id'] }
    ]
  });

  return BookingItem;
};
