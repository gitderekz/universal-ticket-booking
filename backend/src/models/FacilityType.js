const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacilityType = sequelize.define('FacilityType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'facility_types',
    indexes: [
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['active'] }
    ]
  });

  return FacilityType;
};