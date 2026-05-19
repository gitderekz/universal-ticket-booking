const normalizeStationNames = (stations = []) => {
  return stations
    .map((station) => {
      if (!station) return '';
      if (typeof station === 'string') return station;
      if (typeof station.name === 'string') return station.name;
      if (typeof station.station === 'string') return station.station;
      if (station.Station && typeof station.Station.name === 'string') return station.Station.name;
      if (station.station && station.station.name) return station.station.name;
      return '';
    })
    .filter(Boolean);
};

const getRouteSegments = (stations = []) => {
  const names = normalizeStationNames(stations);
  if (names.length < 2) return [];
  return names.slice(0, -1).map((station, index) => `${station}-${names[index + 1]}`);
};

const getJourneySegments = (stations = [], startStation, endStation) => {
  const names = normalizeStationNames(stations);
  const startIndex = names.findIndex((name) => name === startStation);
  const endIndex = names.findIndex((name) => name === endStation);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return [];
  }

  return names.slice(startIndex, endIndex).map((station, index) => `${station}-${names[startIndex + index + 1]}`);
};

const hasSegmentConflict = (requestedSegments = [], occupiedSegments = []) => {
  if (!requestedSegments || requestedSegments.length === 0) return false;
  if (!occupiedSegments || occupiedSegments.length === 0) return true;
  const occupiedSet = new Set(occupiedSegments);
  return requestedSegments.some((segment) => occupiedSet.has(segment));
};

const calculateSegmentPrice = (fullPrice, stations = [], startStation, endStation) => {
  const names = normalizeStationNames(stations);
  const startIndex = names.findIndex((name) => name === startStation);
  const endIndex = names.findIndex((name) => name === endStation);

  if (typeof fullPrice !== 'number' || Number.isNaN(fullPrice) || names.length < 2) {
    return 0;
  }

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return fullPrice;
  }

  const totalSegments = Math.max(names.length - 1, 1);
  const requestedSegmentCount = endIndex - startIndex;
  const pricePerSegment = fullPrice / totalSegments;
  return Math.round(requestedSegmentCount * pricePerSegment);
};

module.exports = {
  normalizeStationNames,
  getRouteSegments,
  getJourneySegments,
  hasSegmentConflict,
  calculateSegmentPrice
};
