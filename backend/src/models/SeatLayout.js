const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SeatLayout = sequelize.define('SeatLayout', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    layoutable_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    layoutable_type: {
      type: DataTypes.ENUM('transport', 'facility'),
      allowNull: false,
      defaultValue: 'transport'
    },
    layout_type: {
      type: DataTypes.ENUM('seat', 'spot', 'table', 'room', 'mixed'),
      allowNull: false,
      defaultValue: 'seat'
    },
    pattern: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'seat_layouts',
    indexes: [
      { fields: ['layoutable_id'] },
      { fields: ['layoutable_type'] },
      { fields: ['layout_type'] },
      { fields: ['status'] }
    ]
  });

  return SeatLayout;
};
