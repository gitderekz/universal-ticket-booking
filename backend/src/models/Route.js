const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Route = sequelize.define('Route', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    origin_station_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stations',
        key: 'id'
      }
    },
    destination_station_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stations',
        key: 'id'
      }
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'draft'
    },
    is_sub_route: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    parent_route_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'routes',
        key: 'id'
      }
    }
  }, {
    tableName: 'routes',
    indexes: [
      { fields: ['company_id'] },
      { fields: ['transport_id'] },
      { fields: ['origin_station_id'] },
      { fields: ['destination_station_id'] },
      { fields: ['status'] },
      { fields: ['parent_route_id'] }
    ]
  });

  return Route;
};
