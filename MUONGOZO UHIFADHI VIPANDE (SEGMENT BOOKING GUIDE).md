Your current implementation is already good structurally, but the biggest architectural issue is this:

> Your seat availability system is currently "whole-journey based", not "segment-based".

Right now:

```ts
occupiedSeats={bookedSeats}
```

means:

* if seat A1 is booked once,
* it becomes unavailable for the entire journey.

That completely ignores:

* startStation
* endStation
* route segments

which are the core of your new business logic.

---

# What Must Change

You need to move from:

```txt
Seat Occupied Globally
```

to:

```txt
Seat Occupied Per Segment
```

---

# The Correct Mental Model

Instead of storing:

```ts
seat_code: "A1"
```

You should store:

```ts
seat_code: "A1"
occupied_segments: [
  "A-B",
  "B-C"
]
```

Then:

* A→B and B→C can share seat
* B→D blocks overlapping journeys
* segment overlap determines availability

---

# THE MOST IMPORTANT IMPROVEMENT

Your current code:

```ts
const booked = availability?.seatMap
  ?.filter((seat: any) => seat.status === 'booked')
  .map((seat: any) => seat.code)
```

is fundamentally insufficient.

You need:

```ts
[
  {
    seat_code: 'A1',
    start_station: 'B',
    end_station: 'D',
    occupied_segments: ['B-C', 'C-D']
  }
]
```

---

# FULL IMPROVED AI PROMPT

Below is the MUCH BETTER prompt you should give your AI coding assistant.

---

We need to refactor and improve the transport booking system in:

figma-frontend/src/app/pages/Booking/TransportBooking.tsx

The current implementation supports:

* transport selection
* route selection
* timetable selection
* seat selection
* payment flow

We recently added:

* start station selection
* end station selection

However, seat availability and pricing are still implemented as full-route bookings instead of segment-based bookings.

We need to redesign the booking logic to support SEGMENT-BASED SEAT RESERVATION.

==================================================
BUSINESS REQUIREMENTS
=====================

A seat should ONLY be occupied for the route segments covered by the passenger booking.

Seats must remain available for non-overlapping segments.

Example route:
A → B → C → D → E

Segments:

* A-B
* B-C
* C-D
* D-E

==================================================
RULES
=====

1. Booking A→E

* seat unavailable for entire journey

2. Booking A→B

* occupies segment A-B only
* same seat should still be available for:
  B→C
  B→D
  B→E
  C→D
  C→E
  D→E

3. Booking D→E

* occupies segment D-E only
* same seat should still be available for:
  A→B
  A→C
  A→D
  B→C
  B→D
  C→D

4. Booking B→D
   Occupied:

* B-C
* C-D

Must block:

* A→C
* A→D
* A→E
* B→C
* B→D
* B→E
* C→D
* C→E

Must allow:

* A→B
* D→E

5. Multiple passengers should be able to share the same seat if segments do not overlap:

* Client1: A→B
* Client2: B→C
* Client3: C→D
* Client4: D→E

==================================================
TECHNICAL IMPROVEMENTS REQUIRED
===============================

1. Implement route segment generation

Example:
[A,B,C,D,E]
becomes:
[A-B, B-C, C-D, D-E]

Create utility functions:

* getRouteSegments()
* getJourneySegments(start,end)
* checkSegmentOverlap()

==================================================
2. IMPLEMENT SEGMENT-BASED AVAILABILITY
=======================================

Current implementation incorrectly marks seats globally unavailable:

const booked = availability?.seatMap
?.filter((seat) => seat.status === 'booked')
.map((seat) => seat.code)

This must be redesigned.

Backend/API response should include:

[
{
seat_code: "A1",
start_station: "B",
end_station: "D",
occupied_segments: ["B-C","C-D"]
}
]

Seat availability should depend on whether requested journey segments overlap existing occupied segments.

==================================================
3. ADD SEGMENT OVERLAP VALIDATION
=================================

Implement helper:

function hasSegmentConflict(
requestedSegments,
occupiedSegments
)

Returns true if any segment overlaps.

==================================================
4. FILTER AVAILABLE SEATS DYNAMICALLY
=====================================

Before rendering SeatSelector:

* calculate requested journey segments
* compare against existing bookings
* mark only conflicting seats unavailable

Example:
If seat A1 is booked B→D,
then:

* A→B should still see A1 available
* D→E should still see A1 available

==================================================
5. IMPROVE PRICE CALCULATION
============================

Current calculatePrice() is incomplete.

Implement dynamic pricing based on:

* number of traveled segments
  OR
* traveled distance

Example:
Full route A→E = full price
A→B = partial price

Formula example:

pricePerSegment =
fullRoutePrice / totalSegments

journeyPrice =
requestedSegments.length * pricePerSegment

==================================================
6. VALIDATE STATION SELECTION
=============================

Prevent:

* same start/end station
* reverse journeys
* invalid stations

Example:
D→B should not be allowed.

==================================================
7. UPDATE TICKET DATA
=====================

Booking payload must include:

* start_station
* end_station
* occupied_segments
* traveled_segment_count

==================================================
8. UPDATE UI
============

Display:

* selected stations
* traveled stops
* dynamic pricing
* occupied journey range

In seat selection:
show:
"Journey: B → D"

==================================================
9. CONCURRENCY PROTECTION
=========================

Prevent race conditions:
two users booking same seat simultaneously.

Backend should:

* validate segments inside DB transaction
* reject overlapping bookings

==================================================
10. REFACTORING REQUIREMENTS
============================

Refactor TransportBooking.tsx to:

* reduce duplicated logic
* move segment logic into utilities
* move pricing into helper functions
* improve readability
* improve type safety
* avoid repeated route station extraction

==================================================
11. SUGGESTED UTILITIES
=======================

Create:

utils/routeSegments.ts

Functions:

* extractRouteStations(route)
* getRouteSegments(stations)
* getJourneySegments(stations,start,end)
* hasSegmentConflict(a,b)
* calculateSegmentPrice()

==================================================
12. IMPORTANT
=============

Use SEGMENTS as the source of truth.

Do NOT treat seat occupancy as whole-journey occupancy anymore.

Seat conflict exists ONLY if route segments overlap.
