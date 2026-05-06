const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RouteStation = sequelize.define('RouteStation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id'
      }
    },
    station_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stations',
        key: 'id'
      }
    },
    sequence_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    distance_from_origin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    cumulative_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    is_break_stop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    stop_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'route_stations',
    indexes: [
      { fields: ['route_id'] },
      { fields: ['station_id'] },
      { fields: ['sequence_order'] }
    ],
    uniqueKeys: {
      route_station_unique: {
        fields: ['route_id', 'station_id']
      }
    }
  });

  return RouteStation;
};
