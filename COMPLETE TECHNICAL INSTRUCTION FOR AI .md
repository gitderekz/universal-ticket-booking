# COMPLETE TECHNICAL INSTRUCTION FOR AI CODING ASSISTANT
## Full-Stack Booking System (Web + Backend Only)

**Project Start Date:** May 5, 2026  
**Target:** Frontend (React.js) + Backend (Node.js/Express) + Database (MySQL/MariaDB)  
**Excluded:** Mobile app (Flutter) - focus only on web platform

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Core Architecture & Concepts](#2-core-architecture--concepts)
3. [Database Schema (Complete)](#3-database-schema-complete)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Critical Business Logic](#6-critical-business-logic)
7. [Features Implementation](#7-features-implementation)
8. [Security Requirements](#8-security-requirements)
9. [Deployment & Setup](#9-deployment--setup)
10. [Development Priority Order](#10-development-priority-order)

---

## 1. PROJECT OVERVIEW

### 1.1 System Purpose
Build a **unified booking platform** supporting two main categories:

**A. TRANSPORT BOOKING (Seat-based)**
- Safari cars, mini-buses, buses, trains, aeroplanes, boats, ferries, ships
- Features: Routes, stations, sub-routes, timetables, seat maps with aisles
- Pricing: Full route or partial (start station to end station)

**B. FACILITY BOOKING (Seat/Spot/Unit-based)**
- Entertainment: Movie theatres, comedy clubs, fashion shows, stadiums
- Events: Conference halls, exhibitions
- Outdoor: Restaurant tables, picnic parks, parking lots
- Housing: Hotel rooms, rental houses, apartments
- Sports: Arenas (football, boxing, basketball, rugby, Olympics)

### 1.2 Core Concept Unification
Both categories use a **unified resource model**:
- **Resource** = Transport OR Facility
- **Event** = Journey (transport) OR Activity (facility)
- **SeatUnit** = Seat (transport/seat-based facility) OR Spot/Table/Room (unit-based facility)

### 1.3 Target Users & Roles

| Role | Permissions |
|------|-------------|
| **Developer** | Full system access, can see/do everything |
| **Super Admin** | Platform owner: manage all companies, approve registrations, system settings, audit logs |
| **Company Admin** | Manage their company: transports/facilities, routes/activities, staff, view reports |
| **Staff** | Manage assigned transports/routes/activities (scoped by company admin) |
| **Customer** | Book tickets, view bookings, download receipts, receive notifications |

### 1.4 Technical Stack

**Backend:**
- Node.js (v20+) with Express.js
- Sequelize ORM (v6+)
- MySQL 8.0+ or MariaDB 10.6+
- Socket.io (real-time seat updates)
- JWT for authentication (access + refresh tokens)
- Multer for file uploads
- Puppeteer for PDF receipt generation
- node-cron for scheduled jobs
- i18n for localization

**Frontend (Web):**
- React.js (v18+) with Vite
- React Router v6
- Redux Toolkit (state management)
- Axios (API client)
- Socket.io-client (real-time)
- Tailwind CSS (styling)
- i18next (internationalization)
- Recharts (dashboard analytics)
- jsPDF or react-pdf (receipt generation)

---

## 2. CORE ARCHITECTURE & CONCEPTS

### 2.1 Critical Design Patterns

**Unified Resource System:**
```javascript
// Polymorphic approach for transports and facilities
Resource (Transport | Facility)
  └── Event (Journey | ActivityInstance)
       └── SeatUnit (Seat | Spot | Table | Room)
```

**Seat Reservation with TTL (Time-To-Live):**
- User selects seat → Creates `seat_hold` record with 10-minute expiry
- Socket.io broadcasts "seat held" to all users viewing same journey
- Cron job runs every 30 seconds to release expired holds
- On payment success → Convert hold to permanent booking

**Journey Instance Pattern:**
```
Timetable (template) ──generates──> Journey (specific date)
Example: 
  Timetable: Bus A, Dar→Mwanza, departs 06:00 daily
  Generates: Journey #101 (May 10), Journey #102 (May 11), etc.
```

### 2.2 Swahili Time Conversion (Display Only)

**Rule:** Store all times in UTC. Convert for display only when locale is 'sw'.

**Conversion Logic:**
```javascript
function toSwahiliTime(utcDate) {
  const hour = utcDate.getUTCHours();
  const swahiliHour = ((hour + 6) % 12) || 12;
  
  const periods = {
    'usiku': [0,1,2,3,19,20,21,22,23],    // night
    'alfajiri': [4,5],                      // dawn
    'asubuhi': [6,7,8,9,10,11],            // morning
    'mchana': [12,13,14,15],               // afternoon
    'jioni': [16,17,18]                    // evening
  };
  
  let period = 'usiku';
  for (const [p, hours] of Object.entries(periods)) {
    if (hours.includes(hour)) { period = p; break; }
  }
  
  return `${swahiliHour}:00 ${period}`;
}

// Reference table (absolute mapping)
// 06:00 UTC = 12:00 asubuhi
// 10:00 UTC = 4:00 asubuhi
// 12:00 UTC = 6:00 mchana
// 16:00 UTC = 10:00 jioni
// 19:00 UTC = 1:00 usiku
```

### 2.3 Currency System

**Rule:** Store all prices in base currency (TZS) in database. Convert at display time.

**Exchange Rate Flow:**
1. Super admin sets exchange rates in `currencies` table
2. Frontend fetches rates on app load, stores in Redux
3. All prices displayed using format: `(price_in_TZS * exchange_rate).toLocaleString()`
4. Booking snapshot: Store `exchange_rate_at_booking` to preserve historical accuracy

### 2.4 Sub-Route Auto-Detection Logic

**Scenario:** User selects start station that is NOT the route origin

**Logic Flow:**
```javascript
async function handleRouteAndStations(selectedRouteId, startStationId, endStationId) {
  const route = await Route.findByPk(selectedRouteId, {
    include: ['routeStations']
  });
  
  // Check if start station matches route origin
  if (startStationId === route.origin_station_id) {
    // Use selected route as-is
    return { route, price: calculatePartialPrice(route, startStationId, endStationId) };
  }
  
  // Search for sub-route where:
  // 1. parent_route_id = selectedRouteId
  // 2. origin_station_id = startStationId
  // 3. endStationId exists in its routeStations
  
  const subRoute = await Route.findOne({
    where: {
      parent_route_id: selectedRouteId,
      origin_station_id: startStationId,
      is_sub_route: true
    },
    include: [{
      model: RouteStation,
      where: { station_id: endStationId },
      required: true
    }]
  });
  
  if (subRoute) {
    // Sub-route found - use it instead
    return { route: subRoute, price: subRoute.base_price };
  } else {
    // No sub-route - use main route but calculate partial price
    return { route, price: calculatePartialPrice(route, startStationId, endStationId) };
  }
}

function calculatePartialPrice(route, startStationId, endStationId) {
  const startStation = route.routeStations.find(rs => rs.station_id === startStationId);
  const endStation = route.routeStations.find(rs => rs.station_id === endStationId);
  
  if (!startStation || !endStation) throw new Error('Invalid stations');
  if (startStation.sequence_order >= endStation.sequence_order) {
    throw new Error('End station must be after start station');
  }
  
  return endStation.price_from_origin - startStation.price_from_origin;
}
```

---

## 3. DATABASE SCHEMA (COMPLETE)

### 3.1 Implementation Rules
- Use **UUID** for all primary keys (except junction tables with composite keys)
- Use **Sequelize** for all database interactions (no raw SQL)
- Implement **soft deletes** where appropriate (`deletedAt` column)
- Add **indexes** on all foreign keys and frequently queried fields
- Use **ENUM** types for status fields

### 3.2 Complete Table Structure

```sql
-- ============================================
-- CORE & AUTH TABLES
-- ============================================

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(5) DEFAULT 'sw',
    preferred_currency_id CHAR(36),
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions_json JSON,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- Insert default roles
INSERT INTO roles (id, name, slug, is_system) VALUES
    (UUID(), 'Developer', 'developer', TRUE),
    (UUID(), 'Super Admin', 'super_admin', TRUE),
    (UUID(), 'Company Admin', 'company_admin', TRUE),
    (UUID(), 'Staff', 'staff', TRUE),
    (UUID(), 'Customer', 'customer', TRUE);

CREATE TABLE user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    company_id CHAR(36) NULL,
    assigned_by CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role_company (user_id, role_id, company_id),
    INDEX idx_user (user_id),
    INDEX idx_company (company_id)
);

CREATE TABLE user_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

CREATE TABLE settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    group_name VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_group (group_name)
);

CREATE TABLE nav_menus (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_slug VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    path VARCHAR(255),
    parent_id CHAR(36) NULL,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    requires_permission VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES nav_menus(id) ON DELETE CASCADE,
    INDEX idx_role (role_slug),
    INDEX idx_parent (parent_id),
    INDEX idx_order (order_index)
);

CREATE TABLE currencies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5),
    exchange_rate_to_tzs DECIMAL(15,6) NOT NULL,
    is_base BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Insert base currency
INSERT INTO currencies (id, code, name, symbol, exchange_rate_to_tzs, is_base) VALUES
    (UUID(), 'TZS', 'Tanzanian Shilling', 'TSh', 1.000000, TRUE);

CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- ============================================
-- COMPANY MANAGEMENT
-- ============================================

CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    category ENUM('transport', 'entertainment', 'events', 'outdoor', 'housing', 'sports') NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'rejected') DEFAULT 'pending',
    verification_docs JSON,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    coordinates VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    payout_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    INDEX idx_owner (owner_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

CREATE TABLE company_staff (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role_in_company ENUM('admin', 'manager', 'operator', 'viewer') NOT NULL,
    permissions_override JSON,
    assigned_transport_ids JSON,
    assigned_facility_ids JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_staff (company_id, user_id),
    INDEX idx_company (company_id),
    INDEX idx_user (user_id),
    INDEX idx_active (is_active)
);

-- ============================================
-- TRANSPORT DOMAIN
-- ============================================

CREATE TABLE transport_types (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('land', 'water', 'air') NOT NULL,
    icon_url VARCHAR(500),
    description TEXT,
    requires_route BOOLEAN DEFAULT TRUE,
    requires_sitting_plan BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_slug (slug)
);

-- Insert common transport types
INSERT INTO transport_types (id, name, slug, category) VALUES
    (UUID(), 'Safari Car', 'safari-car', 'land'),
    (UUID(), 'Mini Bus', 'mini-bus', 'land'),
    (UUID(), 'Bus', 'bus', 'land'),
    (UUID(), 'Train', 'train', 'land'),
    (UUID(), 'Aeroplane', 'aeroplane', 'air'),
    (UUID(), 'Boat', 'boat', 'water'),
    (UUID(), 'Ferry', 'ferry', 'water'),
    (UUID(), 'Ship', 'ship', 'water');

CREATE TABLE transports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    transport_type_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    capacity INT,
    images JSON,
    features JSON,
    status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (transport_type_id) REFERENCES transport_types(id),
    INDEX idx_company (company_id),
    INDEX idx_type (transport_type_id),
    INDEX idx_registration (registration_number),
    INDEX idx_status (status)
);

CREATE TABLE seat_layouts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    layoutable_id CHAR(36) NOT NULL,
    layoutable_type ENUM('transport', 'facility') NOT NULL,
    layout_type ENUM('seat', 'spot', 'table', 'room', 'section', 'mixed') NOT NULL,
    config_json JSON NOT NULL,
    total_units INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_layoutable (layoutable_id, layoutable_type),
    INDEX idx_status (status)
);

CREATE TABLE seats (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seat_layout_id CHAR(36) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    unit_type ENUM('standard', 'window', 'aisle', 'wheelchair', 'operator', 'driver', 
                   'spot', 'table', 'room', 'suite', 'vip', 'economy', 'business') NOT NULL,
    row_number INT,
    column_number INT,
    metadata JSON,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seat_layout_id) REFERENCES seat_layouts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_layout_unit (seat_layout_id, unit_code),
    INDEX idx_layout (seat_layout_id),
    INDEX idx_type (unit_type),
    INDEX idx_status (status)
);

CREATE TABLE stations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    coordinates POINT,
    type ENUM('origin', 'destination', 'intermediate', 'terminal') DEFAULT 'intermediate',
    facilities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_city (city),
    INDEX idx_type (type),
    SPATIAL INDEX idx_coordinates (coordinates)
);

CREATE TABLE routes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    transport_id CHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    origin_station_id CHAR(36) NOT NULL,
    destination_station_id CHAR(36) NOT NULL,
    total_distance_km DECIMAL(10,2),
    base_price DECIMAL(12,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    is_sub_route BOOLEAN DEFAULT FALSE,
    parent_route_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (transport_id) REFERENCES transports(id) ON DELETE SET NULL,
    FOREIGN KEY (origin_station_id) REFERENCES stations(id),
    FOREIGN KEY (destination_station_id) REFERENCES stations(id),
    FOREIGN KEY (parent_route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_origin (origin_station_id),
    INDEX idx_destination (destination_station_id),
    INDEX idx_status (status),
    INDEX idx_parent (parent_route_id)
);

CREATE TABLE route_stations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    route_id CHAR(36) NOT NULL,
    station_id CHAR(36) NOT NULL,
    sequence_order INT NOT NULL,
    distance_from_origin_km DECIMAL(10,2),
    price_from_origin DECIMAL(12,2) NOT NULL,
    is_break_stop BOOLEAN DEFAULT FALSE,
    stop_duration_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id),
    UNIQUE KEY unique_route_station (route_id, station_id),
    INDEX idx_route (route_id),
    INDEX idx_station (station_id),
    INDEX idx_sequence (route_id, sequence_order)
);

CREATE TABLE timetables (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    route_id CHAR(36) NOT NULL,
    transport_id CHAR(36) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    frequency_type ENUM('once', 'daily', 'weekly', 'custom') DEFAULT 'daily',
    frequency_config JSON,
    effective_from DATE NOT NULL,
    effective_until DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (transport_id) REFERENCES transports(id),
    INDEX idx_route (route_id),
    INDEX idx_transport (transport_id),
    INDEX idx_effective (effective_from, effective_until),
    INDEX idx_status (status)
);

CREATE TABLE journeys (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    timetable_id CHAR(36) NULL,
    transport_id CHAR(36) NOT NULL,
    route_id CHAR(36) NOT NULL,
    journey_date DATE NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    status ENUM('scheduled', 'boarding', 'departed', 'delayed', 'cancelled', 'completed') DEFAULT 'scheduled',
    available_seats_count INT DEFAULT 0,
    booked_seats_count INT DEFAULT 0,
    held_seats_count INT DEFAULT 0,
    delay_minutes INT DEFAULT 0,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE SET NULL,
    FOREIGN KEY (transport_id) REFERENCES transports(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    INDEX idx_timetable (timetable_id),
    INDEX idx_transport (transport_id),
    INDEX idx_route (route_id),
    INDEX idx_date (journey_date),
    INDEX idx_status (status),
    INDEX idx_departure (departure_time),
    INDEX idx_available (available_seats_count)
);

-- ============================================
-- FACILITY DOMAIN (Non-Transport)
-- ============================================

CREATE TABLE facility_types (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('entertainment', 'events', 'outdoor', 'housing', 'sports') NOT NULL,
    layout_type ENUM('seats', 'units', 'mixed', 'none') NOT NULL,
    icon_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_slug (slug)
);

-- Insert common facility types
INSERT INTO facility_types (id, name, slug, category, layout_type) VALUES
    (UUID(), 'Movie Theatre', 'movie-theatre', 'entertainment', 'seats'),
    (UUID(), 'Conference Hall', 'conference-hall', 'events', 'seats'),
    (UUID(), 'Stadium', 'stadium', 'sports', 'seats'),
    (UUID(), 'Arena', 'arena', 'sports', 'seats'),
    (UUID(), 'Restaurant Table', 'restaurant-table', 'outdoor', 'units'),
    (UUID(), 'Parking Lot', 'parking-lot', 'outdoor', 'units'),
    (UUID(), 'Picnic Park', 'picnic-park', 'outdoor', 'units'),
    (UUID(), 'Hotel Room', 'hotel-room', 'housing', 'units'),
    (UUID(), 'Apartment', 'apartment', 'housing', 'units');

CREATE TABLE facilities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    facility_type_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    coordinates POINT,
    capacity INT,
    images JSON,
    amenities JSON,
    status ENUM('active', 'maintenance', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_type_id) REFERENCES facility_types(id),
    INDEX idx_company (company_id),
    INDEX idx_type (facility_type_id),
    INDEX idx_city (city),
    INDEX idx_status (status),
    SPATIAL INDEX idx_coordinates (coordinates)
);

CREATE TABLE activities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    facility_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type ENUM('event', 'session', 'programme', 'rental', 'showing') NOT NULL,
    category VARCHAR(50),
    base_price DECIMAL(12,2) NOT NULL,
    currency_id CHAR(36) NOT NULL,
    duration_minutes INT,
    images JSON,
    age_restriction VARCHAR(50),
    terms_conditions TEXT,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES currencies(id),
    INDEX idx_facility (facility_id),
    INDEX idx_type (activity_type),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

CREATE TABLE activity_schedules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    activity_id CHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    frequency_type ENUM('once', 'daily', 'weekly', 'custom') DEFAULT 'daily',
    frequency_config JSON,
    effective_from DATE NOT NULL,
    effective_until DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id),
    INDEX idx_effective (effective_from, effective_until),
    INDEX idx_status (status)
);

CREATE TABLE activity_instances (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    activity_schedule_id CHAR(36) NULL,
    activity_id CHAR(36) NOT NULL,
    instance_date DATE NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    available_units_count INT DEFAULT 0,
    booked_units_count INT DEFAULT 0,
    held_units_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_schedule_id) REFERENCES activity_schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    INDEX idx_schedule (activity_schedule_id),
    INDEX idx_activity (activity_id),
    INDEX idx_date (instance_date),
    INDEX idx_status (status)
);

-- ============================================
-- BOOKING & PAYMENT DOMAIN
-- ============================================

CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    user_id CHAR(36) NULL,
    company_id CHAR(36) NOT NULL,
    booking_type ENUM('transport', 'facility') NOT NULL,
    journey_id CHAR(36) NULL,
    activity_instance_id CHAR(36) NULL,
    status ENUM('pending', 'holding', 'confirmed', 'cancelled', 'refunded', 'completed', 'no_show') DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency_id CHAR(36) NOT NULL,
    exchange_rate_at_booking DECIMAL(15,6) NOT NULL,
    passenger_count INT DEFAULT 1,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_instance_id) REFERENCES activity_instances(id) ON DELETE SET NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(id),
    INDEX idx_code (booking_code),
    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_status (status),
    INDEX idx_booking_type (booking_type),
    INDEX idx_journey (journey_id),
    INDEX idx_activity (activity_instance_id),
    INDEX idx_expires (expires_at),
    INDEX idx_booked (booked_at)
);

CREATE TABLE booking_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    item_type ENUM('seat', 'spot', 'room', 'table', 'section') NOT NULL,
    item_code VARCHAR(50) NOT NULL,
    passenger_name VARCHAR(255),
    passenger_type ENUM('adult', 'child', 'infant', 'senior') DEFAULT 'adult',
    passenger_details JSON,
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_item (item_type, item_code)
);

CREATE TABLE seat_holds (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    journey_id CHAR(36) NULL,
    activity_instance_id CHAR(36) NULL,
    seat_code VARCHAR(50) NOT NULL,
    user_id CHAR(36) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    held_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status ENUM('holding', 'released', 'converted', 'expired') DEFAULT 'holding',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_instance_id) REFERENCES activity_instances(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_journey_seat (journey_id, seat_code),
    INDEX idx_activity_seat (activity_instance_id, seat_code),
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_expires (expires_at, status),
    INDEX idx_status (status)
);

CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    transaction_reference VARCHAR(255) UNIQUE NOT NULL,
    payment_method ENUM('airtel_money', 'mpesa', 'halopesa', 'yas_cash', 
                        'nbc_bank', 'nmb_bank', 'crdb_bank', 'visa', 'mastercard', 'paypal') NOT NULL,
    payment_provider VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    currency_id CHAR(36) NOT NULL,
    exchange_rate_at_payment DECIMAL(15,6) NOT NULL,
    provider_response JSON,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id),
    INDEX idx_booking (booking_id),
    INDEX idx_reference (transaction_reference),
    INDEX idx_status (status),
    INDEX idx_method (payment_method)
);

CREATE TABLE tickets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    ticket_code VARCHAR(30) UNIQUE NOT NULL,
    qr_code_data TEXT NOT NULL,
    qr_code_image_url VARCHAR(500),
    status ENUM('active', 'used', 'expired', 'cancelled') DEFAULT 'active',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP NULL,
    validated_by CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (validated_by) REFERENCES users(id),
    INDEX idx_booking (booking_id),
    INDEX idx_code (ticket_code),
    INDEX idx_status (status)
);

CREATE TABLE refund_requests (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    amount_requested DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
    processed_by CHAR(36) NULL,
    processed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- ============================================
-- NOTIFICATIONS & REVIEWS
-- ============================================

CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_via VARCHAR(50) DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id, is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    booking_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    reply TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_company (company_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional performance indexes
CREATE INDEX idx_journeys_date_status ON journeys(journey_date, status);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX idx_seat_holds_expires_status ON seat_holds(expires_at, status);
CREATE INDEX idx_route_stations_price ON route_stations(route_id, price_from_origin);
CREATE INDEX idx_transports_company_status ON transports(company_id, status);
CREATE INDEX idx_facilities_company_status ON facilities(company_id, status);
```

### 3.3 Sequelize Model Associations

```javascript
// models/index.js - Define all associations

// User associations
User.hasMany(UserRole, { foreignKey: 'user_id' });
User.hasMany(UserSession, { foreignKey: 'user_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });
User.belongsToMany(Company, { through: CompanyStaff, foreignKey: 'user_id' });

// Company associations
Company.hasMany(Transport, { foreignKey: 'company_id' });
Company.hasMany(Facility, { foreignKey: 'company_id' });
Company.hasMany(Route, { foreignKey: 'company_id' });
Company.hasMany(Station, { foreignKey: 'company_id' });
Company.hasMany(Booking, { foreignKey: 'company_id' });
Company.belongsToMany(User, { through: CompanyStaff, foreignKey: 'company_id' });

// Transport associations
Transport.belongsTo(Company, { foreignKey: 'company_id' });
Transport.belongsTo(TransportType, { foreignKey: 'transport_type_id' });
Transport.hasMany(Journey, { foreignKey: 'transport_id' });
Transport.hasMany(SeatLayout, { 
  foreignKey: 'layoutable_id',
  constraints: false,
  scope: { layoutable_type: 'transport' }
});

// Route associations
Route.belongsTo(Company, { foreignKey: 'company_id' });
Route.belongsTo(Transport, { foreignKey: 'transport_id' });
Route.belongsTo(Station, { as: 'origin', foreignKey: 'origin_station_id' });
Route.belongsTo(Station, { as: 'destination', foreignKey: 'destination_station_id' });
Route.hasMany(RouteStation, { foreignKey: 'route_id' });
Route.hasMany(Timetable, { foreignKey: 'route_id' });
Route.hasMany(Journey, { foreignKey: 'route_id' });
Route.belongsTo(Route, { as: 'parent', foreignKey: 'parent_route_id' });
Route.hasMany(Route, { as: 'subRoutes', foreignKey: 'parent_route_id' });

// Journey associations
Journey.belongsTo(Timetable, { foreignKey: 'timetable_id' });
Journey.belongsTo(Transport, { foreignKey: 'transport_id' });
Journey.belongsTo(Route, { foreignKey: 'route_id' });
Journey.hasMany(Booking, { foreignKey: 'journey_id' });
Journey.hasMany(SeatHold, { foreignKey: 'journey_id' });

// SeatLayout polymorphic
SeatLayout.hasMany(Seat, { foreignKey: 'seat_layout_id' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Company, { foreignKey: 'company_id' });
Booking.belongsTo(Journey, { foreignKey: 'journey_id' });
Booking.belongsTo(ActivityInstance, { foreignKey: 'activity_instance_id' });
Booking.hasMany(BookingItem, { foreignKey: 'booking_id' });
Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Booking.hasOne(Ticket, { foreignKey: 'booking_id' });

// SeatHold polymorphic
SeatHold.belongsTo(Journey, { foreignKey: 'journey_id' });
SeatHold.belongsTo(ActivityInstance, { foreignKey: 'activity_instance_id' });
SeatHold.belongsTo(User, { foreignKey: 'user_id' });
```

---

## 4. BACKEND IMPLEMENTATION

### 4.1 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── socket.js
│   │   └── multer.js
│   ├── migrations/
│   ├── seeders/
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Transport.js
│   │   ├── Route.js
│   │   ├── Journey.js
│   │   ├── Booking.js
│   │   ├── SeatHold.js
│   │   └── ... (all models)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── companyController.js
│   │   ├── transportController.js
│   │   ├── routeController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── adminController.js
│   │   └── reportController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── seatHoldService.js
│   │   ├── bookingService.js
│   │   ├── priceCalculationService.js
│   │   ├── journeyGeneratorService.js
│   │   ├── notificationService.js
│   │   ├── receiptService.js
│   │   ├── paymentService.js
│   │   └── currencyService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── companies.js
│   │   │   ├── transports.js
│   │   │   ├── routes.js
│   │   │   ├── facilities.js
│   │   │   ├── bookings.js
│   │   │   ├── payments.js
│   │   │   ├── admin.js
│   │   │   └── public.js
│   │   └── index.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── bookingValidator.js
│   │   └── ... (Joi schemas)
│   ├── utils/
│   │   ├── swahiliTime.js
│   │   ├── seatGenerator.js
│   │   ├── pdfGenerator.js
│   │   ├── qrGenerator.js
│   │   └── helpers.js
│   ├── jobs/
│   │   ├── releaseExpiredHolds.js
│   │   ├── generateJourneys.js
│   │   ├── sendReminders.js
│   │   └── index.js
│   ├── sockets/
│   │   ├── index.js
│   │   └── seatHandlers.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── sw.json
│   │   ├── zh.json
│   │   ├── ru.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   ├── de.json
│   │   └── pt.json
│   └── app.js
├── uploads/
├── tests/
├── .env
├── .env.example
├── package.json
└── server.js
```

### 4.2 Environment Variables (.env.example)

```bash
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=booking_system
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# File Storage (using local for development)
STORAGE_TYPE=local
STORAGE_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@bookingsystem.com

# Payment Providers (Stub for development)
PAYMENT_MODE=stub
FLUTTERWAVE_PUBLIC_KEY=test_public_key
FLUTTERWAVE_SECRET_KEY=test_secret_key

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173

# Cron Jobs
CRON_RELEASE_HOLDS=*/30 * * * * *
CRON_GENERATE_JOURNEYS=0 1 * * *
CRON_SEND_REMINDERS=0 */2 * * * *
```

### 4.3 Core Service Implementations

#### A. Seat Hold Service (Critical)

```javascript
// services/seatHoldService.js
const { Sequelize, Op } = require('sequelize');
const { SeatHold, Journey, ActivityInstance } = require('../models');

class SeatHoldService {
  constructor(io) {
    this.io = io;
  }

  async holdSeats({ journeyId, activityInstanceId, seatCodes, userId, sessionId }) {
    const holdDurationMinutes = 10;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
    
    // Determine entity type
    const entityType = journeyId ? 'journey' : 'activity';
    const entityId = journeyId || activityInstanceId;
    
    // Check if seats are already held or booked
    const existingHolds = await SeatHold.findAll({
      where: {
        [entityType === 'journey' ? 'journey_id' : 'activity_instance_id']: entityId,
        seat_code: { [Op.in]: seatCodes },
        status: 'holding',
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (existingHolds.length > 0) {
      const heldSeats = existingHolds.map(h => h.seat_code);
      throw new Error(`Seats already held: ${heldSeats.join(', ')}`);
    }
    
    // Create holds in transaction
    const holds = await Sequelize.transaction(async (t) => {
      const createdHolds = [];
      for (const seatCode of seatCodes) {
        const hold = await SeatHold.create({
          journey_id: journeyId || null,
          activity_instance_id: activityInstanceId || null,
          seat_code: seatCode,
          user_id: userId,
          session_id: sessionId,
          expires_at: expiresAt,
          status: 'holding'
        }, { transaction: t });
        createdHolds.push(hold);
      }
      return createdHolds;
    });
    
    // Broadcast to all users viewing this journey/activity
    const room = entityType === 'journey' ? `journey:${journeyId}` : `activity:${activityInstanceId}`;
    this.io.to(room).emit('seats-held', {
      seatCodes,
      expiresAt,
      heldBy: userId
    });
    
    return { holds, expiresAt };
  }
  
  async releaseExpiredHolds() {
    const now = new Date();
    const expiredHolds = await SeatHold.findAll({
      where: {
        expires_at: { [Op.lt]: now },
        status: 'holding'
      }
    });
    
    for (const hold of expiredHolds) {
      await hold.update({ status: 'expired' });
      
      const room = hold.journey_id ? `journey:${hold.journey_id}` : `activity:${hold.activity_instance_id}`;
      this.io.to(room).emit('seats-released', {
        seatCodes: [hold.seat_code]
      });
    }
    
    return expiredHolds.length;
  }
  
  async convertHoldsToBooking(holdIds, bookingId) {
    await SeatHold.update(
      { status: 'converted' },
      { where: { id: { [Op.in]: holdIds }, status: 'holding' } }
    );
  }
}

module.exports = SeatHoldService;
```

#### B. Booking Service with Sub-route Logic

```javascript
// services/bookingService.js
const { Sequelize } = require('sequelize');
const { Booking, Route, RouteStation, Journey, PriceCalculationService } = require('../models');
const crypto = require('crypto');

class BookingService {
  
  async createTransportBooking({
    userId,
    journeyId,
    seatCodes,
    startStationId,
    endStationId,
    passengerDetails,
    contactInfo
  }) {
    // Get journey with route and transport
    const journey = await Journey.findByPk(journeyId, {
      include: ['route', 'transport']
    });
    
    if (!journey) throw new Error('Journey not found');
    if (journey.status !== 'scheduled') throw new Error('Journey not available');
    
    const route = journey.route;
    
    // Handle sub-route detection
    const { effectiveRoute, pricePerSeat } = await this.resolveRouteAndPrice({
      route,
      startStationId,
      endStationId,
      passengerCount: seatCodes.length
    });
    
    // Calculate total amount
    const totalAmount = pricePerSeat * seatCodes.length;
    
    // Generate unique booking code
    const bookingCode = this.generateBookingCode();
    
    // Create booking
    const booking = await Booking.create({
      booking_code: bookingCode,
      user_id: userId,
      company_id: route.company_id,
      booking_type: 'transport',
      journey_id: journeyId,
      status: 'holding',
      total_amount: totalAmount,
      currency_id: 'TZS_BASE_ID', // Fetch from settings
      exchange_rate_at_booking: 1.0,
      passenger_count: seatCodes.length,
      contact_name: contactInfo.name,
      contact_phone: contactInfo.phone,
      contact_email: contactInfo.email,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    // Create booking items for each seat
    for (let i = 0; i < seatCodes.length; i++) {
      await BookingItem.create({
        booking_id: booking.id,
        item_type: 'seat',
        item_code: seatCodes[i],
        passenger_name: passengerDetails[i]?.name,
        passenger_type: passengerDetails[i]?.type || 'adult',
        passenger_details: passengerDetails[i],
        unit_price: pricePerSeat
      });
    }
    
    return booking;
  }
  
  async resolveRouteAndPrice({ route, startStationId, endStationId, passengerCount }) {
    // Get route stations ordered by sequence
    const routeStations = await RouteStation.findAll({
      where: { route_id: route.id },
      order: [['sequence_order', 'ASC']],
      include: ['station']
    });
    
    const startStation = routeStations.find(rs => rs.station_id === startStationId);
    const endStation = routeStations.find(rs => rs.station_id === endStationId);
    
    if (!startStation || !endStation) {
      throw new Error('Invalid stations for this route');
    }
    
    // Check if start is origin
    if (startStation.sequence_order === 1) {
      // Full route or partial from origin
      const pricePerSeat = endStation.price_from_origin;
      return { effectiveRoute: route, pricePerSeat };
    }
    
    // Search for sub-route
    const subRoute = await Route.findOne({
      where: {
        parent_route_id: route.id,
        origin_station_id: startStationId,
        is_sub_route: true,
        status: 'active'
      },
      include: [{
        model: RouteStation,
        where: { station_id: endStationId },
        required: true
      }]
    });
    
    if (subRoute) {
      return { effectiveRoute: subRoute, pricePerSeat: subRoute.base_price };
    }
    
    // No sub-route - calculate partial price
    const pricePerSeat = endStation.price_from_origin - startStation.price_from_origin;
    if (pricePerSeat <= 0) {
      throw new Error('End station must be after start station');
    }
    
    return { effectiveRoute: route, pricePerSeat };
  }
  
  generateBookingCode() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
    return `BKG-${year}${month}${day}-${random}`;
  }
}

module.exports = BookingService;
```

#### C. Journey Generator Cron Job

```javascript
// jobs/generateJourneys.js
const { CronJob } = require('cron');
const { Timetable, Journey, Transport, Route, Op } = require('../models');

class JourneyGenerator {
  static async generateNext30Days() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const activeTimetables = await Timetable.findAll({
      where: {
        status: 'active',
        effective_from: { [Op.lte]: thirtyDaysLater },
        [Op.or]: [
          { effective_until: { [Op.gte]: today } },
          { effective_until: null }
        ]
      },
      include: ['route', 'transport']
    });
    
    for (const timetable of activeTimetables) {
      const daysToGenerate = this.getDaysForTimetable(timetable, today, thirtyDaysLater);
      
      for (const date of daysToGenerate) {
        const departureDateTime = new Date(date);
        const [departureHours, departureMinutes] = timetable.departure_time.split(':');
        departureDateTime.setHours(parseInt(departureHours), parseInt(departureMinutes), 0);
        
        const arrivalDateTime = new Date(date);
        const [arrivalHours, arrivalMinutes] = timetable.arrival_time.split(':');
        arrivalDateTime.setHours(parseInt(arrivalHours), parseInt(arrivalMinutes), 0);
        
        // Check if journey already exists
        const existing = await Journey.findOne({
          where: {
            timetable_id: timetable.id,
            journey_date: date
          }
        });
        
        if (!existing) {
          await Journey.create({
            timetable_id: timetable.id,
            transport_id: timetable.transport_id,
            route_id: timetable.route_id,
            journey_date: date,
            departure_time: departureDateTime,
            arrival_time: arrivalDateTime,
            status: 'scheduled',
            available_seats_count: timetable.transport.capacity || 0,
            booked_seats_count: 0,
            held_seats_count: 0
          });
        }
      }
    }
  }
  
  static getDaysForTimetable(timetable, startDate, endDate) {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      let includeDay = false;
      
      switch (timetable.frequency_type) {
        case 'daily':
          includeDay = true;
          break;
        case 'weekly':
          const dayOfWeek = current.getDay();
          includeDay = timetable.frequency_config?.days?.includes(dayOfWeek) || false;
          break;
        case 'once':
          const sameDate = current.toDateString() === new Date(timetable.effective_from).toDateString();
          includeDay = sameDate;
          break;
        default:
          includeDay = true;
      }
      
      if (includeDay) {
        days.push(new Date(current));
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }
}

// Schedule job to run daily at 1 AM
const job = new CronJob('0 1 * * *', async () => {
  console.log('Generating journeys for next 30 days...');
  await JourneyGenerator.generateNext30Days();
  console.log('Journey generation complete');
});

module.exports = { JourneyGenerator, job };
```

### 4.4 API Endpoints (Complete List)

```javascript
// routes/v1/auth.js
router.post('/register', authValidator.register, authController.register);
router.post('/login', authValidator.login, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authValidator.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authValidator.resetPassword, authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);

// routes/v1/users.js
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, authValidator.updateProfile, userController.updateProfile);
router.get('/me/bookings', authMiddleware, userController.getMyBookings);
router.get('/me/bookings/:id', authMiddleware, userController.getBookingDetail);
router.get('/me/tickets', authMiddleware, userController.getMyTickets);
router.get('/me/notifications', authMiddleware, userController.getNotifications);
router.put('/me/notifications/:id/read', authMiddleware, userController.markNotificationRead);

// routes/v1/companies.js (Company Admin only)
router.post('/', authMiddleware, requireRole('company_admin'), companyValidator.create, companyController.create);
router.get('/my', authMiddleware, requireRole('company_admin', 'staff'), companyController.getMyCompany);
router.put('/:id', authMiddleware, requireRole('company_admin'), companyValidator.update, companyController.update);
router.post('/:id/staff', authMiddleware, requireRole('company_admin'), companyValidator.addStaff, companyController.addStaff);
router.get('/:id/staff', authMiddleware, requireRole('company_admin'), companyController.getStaff);
router.put('/:id/staff/:userId', authMiddleware, requireRole('company_admin'), companyController.updateStaff);
router.delete('/:id/staff/:userId', authMiddleware, requireRole('company_admin'), companyController.removeStaff);
router.get('/:id/dashboard-stats', authMiddleware, requireRole('company_admin', 'staff'), companyController.getDashboardStats);
router.get('/:id/reports/revenue', authMiddleware, requireRole('company_admin'), companyController.getRevenueReport);

// routes/v1/transports.js
router.post('/', authMiddleware, requireRole('company_admin'), transportValidator.create, transportController.create);
router.get('/', transportController.getAllPublic); // Public
router.get('/:id', transportController.getById); // Public
router.put('/:id', authMiddleware, requireRole('company_admin'), transportValidator.update, transportController.update);
router.delete('/:id', authMiddleware, requireRole('company_admin'), transportController.delete);
router.post('/:id/seat-layout', authMiddleware, requireRole('company_admin'), transportValidator.createSeatLayout, transportController.createSeatLayout);
router.get('/:id/seats', transportController.getSeats); // Public

// routes/v1/routes.js
router.post('/', authMiddleware, requireRole('company_admin'), routeValidator.create, routeController.create);
router.get('/', routeController.getAllPublic); // Public
router.get('/:id', routeController.getById); // Public
router.put('/:id', authMiddleware, requireRole('company_admin'), routeValidator.update, routeController.update);
router.delete('/:id', authMiddleware, requireRole('company_admin'), routeController.delete);
router.post('/:id/stations', authMiddleware, requireRole('company_admin'), routeController.addStations);
router.get('/:id/stations', routeController.getStations); // Public
router.post('/:id/sub-routes', authMiddleware, requireRole('company_admin'), routeController.createSubRoute);
router.get('/:id/sub-routes', routeController.getSubRoutes); // Public

// routes/v1/bookings.js (CRITICAL)
router.post('/hold-seats', authMiddleware, bookingValidator.holdSeats, bookingController.holdSeats);
router.post('/', authMiddleware, bookingValidator.createBooking, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBooking);
router.put('/:id/cancel', authMiddleware, bookingValidator.cancel, bookingController.cancelBooking);
router.post('/:id/payment-init', authMiddleware, bookingController.initPayment);
router.post('/:id/payment-verify', authMiddleware, bookingController.verifyPayment);
router.get('/:id/receipt', authMiddleware, bookingController.getReceipt);
router.post('/:id/regenerate-receipt', authMiddleware, bookingController.regenerateReceipt);
router.post('/guest', bookingValidator.guestBooking, bookingController.createGuestBooking);

// routes/v1/admin.js (Super Admin only)
router.use(authMiddleware, requireRole('super_admin', 'developer'));
router.get('/companies/pending', adminController.getPendingCompanies);
router.put('/companies/:id/approve', adminController.approveCompany);
router.put('/companies/:id/reject', adminController.rejectCompany);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/bookings', adminController.getAllBookings);
router.get('/reports/platform', adminController.getPlatformReport);
router.put('/currencies/:id/rate', adminValidator.updateCurrencyRate, adminController.updateCurrencyRate);
router.get('/audit-logs', adminController.getAuditLogs);
router.put('/settings', adminController.updateSettings);
```

### 4.5 Socket.io Implementation

```javascript
// sockets/index.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { SeatHoldService } = require('../services');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));
      socket.userId = decoded.userId;
      next();
    });
  });
  
  const seatHoldService = new SeatHoldService(io);
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join journey room for live seat updates
    socket.on('join-journey', async (journeyId) => {
      socket.join(`journey:${journeyId}`);
      
      // Send current seat map with hold status
      const seatMap = await getSeatMapWithHolds(journeyId);
      socket.emit('seat-map', seatMap);
    });
    
    socket.on('join-activity', async (activityInstanceId) => {
      socket.join(`activity:${activityInstanceId}`);
      const seatMap = await getActivitySeatMap(activityInstanceId);
      socket.emit('seat-map', seatMap);
    });
    
    // User selects a seat
    socket.on('select-seat', async ({ journeyId, activityInstanceId, seatCode }) => {
      try {
        const result = await seatHoldService.holdSeats({
          journeyId,
          activityInstanceId,
          seatCodes: [seatCode],
          userId: socket.userId,
          sessionId: socket.id
        });
        
        const room = journeyId ? `journey:${journeyId}` : `activity:${activityInstanceId}`;
        socket.to(room).emit('seat-held', {
          seatCode,
          expiresAt: result.expiresAt,
          heldBy: socket.userId
        });
        
        socket.emit('seat-selected', {
          success: true,
          holdId: result.holds[0].id,
          expiresAt: result.expiresAt
        });
      } catch (error) {
        socket.emit('seat-error', { seatCode, message: error.message });
      }
    });
    
    // User releases a seat
    socket.on('release-seat', async ({ journeyId, activityInstanceId, seatCode }) => {
      await SeatHold.destroy({
        where: {
          [journeyId ? 'journey_id' : 'activity_instance_id']: journeyId || activityInstanceId,
          seat_code: seatCode,
          user_id: socket.userId,
          session_id: socket.id,
          status: 'holding'
        }
      });
      
      const room = journeyId ? `journey:${journeyId}` : `activity:${activityInstanceId}`;
      socket.to(room).emit('seat-released', { seatCode });
    });
    
    // Leave room
    socket.on('leave-journey', (journeyId) => {
      socket.leave(`journey:${journeyId}`);
    });
    
    socket.on('leave-activity', (activityInstanceId) => {
      socket.leave(`activity:${activityInstanceId}`);
    });
    
    // Clean up on disconnect
    socket.on('disconnect', async () => {
      // Release all holds by this session after 30 seconds
      setTimeout(async () => {
        await SeatHold.update(
          { status: 'released' },
          {
            where: {
              session_id: socket.id,
              status: 'holding',
              expires_at: { [Op.gt]: new Date() }
            }
          }
        );
      }, 30000);
    });
  });
  
  return io;
};
```

---

## 5. FRONTEND IMPLEMENTATION

### 5.1 Project Structure

```
frontend/
├── public/
│   └── locales/
│       ├── en.json
│       ├── sw.json
│       ├── zh.json
│       ├── ru.json
│       ├── es.json
│       ├── fr.json
│       ├── de.json
│       └── pt.json
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── booking/
│   │   │   ├── SeatMap.jsx
│   │   │   ├── SeatMapV2.jsx (with Socket.io)
│   │   │   ├── RouteSelector.jsx
│   │   │   ├── StationSelector.jsx
│   │   │   ├── DateSelector.jsx
│   │   │   ├── PassengerForm.jsx
│   │   │   ├── PaymentWidget.jsx
│   │   │   └── BookingSummary.jsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── PopularTickets.jsx
│   │   └── maps/
│   │       ├── SeatGrid.jsx
│   │       └── UnitList.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── CurrencyContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useCurrency.js
│   │   ├── useNotification.js
│   │   └── useLocalStorage.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── TransportDetail.jsx
│   │   │   └── FacilityDetail.jsx
│   │   ├── booking/
│   │   │   ├── TransportBookingFlow.jsx
│   │   │   ├── FacilityBookingFlow.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── ReceiptPage.jsx
│   │   ├── user/
│   │   │   ├── Profile.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── MyTickets.jsx
│   │   │   └── Notifications.jsx
│   │   ├── company/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transports.jsx
│   │   │   ├── TransportForm.jsx
│   │   │   ├── Routes.jsx
│   │   │   ├── RouteForm.jsx
│   │   │   ├── Timetables.jsx
│   │   │   ├── Staff.jsx
│   │   │   └── Reports.jsx
│   │   └── admin/
│   │       ├── Companies.jsx
│   │       ├── Users.jsx
│   │       ├── Settings.jsx
│   │       └── AuditLogs.jsx
│   ├── services/
│   │   ├── api.js (axios instance)
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── transportService.js
│   │   ├── facilityService.js
│   │   └── adminService.js
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── bookingSlice.js
│   │   │   ├── searchSlice.js
│   │   │   ├── uiSlice.js
│   │   │   └── currencySlice.js
│   │   └── store.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── swahiliTime.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env
```

### 5.2 Critical Frontend Components

#### A. SeatMap Component with Socket.io

```jsx
// components/booking/SeatMapV2.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

const SeatMapV2 = ({ journeyId, activityInstanceId, onSeatsSelected }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdExpiry, setHoldExpiry] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const entityId = journeyId || activityInstanceId;
  const entityType = journeyId ? 'journey' : 'activity';
  
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Join room
    socket.emit(`join-${entityType}`, entityId);
    
    // Listen for seat map
    socket.on('seat-map', (seatMap) => {
      setSeats(seatMap);
    });
    
    // Listen for seats held by others
    socket.on('seat-held', ({ seatCode, expiresAt, heldBy }) => {
      if (heldBy !== user?.id) {
        setSeats(prev => prev.map(seat =>
          seat.code === seatCode 
            ? { ...seat, status: 'held', heldUntil: expiresAt }
            : seat
        ));
      }
    });
    
    // Listen for seats released
    socket.on('seat-released', ({ seatCode }) => {
      setSeats(prev => prev.map(seat =>
        seat.code === seatCode 
          ? { ...seat, status: 'available', heldUntil: null }
          : seat
      ));
    });
    
    // Listen for own seat selection confirmation
    socket.on('seat-selected', ({ success, holdId, expiresAt }) => {
      if (success) {
        setHoldExpiry(expiresAt);
        startCountdown(expiresAt);
      }
    });
    
    socket.on('seat-error', ({ seatCode, message }) => {
      toast.error(`Seat ${seatCode}: ${message}`);
      setSelectedSeats(prev => prev.filter(s => s !== seatCode));
    });
    
    return () => {
      socket.emit(`leave-${entityType}`, entityId);
      socket.off('seat-map');
      socket.off('seat-held');
      socket.off('seat-released');
      socket.off('seat-selected');
      socket.off('seat-error');
    };
  }, [socket, isConnected, entityId, entityType]);
  
  const startCountdown = (expiryDate) => {
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diff = expiry - now;
      
      if (diff <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setHoldExpiry(null);
        setSelectedSeats([]);
        toast.warning('Seat hold expired. Please select again.');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  };
  
  const handleSeatClick = (seat) => {
    if (seat.status === 'taken' || seat.status === 'held') {
      toast.error(`Seat ${seat.code} is not available`);
      return;
    }
    
    if (selectedSeats.includes(seat.code)) {
      // Release seat
      socket.emit('release-seat', {
        [journeyId ? 'journeyId' : 'activityInstanceId']: entityId,
        seatCode: seat.code
      });
      setSelectedSeats(prev => prev.filter(s => s !== seat.code));
    } else {
      // Select seat
      socket.emit('select-seat', {
        [journeyId ? 'journeyId' : 'activityInstanceId']: entityId,
        seatCode: seat.code
      });
      setSelectedSeats(prev => [...prev, seat.code]);
      onSeatsSelected([...selectedSeats, seat.code]);
    }
  };
  
  const getSeatColor = (seat) => {
    if (seat.status === 'taken') return 'bg-red-600 cursor-not-allowed';
    if (seat.status === 'held') return 'bg-gray-500 cursor-not-allowed';
    if (selectedSeats.includes(seat.code)) return 'bg-orange-500 hover:bg-orange-600';
    if (seat.unit_type === 'driver' || seat.unit_type === 'operator') return 'bg-yellow-500 cursor-not-allowed';
    if (seat.unit_type === 'wheelchair') return 'bg-green-600';
    return 'bg-blue-600 hover:bg-blue-700 cursor-pointer';
  };
  
  // Render grid based on seating pattern
  const renderGrid = () => {
    // Group seats by row
    const rows = seats.reduce((acc, seat) => {
      if (!acc[seat.row_number]) acc[seat.row_number] = [];
      acc[seat.row_number].push(seat);
      return acc;
    }, {});
    
    return Object.entries(rows).map(([rowNum, rowSeats]) => (
      <div key={rowNum} className="flex justify-center gap-2 mb-2">
        <div className="text-sm font-bold w-8 text-center">{rowNum}</div>
        {rowSeats.map(seat => (
          <button
            key={seat.code}
            onClick={() => handleSeatClick(seat)}
            className={`w-12 h-12 rounded-lg text-white font-bold transition-colors ${getSeatColor(seat)}`}
            disabled={seat.status === 'taken' || seat.status === 'held' || seat.unit_type === 'driver'}
            title={`${seat.code} - ${seat.unit_type}`}
          >
            {seat.code}
          </button>
        ))}
      </div>
    ));
  };
  
  return (
    <div className="seat-map-container">
      {countdown && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700 font-bold">
            ⏰ Hold expires in: {countdown}
          </p>
        </div>
      )}
      
      <div className="legend flex gap-4 mb-4 justify-center">
        <div className="flex items-center"><div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>Available</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>Selected</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-red-600 rounded mr-2"></div>Taken</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>Held</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>Driver/Operator</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-green-600 rounded mr-2"></div>Wheelchair</div>
      </div>
      
      <div className="bus-layout bg-gray-100 p-6 rounded-lg inline-block w-full">
        <div className="text-center mb-4 font-bold">🚌 FRONT OF VEHICLE 🚌</div>
        {renderGrid()}
        <div className="text-center mt-4 font-bold">🚌 BACK OF VEHICLE 🚌</div>
      </div>
    </div>
  );
};

export default SeatMapV2;
```

#### B. Transport Booking Flow (Multi-step Wizard)

```jsx
// pages/booking/TransportBookingFlow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentBooking } from '../../store/slices/bookingSlice';
import SeatMapV2 from '../../components/booking/SeatMapV2';
import RouteSelector from '../../components/booking/RouteSelector';
import StationSelector from '../../components/booking/StationSelector';
import DateSelector from '../../components/booking/DateSelector';
import PassengerForm from '../../components/booking/PassengerForm';
import PaymentWidget from '../../components/booking/PaymentWidget';
import bookingService from '../../services/bookingService';

const steps = ['Select Route', 'Select Stations', 'Select Date', 'Select Seats', 'Passenger Details', 'Payment'];

const TransportBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    transportType: null,
    transport: null,
    route: null,
    startStation: null,
    endStation: null,
    journey: null,
    selectedSeats: [],
    passengers: [],
    contactInfo: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleBookingComplete = async (paymentResult) => {
    setIsSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        ...bookingData,
        paymentResult
      });
      
      dispatch(setCurrentBooking(booking));
      navigate(`/booking/receipt/${booking.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <RouteSelector
            transportType={bookingData.transportType}
            onSelect={(route, transport) => {
              updateBookingData({ route, transport });
              nextStep();
            }}
          />
        );
      case 1:
        return (
          <StationSelector
            route={bookingData.route}
            onSelect={(startStation, endStation) => {
              updateBookingData({ startStation, endStation });
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <DateSelector
            route={bookingData.route}
            transport={bookingData.transport}
            startStation={bookingData.startStation}
            endStation={bookingData.endStation}
            onSelect={(journey) => {
              updateBookingData({ journey });
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>
            <SeatMapV2
              journeyId={bookingData.journey.id}
              onSeatsSelected={(seats) => updateBookingData({ selectedSeats: seats })}
            />
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-2 bg-gray-500 rounded">Back</button>
              <button 
                onClick={nextStep} 
                disabled={bookingData.selectedSeats.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Continue ({bookingData.selectedSeats.length} seats)
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <PassengerForm
            seatCount={bookingData.selectedSeats.length}
            onComplete={(passengers, contactInfo) => {
              updateBookingData({ passengers, contactInfo });
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <PaymentWidget
            bookingData={bookingData}
            onPaymentComplete={handleBookingComplete}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex-1 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className={`text-sm mt-2 ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default TransportBookingFlow;
```

### 5.3 Redux Store Configuration

```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### 5.4 Localization Setup (i18n)

```javascript
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const enTranslations = {
  common: {
    book_now: 'Book Now',
    search: 'Search',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    profile: 'Profile',
    bookings: 'My Bookings',
    tickets: 'My Tickets'
  },
  booking: {
    select_route: 'Select Route',
    select_stations: 'Select Stations',
    select_date: 'Select Date & Time',
    select_seats: 'Select Seats',
    passenger_details: 'Passenger Details',
    payment: 'Payment',
    origin: 'Origin',
    destination: 'Destination',
    departure: 'Departure',
    arrival: 'Arrival',
    seat: 'Seat',
    total: 'Total',
    confirm_booking: 'Confirm Booking'
  },
  seat: {
    available: 'Available',
    taken: 'Taken',
    selected: 'Selected',
    held: 'Held by another user',
    driver: 'Driver/Operator',
    wheelchair: 'Wheelchair Accessible'
  },
  errors: {
    required: 'This field is required',
    invalid_email: 'Invalid email address',
    invalid_phone: 'Invalid phone number',
    seat_unavailable: 'Seat is no longer available',
    payment_failed: 'Payment failed. Please try again.'
  }
};

// Swahili translations
const swTranslations = {
  common: {
    book_now: 'Book Sasa',
    search: 'Tafuta',
    login: 'Ingia',
    register: 'Jiunge',
    logout: 'Toka',
    dashboard: 'Dashibodi',
    profile: 'Profaili',
    bookings: 'Nafasi Zangu',
    tickets: 'Tiketi Zangu'
  },
  booking: {
    select_route: 'Chagua Njia',
    select_stations: 'Chagua Vituo',
    select_date: 'Chagua Tarehe na Muda',
    select_seats: 'Chagua Viti',
    passenger_details: 'Taarifa za Abiria',
    payment: 'Malipo',
    origin: 'Kuanzia',
    destination: 'Kuelekea',
    departure: 'Kuondoka',
    arrival: 'Kufika',
    seat: 'Kiti',
    total: 'Jumla',
    confirm_booking: 'Thibitisha Nafasi'
  },
  seat: {
    available: 'Inapatikana',
    taken: 'Imechukuliwa',
    selected: 'Umechagua',
    held: 'Imeshikiliwa na mtumiaji mwingine',
    driver: 'Dereva/Opereta',
    wheelchair: 'Inayofaa Kiti cha Magurudumu'
  },
  swahili_time: {
    asubuhi: 'Asubuhi',
    mchana: 'Mchana',
    jioni: 'Jioni',
    usiku: 'Usiku',
    alfajiri: 'Alfajiri'
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      sw: { translation: swTranslations },
      // Add other languages similarly
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### 5.5 Tailwind CSS Configuration (Dark Mode)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        seat: {
          available: '#1E40AF',
          selected: '#F59E0B',
          taken: '#DC2626',
          held: '#9CA3AF',
          operator: '#FBBF24',
          wheelchair: '#10B981',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

---

## 6. CRITICAL BUSINESS LOGIC

### 6.1 Seat Generation Algorithm

```javascript
// utils/seatGenerator.js
function generateSeatsFromPattern(pattern, rows, layoutType = 'seat') {
  // pattern examples: "1-2", "2-2-2", "3-2-3", "2-3"
  const parts = pattern.split('-').map(Number);
  const seats = [];
  
  for (let row = 1; row <= rows; row++) {
    let columnCounter = 1;
    const rowLabel = getRowLabel(row);
    
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const seatsInBlock = parts[partIndex];
      
      // Add seats in this block
      for (let i = 0; i < seatsInBlock; i++) {
        const seatCode = `${rowLabel}${columnCounter}`;
        let seatType = 'standard';
        
        // Special seat assignments
        if (row === 1 && partIndex === 0 && i === 0) {
          seatType = layoutType === 'transport' ? 'driver' : 'operator';
        } else if (row === rows && partIndex === parts.length - 1 && i === seatsInBlock - 1) {
          seatType = 'wheelchair';
        } else if (i === 0 || i === seatsInBlock - 1) {
          seatType = 'window';
        } else if (partIndex > 0 && partIndex < parts.length - 1) {
          seatType = 'aisle';
        }
        
        seats.push({
          code: seatCode,
          row: row,
          column: columnCounter,
          type: seatType,
          status: 'available'
        });
        
        columnCounter++;
      }
      
      // Add aisle (space) except after last block
      if (partIndex < parts.length - 1) {
        columnCounter++; // Skip one column for aisle
      }
    }
  }
  
  return seats;
}

function getRowLabel(row) {
  // Convert number to letter: 1->A, 2->B, ... 27->AA, 28->AB
  let label = '';
  let num = row;
  while (num > 0) {
    num--;
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26);
  }
  return label;
}

// Example usage:
// Pattern "1-2" with 3 rows = A1, space, A2, A3; B1, space, B2, B3; C1, space, C2, C3
// Pattern "2-2-2" with 2 rows = A1,A2,space,A3,A4,space,A5,A6; B1,B2,space,B3,B4,space,B5,B6
```

### 6.2 Price Calculation for Partial Routes

```javascript
// utils/priceCalculator.js
async function calculateTransportPrice(routeId, startStationId, endStationId, passengerCount) {
  const route = await Route.findByPk(routeId, {
    include: [{
      model: RouteStation,
      as: 'routeStations',
      order: [['sequence_order', 'ASC']]
    }]
  });
  
  const startStation = route.routeStations.find(rs => rs.station_id === startStationId);
  const endStation = route.routeStations.find(rs => rs.station_id === endStationId);
  
  if (!startStation || !endStation) {
    throw new Error('Invalid stations');
  }
  
  if (startStation.sequence_order >= endStation.sequence_order) {
    throw new Error('End station must be after start station');
  }
  
  // Price = difference between end station cumulative price and start station cumulative price
  const pricePerPassenger = endStation.price_from_origin - startStation.price_from_origin;
  
  if (pricePerPassenger <= 0) {
    throw new Error('Invalid price calculation');
  }
  
  return {
    pricePerPassenger,
    totalPrice: pricePerPassenger * passengerCount,
    startStation: startStation.station,
    endStation: endStation.station,
    distance: endStation.distance_from_origin_km - startStation.distance_from_origin_km
  };
}
```

### 6.3 Sub-route Detection Logic

```javascript
// services/subRouteService.js
async function findSubRoute(parentRouteId, startStationId, endStationId) {
  // Find sub-route that matches the exact start station and includes the end station
  const subRoute = await Route.findOne({
    where: {
      parent_route_id: parentRouteId,
      origin_station_id: startStationId,
      is_sub_route: true,
      status: 'active'
    },
    include: [{
      model: RouteStation,
      required: true,
      where: { station_id: endStationId }
    }]
  });
  
  if (subRoute) {
    return subRoute;
  }
  
  // If no exact sub-route, check if start station is an intermediate station
  // and end station is downstream, use main route with partial pricing
  const parentRoute = await Route.findByPk(parentRouteId, {
    include: ['routeStations']
  });
  
  const startExists = parentRoute.routeStations.some(rs => rs.station_id === startStationId);
  const endExists = parentRoute.routeStations.some(rs => rs.station_id === endStationId);
  
  if (startExists && endExists) {
    return { type: 'partial', route: parentRoute };
  }
  
  throw new Error('No valid route found between selected stations');
}
```

---

## 7. FEATURES IMPLEMENTATION

### 7.1 Localization (8 Languages)

Supported languages:
- English (en)
- Swahili (sw) - with Swahili time conversion
- Chinese (zh)
- Russian (ru)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)

**Implementation in React:**
```jsx
// Use throughout app
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => changeLanguage('sw')}>Kiswahili</button>
    </div>
  );
}
```

### 7.2 Dark/Light Mode

```jsx
// contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 7.3 Currency System

```jsx
// contexts/CurrencyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [currentCurrency, setCurrentCurrency] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  
  useEffect(() => {
    fetchCurrencies();
    const saved = localStorage.getItem('currency');
    if (saved) setCurrentCurrency(JSON.parse(saved));
  }, []);
  
  const fetchCurrencies = async () => {
    const res = await axios.get('/api/v1/currencies');
    setCurrencies(res.data);
    const rates = {};
    res.data.forEach(c => {
      rates[c.code] = c.exchange_rate_to_tzs;
    });
    setExchangeRates(rates);
  };
  
  const formatPrice = (priceInTZS) => {
    if (!currentCurrency) return `${priceInTZS} TZS`;
    const converted = priceInTZS * currentCurrency.exchange_rate_to_tzs;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency.code
    }).format(converted);
  };
  
  return (
    <CurrencyContext.Provider value={{ currencies, currentCurrency, setCurrentCurrency, formatPrice, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};
```

### 7.4 Role-Based Navigation

```jsx
// components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  // Public/Customer
  { path: '/', label: 'Home', icon: '🏠', roles: ['customer', 'company_admin', 'staff', 'super_admin'] },
  { path: '/search', label: 'Search', icon: '🔍', roles: ['customer'] },
  { path: '/my-bookings', label: 'My Bookings', icon: '🎫', roles: ['customer'] },
  { path: '/my-tickets', label: 'My Tickets', icon: '🎟️', roles: ['customer'] },
  
  // Company
  { path: '/company/dashboard', label: 'Dashboard', icon: '📊', roles: ['company_admin', 'staff'] },
  { path: '/company/transports', label: 'Transports', icon: '🚌', roles: ['company_admin', 'staff'] },
  { path: '/company/routes', label: 'Routes', icon: '🛣️', roles: ['company_admin', 'staff'] },
  { path: '/company/timetables', label: 'Timetables', icon: '📅', roles: ['company_admin', 'staff'] },
  { path: '/company/facilities', label: 'Facilities', icon: '🏢', roles: ['company_admin'] },
  { path: '/company/staff', label: 'Staff', icon: '👥', roles: ['company_admin'] },
  { path: '/company/reports', label: 'Reports', icon: '📈', roles: ['company_admin'] },
  
  // Admin
  { path: '/admin/companies', label: 'Companies', icon: '🏭', roles: ['super_admin', 'developer'] },
  { path: '/admin/users', label: 'Users', icon: '👤', roles: ['super_admin', 'developer'] },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️', roles: ['super_admin', 'developer'] },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📝', roles: ['super_admin', 'developer'] },
];

const Sidebar = () => {
  const { user, userRoles } = useAuth();
  
  const visibleItems = menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );
  
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        OmniBook
      </div>
      <nav className="mt-4">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-r-4 border-blue-500' : ''
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
```

---

## 8. SECURITY REQUIREMENTS

### 8.1 Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, UserRole, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: UserRole,
        include: [Role]
      }]
    });
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }
    
    req.user = user;
    req.userRoles = user.userRoles.map(ur => ur.role.slug);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const hasRole = req.userRoles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
```

### 8.2 Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  keyGenerator: (req) => req.ip
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please slow down' }
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many booking attempts, please wait' }
});

module.exports = { authLimiter, apiLimiter, bookingLimiter };
```

### 8.3 Input Validation (Joi Schemas)

```javascript
// validators/bookingValidator.js
const Joi = require('joi');

const holdSeatsSchema = Joi.object({
  journeyId: Joi.string().uuid().optional(),
  activityInstanceId: Joi.string().uuid().optional(),
  seatCodes: Joi.array().items(Joi.string().max(10)).min(1).max(20).required(),
  sessionId: Joi.string().required()
}).xor('journeyId', 'activityInstanceId');

const createBookingSchema = Joi.object({
  journeyId: Joi.string().uuid().optional(),
  activityInstanceId: Joi.string().uuid().optional(),
  seatCodes: Joi.array().items(Joi.string()).min(1).required(),
  startStationId: Joi.string().uuid().when('journeyId', { is: Joi.exist(), then: Joi.required() }),
  endStationId: Joi.string().uuid().when('journeyId', { is: Joi.exist(), then: Joi.required() }),
  passengers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('adult', 'child', 'infant', 'senior').default('adult'),
    idNumber: Joi.string().optional()
  })).min(1).required(),
  contactInfo: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    email: Joi.string().email().required()
  }).required()
}).xor('journeyId', 'activityInstanceId');

module.exports = { holdSeatsSchema, createBookingSchema };
```

---

## 9. DEPLOYMENT & SETUP

### 9.1 Docker Configuration

**Dockerfile (Backend):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: booking_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - booking_network

  redis:
    image: redis:7-alpine
    container_name: booking_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - booking_network

  backend:
    build: ./backend
    container_name: booking_backend
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      REDIS_HOST: redis
    ports:
      - "5000:5000"
    depends_on:
      - mysql
      - redis
    networks:
      - booking_network

  frontend:
    build: ./frontend
    container_name: booking_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - booking_network

volumes:
  mysql_data:
  redis_data:

networks:
  booking_network:
    driver: bridge
```

### 9.2 Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 9.3 Database Seeder

```javascript
// seeders/20260505000000-initial-data.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert currencies
    await queryInterface.bulkInsert('currencies', [
      { id: '11111111-1111-1111-1111-111111111111', code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', exchange_rate_to_tzs: 1.000000, is_base: true, is_active: true },
      { id: '22222222-2222-2222-2222-222222222222', code: 'USD', name: 'US Dollar', symbol: '$', exchange_rate_to_tzs: 2300.000000, is_base: false, is_active: true },
      { id: '33333333-3333-3333-3333-333333333333', code: 'EUR', name: 'Euro', symbol: '€', exchange_rate_to_tzs: 2500.000000, is_base: false, is_active: true },
    ]);
    
    // Insert sample company
    await queryInterface.bulkInsert('companies', [
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', owner_id: 'user-id-here', name: 'Sample Transport Co', slug: 'sample-transport', category: 'transport', status: 'active', contact_email: 'info@sample.com', contact_phone: '255700000000' }
    ]);
    
    // Insert sample transport
    await queryInterface.bulkInsert('transports', [
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', transport_type_id: 'bus-type-id', name: 'Sample Bus', registration_number: 'T123ABC', capacity: 50, status: 'active' }
    ]);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('currencies', null, {});
    await queryInterface.bulkDelete('companies', null, {});
    await queryInterface.bulkDelete('transports', null, {});
  }
};
```

---

## 10. DEVELOPMENT PRIORITY ORDER

### Phase 1: Foundation (Days 1-3)
- [ ] Setup project structure (backend + frontend)
- [ ] Configure database, Sequelize models
- [ ] Implement authentication (register, login, JWT)
- [ ] Create basic user and company CRUD
- [ ] Setup Socket.io foundation

### Phase 2: Core Transport (Days 4-7)
- [ ] Transport types, transports CRUD
- [ ] Seat layout generation algorithm
- [ ] Stations, routes, route_stations CRUD
- [ ] Sub-route creation logic
- [ ] Timetables and journey generation cron job

### Phase 3: Booking Engine (Days 8-12)
- [ ] Seat hold service with expiry
- [ ] Socket.io seat selection broadcast
- [ ] Booking creation with sub-route detection
- [ ] Price calculation for partial routes
- [ ] Payment stub integration
- [ ] Receipt PDF generation
- [ ] QR code ticket generation

### Phase 4: Facility Module (Days 13-16)
- [ ] Facility types, facilities CRUD
- [ ] Activities and schedules
- [ ] Activity instances generation
- [ ] Unit-based booking (rooms, tables, spots)
- [ ] Unified search API

### Phase 5: Frontend Web App (Days 17-23)
- [ ] Authentication screens (login, register)
- [ ] Homepage with search
- [ ] Transport booking wizard (6 steps)
- [ ] Seat map component with Socket.io
- [ ] Facility booking flow
- [ ] User dashboard (my bookings, tickets)
- [ ] Payment page
- [ ] Receipt page with PDF download

### Phase 6: Admin & Company Panels (Days 24-28)
- [ ] Company admin dashboard
- [ ] Transport/facility management UI
- [ ] Route/timetable management UI
- [ ] Staff management UI
- [ ] Super admin panel (companies approval, users, settings)
- [ ] Reports and analytics charts

### Phase 7: Features & Polish (Days 29-35)
- [ ] Localization (8 languages) with Swahili time
- [ ] Dark/light mode toggle
- [ ] Currency switching
- [ ] Notifications (in-app, email)
- [ ] Role-based navigation
- [ ] Responsive design for mobile web
- [ ] Performance optimization
- [ ] Error handling and validation
- [ ] Testing (unit, integration, E2E)

### Phase 8: Deployment (Days 36-40)
- [ ] Docker configuration
- [ ] Environment variables setup
- [ ] Database migrations and seeders
- [ ] Production build optimization
- [ ] SSL/HTTPS configuration
- [ ] Monitoring and logging setup
- [ ] Documentation (API, setup, user guide)

---

## FINAL INSTRUCTION TO AI

**You are now ready to generate the complete codebase following this specification.**

**Output Requirements:**
1. Generate **EVERY file** listed in the structure above
2. Include **ALL code** - no placeholders or comments saying "add your code here"
3. Ensure all imports/exports match exactly
4. Make all code **production-ready** with proper error handling
5. Add **console.log** statements for debugging in development only
6. Include **comments** explaining complex logic (seat generation, sub-route detection, Swahili time conversion)
7. Ensure **Sequelize models** have proper associations and indexes
8. Implement **all security measures** (rate limiting, validation, XSS protection)
9. Make the **frontend responsive** (mobile, tablet, desktop)
10. Provide **working docker-compose** that runs the entire stack

**Do NOT skip:**
- Seat hold expiry cron job
- Journey generation cron job  
- Sub-route auto-detection logic
- Socket.io room-based broadcasting
- Swahili time conversion utility
- Exchange rate snapshot on bookings

**Start generating the codebase now, file by file, in the order specified in the Development Priority Order.**