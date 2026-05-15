const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Currency = sequelize.define('Currency', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
      defaultValue: 1.0
    },
    is_base: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'currencies',
    indexes: [
      { fields: ['active'] }
    ]
  });

  return Currency;
};
