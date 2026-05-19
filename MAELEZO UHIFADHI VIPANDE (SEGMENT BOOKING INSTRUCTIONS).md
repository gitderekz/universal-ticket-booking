We have implemented station selection where passengers can choose:

starting station
ending station

within a route journey.

Now we want to improve the booking system with:

Dynamic pricing based on traveled distance/stops
Segment-based seat availability
Tickets displaying selected start/end stations
BUSINESS RULE

A seat should only be considered occupied for the route segments covered by the passenger booking.

A seat can be reused by another passenger if their selected journey does NOT overlap with already occupied segments.

ROUTE EXAMPLE

Route:
A → B → C → D → E

Segments:

A-B
B-C
C-D
D-E
BOOKING RULES
Case 1

If a passenger books A → E:

the seat is occupied for the entire journey
no other passenger can use that seat
Case 2

If passenger books A → B:
Occupied segment:

A-B

Seat should still be available for:

B→C
B→D
B→E
C→D
C→E
D→E
Case 3

If passenger books D → E:
Occupied segment:

D-E

Seat should still be available for:

A→B
A→C
A→D
B→C
B→D
C→D
Case 4

If passenger books B → D:
Occupied segments:

B-C
C-D

Seat must NOT be available for:

A→C
A→D
A→E
B→C
B→D
B→E
C→D
C→E

Seat should ONLY remain available for:

A→B
D→E
Case 5

Multiple passengers should be able to use the same seat in one route if their occupied segments do not overlap.

Example:

Client1: A→B
Client2: B→C
Client3: C→D
Client4: D→E

All four bookings can use the same seat.

IMPLEMENTATION REQUIREMENTS

Please implement:

Seat availability validation using route segments
Conflict detection between bookings
Dynamic fare calculation based on:
number of stops OR
traveled distance
Ticket details showing:
route
start station
end station
occupied segments
Database structure optimized for segment-based bookings

---------------------------------------------------------
Important Edge Cases:

1. Adjacent stations are NOT overlapping

A→B and B→C are valid together.

Because:

first booking ends at B
second starts at B

No segment overlap.

2. Invalid journeys

Prevent:

same start/end station
reverse direction (D→B)
nonexistent stations
3. Concurrency

Two users booking same seat simultaneously must not bypass validation.

You likely need:

DB transactions
row locking
optimistic locking
4. Seat holding timeout

If payment not completed:

reserve temporarily
auto-release after X minutes