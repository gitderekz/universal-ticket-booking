const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserModel = require('./User');
const RoleModel = require('./Role');
const UserRoleModel = require('./UserRole');
const UserSessionModel = require('./UserSession');
const SettingModel = require('./Setting');
const CurrencyModel = require('./Currency');
const CompanyModel = require('./Company');
const TransportTypeModel = require('./TransportType');
const TransportModel = require('./Transport');
const StationModel = require('./Station');
const RouteModel = require('./Route');
const RouteStationModel = require('./RouteStation');
const TimetableModel = require('./Timetable');
const JourneyModel = require('./Journey');
const SeatLayoutModel = require('./SeatLayout');
const SeatModel = require('./Seat');
const BookingModel = require('./Booking');
const BookingItemModel = require('./BookingItem');
const SeatHoldModel = require('./SeatHold');
const PaymentModel = require('./Payment');
const FacilityTypeModel = require('./FacilityType');
const FacilityModel = require('./Facility');
const ActivityModel = require('./Activity');
const ActivityInstanceModel = require('./ActivityInstance');
const SystemLogModel = require('./SystemLog');
const User = UserModel(sequelize);
const Role = RoleModel(sequelize);
const UserRole = UserRoleModel(sequelize);
const UserSession = UserSessionModel(sequelize);
const Setting = SettingModel(sequelize);
const Currency = CurrencyModel(sequelize);
const Company = CompanyModel(sequelize);
const TransportType = TransportTypeModel(sequelize);
const Transport = TransportModel(sequelize);
const Station = StationModel(sequelize);
const Route = RouteModel(sequelize);
const RouteStation = RouteStationModel(sequelize);
const FacilityType = FacilityTypeModel(sequelize);
const Facility = FacilityModel(sequelize);
const Activity = ActivityModel(sequelize);
const ActivityInstance = ActivityInstanceModel(sequelize);
const SystemLog = SystemLogModel(sequelize);
const Timetable = TimetableModel(sequelize);
const Journey = JourneyModel(sequelize);
const SeatLayout = SeatLayoutModel(sequelize);
const Seat = SeatModel(sequelize);
const Booking = BookingModel(sequelize);
const BookingItem = BookingItemModel(sequelize);
const SeatHold = SeatHoldModel(sequelize);
const Payment = PaymentModel(sequelize);

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id'
});
User.hasMany(UserRole, { foreignKey: 'user_id' });
UserRole.belongsTo(User, { foreignKey: 'user_id' });
Role.hasMany(UserRole, { foreignKey: 'role_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserSession, { foreignKey: 'user_id' });
Company.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
User.hasMany(Company, { foreignKey: 'owner_id', as: 'ownedCompanies' });
User.belongsTo(Currency, { foreignKey: 'preferred_currency_id', as: 'preferredCurrency' });
Currency.hasMany(User, { foreignKey: 'preferred_currency_id' });

UserRole.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Company.hasMany(UserRole, { foreignKey: 'company_id', as: 'userRoles' });

Company.hasMany(Transport, { foreignKey: 'company_id' });
Transport.belongsTo(Company, { foreignKey: 'company_id' });
Transport.belongsTo(TransportType, { foreignKey: 'transport_type_id' });
TransportType.hasMany(Transport, { foreignKey: 'transport_type_id' });
Company.hasMany(Station, { foreignKey: 'company_id' });
Station.belongsTo(Company, { foreignKey: 'company_id' });
Company.hasMany(Route, { foreignKey: 'company_id' });
Route.belongsTo(Company, { foreignKey: 'company_id' });
Transport.hasMany(Route, { foreignKey: 'transport_id' });
Route.belongsTo(Transport, { foreignKey: 'transport_id' });
Route.belongsTo(Station, { as: 'originStation', foreignKey: 'origin_station_id' });
Route.belongsTo(Station, { as: 'destinationStation', foreignKey: 'destination_station_id' });
Route.belongsTo(Route, { as: 'parentRoute', foreignKey: 'parent_route_id' });
Route.hasMany(RouteStation, { foreignKey: 'route_id' });
RouteStation.belongsTo(Route, { foreignKey: 'route_id' });
RouteStation.belongsTo(Station, { foreignKey: 'station_id' });
Station.hasMany(RouteStation, { foreignKey: 'station_id' });
Route.hasMany(Timetable, { foreignKey: 'route_id' });
Timetable.belongsTo(Route, { foreignKey: 'route_id' });
Transport.hasMany(Timetable, { foreignKey: 'transport_id' });
Timetable.belongsTo(Transport, { foreignKey: 'transport_id' });
Timetable.hasMany(Journey, { foreignKey: 'timetable_id' });
Journey.belongsTo(Timetable, { foreignKey: 'timetable_id' });
Journey.belongsTo(Transport, { foreignKey: 'transport_id' });
Transport.hasMany(Journey, { foreignKey: 'transport_id' });
Journey.belongsTo(Route, { foreignKey: 'route_id' });
Route.hasMany(Journey, { foreignKey: 'route_id' });
SeatLayout.hasMany(Seat, { foreignKey: 'seat_layout_id' });
Seat.belongsTo(SeatLayout, { foreignKey: 'seat_layout_id' });
Transport.hasOne(SeatLayout, { foreignKey: 'layoutable_id', scope: { layoutable_type: 'transport' }, as: 'seatLayout', constraints: false });
SeatLayout.belongsTo(Transport, { foreignKey: 'layoutable_id', constraints: false, as: 'transport' });
Facility.hasOne(SeatLayout, { foreignKey: 'layoutable_id', scope: { layoutable_type: 'facility' }, as: 'seatLayout', constraints: false });
SeatLayout.belongsTo(Facility, { foreignKey: 'layoutable_id', constraints: false, as: 'facility' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(Company, { foreignKey: 'company_id' });
Company.hasMany(Booking, { foreignKey: 'company_id' });
Booking.belongsTo(Journey, { foreignKey: 'journey_id' });
Journey.hasMany(Booking, { foreignKey: 'journey_id' });
Booking.belongsTo(ActivityInstance, { foreignKey: 'activity_instance_id' });
ActivityInstance.hasMany(Booking, { foreignKey: 'activity_instance_id' });
Booking.belongsTo(Currency, { foreignKey: 'currency_id' });
Currency.hasMany(Booking, { foreignKey: 'currency_id' });
Booking.hasMany(BookingItem, { foreignKey: 'booking_id' });
BookingItem.belongsTo(Booking, { foreignKey: 'booking_id' });
Booking.hasMany(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

Company.hasMany(Facility, { foreignKey: 'company_id' });
Facility.belongsTo(Company, { foreignKey: 'company_id' });
FacilityType.hasMany(Facility, { foreignKey: 'facility_type_id' });
Facility.belongsTo(FacilityType, { foreignKey: 'facility_type_id' });

Facility.hasMany(Activity, { foreignKey: 'facility_id' });
Activity.belongsTo(Facility, { foreignKey: 'facility_id' });
Activity.hasMany(ActivityInstance, { foreignKey: 'activity_id' });
ActivityInstance.belongsTo(Activity, { foreignKey: 'activity_id' });
Facility.hasMany(ActivityInstance, { foreignKey: 'facility_id' });
ActivityInstance.belongsTo(Facility, { foreignKey: 'facility_id' });

SeatHold.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SeatHold, { foreignKey: 'user_id' });
Journey.hasMany(SeatHold, { foreignKey: 'journey_id' });
SeatHold.belongsTo(Journey, { foreignKey: 'journey_id' });
ActivityInstance.hasMany(SeatHold, { foreignKey: 'activity_instance_id' });
SeatHold.belongsTo(ActivityInstance, { foreignKey: 'activity_instance_id' });
Booking.hasMany(SeatHold, { foreignKey: 'booking_id' });
SeatHold.belongsTo(Booking, { foreignKey: 'booking_id' });

// SystemLog associations
SystemLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SystemLog, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  UserSession,
  Setting,
  Currency,
  Company,
  TransportType,
  Transport,
  Station,
  Route,
  RouteStation,
  Timetable,
  Journey,
  SeatLayout,
  Seat,
  Booking,
  BookingItem,
  SeatHold,
  Payment,
  FacilityType,
  Facility,
  Activity,
  ActivityInstance,
  SystemLog
};
