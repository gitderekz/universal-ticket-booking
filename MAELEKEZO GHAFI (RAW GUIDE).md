
DEMANDS:
[Partial-route seat allocation
Segment occupancy validation
Dynamic pricing by traveled distance/stops
Seat reuse optimization]

IMPROVEMENT SUGGESTION:
Now that we have implemented stations selections where client can start or end journey between the main route, we should calculate price based on the stops.. what do you think..?
The ticket should also reflect the start&end stations selected

CASE STUDIES OVERVIEW:
1. If the client end station is before the route completes, then that seat should be available to other client that will book and choose their starting station as the end station(or next stations ) of the earlier booked customer of that seat in that journey

2. If the client start station is long after the route starts, then that seat should be available to other client that will book and choose their end station as the start station(or prior stations ) of the earlier booked customer of that seat in that journey

CASE STUDIES MORE DETAILS:
1. If route has stations A->B->C->D->E (A being the start station and E being the end station of journey)
2. If client book from A->E  then the seat should never be available 
3. If client1 book from A->B then the seat should be available to customers that their start station is either [B,C or D]
4. If client1 book from D->E then the seat should be available to cients that their end stations is [A,B,C or D]
5. If clientt1 book from B->D then no one should be able to book from A->E,A->C,A->D, B->E,B->D,B->C, C->D,C->E, But the seat should only be available to customer that book from A->B and D->E  
6. Four clients at the same time should be able to book the same seat in this scenario: 
Client1 can book from A->B, client2 can book from B->C, client3 can book from C->D, client4 can book from D->E
