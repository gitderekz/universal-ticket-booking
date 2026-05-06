<!-- and mobile(flutter)


Review my instruction that i want to give AI coding assistant to develop the full project for me, check if there is any improvement to be made, any logic that is not well put, any flow that is not in good manner. and give out the most detailed,correct,easy to follow and full context output instructions to give the AI coding assistant to completely develop frontend and backend  system based on my instruction.
Below is my current instructions that needs modifications if any.. -->

----------------------------------------------------------------



I WANT TO DEVELOP THE BOOKING SYSTEM PROJECT

HERE IS THE MAIN PROJECT OVERVIEW AND INSTRUCTIONS
We are going to make a ticket booking system for [safari-cars,mini-buses,buses,trains,aeroplanes,boats,ferries,ships,movie&event-theatres,conference-halls,picnic,parks,PARKINGLOTS,restaurants-tables,hotel-rooms,rental-house,single-rooms-in-one-building,appartments,stadiums,arena(footbal,boxing,hookey,basketball,rugby,olympics,e.t.c)]
The idea is simple lets break it down..
----------------------------------------------------------------------------------------------------
A. FOR TRANSPORTS BASED, SAFARI-CARS/MINI-BUSES/BUSES/TRAINS/AEROPLANES/SHIPS e.t.c
1. The owner/staff will register into database themselves,register their companies,register their transports
2. The owner/staff of a transport company will upload/register the sitting plan belonging to every single of their transports either[safari-cars,mini-buses,buses,trains,aeroplanes,ships] and the sitting plan can be like 1-1 or 1-2 or 1-3 or 2-2 or 2-3 or 3-2 or 1-1-1 or 2-2-2 or 3-2-3 or 6-6 or e.t.c you get the point
- the dash means a space for people to pass example 3-2 means 3seats on left, then space to pass, then 2seats on the right along to the direction of travel
- Also the length should be added, it is very important to know how many rows are going to be generated from front seats to back seat, eg: if length is 3 for 1-2 sitting plan it means 1seat,space,2seats then repeat it for 3 rows like below..
[
    seatA1,space,seatA2,seatA3
    seatB1,space,seatB2,seatB3
    seatC1,space,seatC2,seatC3
]
And example for sitting plan 2-2-2 with length 2
[
    seatA1,seatA2,space,seatA3,seatA4,space,seatA5,seatA6
    seatB1,seatB2,space,seatB3,seatB4,space,seatB5,seatB6
]
- So up to here we will have tables like [users,companies,transport_types,transports,sitting_plan, ]
3. Then for each transport the staff will also upload/register routes, subroutes, stations(along the route), short-break-stations(to eat, attend toilet,e.t.c) and price for each route and stop examples,
i. route: start->Dar-es-salaam end-> Mwanza , its price:60,000
i. stations: 1.pugu, its price:10,000  2.morogoro, its price:20,000  3.Gairo(Break stop), its price:30,000  4.dodoma, its price:40,000  5.singida, its price:50,000  6.Mwanza, its price:60,000 

ii. route: start->Mwanza end-> Dar-es-salaam , its price:60,000
ii. stations: 1.Singida, its price:10,000  2.Dodoma, its price:20,000  3.Kibaigwa(Break stop), its price:30,000  4.Morogoro, its price:40,000  5.Pugu, its price:50,000  6.Dar-es-salaam, its price:60,000 
- So up to here we have another tables [routes,stations]
EXAMPLES OF SUB-ROUTES
i. route: start->Pwani end-> Mwanza , its price:50,000 (NOTE: THIS ROUTE BELONGS TO PARENT ROUTE Dar-es-salaam to Mwanza)
i. stations: 1.morogoro, its price:10,000  2.Gairo(Break stop), its price:20,000  3.dodoma, its price:30,000  4.singida, its price:40,000  5.Mwanza, its price:50,000 

ii. route: start->Pwani end-> Dodoma , its price:40,000 (NOTE: THIS ROUTE BELONGS TO PARENT ROUTE Dar-es-salaam to Mwanza)
ii. stations: 1.morogoro, its price:10,000  2.Gairo(Break stop), its price:20,000  3.dodoma, its price:30,000  


4. Then the staff will register timetables for each of their routes, example: ShipS900-Ocean-Jet will travel route-> from Tanga port to Unguja port, Monday 11 may 2026, start time 10:00am, end journey tim 02:00pm (NOTE IMPORTANT!: IN SWAHILI TIME THIS WILL BE start time [4:00 asubuhi] end journey time [8:00 mchana])
- So we have another table [timetable] that belongs to a route, and that route belongs to a transport. This way it will be easy for client to choose transport type>transport>route>stop-station>datetime then they can finish by paying and download the receipt, and wait for their journey while getting notification as journey approaches

-------------------------------------------------------------------------------------------------
B. FOR NON-TRANSPORT, THE OTHER REMAINING FACILITIES/PLACES
1. The owner/staff will register into database themselves,register their companies,register their facility of bookig like [movie&event-theatres,conference-halls,picnic,parks,parkinglots,restaurants-tables,hotel-rooms,rental-house,single-rooms-in-one-building,appartments,stadiums,arena,e.t.c]
WE CAN PUT THEM IN CATEGORY/TYPE
entertainment [movie-theatres,commedy,fashion,stadiums,e.t.c]
events [conference-halls,e.t.c]
outdoor [restaurants-tables,hotel-tables,park&picnic,parkinglots,e.t.c]
housing [hotel-rooms,rental-house,single-rooms-in-one-building,appartments,e.t.c]
sports [arenas,e.t.c]

2. SITING PLANS FOR SEATS DEPENDABLE AND NON-SEATS DEPENDABLE FACILITIES
I. SITTING PLAN FOR SEATS DEPENDABLE FACILITIES LIKE[movie&event-theatres,conference-halls,stadiums,arena,e.t.c]
i. The owner/staff of a company will upload/register the sitting plan belonging to every single of their facility and the sitting plan can be like 1-1 or 1-2 or 1-3 or 2-2 or 2-3 or 3-2 or 1-1-1 or 2-2-2 or 3-2-3 or 6-6 or e.t.c you get the point
- Also the length should be added, it is very important to know how many rows are going to be generated from front row seats to back seat

II. SITTING PLAN FOR NON-SEATS DEPENDABLE FACILITIES LIKE[picnic,parks,parkinglots,restaurants-tables,hotel-rooms,rental-house,single-rooms-in-one-building,appartments,e.t.c]
NOTE: (Here we will not be dealing with seats but rather spots like carparking spot,picnic chilling spot,appartment spot, room spot,restaurant-table spot, e.t.c
But with all that in mind we shall continue to register sitting plan as usual although type will be either[spot,table,section,room,building,appartment]  
)
i. The owner/staff of a company will upload/register the sitting plan belonging to every single of their facility and the sitting plan can be like 1-1 or 1-2 or 1-3 or 2-2 or 2-3 or 3-2 or 1-1-1 or 2-2-2 or 3-2-3 or 6-6 or e.t.c you get the point
- Also the length should be added, it is very important to know how many rows are going to be generated from front row spot to back spot

3. Then the staff will register activities [events,sessions,programmes] that will be done in their facilities like movies(Titanic) and price: 12,000,football matches(Simba vs Yanga) and price: 12,000,parties(Nyama choma party) and price: 12,000,conferences(Youth employment) and price: 12,000,vacant-house/room/appartment/parkinglot and price: 12,000,e.t.c
4. Then the staff will register timetables for each of their [events,sessions,programmes,e.t.c], example: Arena1 will host a match event-> Simba vs Yanga, Monday 11 may 2026, start time 10:00am, end time 02:00pm (NOTE IMPORTANT!: IN SWAHILI TIME THIS WILL BE start time [4:00 asubuhi] end time [8:00 mchana])
- So we have table [timetable] that belongs to a activities, and that activity belongs to a facility. This way it will be easy for client to choose facility type>facility>activity>datetime>choose seat/spot then they can finish by paying and download the receipt, and wait for their [events,sessions,programmes] while getting notification as activity approaches


-------------------------------------------------------------------------------------------------
C. CLIENT ACTIVITY FLOW
I. Client will register/login to the system and see the cool customized navs & dashboard for client only 
- Should show cool sophisticated stats cards like.. 
transport [safari-cars,mini-buses,buses,trains,ships,aeroplanes,e.t.c]
entertainment [movie-theatres,commedy,fashion,stadiums,e.t.c]
events [conference-halls,e.t.c]
outdoor [restaurants-tables,hotel-tables,park&picnic,parkinglots,e.t.c]
housing [hotel-rooms,rental-house,single-rooms-in-one-building,appartments,e.t.c]
sports [arenas,e.t.c]
- recent tickets for journey,events,outdoors, e.t.c
- popular tickets for journey,transport,events,outdoors, e.t.c

II. BOOKING PROCESS 
client will choose what to book from list of categories or some quick action in dashboard

1. FOR TRANSPORT BASED BOOKING
- if client chose transport related item they should be directed to booking loby and..
i. search/select transport type
ii. search/choose transport |OR| choose date to see list of transport for that date, then choose transport
iii. search/choose choose route, which will come with price and timetable
iv. search/choose starting station(if they don't start from the origin station)
v. search/choose stop station(end of journey if they dont finish the whole route)
IMPORTANT LOGIC BELOW
v. After selecting stop station, If the chosen starting station does not match the starting station of the route selected
Search for the sub-route/route that has the same starting station and the selected stop station is present in among it stop stations
If sub-route/route found then automatic fill the found subroute/route to the route field and replace the earlier user selected  route
IMPORTANT!: Remember subroute is just a route with parentid that is another route id

vi. Then client selects date-time from timetable belonging to that route
vii. Then client should be provided with the sitting plan of the transport [Yellow chairs & stiring wheel for driver/pilot/captain chair,red chairs for taken seats,darkblue chairs for available seats]
viii. Then the client selects the seat/multiple seats and the selected seats will be red and unable to be selected by others doing booking 
-->I think we should implement sockets here to prevent collision from multiple people holding same seat
ix. Then client fills personal details needed for journey like all names,phones,email,e.t.c
x. Client afer confirming their travel,time,sitting postision and personal details should pay for the ticket to finish booking
xi. Payment can be done through mobile money,banks and international systems i.e[airtel,vodacom,halotel,yas,nbc,nmb,crdb,visa,mastercard,e.t.c]
xii. client after finish payment should be provided with a receipt so they can print/save as pdf
xiii. this receipt details should also be saved so it can be regenerated incase it gets lost or destroyed
xiv. all the details about transport,journey,client,payment,e.t.c should be saved with precision

IF PAYMENT FOR THE SELECTED SEATS IS NOT DONE WITHIN 5MINUTES THEN THE SEATS WILL BE LET FREE UNTIL SOMEONE BOOK THEM AGAIN, AND THE USER DELAYED TO PAY WILL HAVE TO REPEAT THE SEAT PICKING PROCESS

2. BOOKING PROCESS FOR FACILITY/NON TRANSPORT BASED
- if client chose facility related item they should be directed to booking loby too and..
i. search/select facility type
ii. search/choose facility |OR| choose date to see list of facility for that date, then choose facility
iii. search/choose choose activity, which will come with price and timetable

iv. Then client selects date-time from timetable belonging to that activity
v. Then client should be provided with the sitting plan of the facility [Yellow chairs for operator,red chairs for taken seats,darkblue chairs for available seats]
vi. Then the client selects the available seat/multiple seats and the selected seats will be red and unable to be selected by others doing booking 
vii. Then client fills personal details needed for booking like all names,phones,email,e.t.c
viii. Client afer confirming their booking,time,sitting postision and personal details should pay for the ticket to finish booking
ix. Payment can be done through mobile money,banks and international systems i.e[airtel,vodacom,halotel,yas,nbc,nmb,crdb,visa,mastercard,e.t.c]
x. client after finish payment should be provided with a receipt so they can print/save as pdf
xi. this receipt details should also be saved so it can be regenerated incase it gets lost or destroyed
xii. all the details about facility,activity,client,payment,e.t.c should be saved with precision

IF PAYMENT FOR THE SELECTED SEATS IS NOT DONE WITHIN 5MINUTES THEN THE SEATS WILL BE LET FREE UNTIL SOMEONE BOOK THEM AGAIN, AND THE USER DELAYED TO PAY WILL HAVE TO REPEAT THE SEAT PICKING PROCESS

--------------------------------------------
Up to here we have a lot of tables like
[users,roles,settings,navmenus,companies,transport_types,transports,routes,stations,timetable,facilities
sitting_plan(should have seat_type [standard, wheelchair, operator, table, spot, room]),
activities(with types events,sessions,programmes) ,
journeys(every trip the transport make is another journey that belongs to that transport, and every booking should have journeyid. This will help to keep track of movements and ticket of one journey to another),
bookings, booking_seats, payments, notifications, user_sessions, cart,auditlogs,
currencies (should have exchange rate)

] 
I beleave there are forgotten tables we should implement them too, and some tables that we wont need leave them out too
-------------------------------------------
TIME OF PROJECT DEVELOPMENT
5 MAY 2026

TECHNICAL REQUIREMENTS
frontend: ReactJs
backend: NodeJs
database: mysql/mariadb
REST API
use these libraries:
Socket.io for notifications and seat selections
multer for media uploads
sequelize for database interaction

IMPLEMENT THESE FEATURES
1. Localzation english,swahili,chinese,russia,spanish,french,germany,portugese
2. Lightmode & darkmode
3. Currency setting by admin only (by default TZS) If currency is switched it should calculate equivalency of than new currency based on exchange rate parameter registered on currency table 
4. Nice dashboard with cool cards and statistics
5. Role based navigation menus/sidenav (normal user shall not see staff based menus)
6. Realtime Notifications

ROLES
DEVELOPER (can see & do everything).
super admin (platform owner).
company admin (can manage their company, transports, staff, transports/routes/activities).
staff (can manage specific transports/routes/activities assigned by company_admin).
customer (can only book and view the user related pages like tickets,booking,dashboard,e.t.c).

ADDITIONAL INFO
+-----------+------------+-------------------+
| 24H Time  | 12H Time   | Swahili Time      |
+-----------+------------+-------------------+
| 00:00     | 12:00 AM   | 6:00 usiku        |
| 01:00     | 1:00 AM    | 7:00 usiku        |
| 02:00     | 2:00 AM    | 8:00 usiku        |
| 03:00     | 3:00 AM    | 9:00 usiku        |
| 04:00     | 4:00 AM    | 10:00 alfajiri    |
| 05:00     | 5:00 AM    | 11:00 alfajiri    |
| 06:00     | 6:00 AM    | 12:00 asubuhi     |
| 07:00     | 7:00 AM    | 1:00 asubuhi      |
| 08:00     | 8:00 AM    | 2:00 asubuhi      |
| 09:00     | 9:00 AM    | 3:00 asubuhi      |
| 10:00     | 10:00 AM   | 4:00 asubuhi      |
| 11:00     | 11:00 AM   | 5:00 asubuhi      |
| 12:00     | 12:00 PM   | 6:00 mchana       |
| 13:00     | 1:00 PM    | 7:00 mchana       |
| 14:00     | 2:00 PM    | 8:00 mchana       |
| 15:00     | 3:00 PM    | 9:00 mchana       |
| 16:00     | 4:00 PM    | 10:00 jioni       |
| 17:00     | 5:00 PM    | 11:00 jioni       |
| 18:00     | 6:00 PM    | 12:00 jioni       |
| 19:00     | 7:00 PM    | 1:00 usiku        |
| 20:00     | 8:00 PM    | 2:00 usiku        |
| 21:00     | 9:00 PM    | 3:00 usiku        |
| 22:00     | 10:00 PM   | 4:00 usiku        |
| 23:00     | 11:00 PM   | 5:00 usiku        |
+-----------+------------+-------------------+