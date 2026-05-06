# STAFF WORKFLOW ARCHITECTURE - COMPLETE SYSTEM FLOW

## From Registration to Logout - Enumerated List Summary

### PART ONE: ACCOUNT CREATION AND ONBOARDING

**1.0 Initial Registration Process**

1.1 The staff member navigates to the platform homepage and clicks the Register button located in the top right corner of the navigation bar.

1.2 The system displays a registration form with two distinct sections: personal information and account credentials.

1.3 In the personal information section, the staff member enters their full legal first name, full legal last name, a valid email address that has not been previously registered, a mobile phone number including the country code, and optionally uploads a profile photograph.

1.4 In the account credentials section, the staff member creates a username that must be unique across the platform, enters a password that meets the security requirements of at least eight characters with one uppercase letter, one lowercase letter, one number, and one special character, then confirms the password by typing it again exactly.

1.5 The staff member selects their account type from a dropdown menu containing all available roles, and for this workflow they must select Staff as their role.

1.6 Below the role selection, a note appears explaining that staff members must be associated with a company either by creating a new company or being added by an existing company admin.

1.7 The staff member checks two checkbox agreements confirming they accept the terms of service and privacy policy.

1.8 After completing all fields, the staff member clicks the Submit Registration button.

1.9 The system validates all input fields, ensuring email format is correct, phone number has the proper number of digits, password meets complexity requirements, and the email is not already in use by another account.

1.10 Upon successful validation, the system hashes the password using bcrypt with twelve salt rounds and creates a new user record in the users table with status set to pending email verification.

1.11 The system generates a unique email verification token and sends a verification link to the provided email address.

1.12 The staff member receives the email and clicks the verification link, which sets email verified timestamp in their user record and changes account status to active.

1.13 The system redirects the staff member to the login page with a success message indicating their account is now active and they can log in.

**1.1 First Login Attempt**

1.14 The staff member navigates to the login page and enters their email address and password.

1.15 The system validates the credentials against the users table, checking that the email exists, the account status is active, and the password hash matches.

1.16 Upon successful authentication, the system generates a JSON Web Token access token that expires in fifteen minutes and a refresh token that expires in seven days.

1.17 The system stores the refresh token hash in the user sessions table along with the device information, IP address, and expiration timestamp.

1.18 The access token is returned to the frontend and stored in memory, while the refresh token is set as an HTTP-only cookie.

1.19 The staff member is redirected to their dashboard which currently shows a notification that they are not yet associated with any company.

**1.2 Company Creation or Association**

1.20 The staff member has two options displayed prominently on their dashboard: Create New Company or Join Existing Company.

1.21 If the staff member chooses to create a new company, they click the Create New Company button.

1.22 The system displays the company registration form with sections for basic information, contact details, documentation, and payout information.

1.23 In the basic information section, the staff member enters the company legal name, a unique slug for URLs derived from the company name, a description of the company services, selects a category from the dropdown options of transport, entertainment, events, outdoor, housing, or sports, and uploads a company logo image.

1.24 In the contact details section, the staff member enters the physical address including street, city, and country, inputs the geographical coordinates if known, provides a contact email that will be publicly displayed, and lists a contact phone number.

1.25 In the documentation section, the staff member uploads verification documents including business registration certificate, tax identification number certificate, and any industry-specific licenses.

1.26 In the payout information section, the staff member provides bank account details including bank name, account holder name, account number, and routing number for receiving commission payments.

1.27 The staff member reviews all entered information and clicks the Submit Company Registration button.

1.28 The system creates a new company record in the companies table with status set to pending, creates a company_staff record linking the staff member to the company with role set to admin since they are the founder, and creates an audit log entry for the company creation action.

1.29 A notification is automatically sent to all super admin users indicating a new company requires approval.

1.30 The staff member sees a pending approval message on their dashboard, explaining that they can begin setting up transports and facilities but cannot publish them until the company is approved by platform administrators.

1.31 If the staff member instead chooses to join an existing company, they click the Join Existing Company button and enter a company invitation code provided to them by the company admin.

1.32 The system validates the invitation code against pending invitations in the company staff invitations table, and upon successful validation, creates a company staff record linking the staff member to that company with the role specified in the invitation.

1.33 The staff member is now associated with the company and their dashboard updates to show company management options.

**1.3 Company Approval Process**

1.34 While waiting for approval, the staff member can still access all transport and facility setup features but with a draft mode indicator on all resources.

1.35 A super admin receives the pending company notification and navigates to the admin panel companies pending approval section.

1.36 The super admin reviews all company details, verifies the uploaded documentation, checks the company category appropriateness, and either approves or rejects the application with a comment.

1.37 Upon approval, the system updates the company status to active and sends a notification to the staff member informing them that their company is now live on the platform.

1.38 The staff member dashboard updates to remove all draft mode warnings, and they can now publish their transports, facilities, routes, and timetables for customer booking.

---

### PART TWO: TRANSPORT AND FACILITY SETUP

**2.0 Transport Registration Workflow**

2.1 After company approval, the staff member navigates to the Company Management section and selects Transports from the sidebar menu.

2.2 The system displays the transports list page showing all existing transports for the company with their status, type, registration number, and options to edit, duplicate, or delete each transport.

2.3 The staff member clicks the Add New Transport button to begin creating a new transport.

2.4 The system displays the transport creation form organized into three sections: basic information, specifications, and features.

2.5 In the basic information section, the staff member selects a transport type from the dropdown populated from the transport types table, which includes options like Safari Car, Mini Bus, Bus, Train, Aeroplane, Boat, Ferry, or Ship.

2.6 The staff member enters a display name for the transport, a unique registration number that serves as the official identification, and a description highlighting special characteristics of this vehicle.

2.7 In the specifications section, the staff member enters the total passenger capacity as a number, uploads multiple photographs showing the interior and exterior of the transport, and selects the status from options of active, maintenance, or retired.

2.8 In the features section, the staff member checks boxes for available amenities including air conditioning, WiFi, restroom, entertainment system, power outlets, snacks service, and wheelchair accessibility.

2.9 The staff member clicks the Save Transport button, and the system creates a new record in the transports table linked to their company, with status set to draft pending completion of all required setups.

2.10 The system automatically creates an audit log entry for the transport creation action and redirects the staff member to the transport detail page where they can now set up the seating plan.

**2.1 Seating Plan Registration for Transports**

2.11 On the transport detail page, the staff member clicks the Configure Seating Plan button.

2.12 The system checks whether a seating plan already exists for this transport. If not, it displays the seating plan configuration form.

2.13 The staff member enters the total number of rows that will be generated from the front of the vehicle to the back. For a standard bus, this might be twelve rows. For a minibus, it might be six rows.

2.14 The staff member selects or enters the seat pattern format. The pattern uses hyphens to separate seat blocks, where each number indicates how many seats are in that block, and each hyphen represents an aisle or walking space between blocks.

2.15 Examples of patterns include one dash two meaning one seat on the left side, an aisle in the middle, and two seats on the right side. Two dash two dash two means two seats on left, an aisle, two seats in middle, an aisle, two seats on right. Three dash two dash three means three seats on left, an aisle, two seats in middle, an aisle, three seats on right.

2.16 For each block in the pattern, the staff member can optionally specify if that block contains any special seats like wheelchair positions or if the front row block one should have the driver seat.

2.17 The staff member previews the generated seating layout in real time as they adjust the rows and pattern.

2.18 The preview shows a grid representation with row labels starting from A at the front, seat codes combining row letters and seat numbers, correct aisle spacing according to the pattern, and color coding for different seat types.

2.19 If satisfied, the staff member clicks the Save Seating Plan button.

2.20 The system calls the seat generation algorithm that takes the pattern string and row count as inputs, generates each seat with its unique code, determines seat type based on position, and creates a seat layout record in the seat layouts table, then generates individual seat records in the seats table for each seat position.

2.21 The system updates the transport status from draft to active setup, indicating the seating plan is ready but routes still need to be configured.

2.22 The staff member is redirected back to the transport list, where they can now see the seating plan status as configured.

**2.2 Facility Registration Workflow**

2.23 From the sidebar menu, the staff member selects Facilities to manage their facility portfolio.

2.24 The system displays the facilities list page showing all existing facilities for the company with their type, status, and options to edit or delete.

2.25 The staff member clicks the Add New Facility button.

2.26 The system displays the facility creation form organized into basic information, location, amenities, and scheduling sections.

2.27 In the basic information section, the staff member selects a facility type from the dropdown populated from the facility types table, which includes options like Movie Theatre, Conference Hall, Stadium, Arena, Restaurant Table, Parking Lot, Picnic Park, Hotel Room, or Apartment.

2.28 The staff member enters the facility name, a detailed description of what this facility offers, and selects the layout type from seats, units, mixed, or none based on the facility type.

2.29 In the location section, the staff member enters the physical address including street, building number, city, country, and optionally the geographical coordinates for map display.

2.30 The staff member inputs the total capacity of the facility, uploads multiple photographs showing the facility interior and exterior, and selects the status from active, maintenance, or closed.

2.31 In the amenities section, the staff member checks boxes for available amenities including parking, restrooms, WiFi, food service, accessibility features, air conditioning, and security.

2.32 In the scheduling section, the staff member sets default operating hours for different days of the week.

2.33 The staff member clicks the Save Facility button, and the system creates a new record in the facilities table linked to their company.

2.34 The system redirects to the facility detail page where the staff member can now configure the seating or unit plan based on the layout type.

**2.3 Seating or Unit Plan Registration for Facilities**

2.35 On the facility detail page, the staff member clicks the Configure Layout button.

2.36 If the facility has layout type of seats, the system displays the same seating plan configuration form as transports, with rows and pattern inputs, and the preview shows a traditional seat grid.

2.37 For a movie theatre or stadium, the staff member enters rows count as fifteen and pattern as six dash six meaning six seats, aisle, six seats per row.

2.38 If the facility has layout type of units for options like hotel rooms or parking spots, the system displays a different configuration form.

2.39 For unit layout, the staff member enters the number of units as twenty for parking spots or ten for hotel rooms, selects the unit naming convention from numeric, alphanumeric, or custom, and specifies the starting number such as one hundred one for hotel rooms starting from room one hundred one.

2.40 The staff member can optionally group units into sections like VIP section or Standard section, and assign different pricing or attributes to each section.

2.41 The staff member previews the generated unit layout showing how rooms or parking spots will appear to customers during booking.

2.42 The staff member clicks the Save Layout button, and the system generates seat layout records and individual seat or unit records with unit type appropriate for the facility type.

2.43 For restaurant tables, the system allows the staff member to designate some tables as smoking or non-smoking, indoor or outdoor, and specify table capacity in terms of number of people.

2.44 For parking lots, the system allows designation of electric vehicle charging spots, handicap accessible spots, and covered versus uncovered parking.

2.45 For hotel rooms, the system allows specification of room types like single, double, suite, bed sizes, view types, and additional amenities per room.

2.46 The facility status updates to active, indicating it is ready for activities and timetables to be configured.

---

### PART THREE: ROUTES, PRICES, AND SUB-ROUTES

**3.0 Station Registration Workflow**

3.1 Before creating routes, the staff member must register stations. From the sidebar, they select Stations under the Transport section.

3.2 The system displays the stations list page showing all existing stations for the company with their name, city, type, and options to edit or delete.

3.3 The staff member clicks the Add New Station button.

3.4 The system displays the station creation form with fields for station name, a unique code for internal reference, description of the station facilities, physical address, city, country, and geographical coordinates.

3.5 The staff member selects the station type from origin, destination, intermediate, or terminal based on how this station will be used in routes.

3.6 In the facilities section, the staff member checks boxes for available amenities at this station including waiting area, restrooms, food court, parking, ticket counter, baggage storage, and accessibility features.

3.7 The staff member uploads a photograph of the station if available for display to customers.

3.8 The staff member clicks the Save Station button, and the system creates a new record in the stations table linked to their company.

3.9 The staff member repeats this process to create all stations along their typical routes. For a route from Dar es Salaam to Mwanza, they would create stations including Pugu, Morogoro, Gairo, Dodoma, Singida, and Mwanza.

**3.1 Route Registration Workflow**

3.10 From the sidebar, the staff member selects Routes under the Transport section.

3.11 The system displays the routes list page showing all existing routes for the company with their origin, destination, price, status, and options to edit or delete.

3.12 The staff member clicks the Add New Route button.

3.13 The system displays the route creation form with sections for basic information, stations sequence, and pricing.

3.14 In the basic information section, the staff member enters a route name like Dar es Salaam to Mwanza Express, selects optional transport association if this route is specific to a particular vehicle, and enters a description.

3.15 The staff member selects the origin station from the list of stations they previously created and the destination station from the list.

3.16 In the stations sequence section, the staff member builds the ordered list of stations along the route. They first select a station from the dropdown, then click Add to Route, and the station appears in a sortable list.

3.17 The staff member arranges the stations in correct travel order by dragging them up or down. For Dar es Salaam to Mwanza, the sequence is Pugu first after origin, then Morogoro, then Gairo as a break stop, then Dodoma, then Singida, then destination Mwanza.

3.18 For each station added to the route, the staff member enters the distance from origin in kilometers and the cumulative price from origin. For example, Pugu might be twenty kilometers with price five thousand, Morogoro two hundred kilometers with price fifteen thousand, Gairo three hundred kilometers with price twenty two thousand, Dodoma four hundred fifty kilometers with price thirty five thousand, Singida six hundred kilometers with price forty five thousand, and Mwanza nine hundred kilometers with price sixty thousand.

3.19 The staff member can mark any station as a break stop by checking the Is Break Stop checkbox, which indicates passengers can disembark for meals or restrooms. For break stops, the staff member also enters the expected stop duration in minutes.

3.20 In the pricing section, the staff member enters the base price for the full route from origin to destination, which should match the cumulative price of the destination station. For Dar es Salaam to Mwanza, the base price is sixty thousand.

3.21 The staff member can optionally set dynamic pricing rules for different times or seasons, such as higher prices during holidays or lower prices for off-peak hours.

3.22 The staff member clicks the Save Route button, and the system creates a new record in the routes table, then creates individual route station records for each station in the sequence with their distances and cumulative prices.

3.23 The system calculates this route as a parent route since no parent route identifier is specified, and sets is sub route to false.

**3.2 Sub-route Registration Workflow**

3.24 After creating the parent route, the staff member may want to create sub-routes for passengers who want to start or end at intermediate stations rather than the origin or destination.

3.25 On the route detail page for the parent route, the staff member clicks the Create Sub-route button.

3.26 The system displays the sub-route creation form, which is similar to the route form but with additional constraints.

3.27 The staff member selects the origin station for the sub-route, which must be one of the intermediate stations from the parent route, not the original origin. For example, they might select Pwani which is an alternative boarding point between Dar es Salaam and Morogoro.

3.28 The staff member selects the destination station for the sub-route, which must be either the original destination or another intermediate station further along the route.

3.29 The system automatically calculates the distance and price based on the parent route station data, subtracting the origin cumulative price from the destination cumulative price.

3.30 The staff member can adjust the sub-route price if they want to offer a discount or charge differently from the calculated partial price.

3.31 The staff member adds stations to the sub-route sequence, but these stations must be a subset of the parent route stations starting from the selected origin and ending at the selected destination.

3.32 The staff member clicks the Save Sub-route button, and the system creates a new route record with is sub route set to true, parent route identifier pointing to the parent route, and origin station set to the selected intermediate station.

3.33 The system automatically creates the route station records for the sub-route based on the parent route station data, copying the distances and prices adjusted to make the origin price zero.

3.34 The staff member can create multiple sub-routes from the same parent route to accommodate various passenger needs, such as Pwani to Mwanza, Pwani to Dodoma, Morogoro to Singida, or Dodoma to Mwanza.

**3.3 Route Activation and Management**

3.35 After creating routes and sub-routes, the staff member returns to the route list where all routes are initially in draft status.

3.36 The staff member can edit any route to adjust prices, add or remove stations, or change the sequence.

3.37 When the staff member is satisfied with the route configuration, they change the route status from draft to active.

3.38 The system validates that the route has at least origin and destination stations, that all cumulative prices are in ascending order, and that distances are positive.

3.39 Upon activation, the route becomes available for timetable creation and customer booking.

3.40 The staff member can also create seasonally adjusted copies of routes, such as a holiday pricing version with higher prices that is only active during December.

---

### PART FOUR: TIMETABLES AND JOURNEY GENERATION

**4.0 Timetable Registration Workflow**

4.1 After routes and transports are configured, the staff member selects Timetables from the sidebar under the Transport section.

4.2 The system displays the timetables list page showing all existing timetables for the company with route, transport, frequency, and status information.

4.3 The staff member clicks the Add New Timetable button.

4.4 The system displays the timetable creation form with sections for route selection, time configuration, frequency pattern, and validity period.

4.5 In the route selection section, the staff member selects a route from the list of active routes for their company, and then selects a transport from the list of active transports assigned to that route.

4.6 The system displays the transport capacity and the route distance to assist in planning.

4.7 In the time configuration section, the staff member sets the departure time using a time picker that supports both standard and Swahili time display options.

4.8 The staff member sets the arrival time, which the system can auto-calculate based on route distance and average speed if they enable the estimate feature.

4.9 In the frequency pattern section, the staff member selects the frequency type from once, daily, weekly, or custom.

4.10 If they select once, the timetable only applies to a single specific date which they select from a calendar.

4.11 If they select daily, the timetable applies to every day within the validity period.

4.12 If they select weekly, the staff member checks boxes for which days of the week the service operates, such as Monday, Wednesday, and Friday only.

4.13 If they select custom, the staff member can define complex patterns like every first Monday of the month or every weekday except public holidays.

4.14 In the validity period section, the staff member selects an effective from date when this timetable starts being valid, and an effective until date when it stops being valid.

4.15 The staff member can optionally set a price multiplier for this specific timetable, such as one point two five for peak hour services or zero point eight for off-peak promotions.

4.16 The staff member clicks the Save Timetable button, and the system creates a new record in the timetables table with status set to active.

4.17 The system then triggers an immediate journey generation for this timetable, creating journey instances for the remaining days within the validity period up to thirty days in the future.

**4.1 Journey Generation Automation**

4.18 Every day at one in the morning, a system cron job runs the journey generator service.

4.19 The journey generator queries all active timetables where the effective until date is greater than or equal to the current date or null, and where the effective from date is less than or equal to the date thirty days from now.

4.20 For each timetable, the generator determines which dates within the next thirty days match the frequency pattern.

4.21 For a daily timetable, every date qualifies. For a weekly timetable, only dates where the day of week matches the selected days qualify.

4.22 For each qualifying date, the generator creates a journey instance with journey date set to that date, departure time combining the date with the timetable departure time, arrival time combining the date with the timetable arrival time, and status set to scheduled.

4.23 The generator calculates the available seats count as the transport capacity minus any preexisting bookings, and initializes booked and held counts to zero.

4.24 If a journey instance already exists for that timetable and date due to a previous generation run, the generator skips creation to avoid duplicates.

4.25 The generator also creates activity instances for facility schedules using the same logic.

4.26 The staff member can manually trigger journey generation from the timetable management page if they need to generate journeys immediately after creating a new timetable.

**4.2 Journey Management**

4.27 From the sidebar, the staff member can select Journeys to view all generated journey instances.

4.28 The system displays the journeys list page with filters for date range, route, transport, and status.

4.29 For each journey, the staff member can see the journey date, departure and arrival times, total seats, available seats, booked seats, held seats, and current status.

4.30 The staff member can manually update a journey status from scheduled to boarding when they start allowing check-in, to departed when the vehicle leaves, to delayed if there is a delay with the delay minutes field, to cancelled if the journey is not operating, or to completed after arrival.

4.31 If a journey is cancelled, the system automatically sends notifications to all booked passengers, processes refunds if applicable, and releases all held seats.

4.32 If a journey is delayed, the system sends notifications to all passengers with the new expected departure time.

4.33 The staff member can also view a journey seat map showing exactly which seats are booked in red, held in gray, and available in blue for customer service purposes.

**4.3 Facility Schedule and Activity Registration**

4.34 For facilities, the staff member selects Activities from the sidebar under the Facility section.

4.35 The system displays the activities list page showing all existing activities for the facility with their type, price, and status.

4.36 The staff member clicks the Add New Activity button.

4.37 The system displays the activity creation form with fields for activity name, description, activity type from event, session, programme, rental, or showing, category like movie or conference, base price, duration in minutes, images, age restriction if any, and terms and conditions.

4.38 The staff member selects which facility this activity belongs to from the list of their active facilities.

4.39 After saving the activity, the staff member clicks the Add Schedule button on the activity detail page.

4.40 The system displays the schedule form similar to the timetable form, with start time, end time, frequency pattern, and validity period.

4.41 The staff member sets the schedule start time, end time, and frequency just like transport timetables.

4.42 The system automatically generates activity instances for dates matching the schedule pattern.

4.43 For a movie theatre showing the same movie multiple times per day, the staff member creates separate schedules for each showing time.

4.44 For a hotel room, the activity is a rental with daily schedules, and each room unit is available for booking on specific dates.

4.45 The staff member can set different prices for different showing times, such as higher prices for evening shows and lower prices for matinees.

---

### PART FIVE: BOOKING AND PAYMENT OVERSIGHT

**5.0 Staff View of Customer Bookings**

5.1 From the sidebar, the staff member selects Bookings under the Company section to view all bookings made by customers for their company.

5.2 The system displays the bookings list page with columns for booking code, customer name, booking type, journey or activity details, total amount, status, booking date, and action buttons.

5.3 The staff member can filter bookings by date range, status, route, or transport to find specific bookings.

5.4 The staff member can click on any booking to view the full booking details including passenger information, seat assignments, payment status, and ticket information.

5.5 For transport bookings, the detail page shows the journey details, selected seats with a mini seat map highlighting the booked seats, passenger details per seat, contact information, and payment summary.

5.6 For facility bookings, the detail page shows the activity details, selected units or seats, and similar passenger and payment information.

5.7 The staff member can view and regenerate booking receipts if the customer lost their original copy.

5.8 The staff member can resend booking confirmation emails to customers if needed.

**5.1 Booking Cancellation and Refund Processing**

5.9 From the booking detail page, the staff member can initiate a cancellation if the customer requests it.

5.10 The system displays the cancellation form asking for cancellation reason and whether the customer should receive a full or partial refund.

5.11 The staff member selects the cancellation reason from a dropdown or enters custom text.

5.12 Based on the company cancellation policy configured in settings, the system auto-calculates the refund amount, such as full refund if cancelled more than twenty four hours before departure, fifty percent refund if cancelled twelve to twenty four hours before, or no refund if cancelled less than twelve hours before.

5.13 The staff member can override the calculated refund amount with manager approval for special circumstances.

5.14 Upon confirming cancellation, the system updates the booking status to cancelled, releases the seats back to available for that journey, creates a refund request record if money is owed, and initiates the refund payment through the original payment method.

5.15 The system sends cancellation confirmation and refund notification to the customer via email and in-app notification.

5.16 The staff member can view all refund requests and their status from the Refunds page.

**5.2 Check-in and Ticket Validation**

5.17 On the day of the journey or activity, the staff member uses the Check-in page to validate customer tickets.

5.18 The staff member can either scan a customer QR code using a connected barcode scanner or manually enter the ticket code.

5.19 The system displays the booking details associated with the ticket code, showing the customer name, seat assignments, and journey details.

5.20 The staff member verifies that the booking status is confirmed and the ticket status is active.

5.21 The staff member confirms that the current time is within the check-in window for the journey, which is typically one hour before departure until departure time.

5.22 The staff member clicks the Validate Ticket button, and the system updates the ticket status to used, records the validation timestamp, and records the staff member identifier as the validator.

5.23 For group bookings with multiple passengers, the staff member can validate all tickets at once or validate individually as each passenger arrives.

5.24 The system prevents double validation by checking that the ticket has not been previously validated.

5.25 If a customer shows up after the journey has departed, the staff member can mark them as no show, which may affect their ability to get refunds.

5.26 The staff member can also view the manifest of all passengers expected for a journey, showing which passengers have checked in and which are still pending.

---

### PART SIX: REPORTS AND ANALYTICS

**6.0 Revenue and Booking Reports**

6.1 From the sidebar, the staff member selects Reports under the Company section.

6.2 The system displays the reports dashboard with available report types including Revenue Report, Booking Report, Occupancy Report, and Route Performance Report.

6.3 For the Revenue Report, the staff member selects a date range such as current month, last month, or custom range.

6.4 The system generates a report showing total revenue by day within the range, broken down by booking type of transport versus facility, and further broken down by individual route or activity.

6.5 The report includes charts showing revenue trends over time, peak revenue days, and comparison to previous period.

6.6 The staff member can export the report as PDF or CSV for accounting purposes.

6.7 For the Booking Report, the staff member selects a date range, and the system shows total bookings count, average booking value, popular booking times, and booking source distribution of web versus mobile.

6.8 The report includes cancellation rate percentage and most common cancellation reasons.

**6.1 Occupancy and Utilization Reports**

6.9 For transport companies, the staff member generates the Occupancy Report to see how full their vehicles are on average.

6.10 The system calculates average seat occupancy percentage for each route, each transport, and each day of week.

6.11 The report shows which journeys have consistently low occupancy, helping the staff member decide whether to adjust pricing or discontinue certain times.

6.12 The staff member can see seat utilization by specific seats, identifying if certain seats like wheelchair spots or front row seats are more or less popular.

6.13 For facility companies, the staff member generates the Utilization Report showing what percentage of rooms, tables, or spots are booked over time.

6.14 The report shows peak utilization days and times, helping optimize staffing and pricing.

6.15 For hotel rooms, the report shows average length of stay and occupancy by room type.

**6.2 Route and Activity Performance**

6.16 The staff member generates the Route Performance Report to analyze profitability of each route.

6.17 The system calculates total revenue per route, average ticket price, number of trips operated, and revenue per kilometer.

6.18 The report highlights the most profitable routes and routes that may need adjustment.

6.19 The staff member can compare performance of parent routes versus sub-routes to see if creating sub-routes increased overall ridership.

6.20 For activities, the report shows attendance rates, popular showing times, and revenue per activity.

6.21 The staff member uses this data to decide which movies to extend or which conference topics to offer again.

**6.3 Staff Performance Reports**

6.22 For company admins supervising multiple staff members, the system provides staff performance reports.

6.23 The report shows which staff member created which routes, timetables, or activities, and how those resources are performing.

6.24 The report includes audit log summaries showing staff activity volume and types of actions taken.

6.25 The company admin can identify high-performing staff members for recognition and staff members who may need additional training.

---

### PART SEVEN: NOTIFICATIONS AND COMMUNICATIONS

**7.0 System Notifications for Staff**

7.1 The staff member receives real-time notifications through the notification bell icon in the navigation bar.

7.2 Notifications include alerts for new bookings, booking cancellations that require attention, payment failures that need resolution, journey status changes like delays or cancellations they need to communicate to customers, and low seat availability warnings for popular journeys.

7.3 When a new booking is made, the staff member receives a notification with the booking code and customer name, and can click to view the booking details directly.

7.4 When a journey is less than twenty-four hours away and still has many empty seats, the system sends a notification suggesting the staff member consider promotional pricing to fill seats.

7.5 The staff member can mark notifications as read individually or mark all as read.

7.6 Notification preferences can be configured to receive email digests for non-urgent notifications and real-time in-app notifications for urgent matters.

**7.1 Customer Communication Tools**

7.7 From the booking detail page, the staff member can send direct messages to the customer.

7.8 The communication form allows sending email, SMS, or in-app notification to the customer.

7.9 The staff member can select from pre-written templates for common situations like departure gate changes, delay notifications, or cancellation information.

7.10 For journey-wide announcements, the staff member can send bulk messages to all customers booked on a specific journey.

7.11 The system respects customer notification preferences and will not send SMS to customers who opted out of SMS communications.

7.12 All communications are logged in the booking audit trail for customer service reference.

---

### PART EIGHT: PROFILE AND SETTINGS MANAGEMENT

**8.0 Staff Profile Management**

8.1 The staff member clicks on their avatar in the top right corner and selects Profile from the dropdown menu.

8.2 The system displays the profile page with sections for personal information, account security, notification preferences, and language settings.

8.3 In the personal information section, the staff member can update their first name, last name, email address, phone number, and upload a new profile photo.

8.4 Any change to email address requires reverification by clicking a link sent to the new email address.

8.5 In the account security section, the staff member can change their password by entering the current password, new password with confirmation, and clicking Update Password.

8.6 The staff member can enable two-factor authentication, which requires linking to an authenticator app by scanning a QR code and entering a verification code.

8.7 In the notification preferences section, the staff member can choose which types of notifications they receive and through which channels of email, in-app, or SMS.

8.8 In the language settings section, the staff member selects their preferred language from the eight available options, and the entire interface switches to that language immediately.

8.9 The staff member can also select their preferred time zone and date format.

**8.1 Company Settings Management**

8.10 For company admins, the Settings page under Company section allows management of company-wide configurations.

8.11 The staff member can update company basic information like name, description, logo, and contact details.

8.12 The staff member can configure cancellation policies including how many hours before departure full refund is available, partial refund windows, and no-refund cutoff times.

8.13 The staff member can set default pricing rules like weekend surcharge percentages or holiday multipliers.

8.14 The staff member can manage payout settings including bank account details for receiving platform payouts.

8.15 The staff member can view the company API keys for integrating third-party systems with the platform.

8.16 Any changes to critical company information require providing the account password for verification before saving.

**8.2 Staff Team Management for Company Admins**

8.17 From the Staff page under Company section, the company admin can manage all staff members associated with the company.

8.18 The system displays a list of staff members with their names, roles, assigned resources, status, and options to edit or remove.

8.19 The company admin clicks the Invite Staff button to add a new staff member to the team.

8.20 The system displays an invitation form where the company admin enters the email address of the person to invite, selects their role within the company from admin, manager, operator, or viewer, and optionally specifies which specific transports or facilities this staff member can manage.

8.21 For a manager role, they can manage all company resources by default. For an operator role, the company admin selects specific transports from a multi-select dropdown.

8.22 The company admin clicks Send Invitation, and the system creates an invitation record and sends an email to the invitee with a link to join the company.

8.23 When the invitee accepts, they are automatically linked to the company with the specified role and permissions.

8.24 The company admin can edit an existing staff member to change their role or reassign resources at any time.

8.25 The company admin can deactivate a staff member if they leave the company, which revokes their access without deleting their account history.

8.26 The system maintains audit logs of all staff management actions for security compliance.

---

### PART NINE: LOGOUT AND SESSION MANAGEMENT

**9.0 Manual Logout Process**

9.1 When the staff member finishes their work session, they click on their avatar in the top right corner of the navigation bar.

9.2 From the dropdown menu, they select the Logout option.

9.3 The system displays a confirmation dialog asking Are you sure you want to logout to prevent accidental logout.

9.4 The staff member clicks Confirm Logout.

9.5 The frontend removes the access token from memory and clears any stored authentication state in Redux.

9.6 The frontend sends a logout request to the backend logout endpoint with the refresh token cookie.

9.7 The backend invalidates the refresh token by deleting the session record from the user sessions table.

9.8 The backend also clears the HTTP-only cookie containing the refresh token by setting its expiration to a past date.

9.9 The frontend redirects the staff member to the login page and clears all sensitive data from local storage.

9.10 The staff member sees a success message indicating they have been successfully logged out.

**9.1 Automatic Logout on Inactivity**

9.11 To maintain security, the system implements automatic logout after a period of inactivity.

9.12 The frontend tracks user activity including mouse movements, keyboard presses, clicks, and scroll events.

9.13 If no activity is detected for thirty minutes, the frontend initiates an automatic logout sequence.

9.14 Before logging out, the system displays a warning dialog asking Are you still there with options to Stay Logged In or Logout Now.

9.15 If the staff member clicks Stay Logged In, the activity timer resets, and no logout occurs.

9.16 If the staff member does not respond within two minutes or clicks Logout Now, the system performs the same logout process as manual logout.

9.17 The system also automatically logs out if the access token expires and the refresh token attempt fails due to the session being invalid.

9.18 This ensures that even if a staff member forgets to log out on a shared computer, their session will not remain active indefinitely.

**9.2 Session Management Across Multiple Devices**

9.19 The staff member can be logged into the same account on multiple devices simultaneously, such as desktop computer and mobile phone.

9.20 Each device has its own session record in the user sessions table with unique device information.

9.21 From the Profile Security page, the staff member can view all active sessions showing device type, browser, IP address, last activity time, and login time.

9.22 The staff member can remotely terminate any session by clicking the Revoke button next to that session entry.

9.23 Upon revoking a session, the backend immediately invalidates that refresh token, and any API requests from that device will receive a 401 unauthorized response.

9.24 The staff member can also choose to Revoke All Other Sessions, which logs out all devices except the current one.

9.25 This feature is useful if the staff member suspects unauthorized access to their account or if they lost a device.

---

### PART TEN: COMPLETE WORKFLOW DIAGRAM SUMMARY

# COMPLETE STAFF WORKFLOW ARCHITECTURE - SCROLLABLE DIAGRAM SUMMARY

## INSTRUCTIONS: The diagram below is contained within a scrollable container. Use horizontal scroll (← →) to view the full width of each diagram. Copy the entire block including the scrollable div tags to preserve formatting.

---

```html
<div style="overflow-x: auto; min-width: 100%; background-color: #0a0e27; padding: 20px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4;">
<pre style="color: #00ff00; margin: 0;">
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 STAFF WORKFLOW - COMPLETE SYSTEM JOURNEY ARCHITECTURE                                                                                 │
│                                                                                    From Registration to Logout - All Activities Included                                                                             │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                              PHASE 1: ACCOUNT CREATION AND VERIFICATION
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────┐
│    STAFF ACCESSES PLATFORM         │         │    FILLS REGISTRATION FORM         │         │    SYSTEM VALIDATES INPUTS          │
│                                    │         │                                    │         │                                    │
│    ┌───────────────────────────┐   │         │    ┌───────────────────────────┐   │         │    ┌───────────────────────────┐   │
│    │   Click Register Button   │   │────────▶│    │ - Full Name              │   │────────▶│    │ - Email format valid      │   │
│    └───────────────────────────┘   │         │    │ - Email Address          │   │         │    │ - Phone number valid      │   │
│                                    │         │    │ - Phone Number           │   │         │    │ - Password meets strength │   │
└────────────────────────────────────┘         │    │ - Password (complex)      │   │         │    │ - Email not already used  │   │
                                               │    │ - Confirm Password        │   │         │    │ - Terms accepted          │   │
                                               │    │ - Role: STAFF             │   │         │    └───────────────────────────┘   │
                                               │    │ - Accept Terms            │   │         │                                    │
                                               │    └───────────────────────────┘   │         └────────────────────────────────────┘
                                               └────────────────────────────────────┘                           │
                                                                                                                │
                                                                                                                ▼
                              ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
                              │                              SYSTEM CREATES USER RECORD                                                      │
                              │                                                                                                             │
                              │    ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐   │
                              │    │  📁 users table:                                                                                  │   │
                              │    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
                              │    │  │  id = UUID()                                                                                 │  │   │
                              │    │  │  email, phone (unique)                                                                        │  │   │
                              │    │  │  password_hash = bcrypt(password, 12 rounds)                                                 │  │   │
                              │    │  │  status = 'pending_email_verification'                                                       │  │   │
                              │    │  │  email_verified_at = NULL                                                                     │  │   │
                              │    │  │  created_at = NOW()                                                                           │  │   │
                              │    │  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
                              │    └───────────────────────────────────────────────────────────────────────────────────────────────────┘   │
                              │                                                                                                             │
                              │    ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐   │
                              │    │  📁 user_roles table:                                                                              │   │
                              │    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
                              │    │  │  user_id, role_id (from roles table where slug = 'staff')                                   │  │   │
                              │    │  │  company_id = NULL (not yet associated)                                                      │  │   │
                              │    │  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
                              │    └───────────────────────────────────────────────────────────────────────────────────────────────────┘   │
                              └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
                              │                         SYSTEM SENDS VERIFICATION EMAIL                                                │
                              │                                                                                                             │
                              │    ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐   │
                              │    │  📧 Email contains:                                                                                │   │
                              │    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
                              │    │  │  - Unique verification token (UUID)                                                          │  │   │
                              │    │  │  - Link: https://platform.com/verify-email?token=xxxx-xxxx-xxxx                              │  │   │
                              │    │  │  - Expiration: 24 hours                                                                        │  │   │
                              │    │  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
                              │    └───────────────────────────────────────────────────────────────────────────────────────────────────┘   │
                              └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────┐
│    STAFF CLICKS VERIFICATION      │         │    SYSTEM VERIFIES TOKEN           │         │    SYSTEM UPDATES USER RECORD      │
│    LINK IN EMAIL                  │────────▶│    AND ACTIVATES ACCOUNT           │────────▶│                                    │
│                                    │         │                                    │         │    ┌───────────────────────────┐   │
└────────────────────────────────────┘         │    ┌───────────────────────────┐   │         │    │ email_verified_at = NOW()│   │
                                               │    │ Token valid? ✅           │   │         │    │ status = 'active'         │   │
                                               │    │ Token expired? ❌         │   │         │    └───────────────────────────┘   │
                                               │    └───────────────────────────┘   │         └────────────────────────────────────┘
                                               └────────────────────────────────────┘                           │
                                                                                                                ▼
┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────┐
│    SYSTEM REDIRECTS TO             │         │    STAFF ENTERS EMAIL              │         │    SYSTEM AUTHENTICATES            │
│    LOGIN PAGE WITH                 │────────▶│    AND PASSWORD TO LOGIN           │────────▶│    CREDENTIALS                     │
│    SUCCESS MESSAGE                 │         │                                    │         │                                    │
│                                    │         │    ┌───────────────────────────┐   │         │    ┌───────────────────────────┐   │
│    "Account verified!              │         │    │ Email: staff@company.com  │   │         │    │ Check email exists        │   │
│     Please login"                  │         │    │ Password: ********        │   │         │    │ Verify status = 'active'  │   │
│                                    │         │    └───────────────────────────┘   │         │    │ Compare password hash     │   │
└────────────────────────────────────┘         └────────────────────────────────────┘         │    └───────────────────────────┘   │
                                                                                             └────────────────────────────────────┘
                                                                                                                │
                                                                                                                ▼
                              ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
                              │                           AUTHENTICATION PROCESS - TOKEN GENERATION                                         │
                              │                                                                                                             │
                              │    ┌─────────────────────────────────┐    ┌─────────────────────────────────┐    ┌─────────────────────────────────────────┐
                              │    │  1. VALIDATE CREDENTIALS        │───▶│  2. GENERATE JWT TOKENS         │───▶│  3. STORE REFRESH TOKEN                 │
                              │    │                                 │    │                                 │    │                                         │
                              │    │  ┌───────────────────────────┐  │    │  ┌───────────────────────────┐  │    │  ┌───────────────────────────────────┐  │
                              │    │  │ ✅ Email exists           │  │    │  │ Access Token:              │  │    │  │ 📁 user_sessions table:           │  │
                              │    │  │ ✅ Status = active        │  │    │  │ - Expires: 15 minutes      │  │    │  │ ┌───────────────────────────────┐ │  │
                              │    │  │ ✅ Password matches hash  │  │    │  │ - Stored in memory         │  │    │  │ │ refresh_token_hash (bcrypt)  │ │  │
                              │    │  └───────────────────────────┘  │    │  │                             │  │    │  │ │ device_info, ip_address     │ │  │
                              │    │                                 │    │  │ Refresh Token:             │  │    │  │ │ expires_at = NOW() + 7 days │ │  │
                              │    │                                 │    │  │ - Expires: 7 days          │  │    │  │ └───────────────────────────────┘ │  │
                              │    │                                 │    │  │ - HTTP-only cookie         │  │    │  └───────────────────────────────────┘  │
                              │    └─────────────────────────────────┘    │  └───────────────────────────┘  │    │                                         │
                              │                                           │                                 │    │  ┌───────────────────────────────────┐  │
                              │                                           │                                 │    │  │ Set-Cookie: refreshToken=xxxx     │  │
                              │                                           │                                 │    │  │ HttpOnly; Secure; SameSite=Strict │  │
                              │                                           │                                 │    │  └───────────────────────────────────┘  │
                              │                                           └─────────────────────────────────┘    └─────────────────────────────────────────┘
                              └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                          STAFF DASHBOARD - NO COMPANY ASSOCIATION                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                                     │
│                                                      ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│                                                      │                                                                                                     │   │
│                                                      │                              ⚠️  You are not associated with any company yet                        │   │
│                                                      │                                                                                                     │   │
│                                                      │         ┌─────────────────────────────────────────┐              ┌─────────────────────────────────────────┐   │
│                                                      │         │      CREATE NEW COMPANY                 │              │      JOIN EXISTING COMPANY             │   │
│                                                      │         │                                         │              │                                         │   │
│                                                      │         │  ┌───────────────────────────────────┐  │              │  ┌───────────────────────────────────┐  │   │
│                                                      │         │  │ 📝 Company Registration Form:    │  │              │  │ 🔑 Enter Invitation Code:          │  │   │
│                                                      │         │  │  - Legal Name                    │  │              │  │                                     │  │   │
│                                                      │         │  │  - Slug (URL-friendly)           │  │              │  │  ┌─────────────────────────────┐    │  │   │
│                                                      │         │  │  - Category (Transport, etc)    │  │              │  │  │ [____________]               │    │  │   │
│                                                      │         │  │  - Logo Upload                  │  │              │  │  └─────────────────────────────┘    │  │   │
│                                                      │         │  │  - Address/City/Country         │  │              │  │                                     │  │   │
│                                                      │         │  │  - Contact Email/Phone          │  │              │  │  ┌─────────────────────────────┐    │  │   │
│                                                      │         │  │  - Tax/Document Uploads         │  │              │  │  │     Verify & Join            │    │  │   │
│                                                      │         │  │  - Bank Account Details         │  │              │  │  └─────────────────────────────┘    │  │   │
│                                                      │         │  └───────────────────────────────────┘  │              │  └───────────────────────────────────┘  │   │
│                                                      │         │                                         │              │                                         │   │
│                                                      │         │         ┌─────────────────────────┐     │              │         ┌─────────────────────────┐     │   │
│                                                      │         │         │   Submit Registration   │     │              │         │   Submit Invitation     │     │   │
│                                                      │         │         └─────────────────────────┘     │              │         └─────────────────────────┘     │   │
│                                                      │         └─────────────────────────────────────────┘              └─────────────────────────────────────────┘   │
│                                                      │                                                                                                     │   │
│                                                      │                              │                                                  │                     │   │
│                                                      │                              ▼                                                  ▼                     │   │
│                                                      │         ┌─────────────────────────────────────────┐              ┌─────────────────────────────────────────┐   │
│                                                      │         │  📁 Company Created                     │              │  📁 Staff Linked to Existing Company    │   │
│                                                      │         │  - status = 'pending'                    │              │  - company_staff record created         │   │
│                                                      │         │  - owner_id = staff_id                   │              │  - role as specified in invitation      │   │
│                                                      │         │  - Notification sent to Super Admins     │              │  - assigned_resources set               │   │
│                                                      │         └────────────────┬────────────────────────┘              └────────────────┬────────────────────────┘   │
│                                                      │                          │                                                          │                         │
│                                                      │                          ▼                                                          ▼                         │
│                                                      │         ┌─────────────────────────────────────────┐              ┌─────────────────────────────────────────┐   │
│                                                      │         │      WAITING FOR SUPER ADMIN             │              │      IMMEDIATE ACCESS                   │   │
│                                                      │         │           APPROVAL                       │              │      Dashboard available                │   │
│                                                      │         └─────────────────────────────────────────┘              └─────────────────────────────────────────┘   │
│                                                      │                                                                                                     │   │
│                                                      └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                        SUPER ADMIN APPROVAL PROCESS                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                                     │
│    ┌─────────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────────────────────────────────────────────────────┐
│    │  SUPER ADMIN RECEIVES       │      │  SUPER ADMIN REVIEWS        │      │  SUPER ADMIN APPROVES       │      │  SYSTEM UPDATES COMPANY                                              │
│    │  NOTIFICATION               │─────▶│  COMPANY DETAILS            │─────▶│  OR REJECTS APPLICATION     │─────▶│                                                         │
│    │                             │      │                             │      │                             │      │  ┌─────────────────────────────────────────────────────────────────┐   │
│    │  ┌───────────────────────┐  │      │  ┌───────────────────────┐  │      │  ┌───────────────────────┐  │      │  │ UPDATE companies SET status = 'active', updated_at = NOW()   │   │
│    │  │ 🔔 New company pending │  │      │  │ 📝 Review:            │  │      │  │ ✅ APPROVE             │  │      │  │ WHERE id = company_id                                         │   │
│    │  │    approval: CompanyX  │  │      │  │  - Legal documents    │  │      │  │ ❌ REJECT with reason  │  │      │  └─────────────────────────────────────────────────────────────────┘   │
│    │  └───────────────────────┘  │      │  │  - Tax certificates    │  │      │  └───────────────────────┘  │      │                                                         │
│    │                             │      │  │  - Company category    │  │      │                             │      │  ┌─────────────────────────────────────────────────────────────────┐   │
│    │                             │      │  └───────────────────────┘  │      │                             │      │  │ 📧 Send notification to staff:                                  │   │
│    │                             │      │                             │      │                             │      │  │    "Your company has been approved! 🎉"                         │   │
│    │                             │      │                             │      │                             │      │  └─────────────────────────────────────────────────────────────────┘   │
│    └─────────────────────────────┘      └─────────────────────────────┘      └─────────────────────────────┘      └─────────────────────────────────────────────────────────────────────────┘
│                                                                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                       STAFF DASHBOARD - COMPANY ACTIVE                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                                     │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │                                                                                                                                                         │   │
│    │                                              ✅  Company Approved - You can now manage transports and facilities                                     │   │
│    │                                                                                                                                                         │   │
│    │    ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐      │   │
│    │    │    TRANSPORTS     │    │    FACILITIES     │    │      ROUTES       │    │    TIMETABLES     │    │     STATIONS      │    │     BOOKINGS      │      │   │
│    │    │       ┌───┐       │    │       ┌───┐       │    │       ┌───┐       │    │       ┌───┐       │    │       ┌───┐       │    │       ┌───┐       │      │   │
│    │    │       │ 0 │       │    │       │ 0 │       │    │       │ 0 │       │    │       │ 0 │       │    │       │ 0 │       │    │       │ 0 │       │      │   │
│    │    │       └───┘       │    │       └───┘       │    │       └───┘       │    │       └───┘       │    │       └───┘       │    │       └───┘       │      │   │
│    │    │    Add New ➕      │    │    Add New ➕      │    │    Add New ➕      │    │    Add New ➕      │    │    Add New ➕      │    │      View All      │      │   │
│    │    └───────────────────┘    └───────────────────┘    └───────────────────┘    └───────────────────┘    └───────────────────┘    └───────────────────┘      │   │
│    │                                                                                                                                                         │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                              PHASE 2: TRANSPORT AND SEATING PLAN SETUP
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                              TRANSPORT CREATION WORKFLOW                                                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│    STAFF NAVIGATES TO             │         │    CLICKS ADD NEW                  │         │    FILLS TRANSPORT FORM                                                                                                                   │
│    TRANSPORTS SECTION             │────────▶│    TRANSPORT BUTTON                │────────▶│                                                                                                                             │
│    IN SIDEBAR                     │         │                                    │         │    ┌─────────────────────────────────────────┐    ┌─────────────────────────────────────────┐                         │
│                                    │         │    ┌───────────────────────────┐   │         │    │     BASIC INFORMATION                    │    │     SPECIFICATIONS                       │                         │
│    ┌───────────────────────────┐   │         │    │      + Add New           │   │         │    │  ┌─────────────────────────────────────┐  │    │  ┌─────────────────────────────────────┐  │                         │
│    │ 🚌 Transports             │   │         │    │      Transport           │   │         │    │  │ Transport Type: [Bus ▼]              │  │    │  │ Capacity: [50]                       │  │                         │
│    │ 🏢 Facilities             │   │         │    └───────────────────────────┘   │         │    │  │ Name: [Express Shuttle]              │  │    │  │ Photos: [Choose Files] 📎            │  │                         │
│    │ 🛣️ Routes                 │   │         └────────────────────────────────────┘         │    │  │ Registration #: [T123ABC]            │  │    │  │ Status: [Active ▼]                   │  │                         │
│    │ 📅 Timetables             │   │                                                    │    │  │ Description: [Luxury bus with AC]    │  │    │  └─────────────────────────────────────┘  │                         │
│    │ 📍 Stations               │   │                                                    │    │  └─────────────────────────────────────┘  │    │                                         │                         │
│    └───────────────────────────┘   │                                                    │    │                                         │    │    ┌─────────────────────────────────────────┐                         │
│                                    │                                                    │    │    ┌─────────────────────────────────────────┐    │    │           FEATURES                        │                         │
└────────────────────────────────────┘                                                    │    │    │              FEATURES                     │    │    │  ┌─────────────────────────────────────┐  │                         │
                                                                                          │    │    │  ┌─────────────────────────────────────┐  │    │    │  │ ☑ Air Conditioning                   │  │                         │
                                                                                          │    │    │  │ ☑ WiFi                              │  │    │    │  │ ☑ Restroom                          │  │                         │
                                                                                          │    │    │  │ ☑ Power Outlets                     │  │    │    │  │ ☑ Entertainment System              │  │                         │
                                                                                          │    │    │  │ ☑ Snacks Service                    │  │    │    │  │ ☑ Wheelchair Access                 │  │                         │
                                                                                          │    │    │  └─────────────────────────────────────┘  │    │    │  └─────────────────────────────────────┘  │                         │
                                                                                          │    │    └─────────────────────────────────────────┘    │    └─────────────────────────────────────────┘                         │
                                                                                          │    └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                                          │                                                                                                                 │
                                                                                          │                                                                                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                              SYSTEM CREATES TRANSPORT RECORD                                                                                                                    │
│                                                                                                                                                                                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  📁 transports table:                                                                                                                                                                                              │   │
│    │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  id = UUID()                                                                                                                                                                                                  │   │   │
│    │  │  company_id = staff_company_id                                                                                                                                                                                 │   │   │
│    │  │  transport_type_id = (selected type from transport_types table)                                                                                                                                               │   │   │
│    │  │  name, registration_number, capacity                                                                                                                                                                          │   │   │
│    │  │  images = JSON array of uploaded image URLs                                                                                                                                                                   │   │   │
│    │  │  features = JSON object of selected amenities                                                                                                                                                                 │   │   │
│    │  │  status = 'draft' (awaiting seating plan configuration)                                                                                                                                                       │   │   │
│    │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                                                                                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  📁 audit_logs table:                                                                                                                                                                                             │   │
│    │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  id = UUID(), user_id = staff_id, action = 'CREATE', entity_type = 'transport', entity_id = transport_id, ip_address, user_agent, created_at = NOW()                                                          │   │   │
│    │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                                                                                                                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                           SEATING PLAN CONFIGURATION WORKFLOW                                                                                                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│    STAFF CLICKS CONFIGURE         │         │    SYSTEM DISPLAYS SEATING         │         │    STAFF ENTERS CONFIGURATION:                                                                                                       │
│    SEATING PLAN BUTTON            │────────▶│    PLAN CONFIGURATION FORM         │────────▶│                                                                                                                             │
│                                    │         │                                    │         │    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    ┌───────────────────────────┐   │         │    ┌───────────────────────────┐   │         │    │                                                                                                                         │   │
│    │   Configure Seating Plan  │   │         │    │  Number of Rows:          │   │         │    │    Number of Rows:  [ 12 ]                                                                                              │   │
│    │   (⚙️ Settings icon)      │   │         │    │  [____]                   │   │         │    │                                                                                                                         │   │
│    └───────────────────────────┘   │         │    │                           │   │         │    │    Seat Pattern:    [ 2-2-2 ]                                                                                            │   │
│                                    │         │    │  Seat Pattern:            │   │         │    │                                                                                                                         │   │
│                                    │         │    │  [______]                 │   │         │    │    Pattern Meaning: 2 seats, aisle, 2 seats, aisle, 2 seats per row                                                │   │
│                                    │         │    │                           │   │         │    │                                                                                                                         │   │
│                                    │         │    │  ┌─────────────────────┐   │   │         │    │    Special Seats:                                                                                                     │   │
│                                    │         │    │  │    PREVIEW AREA     │   │   │         │    │    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│                                    │         │    │  │                    │   │   │         │    │    │  🟡 Driver seat in front row, first seat (Row A, Column 1)                                                       │   │   │
│                                    │         │    │  │  (Live seat grid)   │   │   │         │    │    │  🟢 Wheelchair seat in last row, last seat (Row L, Column 6)                                                     │   │   │
│                                    │         │    │  │                    │   │   │         │    │    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│                                    │         │    │  └─────────────────────┘   │   │         │    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                    │         └────────────────────────────────────┘         │                                                                                                                             │
└────────────────────────────────────┘                                                    │    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
                                                                                          │    │                                                                                                                 │   │
                                                                                          │    │    Staff clicks [💾 SAVE SEATING PLAN] if preview is correct                                                      │   │
                                                                                          │    │                                                                                                                 │   │
                                                                                          │    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
                                                                                          │                                                                                                                             │
                                                                                          │                                                                                                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                           SEAT GENERATION ALGORITHM EXECUTION                                                                                                                 │
│                                                                                                                                                                                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  INPUT:                                                                                                                                                                                                           │   │
│    │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  rows = 12, pattern = "2-2-2"                                                                                                                                                                                 │   │   │
│    │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                    │                                                                                                                                                                       │
│                                                    ▼                                                                                                                                                                       │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  ALGORITHM PROCESS:                                                                                                                                                                                            │   │
│    │                                                                                                                                                                                                                 │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  │  FOR row = 1 TO 12:                                                                                                                                                                                      │   │   │
│    │  │      row_label = getRowLetter(row)    // 1→A, 2→B, 3→C, ... 12→L                                                                                                                                        │   │   │
│    │  │      column_counter = 1                                                                                                                                                                                   │   │   │
│    │  │                                                                                                                                                                                                           │   │   │
│    │  │      FOR EACH block IN pattern.split('-') = ["2", "2", "2"]:                                                                                                                                              │   │   │
│    │  │          FOR seat = 1 TO block_number:                                                                                                                                                                    │   │   │
│    │  │              seat_code = row_label + column_counter                                                                                                                                                       │   │   │
│    │  │              seat_type = determineType(row, block_index, seat, position)                                                                                                                                  │   │   │
│    │  │              // seat_type can be: 'standard', 'driver', 'wheelchair', 'window', 'aisle'                                                                                                                  │   │   │
│    │  │              CREATE seat_record(seat_code, row_label, column_counter, seat_type)                                                                                                                          │   │   │
│    │  │              column_counter++                                                                                                                                                                             │   │   │
│    │  │          END FOR                                                                                                                                                                                          │   │   │
│    │  │          column_counter++   // Add aisle space after block (except last block)                                                                                                                            │   │   │
│    │  │      END FOR                                                                                                                                                                                              │   │   │
│    │  │  END FOR                                                                                                                                                                                                  │   │   │
│    │  │                                                                                                                                                                                                           │   │   │
│    │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                    │                                                                                                                                                                       │
│                                                    ▼                                                                                                                                                                       │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  GENERATED SEAT MAP PREVIEW (12 rows × 6 seats = 72 total seats):                                                                                                                                             │   │
│    │                                                                                                                                                                                                                 │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  │    FRONT OF VEHICLE                                                                                                                                                                                      │   │   │
│    │  │    ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐                                                                                                                                    │   │   │
│    │  │    │ 🟡A1 │ │  A2  │     │  A3  │ │  A4  │     │  A5  │ │  A6  │                                                                                                                                    │   │   │
│    │  │    └──────┘ └──────┘     └──────┘ └──────┘     └──────┘ └──────┘                                                                                                                                    │   │   │
│    │  │         ⬆️ Driver seat                                                                                                                                                                                   │   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  │    ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐                                                                                                                                    │   │   │
│    │  │    │  B1  │ │  B2  │     │  B3  │ │  B4  │     │  B5  │ │  B6  │                                                                                                                                    │   │   │
│    │  │    └──────┘ └──────┘     └──────┘ └──────┘     └──────┘ └──────┘                                                                                                                                    │   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  │    ... (rows C through K)                                                                                                                                                                                │   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  │    ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐                                                                                                                                    │   │   │
│    │  │    │  L1  │ │  L2  │     │  L3  │ │  L4  │     │  L5  │ │ 🟢L6│                                                                                                                                    │   │   │
│    │  │    └──────┘ └──────┘     └──────┘ └──────┘     └──────┘ └──────┘                                                                                                                                    │   │   │
│    │  │         ⬆️ Wheelchair seat                                                                                                                                                                               │   │   │
│    │  │    BACK OF VEHICLE                                                                                                                                                                                       │   │   │
│    │  │                                                                                                                                                                                                         │   │   │
│    │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                    │                                                                                                                                                                       │
│                                                    ▼                                                                                                                                                                       │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │  DATABASE RECORDS CREATED:                                                                                                                                                                                     │   │
│    │                                                                                                                                                                                                                 │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  📁 seat_layouts table:                                                                                                                                                                                    │   │   │
│    │  │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │   │
│    │  │  │  id = UUID(), layoutable_id = transport_id, layoutable_type = 'transport', layout_type = 'seat'                                                                                                      │   │   │   │
│    │  │  │  config_json = {"rows":12, "pattern":"2-2-2", "total_seats":72}                                                                                                                                      │   │   │   │
│    │  │  │  total_units = 72                                                                                                                                                                                     │   │   │   │
│    │  │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │   │
│    │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    │                                                                                                                                                                                                                 │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  📁 seats table (72 records generated):                                                                                                                                                                    │   │   │
│    │  │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │   │
│    │  │  │  Record examples:                                                                                                                                                                                      │   │   │   │
│    │  │  │  - (id, seat_layout_id, unit_code='A1', unit_type='driver', row_number=1, column_number=1, status='active')                                                                                           │   │   │   │
│    │  │  │  - (id, seat_layout_id, unit_code='A2', unit_type='standard', row_number=1, column_number=2, status='active')                                                                                         │   │   │   │
│    │  │  │  - (id, seat_layout_id, unit_code='A3', unit_type='window', row_number=1, column_number=3, status='active')                                                                                           │   │   │   │
│    │  │  │  - (id, seat_layout_id, unit_code='A4', unit_type='aisle', row_number=1, column_number=4, status='active')                                                                                            │   │   │   │
│    │  │  │  - (id, seat_layout_id, unit_code='L6', unit_type='wheelchair', row_number=12, column_number=6, status='active')                                                                                      │   │   │   │
│    │  │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │   │
│    │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    │                                                                                                                                                                                                                 │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  UPDATE transports SET status = 'active_setup' WHERE id = transport_id                                                                                                                                     │   │   │
│    │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │   │
│    │                                                                                                                                                                                                                 │   │
│    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                                                                                                                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                              FACILITY CREATION WORKFLOW                                                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┐         ┌────────────────────────────────────┐         ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│    STAFF NAVIGATES TO             │         │    CLICKS ADD NEW                  │         │    FILLS FACILITY FORM                                                                                                                  │
│    FACILITIES SECTION             │────────▶│    FACILITY BUTTON                 │────────▶│                                                                                                                             │
│    IN SIDEBAR                     │         │                                    │         │    ┌─────────────────────────────────────────┐    ┌─────────────────────────────────────────┐                         │
│                                    │         │    ┌───────────────────────────┐   │         │    │     BASIC INFORMATION                    │    │           LOCATION                        │                         │
│    ┌───────────────────────────┐   │         │    │      + Add New           │   │         │    │  ┌─────────────────────────────────────┐  │    │  ┌─────────────────────────────────────┐  │                         │
│    │ 🚌 Transports             │   │         │    │      Facility            │   │         │    │  │ Facility Type: [Movie Theatre ▼]     │  │    │  │ Address: [123 Main St]               │  │                         │
│    │ 🏢 Facilities             │   │         │    └───────────────────────────┘   │         │    │  │ Name: [Cinema Complex]               │  │    │  │ City: [Dar es Salaam]                │  │                         │
│    │ 🛣️ Routes                 │   │         └────────────────────────────────────┘         │    │  │ Description: [IMAX theatre]          │  │    │  │ Country: [Tanzania]                  │  │                         │
│    │ 📅 Timetables             │   │                                                    │    │  │ Layout Type: [Seats ▼]               │  │    │  │ Coordinates: [-6.7924, 39.2083]      │  │                         │
│    │ 📍 Stations               │   │                                                    │    │  └─────────────────────────────────────┘  │    │  └─────────────────────────────────────┘  │                         │
│    └───────────────────────────┘   │                                                    │    │                                         │    │                                         │                         │
│                                    │                                                    │    │    ┌─────────────────────────────────────────┐    │    ┌─────────────────────────────────────────┐                         │
└────────────────────────────────────┘                                                    │    │    │           AMENITIES & PHOTOS              │    │    │           CAPACITY & STATUS                │                         │
                                                                                          │    │    │  ┌─────────────────────────────────────┐  │    │    │  ┌─────────────────────────────────────┐  │                         │
                                                                                          │    │    │  │ ☑ Parking                           │  │    │    │  │ Capacity: [300]                      │  │                         │
                                                                                          │    │    │  │ ☑ Restrooms                         │  │    │    │  │ Status: [Active ▼]                   │  │                         │
                                                                                          │    │    │  │ ☑ WiFi                              │  │    │    │  │ Photos: [Choose Files] 📎            │  │                         │
                                                                                          │    │    │  │ ☑ Food Court                        │  │    │    │  └─────────────────────────────────────┘  │                         │
                                                                                          │    │    │  │ ☑ Accessibility                     │  │    │    └─────────────────────────────────────────┘                         │
                                                                                          │    │    │  └─────────────────────────────────────┘  │    │                                                                         │
                                                                                          │    │    └─────────────────────────────────────────┘    │                                                                         │
                                                                                          │    └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                                          │                                                                                                                 │
                                                                                          │                                                                                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                              LAYOUT CONFIGURATION BASED ON FACILITY TYPE                                                                                                       │
│                                                                                                                                                                                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │                                                                                                                                                                                                                     │   │
│    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │
│    │  │  IF layout_type = 'seats' (Theatre, Stadium, Arena):                                                                                                                                                         │   │   │
│    │  │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │   │   │
│    │  │  │  Same as transport seating plan configuration: