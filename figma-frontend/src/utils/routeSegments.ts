export type RouteStation = string | { name?: string } | { station?: any } | any;

export const normalizeStationNames = (stations: RouteStation[] = []): string[] => {
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

export const getRouteSegments = (stations: RouteStation[] = []): string[] => {
  const names = normalizeStationNames(stations);
  if (names.length < 2) return [];
  return names.slice(0, -1).map((station, index) => `${station}-${names[index + 1]}`);
};

export const getJourneySegments = (
  stations: RouteStation[] = [],
  startStation: string,
  endStation: string
): string[] => {
  const names = normalizeStationNames(stations);
  const startIndex = names.findIndex((name) => name === startStation);
  const endIndex = names.findIndex((name) => name === endStation);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return [];
  }

  return names.slice(startIndex, endIndex).map((station, index) => `${station}-${names[startIndex + index + 1]}`);
};

export const hasSegmentConflict = (requestedSegments: string[], occupiedSegments: string[]): boolean => {
  if (!requestedSegments || requestedSegments.length === 0) return false;
  if (!occupiedSegments || occupiedSegments.length === 0) return true;
  const occupiedSet = new Set(occupiedSegments);
  return requestedSegments.some((segment) => occupiedSet.has(segment));
};

export const calculateSegmentPrice = (
  fullPrice: number | string,
  stations: RouteStation[] = [],
  startStation: string,
  endStation: string
): number => {
  const priceValue = Number(fullPrice);
  const names = normalizeStationNames(stations);
  const startIndex = names.findIndex((name) => name === startStation);
  const endIndex = names.findIndex((name) => name === endStation);

  if (!Number.isFinite(priceValue) || names.length < 2) {
    return 0;
  }

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return priceValue;
  }

  const totalSegments = Math.max(names.length - 1, 1);
  const requestedSegmentCount = endIndex - startIndex;
  const pricePerSegment = priceValue / totalSegments;
  return Math.round(requestedSegmentCount * pricePerSegment);
};
