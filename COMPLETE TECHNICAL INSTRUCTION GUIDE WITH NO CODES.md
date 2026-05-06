# COMPLETE TECHNICAL INSTRUCTION GUIDE FOR AI CODING ASSISTANT

## Full-Stack Booking System - Web Platform Only

**Project Start Date:** May 5, 2026
**Target Platforms:** Frontend (React.js) + Backend (Node.js/Express) + Database (MySQL/MariaDB)
**Mobile App:** Excluded from this phase - focus only on web platform

---

## PART ONE: PROJECT OVERVIEW AND CORE CONCEPTS

### 1.1 System Purpose and Scope

You are to build a unified booking platform that handles two main categories of reservations. The first category is transport booking which includes safari cars, mini-buses, buses, trains, aeroplanes, boats, ferries and ships. The second category is facility booking which covers entertainment venues like movie theatres and stadiums, event spaces like conference halls, outdoor locations like restaurant tables and parking lots, housing options like hotel rooms and apartments, and sports arenas for football, boxing, basketball and other sports.

The core idea is to create a single system where transport companies and facility owners can register their businesses, manage their bookable resources, and receive reservations from customers. Customers should be able to search for available journeys or activities, select seats or spots, make payments, and receive digital tickets.

### 1.2 Unified Resource Model

To avoid duplicating logic, you must implement a unified resource model. A Resource can be either a Transport or a Facility. An Event can be either a Journey for transport or an Activity for facilities. A Seat Unit can be a physical seat on a vehicle, a spot in a parking lot, a table in a restaurant, or a room in a hotel.

This abstraction allows you to reuse booking logic, payment processing, and notification systems across both transport and facility domains.

### 1.3 User Roles and Permissions

The system must support five distinct user roles with clearly defined permissions.

The Developer role has full system access and can see and do everything including viewing audit logs, modifying database schema, and accessing all companies and bookings. This role is intended for platform maintainers only.

The Super Admin role is the platform owner who can manage all companies, approve or reject company registrations, configure system settings like currencies and exchange rates, view audit logs, and manage all users across the platform.

The Company Admin role belongs to the owner or manager of a registered company. This user can manage their own company profile, add and remove staff members, create and manage transports or facilities, define routes and activities, set up timetables, and view reports for their company only.

The Staff role is a restricted version of Company Admin. Staff members can only manage specific transports or facilities that have been assigned to them by the Company Admin. They can create routes and timetables but only for their assigned resources.

The Customer role is for end users who book tickets. They can register, login, search for journeys or activities, book seats or spots, view their bookings and tickets, download receipts, and receive notifications. They cannot access any administrative features.

### 1.4 Technical Stack Specification

For the backend, you must use Node.js version 20 or higher with the Express.js framework. Database interaction must be handled through Sequelize ORM version 6 or higher with MySQL 8.0 or MariaDB 10.6 as the database. Real-time features require Socket.io for bidirectional communication between server and clients. Authentication must be implemented using JWT with both access tokens that expire after fifteen minutes and refresh tokens that expire after seven days. File uploads for company logos, transport images, and facility photos must use Multer. PDF receipt generation requires Puppeteer to create downloadable tickets. Scheduled tasks like releasing expired seat holds and generating future journeys need node-cron. Internationalization must be handled with i18n for eight languages.

For the frontend web application, you must use React version 18 or higher with Vite as the build tool. Client-side routing requires React Router version 6. State management must be implemented with Redux Toolkit. API communication needs Axios with interceptors for token refresh. Real-time seat updates require Socket.io-client. Styling must be done with Tailwind CSS including dark mode support. Dashboard analytics charts need Recharts. Localization across eight languages requires i18next. PDF generation on the client side can use jsPDF or react-pdf for receipt preview before download.

---

## PART TWO: DATABASE SCHEMA DESIGN

### 2.1 Core and Authentication Tables

The users table stores all registered users with fields for unique identifier using UUID, email address that must be unique, phone number that must be unique and formatted with country code, password hash using bcrypt with twelve rounds, first name and last name, optional avatar URL, preferred language defaulting to Swahili, preferred currency identifier, timestamps for email and phone verification, status field with values active, suspended or banned, last login timestamp and IP address, and standard created and updated timestamps with soft delete support. Indexes must be created on email, phone, and status fields for fast lookup.

The roles table defines the five system roles with fields for unique identifier, role name, unique slug for code references, description text, JSON permissions object for granular access control, boolean flag indicating if the role is system protected, and created timestamp. The five default roles of Developer, Super Admin, Company Admin, Staff, and Customer must be inserted during database seeding.

The user_roles table links users to roles with fields for unique identifier, user identifier foreign key, role identifier foreign key, optional company identifier for roles tied to specific companies, identifier of who assigned the role, and created timestamp. A unique constraint must ensure that a user cannot have the same role for the same company twice. Indexes are required on user and company identifiers.

The user_sessions table manages refresh tokens with fields for unique identifier, user identifier foreign key, hashed refresh token, device information string, IP address, expiration timestamp, and created timestamp. Indexes on user identifier and expiration timestamp are required for cleanup jobs.

The settings table stores system-wide configuration with fields for unique identifier, unique setting key, setting value as text, group name for organization, boolean for public visibility, and created and updated timestamps. Indexes on setting key and group name improve performance.

The nav_menus table controls dynamic navigation menus based on user roles with fields for unique identifier, role slug this menu applies to, menu name, icon name, path URL, optional parent menu identifier for hierarchical menus, order index for sorting, active status boolean, optional required permission string, and created timestamp.

The currencies table manages exchange rates with fields for unique identifier, unique three-letter currency code like TZS or USD, currency name, symbol character, exchange rate to base currency TZS as decimal with fifteen digits and six decimal places, boolean indicating if this is the base currency, active status boolean, and updated timestamp. Tanzania Shilling must be the base currency with exchange rate of one point zero zero zero zero zero zero.

The audit_logs table records all important actions for compliance with fields for unique identifier, user identifier who performed the action or null for system actions, action type like CREATE or DELETE, entity type like transport or booking, entity identifier, old values as JSON, new values as JSON, IP address, user agent string, and created timestamp. Indexes on user, entity combination, action type, and created timestamp are required for efficient auditing queries.

### 2.2 Company Management Tables

The companies table represents registered businesses with fields for unique identifier, owner user identifier foreign key, company name, unique slug for URLs, description text, logo URL, category enum covering transport, entertainment, events, outdoor, housing, and sports, status enum with values pending, active, suspended, or rejected, JSON field for verification documents like tax certificates, address text, city, country, coordinates, contact email and phone, commission rate decimal with two decimal places defaulting to five percent, JSON field for payout details like bank account information, and created and updated timestamps. Indexes must be on owner, slug, status, and category.

The company_staff table manages staff assignments with fields for unique identifier, company identifier foreign key, user identifier foreign key, role within company enum with values admin, manager, operator, or viewer, JSON field for permission overrides, JSON array of assigned transport identifiers, JSON array of assigned facility identifiers, active status boolean, and created and updated timestamps. A unique constraint prevents duplicate company-staff assignments, and indexes on company, user, and active status are required.

### 2.3 Transport Domain Tables

The transport_types table categorizes different vehicles with fields for unique identifier, unique name like Bus or Aeroplane, unique slug, category enum for land, water, or air, icon URL, description text, boolean indicating if this type requires routes, boolean indicating if this type requires sitting plans, and created timestamp.

The transports table stores individual vehicles with fields for unique identifier, company identifier foreign key, transport type identifier foreign key, display name, unique registration number, description text, numeric capacity, JSON array of image URLs, JSON object of features like WiFi or air conditioning, status enum with values active, maintenance, or retired, and created and updated timestamps. Indexes on company, transport type, registration number, and status are required.

The seat_layouts table supports polymorphic layout storage for both transports and facilities with fields for unique identifier, layoutable identifier which can reference either a transport or facility, layoutable type enum distinguishing between transport and facility, layout type enum covering seat, spot, table, room, section, or mixed, JSON configuration object containing pattern details like rows and seat arrangement, total number of units generated, status enum with active or inactive, and created and updated timestamps. Indexes on the polymorphic combination and status improve performance.

The seats table contains individual seat or unit records generated from layouts with fields for unique identifier, seat layout identifier foreign key, unit code like A1 or Room 101, unit type enum covering standard, window, aisle, wheelchair, operator, driver, spot, table, room, suite, vip, economy, or business, row number, column number, JSON metadata for additional properties, status enum with active, inactive, or maintenance, and created timestamp. A unique constraint on layout identifier and unit code prevents duplicates, and indexes on layout, unit type, and status are required.

The stations table defines points along transport routes with fields for unique identifier, company identifier foreign key, station name, optional code, description text, address, city, country, geographical coordinates using spatial data type, type enum for origin, destination, intermediate, or terminal, JSON facilities information, and created and updated timestamps. Indexes on company, city, type, and spatial coordinates are required.

The routes table represents paths between stations with fields for unique identifier, company identifier foreign key, optional transport identifier for route-specific vehicles, route name, description, origin station identifier foreign key, destination station identifier foreign key, total distance in kilometers as decimal, base price for full route as decimal, status enum with active or inactive, boolean indicating if this is a sub-route, optional parent route identifier for sub-routes, and created and updated timestamps. Indexes on company, origin station, destination station, status, and parent route are required.

The route_stations junction table links routes to stations in sequence with fields for unique identifier, route identifier foreign key, station identifier foreign key, integer sequence order starting from one, distance from origin in kilometers, cumulative price from origin, boolean indicating if this is a break stop for meals or restrooms, stop duration in minutes, and created timestamp. A unique constraint on route and station prevents duplicates, and indexes on route and station with sequence order are required for efficient querying.

The timetables table defines scheduled services as templates with fields for unique identifier, route identifier foreign key, transport identifier foreign key, departure time using time data type, arrival time using time data type, frequency type enum for once, daily, weekly, or custom, JSON configuration for weekly days or custom rules, effective from date, optional effective until date, status enum with active or inactive, and created and updated timestamps. Indexes on route, transport, effective date range, and status are required.

The journeys table represents concrete instances of timetables on specific dates with fields for unique identifier, optional timetable identifier foreign key, transport identifier foreign key, route identifier foreign key, journey date, departure datetime combining date and time, arrival datetime, status enum for scheduled, boarding, departed, delayed, cancelled, or completed, integer count of available seats, integer count of booked seats, integer count of held seats, delay minutes, cancellation reason text, and created and updated timestamps. Indexes on timetable, transport, route, journey date, status, departure time, and available seats count are critical for performance.

### 2.4 Facility Domain Tables

The facility_types table categorizes bookable venues with fields for unique identifier, unique name like Movie Theatre or Hotel Room, unique slug, category enum matching the company categories, layout type enum for seats, units, mixed, or none, icon URL, description text, and created timestamp.

The facilities table stores individual venues with fields for unique identifier, company identifier foreign key, facility type identifier foreign key, name, description, address, city, country, geographical coordinates, numeric capacity, JSON array of image URLs, JSON amenities object, status enum with active, maintenance, or closed, and created and updated timestamps. Indexes on company, facility type, city, and status are required along with spatial index on coordinates.

The activities table defines what can be booked at a facility with fields for unique identifier, facility identifier foreign key, name, description, activity type enum for event, session, programme, rental, or showing, category string, base price decimal, currency identifier foreign key, duration in minutes, JSON image URLs, age restriction string, terms and conditions text, status enum with active, cancelled, or completed, and created and updated timestamps. Indexes on facility, activity type, status, and category are required.

The activity_schedules table provides recurring templates for activities with fields for unique identifier, activity identifier foreign key, start time, end time, frequency type enum, frequency configuration JSON, effective from date, effective until date, status enum, and created and updated timestamps. Indexes on activity, effective date range, and status are required.

The activity_instances table represents concrete occurrences of activities on specific dates with fields for unique identifier, optional activity schedule identifier foreign key, activity identifier foreign key, instance date, start datetime, end datetime, status enum for scheduled, ongoing, completed, or cancelled, integer count of available units, booked units, and held units, and created and updated timestamps. Indexes on schedule, activity, instance date, and status are required.

### 2.5 Booking and Payment Domain Tables

The bookings table is the central transaction record with fields for unique identifier, unique booking code generated with pattern like BKG-20260505-X7K9, optional user identifier for guest bookings, company identifier foreign key, booking type enum for transport or facility, optional journey identifier for transport bookings, optional activity instance identifier for facility bookings, status enum with values pending, holding, confirmed, cancelled, refunded, completed, or no show, total amount decimal, currency identifier foreign key, exchange rate snapshot decimal to preserve historical accuracy, passenger count integer, contact name, contact phone, contact email, notes text, cancellation reason, booked at timestamp, expires at timestamp for holding period, confirmed at timestamp, cancelled at timestamp, and created and updated timestamps. Indexes must be created on booking code, user, company, status, booking type, journey, activity instance, expires at, and booked at.

The booking_items table stores individual line items per booking with fields for unique identifier, booking identifier foreign key, item type enum for seat, spot, room, table, or section, item code like A1 or Room 101, passenger name, passenger type enum for adult, child, infant, or senior, JSON details for ID numbers or special needs, unit price decimal, and created timestamp. Index on booking identifier is required.

The seat_holds table implements the ten-minute reservation system with fields for unique identifier, optional journey identifier, optional activity instance identifier, seat code string, user identifier foreign key, session identifier for socket connections, held at timestamp, expires at timestamp calculated as ten minutes after held at, status enum with values holding, released, converted, or expired, and created and updated timestamps. Critical indexes must be on journey or activity instance combined with seat code for availability checks, on user identifier, on session identifier, on expires at combined with status for cron job efficiency, and on status alone.

The payments table records financial transactions with fields for unique identifier, booking identifier foreign key, unique transaction reference, payment method enum covering all mobile money, bank, and card options, payment provider string, amount decimal, currency identifier foreign key, exchange rate snapshot decimal, JSON provider response for debugging, status enum with values pending, processing, completed, failed, refunded, or partially refunded, paid at timestamp, refunded at timestamp, and created and updated timestamps. Indexes on booking, transaction reference, status, and payment method are required.

The tickets table stores digital tickets with fields for unique identifier, booking identifier foreign key, unique ticket code, encrypted QR code data string, QR code image URL, status enum with active, used, expired, or cancelled, generated at timestamp, validated at timestamp, validated by user identifier, and created and updated timestamps. Indexes on booking, ticket code, and status are required.

The refund_requests table handles customer refunds with fields for unique identifier, booking identifier foreign key, user identifier foreign key, reason text, amount requested decimal, status enum for pending, approved, rejected, or processed, processed by user identifier, processed at timestamp, rejection reason text, and created and updated timestamps. Indexes on booking, user, and status are required.

### 2.6 Notifications and Reviews Tables

The notifications table stores user notifications with fields for unique identifier, user identifier foreign key, type string like booking_confirmed or journey_reminder, title, message text, JSON data payload, boolean read status, read at timestamp, sent via enum for push, email, sms, or in_app, and created timestamp. Indexes on user combined with read status, on type, and on created timestamp are required.

The reviews table allows customer feedback with fields for unique identifier, user identifier foreign key, company identifier foreign key, booking identifier foreign key ensuring one review per booking, integer rating between one and five, comment text, reply text from company, status enum for pending, approved, or rejected, and created and updated timestamps. Indexes on company, user, rating, and status are required.

### 2.7 Performance Indexes Summary

Additional performance indexes must be created on journeys table for date and status combination, on bookings table for user and status combination, on payments table for booking and status combination, on seat holds table for expires at and status combination, on route stations table for route and price combination, on transports table for company and status combination, and on facilities table for company and status combination.

---

## PART THREE: BACKEND IMPLEMENTATION

### 3.1 Project Structure

The backend must follow a modular organization. The src directory contains a config folder for database, redis, socket, and multer configuration files. The models folder holds all Sequelize model definitions with proper associations defined in an index file. The controllers folder contains route handler functions organized by domain including auth, user, company, transport, route, booking, payment, admin, and report controllers. The services folder implements business logic including auth service, seat hold service, booking service, price calculation service, journey generator service, notification service, receipt service, payment service, and currency service.

The middleware folder includes authentication middleware for JWT verification, RBAC middleware for role checking, validation middleware for request data, rate limiting middleware for API protection, and error handling middleware. The routes folder organizes API endpoints by version. The validators folder contains Joi schemas for request validation. The utils folder holds helper functions for Swahili time conversion, seat generation algorithm, PDF generation, QR code generation, and other utilities. The jobs folder contains cron job definitions for releasing expired holds, generating journeys, and sending reminders. The sockets folder handles real-time connection logic. The i18n folder stores translation JSON files for eight languages.

### 3.2 Authentication Implementation

JWT authentication must use access tokens that expire after fifteen minutes and refresh tokens that expire after seven days. Access tokens are stored in client memory for React applications. Refresh tokens must be stored in HTTP-only cookies for web applications to prevent XSS attacks. The token payload must include user identifier, array of role slugs, optional company identifier for scoped access, and standard issued at and expiration timestamps.

The login endpoint validates credentials against the database, checks if the user account is active, generates both tokens, stores the refresh token hash in the user sessions table with device information and IP address, and returns the access token and user profile to the client. The refresh endpoint accepts a refresh token, verifies it against the stored hash, issues new access and refresh tokens, and invalidates the old session. The logout endpoint removes the session record.

Password handling requires bcrypt with twelve salt rounds. Passwords must be at least eight characters with at least one uppercase letter, one lowercase letter, one number, and one special character. Rate limiting on login attempts allows only five attempts per fifteen minutes per IP address, with account lockout for thirty minutes after five failed attempts.

### 3.3 Seat Hold Service Logic

The seat hold service is critical for preventing double booking. When a user selects seats, the service must first validate that all requested seats are currently available, meaning they have no active booking and no active hold with future expiration. It then creates seat hold records for each seat with an expiration timestamp set to ten minutes from the current time. Each hold record must include the journey or activity instance identifier, seat code, user identifier, and socket session identifier.

After creating holds, the service must broadcast a seat-held event through Socket.io to all clients currently viewing the same journey or activity room. This event includes the seat codes, expiration timestamp, and the user identifier who held the seats so other users see those seats as temporarily unavailable.

The service must include a method to release expired holds, called by a cron job every thirty seconds. This job finds all hold records with expiration timestamp less than the current time and status still set to holding, updates their status to expired, and broadcasts seat-released events to all clients in the affected rooms.

When a user proceeds to payment after selecting seats, the service must extend the hold expiration to an additional five minutes. This gives the user enough time to complete payment without fear of losing their seats. On successful payment, the service converts the holds to permanent booking by updating their status to converted. On payment failure or cancellation, the service releases the holds.

### 3.4 Booking Service with Sub-route Detection

The booking service must handle the complex logic of transport bookings where users may start from an intermediate station rather than the route origin. When creating a booking with a selected journey, start station, and end station, the service must first retrieve the route and its ordered stations from the route-stations table.

If the selected start station is exactly the route origin station, the service calculates the price using the end station cumulative price from the origin. If the start station is not the origin, the service must search for a sub-route where the parent route matches the current route, the origin station matches the user selected start station, and the end station exists in the sub-route stations. If such a sub-route exists, the service switches to that sub-route and uses its base price.

If no matching sub-route exists, the service calculates a partial price by subtracting the start station cumulative price from the end station cumulative price. This price must be positive, and the end station sequence order must be greater than the start station sequence order. The service then proceeds with the original route but using the calculated partial price.

The booking creation process generates a unique booking code with format BKG-YYYYMMDD-XXXXXX where the last six characters are random alphanumeric. The booking status is set to holding with an expiration timestamp of ten minutes. Booking items are created for each selected seat with passenger details included. The service must ensure all database operations occur within a transaction to maintain consistency.

### 3.5 Journey Generation Cron Job

A cron job scheduled to run daily at one in the morning must generate journey instances for the next thirty days based on active timetables. For each active timetable with effective from and until dates covering the next thirty days, the job calculates which dates the timetable applies to based on its frequency type.

For daily frequency, every date within the range qualifies. For weekly frequency, the job checks the days of week stored in the frequency configuration and only includes dates where the day of week matches. For once frequency, only the specific effective from date qualifies.

For each qualifying date, the job combines the journey date with the timetable departure and arrival times to create full datetime objects. It checks whether a journey already exists for that timetable and date to avoid duplicates. If not, it creates a new journey record with status scheduled, and calculates available seats count from the transport capacity minus any pre-booked seats.

### 3.6 Payment Service with Stub Integration

Since real payment gateway integration requires API keys that cannot be provided in code, the payment service must implement a stub for development and testing. The stub accepts a booking identifier, payment method, and last four digits of card number for logging purposes. It randomly succeeds eighty percent of the time and fails twenty percent of the time to simulate real-world conditions.

On success, the stub returns a status of completed with a fake transaction identifier. The payment service then updates the booking status to confirmed, marks all associated seat holds as converted, generates a ticket with QR code, and triggers notification events for email and in-app alerts. On failure, the stub returns a failure status with a reason like insufficient funds or technical error, and the payment service releases the seat holds and sets the booking status to expired.

For production deployment, clear comments must indicate where to replace the stub with actual payment provider integrations like Flutterwave, Stripe, or direct mobile money APIs. The interface must support webhooks for asynchronous payment confirmations from external providers.

### 3.7 Receipt and Ticket Generation

After successful payment, the system must generate a PDF receipt and a digital ticket with QR code. The receipt generation service uses Puppeteer to launch a headless browser, loads an HTML template with EJS templating, injects the booking details including the booking code, journey details or activity details, passenger information, seat assignments, and payment summary, and generates a PDF buffer.

The PDF is uploaded to cloud storage like S3 or MinIO for permanent storage and retrievable via signed URLs. The receipt download endpoint returns this PDF to the client for printing or saving.

The ticket includes a QR code generated using the qrcode library. The QR code data contains an encrypted JSON string with the ticket code, booking identifier, and validation timestamp. This allows staff scanners to validate tickets offline. The QR code image is also stored in cloud storage.

### 3.8 Socket.io Real-time Architecture

Socket.io must be configured with Redis adapter to support multiple server instances in production. The connection middleware authenticates using the JWT token provided in the connection handshake, extracting the user identifier for later use.

Clients join room-specific channels based on the journey or activity they are viewing. The join event handler adds the socket to a room named journey colon journey identifier or activity colon activity identifier. Upon joining, the server sends the current seat map with availability status including active holds from other users.

The select seat event handler attempts to create holds and broadcasts seat held events to all other clients in the same room, excluding the sender. The release seat event removes holds and broadcasts seat released events. The disconnect event implements a grace period of thirty seconds before releasing any holds held by the disconnected session, giving the user time to reconnect if their connection was temporary.

### 3.9 Notification Service

The notification service must support multiple delivery channels. In-app notifications are stored in the notifications table and fetched via API endpoint marked as read when viewed. Email notifications use Nodemailer with SMTP configuration to send HTML emails for booking confirmations, payment receipts, and journey reminders. Push notifications for web browsers use the Web Push API with service workers.

Event triggers include booking created which sends confirmation emails and in-app notifications, payment received which sends receipt emails and push notifications, seat hold expiring which sends push notifications two minutes before expiration, journey reminder which sends push notifications and SMS two hours before departure for critical alerts, journey delayed which sends push notifications and SMS to all booked passengers, and booking cancelled which sends email and push notifications.

### 3.10 Localization and Swahili Time

The i18n system must support eight languages including English, Swahili, Chinese, Russian, Spanish, French, German, and Portuguese. All user-facing strings are stored in JSON translation files organized by language and namespace. The backend selects the appropriate language based on user preference stored in the JWT token or the Accept-Language header.

Swahili time conversion is a display-only feature. All times are stored in UTC in the database. When the user locale is Swahili, the time conversion helper takes a UTC datetime and calculates the Swahili hour by adding six to the UTC hour then taking modulo twelve, with zero displayed as twelve. The period is determined by the original UTC hour: hours four to five are alfajiri meaning dawn, hours six to eleven are asubuhi meaning morning, hours twelve to fifteen are mchana meaning afternoon, hours sixteen to eighteen are jioni meaning evening, and all other hours are usiku meaning night.

For example, six AM UTC converts to twelve asubuhi, ten AM UTC converts to four asubuhi, twelve PM UTC converts to six mchana, four PM UTC converts to ten jioni, and seven PM UTC converts to one usiku.

---

## PART FOUR: FRONTEND IMPLEMENTATION

### 4.1 Project Structure

The frontend React application follows a feature-based organization. The public directory contains locale JSON files for internationalization and static assets. The src directory contains assets for images and fonts, components organized into common reusable components, layout components like navbar and sidebar, booking-specific components like seat map and route selector, dashboard components like stat cards and charts, and map components for seat grids.

The contexts directory holds React context providers for authentication, theme, currency, and socket connections. The hooks directory contains custom hooks for accessing these contexts with type safety. The pages directory is organized by feature including authentication pages, public pages for home and search, booking flow pages, user dashboard pages for profile and bookings, company management pages for transports and routes, and admin pages for system management.

The services directory contains API client modules using axios with interceptors for authentication tokens. The store directory holds Redux Toolkit slices for auth, booking, search, UI, and currency state management. The utils directory contains formatters, validators, Swahili time helpers, and constants. The styles directory holds global CSS and Tailwind configuration.

### 4.2 State Management Architecture

Redux Toolkit manages application state with several slices. The auth slice stores user profile, authentication status, and access token. The booking slice tracks the current booking flow state including selected journey, selected seats, passenger information, and hold expiration timers. The search slice manages search filters and results across transport and facility searches. The UI slice controls theme mode, sidebar visibility, language selection, and notification toasts. The currency slice stores available currencies, current selected currency, and exchange rates.

The authentication slice uses createAsyncThunk for login and registration actions, handling token storage in localStorage and automatic token refresh on 401 responses. The booking slice includes reducers for step progression, seat selection, passenger form data, and payment state. All slices export their actions and reducers to be combined in the store configuration.

### 4.3 Authentication Flow

The login page collects email and password, dispatches the login thunk, and on success redirects to the dashboard. The register page collects first name, last name, email, phone, and password with confirmation, then automatically logs the user in after successful registration. The forgot password flow sends a reset link to email, and the reset password page allows setting a new password with the token from the email link.

Protected routes use a wrapper component that checks authentication status from Redux and redirects to login if not authenticated. Role-based routes additionally check user roles from the auth slice and redirect to unauthorized page if the user lacks required permissions. The authentication service includes an axios interceptor that catches 401 responses, attempts to refresh the token using the refresh token stored in localStorage, retries the original request with the new token, and logs the user out if refresh fails.

### 4.4 Transport Booking Flow

The transport booking wizard consists of six steps. Step one is select route where the user chooses origin city, destination city, and departure date. The search results display available routes with transport information, departure times, and prices.

Step two is select stations where the user chooses the actual boarding station and alighting station from the stations list of the selected route. If the boarding station is not the route origin, the system calls the sub-route detection API to find a matching sub-route or calculate partial pricing.

Step three is select timetable where the user chooses a specific departure time from available journeys on the selected date, displayed in a calendar or list format with departure time, arrival time, duration, and available seats count.

Step four is seat selection where the user views an interactive seat map generated from the transport layout configuration. The seat map component connects to Socket.io to receive real-time updates when other users select or release seats. Colors indicate available seats in blue, already booked seats in red, seats held by other users in gray, currently selected seats in orange, driver or operator seats in yellow, and wheelchair accessible seats in green.

Step five is passenger details where the user enters passenger information for each selected seat including full name, passenger type of adult, child, infant, or senior, optional identification number, and special assistance requirements. A separate contact person section collects name, phone, and email for booking communications.

Step six is payment where the user reviews the booking summary, selects payment method from available options, and completes payment through the integrated payment gateway. A countdown timer displays the remaining time to complete payment before the seat hold expires. On successful payment, the user is redirected to the receipt page.

### 4.5 Facility Booking Flow

The facility booking flow follows a similar pattern with appropriate modifications. Step one is select facility type from categories like entertainment, events, outdoor, housing, or sports. Step two is select specific facility from search results based on location and date. Step three is select activity from the facility available activities like movie showing, conference session, or room rental. Step four is select timetable for that activity instance. Step five is select spots or units from the facility layout, which may be a grid of tables in a restaurant, a list of available rooms in a hotel, or numbered parking spots in a lot. Step six is payment with the same process as transport.

### 4.6 Seat Map Component Implementation

The seat map component is the most complex UI element. It receives a journey or activity instance identifier and establishes a Socket.io connection. Upon mounting, it emits a join event to the appropriate room and listens for seat map data from the server. The seat map data includes all seats in the layout with their coordinates, codes, types, and current status of available, taken, or held.

The component renders seats in a grid based on the seating pattern. For a pattern like two dash two dash two, the layout displays two seats, an aisle, two seats, an aisle, two seats per row. The component iterates through rows from front to back, rendering seat buttons with appropriate colors based on status and type. Click handlers call the select or release seat events through Socket.io.

A countdown timer displays when the user has selected seats, showing the remaining time before the holds expire. The component also receives real-time seat-held and seat-released events from other users and updates the UI accordingly, converting available seats to held status and back.

The component includes a legend explaining the color codes and a summary of selected seats with their codes. When the user confirms seat selection, it passes the list of selected seat codes to the parent booking flow component.

### 4.7 Dashboard and Analytics

The customer dashboard displays statistics cards showing total bookings, upcoming journeys, active tickets, and money spent. Charts using Recharts display booking trends over time, popular routes, and activity categories. Recent bookings are listed with status indicators and quick actions to view tickets or cancel.

The company dashboard shows revenue charts, seat occupancy rates for transports or facilities, popular routes or activities, and staff performance metrics. The admin dashboard shows platform-wide metrics including total companies, total users, total revenue, commission earned, and pending approval requests.

All dashboards respect user roles, with company admins seeing only their company data, super admins seeing all data, and customers seeing only their personal booking history.

### 4.8 Theme System with Dark Mode

The theme system uses Tailwind CSS dark mode variant with class strategy. A theme context provider stores the current theme preference in localStorage and toggles between light and dark by adding or removing the dark class on the HTML element. All components must use the dark variant class names for their dark mode styles.

Global CSS variables define color palettes for light and dark modes. Primary colors adapt to both themes, maintaining adequate contrast ratios. The theme toggle button switches between sun and moon icons and persists the preference across browser sessions.

### 4.9 Currency Display

The currency system fetches all available currencies and exchange rates from the API on application startup. The current currency selection is stored in localStorage and shared via a currency context. All price displays use a formatPrice helper that multiplies the base price in TZS by the selected currency exchange rate and formats the result according to the user locale.

When the user changes currency, the context updates and all price displays re-render with the new conversion. The booking summary page shows both the converted amount and the original TZS amount for transparency. Exchange rates are cached and refreshed every hour or when the user manually refreshes.

### 4.10 Responsive Design

The application must be fully responsive across mobile, tablet, and desktop breakpoints. Tailwind CSS responsive prefixes handle layout changes. The seat map component switches to a scrollable horizontal layout on mobile devices instead of the fixed grid on desktop. The booking wizard collapses steps into an accordion on mobile and number separated steps on desktop. The sidebar navigation transforms into a bottom navigation bar on mobile devices.

---

## PART FIVE: CRITICAL BUSINESS LOGIC DETAILS

### 5.1 Seat Generation Algorithm

The seat generation algorithm takes two inputs: a pattern string and a number of rows. The pattern string uses hyphens to separate seat blocks, where each number indicates how many seats are in that block, and the hyphen represents a space or aisle between blocks. For example, the pattern one dash two means one seat, space, then two seats. The pattern two dash two dash two means two seats, space, two seats, space, two seats.

For each row from one to the specified number of rows, the algorithm determines the row label using a base twenty-six system where row one is A, row two is B, row twenty-six is Z, row twenty-seven is AA, and so on. It then iterates through each block in the pattern. For each seat in the block, it generates a seat code combining the row label and a running column counter.

Special seat types are assigned based on position. The first seat in the first row and first block is designated as driver for transports or operator for facilities and colored yellow. The last seat in the last row and last block is designated as wheelchair accessible and colored green. Seats at the ends of blocks are designated as window seats if applicable. Seats next to aisles are designated as aisle seats. All other seats are standard.

After generating all seats, the algorithm saves them to the seats table associated with the seat layout. The total units count is the sum of all seats generated.

### 5.2 Sub-route Detection and Partial Pricing

When a user selects a start station that is not the route origin, the system must determine the correct pricing logic. It first checks if a sub-route exists where the parent route matches the selected route, the origin station matches the user start station, and the end station is present in the sub-route stations. If such a sub-route exists, the system automatically switches to that sub-route and uses its full base price.

If no matching sub-route exists, the system uses the main route but calculates a partial price. It finds the cumulative price at the start station and the cumulative price at the end station from the route-stations table. The partial price per passenger is the end station cumulative price minus the start station cumulative price. This calculation requires that the end station sequence order is greater than the start station sequence order, and the resulting price is positive.

The frontend must display this price calculation clearly and allow the user to confirm before proceeding. The backend booking controller implements the same logic to ensure consistency, as the frontend calculation is only for display and the backend recalculates at booking time.

### 5.3 Seat Hold Expiry and Payment Timer

The seat hold system implements a two-stage timer. The first stage is the initial hold that lasts for ten minutes from the moment the user selects seats. During this time, the user can proceed through the passenger details form. If the user reaches the payment page, the system extends the hold for an additional five minutes, giving a total of fifteen minutes potential hold time.

The frontend displays a countdown timer on both the seat selection page and the payment page. When the timer reaches zero, the frontend releases the holds and shows a timeout message. The backend cron job runs every thirty seconds to find expired holds and release them, ensuring that even if the user closes the browser, seats are not held indefinitely.

On the payment page, the timer is especially critical. Users must complete payment before the timer expires. If payment is in progress, the frontend can request a one-time extension of an additional two minutes, but only once per booking to prevent abuse.

### 5.4 Transportation of Complex Routes

For transport companies that operate complex routes with branches, the system supports hierarchical routes through the parent route and is sub-route flags. A parent route defines the main path from origin to destination with all intermediate stations. Sub-routes are alternative paths that start at an intermediate station and end at the destination or another intermediate station.

When searching for available journeys, the system should return both parent route journeys and sub-route journeys if they match the user search criteria. The sub-route detection logic in the booking flow handles cases where a user wants to board at an intermediate station but the parent route journey is the only journey available.

The route-stations table maintains the cumulative price from origin for each station along the route, which enables partial pricing even when sub-routes do not exist. Companies should be encouraged to create sub-routes for frequently requested boarding points to simplify pricing and improve user experience.

### 5.5 Concurrency Control and Race Conditions

The seat hold system must prevent race conditions where two users attempt to select the same seat simultaneously. The database transaction for creating holds uses a unique constraint on journey identifier and seat code combination for active holds. This ensures that only one user can successfully create a hold for a given seat at a time.

When two users click the same seat at the exact same time, the database transaction for the first user to acquire the lock succeeds, and the second user receives a constraint violation error, which the backend translates to a seat already taken message. Socket.io broadcasts ensure that other users see the seat status change immediately, but the database constraint provides the final authority.

The booking creation process similarly uses transactions to ensure that holds are converted to bookings atomically, and seats cannot be double booked even if the user session is disconnected during the process.

---

## PART SIX: FEATURES IMPLEMENTATION DETAILS

### 6.1 Localization with Eight Languages

The application must support English, Swahili, Chinese, Russian, Spanish, French, German, and Portuguese. Language detection uses the browser language setting initially, then falls back to English. Users can manually switch languages from a dropdown menu in the navigation bar, and the preference is saved to localStorage and sent to the backend for future requests.

All user-facing text must use the translation function rather than hardcoded strings. This includes error messages, button labels, form placeholders, and notification content. Dynamic content like booking statuses and seat types also require translation mapping.

The Swahili translation includes special handling for dates and times with the Swahili time conversion. The Swahili translation file defines strings for periods like alfajiri for dawn, asubuhi for morning, mchana for afternoon, jioni for evening, and usiku for night.

### 6.2 Dark and Light Mode

The theme system detects the user system preference initially using the prefers-color-scheme media query, then allows manual toggling from the navigation bar. The selected theme persists across sessions. The theme toggle triggers a CSS class change on the HTML element, and all Tailwind classes that specify dark variants apply automatically.

Component styling must define both light and dark mode color schemes. Background colors, text colors, border colors, and shadow effects all need explicit dark mode equivalents. The seat map component uses darker shades of blue, red, orange, and gray in dark mode for better visibility against dark backgrounds.

The dashboard charts use CSS variables that adjust between light and dark mode, ensuring that chart labels, grid lines, and tooltips remain readable in both themes.

### 6.3 Currency Setting by Admin

Only Super Admin and Developer roles can modify currency exchange rates. The currency management page in the admin panel displays all currencies with their current exchange rates to TZS. The admin can edit the exchange rate for any non-base currency, and the system automatically recalculates all displayed prices without requiring database updates to stored booking amounts.

When an admin changes an exchange rate, the system updates the currencies table and invalidates the frontend exchange rate cache. All active user sessions will fetch the new rates on their next API call. Historical booking records retain their snapshot exchange rates, so past bookings always display the correct amount that was actually paid.

The currency selector in the frontend allows any authenticated user to choose their preferred display currency from the list of active currencies. Guest users see the default currency TZS. The selected currency is stored in Redux and localStorage and applied to all price displays throughout the application.

### 6.4 Dashboard with Statistics Cards

The dashboard for each user role displays relevant statistics using cards and charts. For customers, the cards show total trips taken, upcoming bookings, total spent, and active tickets. For company admin, the cards show total revenue for the current month, total bookings, occupancy rate, and pending activities. For super admin, the cards show total companies, total users, total revenue, and platform commission earned.

Chart components using Recharts display line charts for revenue trends over the last six months, bar charts for popular routes or activities, pie charts for booking category distribution, and area charts for seat occupancy over time.

All dashboard data is fetched from API endpoints that aggregate data from multiple tables. The backend implements caching for dashboard queries to reduce database load, with cache invalidation when new bookings are created.

### 6.5 Role-Based Navigation Menus

The navigation sidebar and top navbar dynamically render menu items based on the user roles. The menu configuration object defines each menu item with path, label, icon, and roles array. A utility function filters the menu items to only those where the user role matches at least one role in the array.

Company admin users see additional menu sections for managing transports, facilities, routes, timetables, staff, and reports. Staff users see a subset of these menus limited to their assigned resources. Super admin users see admin section with company management, user management, settings, and audit logs.

The active menu item is highlighted using the NavLink component with active class styling. Mobile view collapses the sidebar into a bottom navigation bar with icons only, showing labels only for the active item.

### 6.6 Real-time Notifications

The notification system uses a combination of polling for in-app notifications and Socket.io for real-time alerts. When a user receives a new notification while actively using the application, Socket.io emits a notification event that triggers a toast notification and updates the notification bell icon badge.

The notification center page lists all notifications with read and unread status, grouped by date. Users can mark individual notifications as read, mark all as read, or delete notifications. Clicking on a notification that relates to a booking navigates to that booking detail page.

For critical notifications like seat hold expiring or journey delayed, the system also sends email and SMS if the user has provided contact information. Email templates use responsive HTML design and include action buttons to view details on the platform.

---

## PART SEVEN: SECURITY REQUIREMENTS

### 7.1 Authentication Security

Password hashing uses bcrypt with twelve salt rounds, making brute force attacks computationally expensive. Passwords must meet complexity requirements of minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and one special character. Passwords are never logged or stored in plain text.

JWT access tokens expire after fifteen minutes, limiting the window of opportunity for token theft. Refresh tokens expire after seven days and are stored in HTTP-only cookies to prevent JavaScript access. The refresh token rotation scheme issues a new refresh token with each refresh request and invalidates the previous token, preventing token replay attacks.

Login attempts are rate limited to five attempts per fifteen minutes per IP address. After five failed attempts, the account is locked for thirty minutes. Failed attempt counts are stored in Redis with expiration timestamps.

### 7.2 Authorization and RBAC

The RBAC middleware checks user roles and permissions on every protected endpoint. The permission system uses action-based permissions like transport create, transport read, transport update, transport delete. Roles map to collections of these permissions through the permissions JSON field in the roles table.

For company-scoped roles like company admin and staff, the middleware also verifies that the user is accessing resources belonging to their company. For staff users, additional checks verify that the specific transport or facility is in their assigned identifiers list.

The audit log middleware records all create, update, and delete operations on sensitive entities including users, companies, bookings, and payments. Audit logs include the user identifier, action type, entity type, entity identifier, old values, new values, IP address, and user agent.

### 7.3 Input Validation and Sanitization

All API endpoints must validate request data using Joi schemas before processing. Validation rules include required fields, data types, string lengths, email format, phone number format with country code, UUID format for identifiers, and numeric ranges for prices and counts.

SQL injection is prevented by using Sequelize parameterized queries exclusively. No raw SQL queries are allowed. User input is never concatenated into query strings.

XSS protection is implemented through Helmet.js middleware which sets appropriate security headers including Content-Security-Policy. React automatically escapes content in JSX, preventing script injection through user-generated content.

### 7.4 File Upload Security

File uploads using Multer must enforce size limits of five megabytes per file. Allowed file extensions are limited to JPEG, PNG, and PDF. Files are renamed with random strings to prevent path traversal attacks. Uploaded files are scanned for malware using ClamAV integration in production environments.

Company logos, transport images, and facility photos are uploaded to cloud storage with private buckets. Access is granted through signed URLs that expire after a configurable time period, preventing direct access to the underlying storage.

### 7.5 API Rate Limiting

Different rate limits apply to different endpoint categories. Authentication endpoints are limited to five requests per fifteen minutes per IP. Booking endpoints are limited to twenty requests per minute per authenticated user. Public search endpoints are limited to thirty requests per minute per IP to prevent scraping. Admin endpoints have stricter limits of ten requests per minute per admin user.

Exceeding rate limits returns a 429 status code with a message indicating when to retry. Rate limit headers including X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset are included in responses.

### 7.6 Data Encryption

Sensitive data including payout details in the companies table and personal identification information in passenger details must be encrypted at rest using AES-256. The encryption key is stored in environment variables, not in the codebase. Payment provider responses that may contain partial card information are stored encrypted.

HTTPS is mandatory for all environments, including development where self-signed certificates are accepted. HSTS headers force browsers to always use HTTPS. TLS version 1.2 or higher is required.

---

## PART EIGHT: DEPLOYMENT AND SETUP

### 8.1 Environment Configuration

All configuration must be stored in environment variables, never hardcoded. The .env file template includes variables for server port, API URL, frontend URL, database connection details, Redis connection details, JWT secrets and expiry times, storage configuration for development using local filesystem or production using S3, email SMTP settings, payment provider API keys, and cron schedule expressions.

For development, the storage type is set to local with a path to the uploads directory. For production, the storage type is set to S3 with endpoint, access key, secret key, bucket name, and region.

### 8.2 Docker Containerization

The backend Dockerfile uses Node twenty Alpine as base image for minimal size. It copies package files, installs production dependencies only, copies source code, exposes port five thousand, and runs the server. A multi-stage build is used to reduce final image size.

The frontend Dockerfile uses Node twenty Alpine as builder stage to compile the React application, then copies the compiled assets to an Nginx Alpine image for serving static files. Nginx configuration includes gzip compression, cache headers for static assets, and reverse proxy configuration for API and Socket.io requests.

The docker-compose file defines four services. The MySQL service uses MySQL eight image with environment variables for root password and database name, with persistent volume for data storage. The Redis service uses Redis seven Alpine image with persistent volume. The backend service builds from backend directory, depends on MySQL and Redis, and maps port five thousand. The frontend service builds from frontend directory, depends on backend, and maps port eighty.

### 8.3 Database Migrations and Seeders

Sequelize migrations manage database schema changes. Initial migration creates all tables defined in the schema section. Subsequent migrations handle schema updates without data loss. Migration files are timestamped and run in order.

Seeders populate initial data including roles, default currencies, and a demo company for testing. The seeder for roles creates the five system roles. The seeder for currencies creates TZS as base currency, plus USD and EUR for testing. The seeder for demo creates a sample company with a sample transport and a sample facility.

### 8.4 Production Build Optimization

The frontend production build uses Vite optimizations including code splitting, tree shaking, and minification. Route-based code splitting ensures that users only download the JavaScript needed for their current page. Chunk sizes are optimized to balance between initial load time and subsequent navigation speed.

The backend production build excludes development dependencies and uses process manager like PM2 for process monitoring and auto-restart. Logging is configured to write to files with rotation. Error tracking integration is prepared for services like Sentry.

### 8.5 Monitoring and Logging

Application logs include request logs with method, path, status code, and response time, error logs with stack traces, authentication logs with user and outcome, and payment logs with transaction identifiers. Logs are written to both console and rotating files.

Health check endpoints are implemented at health path for load balancer monitoring. The endpoint returns status up when the database and Redis connections are functional, and includes version information.

Performance monitoring includes response time tracking for API endpoints, database query time tracking through Sequelize logging, and memory usage monitoring. Alerts are configured for error rate spikes, high response times, and low available seat counts for popular journeys.

---

## PART NINE: DEVELOPMENT PRIORITY ORDER

### Phase One: Foundation

Start by creating the project structure for both backend and frontend. Set up the database connection and create all Sequelize models as defined in the schema section. Implement the authentication system with JWT tokens, including register, login, refresh, and logout endpoints. Create the user and company CRUD operations with role-based access control. Set up the Socket.io foundation with connection handling and room management. This phase should take approximately three days.

### Phase Two: Core Transport Domain

Implement transport types, transports, and seat layout generation algorithm. Create stations, routes, route-stations with sequencing. Implement sub-route creation and partial price calculation. Build timetables and the journey generation cron job that runs daily. Test the journey generation by creating sample timetables and verifying that journeys are created for the next thirty days. This phase should take approximately four days.

### Phase Three: Booking Engine

Implement the seat hold service with ten-minute expiry and cron job for releasing expired holds. Set up Socket.io handlers for seat selection, release, and broadcast events. Create the booking service with sub-route detection logic and partial pricing. Implement payment stub integration for testing. Build receipt PDF generation using Puppeteer. Create QR code ticket generation. This is the most critical phase and should take approximately five days.

### Phase Four: Facility Domain

Implement facility types, facilities, and seat layouts for non-transport resources. Create activities, activity schedules, and activity instance generation. Build the booking flow for facilities using the same hold and payment logic as transport. Implement unit-based selection for hotel rooms, parking spots, and restaurant tables rather than seat grids where appropriate. This phase should take approximately four days.

### Phase Five: Frontend Web Application

Build the authentication screens for login, registration, and password reset. Create the homepage with search functionality. Implement the six-step transport booking wizard with route selector, station selector, date selector, seat map component, passenger form, and payment page. Build the facility booking wizard with similar steps adapted for units. Create user dashboard showing my bookings and my tickets. Implement the receipt page with PDF download and QR code display. This phase should take approximately seven days.

### Phase Six: Admin and Company Panels

Build the company admin dashboard with statistics cards and charts. Implement transport and facility management interfaces for creating and editing resources. Create route and timetable management interfaces. Build staff management for company admins to assign and remove staff members. Implement the super admin panel for company approvals, user management, system settings, and audit log viewing. Build report generation for revenue and occupancy analytics. This phase should take approximately five days.

### Phase Seven: Features and Polish

Implement localization across eight languages including Swahili time conversion helper. Build the dark and light mode toggle with persistent preference. Implement currency switching with exchange rate calculations. Create the notification system for in-app, email, and push alerts. Implement role-based navigation menu generation. Ensure full responsive design across all devices. Add error handling and loading states throughout the application. Write unit tests for critical services and integration tests for API endpoints. This phase should take approximately seven days.

### Phase Eight: Deployment

Configure Docker containers for backend and frontend with docker-compose. Write database migration and seeder scripts. Set up environment variables for production. Optimize frontend build with code splitting. Configure Nginx reverse proxy with HTTPS. Set up monitoring with health check endpoints. Create API documentation using OpenAPI specification. Write user guide and deployment instructions. This phase should take approximately five days.

---

## PART TEN: FINAL INSTRUCTIONS TO THE AI

You are now ready to generate the complete codebase following this specification. You must generate every file listed in the structure sections. All code must be complete and production-ready with proper error handling, no placeholders or comments saying add your code here. All imports and exports must match exactly.

Include console log statements for debugging during development but mark them to be removed in production. Add comments explaining complex logic especially for seat generation algorithm, sub-route detection, Swahili time conversion, and seat hold expiry system. Ensure Sequelize models have proper associations and all required indexes are defined.

Implement all security measures including rate limiting, input validation, XSS protection, and SQL injection prevention. Make the frontend fully responsive for mobile, tablet, and desktop devices. Provide working docker-compose that runs the entire stack with proper dependencies.

Do not skip the seat hold expiry cron job, the journey generation cron job, the sub-route auto-detection logic, the Socket.io room-based broadcasting, the Swahili time conversion utility, or the exchange rate snapshot on bookings.

The output should be the complete codebase organized in the specified file structure. Start generating the codebase now, file by file, in the order specified in the development priority order beginning with Phase One Foundation.