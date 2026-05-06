const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Seat = sequelize.define('Seat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    seat_layout_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'seat_layouts',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    seat_type: {
      type: DataTypes.ENUM('standard', 'window', 'aisle', 'wheelchair', 'operator', 'driver', 'spot', 'table', 'room', 'vip', 'economy', 'business'),
      allowNull: false,
      defaultValue: 'standard'
    },
    row: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    column: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'seats',
    indexes: [
      { fields: ['seat_layout_id'] },
      { fields: ['code'] },
      { fields: ['seat_type'] },
      { fields: ['status'] }
    ],
    uniqueKeys: {
      layout_code_unique: {
        fields: ['seat_layout_id', 'code']
      }
    }
  });

  return Seat;
};
