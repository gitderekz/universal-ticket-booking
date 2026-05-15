const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    facility_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'facilities',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    activity_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'general',
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    age_restriction: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'cancelled','sold_out'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'activities',
    indexes: [
      { fields: ['facility_id'] },
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['status'] }
    ]
  });

  return Activity;
};