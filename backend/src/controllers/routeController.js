const { sequelize, Route, RouteStation, Station, Transport } = require('../models');

const findOrCreateStationByName = async (name, transaction) => {
  if (!name) return null;
  const trimmedName = name.trim();
  if (!trimmedName) return null;

  let station = await Station.findOne({ where: { name: trimmedName } });
  if (!station) {
    station = await Station.create({ name: trimmedName }, { transaction });
  }
  return station;
};

const buildRouteStationRecords = async (stations, routeId, transaction) => {
  if (!Array.isArray(stations)) return [];

  return Promise.all(stations.map(async (station, index) => {
    const stationId = station.station_id || station.station?.id || station.id || null;
    let resolvedStationId = stationId;
    if (!resolvedStationId && station.name) {
      const stationRecord = await findOrCreateStationByName(station.name, transaction);
      resolvedStationId = stationRecord?.id;
    }

    return {
      route_id: routeId,
      station_id: resolvedStationId,
      sequence_order: station.order ?? index + 1,
      distance_from_origin: station.distance_from_origin ?? station.distanceFromOrigin ?? null,
      cumulative_price: station.cumulative_price ?? station.price ?? 0,
      is_break_stop: station.is_break_stop ?? station.isBreakStop ?? false,
      stop_duration_minutes: station.stop_duration_minutes ?? station.stopDurationMinutes ?? 0,
    };
  }));
};

const listRoutes = async (req, res, next) => {
  try {
    const routes = await Route.findAll({
      include: [
        { model: Transport, attributes: ['id', 'name'] },
        { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
        { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] },
        { 
          model: RouteStation, 
          attributes: ['id', 'sequence_order', 'distance_from_origin', 'cumulative_price', 'is_break_stop', 'stop_duration_minutes'],
          include: [{ model: Station, attributes: ['id', 'name', 'city'] }] 
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ routes });
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      company_id,
      transport_id,
      name,
      description,
      origin_station_id,
      origin_station_name,
      destination_station_id,
      destination_station_name,
      base_price,
      distance_km,
      status,
      is_sub_route,
      parent_route_id,
      stations
    } = req.body;

    const originStationId = origin_station_id || (await findOrCreateStationByName(origin_station_name, transaction))?.id;
    const destinationStationId = destination_station_id || (await findOrCreateStationByName(destination_station_name, transaction))?.id;

    const route = await Route.create({
      company_id,
      transport_id,
      name,
      description,
      origin_station_id: originStationId,
      destination_station_id: destinationStationId,
      base_price,
      distance_km,
      status: status || 'draft',
      is_sub_route: !!is_sub_route,
      parent_route_id: parent_route_id || null
    }, { transaction });

    if (Array.isArray(stations) && stations.length > 0) {
      const stationRecords = await buildRouteStationRecords(stations, route.id, transaction);
      await RouteStation.bulkCreate(stationRecords.filter(r => r.station_id), { transaction });
    }

    await transaction.commit();
    const result = await Route.findByPk(route.id, {
      include: [
        { model: Transport, attributes: ['id', 'name'] },
        { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
        { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] },
        { model: RouteStation, include: [{ model: Station, attributes: ['id', 'name', 'city'] }] }
      ]
    });

    res.status(201).json({ route: result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      company_id,
      transport_id,
      name,
      description,
      origin_station_id,
      origin_station_name,
      destination_station_id,
      destination_station_name,
      base_price,
      distance_km,
      status,
      is_sub_route,
      parent_route_id,
      stations
    } = req.body;

    const route = await Route.findByPk(id);
    if (!route) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Route not found' });
    }

    const originStationId = origin_station_id || (origin_station_name && (await findOrCreateStationByName(origin_station_name, transaction))?.id) || route.origin_station_id;
    const destinationStationId = destination_station_id || (destination_station_name && (await findOrCreateStationByName(destination_station_name, transaction))?.id) || route.destination_station_id;

    await route.update({
      company_id: company_id || route.company_id,
      transport_id: transport_id || route.transport_id,
      name: name || route.name,
      description: description !== undefined ? description : route.description,
      origin_station_id: originStationId,
      destination_station_id: destinationStationId,
      base_price: base_price !== undefined ? base_price : route.base_price,
      distance_km: distance_km !== undefined ? distance_km : route.distance_km,
      status: status || route.status,
      is_sub_route: typeof is_sub_route === 'boolean' ? is_sub_route : route.is_sub_route,
      parent_route_id: parent_route_id !== undefined ? parent_route_id : route.parent_route_id
    }, { transaction });

    if (Array.isArray(stations)) {
      await RouteStation.destroy({ where: { route_id: route.id }, transaction });
      const stationRecords = await buildRouteStationRecords(stations, route.id, transaction);
      await RouteStation.bulkCreate(stationRecords.filter(r => r.station_id), { transaction });
    }

    await transaction.commit();

    const result = await Route.findByPk(route.id, {
      include: [
        { model: Transport, attributes: ['id', 'name'] },
        { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
        { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] },
        { model: RouteStation, include: [{ model: Station, attributes: ['id', 'name', 'city'] }] }
      ]
    });

    res.json({ route: result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    await route.destroy();
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRoutes,
  createRoute,
  updateRoute,
  deleteRoute
};
