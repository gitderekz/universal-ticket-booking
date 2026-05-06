const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TransportType = sequelize.define('TransportType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.ENUM('land', 'air', 'water'),
      allowNull: false,
      defaultValue: 'land'
    },
    icon_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requires_routes: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requires_layout: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'transport_types',
    indexes: [
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['active'] }
    ]
  });

  return TransportType;
};
