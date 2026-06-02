// figma-frontend/src/app/components/layout/Sidebar.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router'; // Changed from 'react-router-dom' to 'react-router'
import { useAuth } from '../../../contexts/AuthContext';
import {
  LayoutDashboard,
  Bus,
  Building2,
  MapPin,
  Calendar,
  Users,
  Ticket,
  FileText,
  Settings,
  LogOut,
  Shield,
  DollarSign,
  Truck,
  Warehouse,
  Route,
  Film,
  Clock,
  Database,
  ChevronDown,
  Navigation,
  Layout,
} from 'lucide-react';

interface NavItem {
  name: string;
  href?: string;
  icon: any;
  roles?: string[];
  children?: NavItem[];
}

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['customer', 'company_admin', 'super_admin', 'developer', 'staff'],
  },
  {
    name: 'Administration',
    icon: Shield,
    roles: ['super_admin', 'developer'],
    children: [
      { name: 'Users', href: '/users', icon: Users, roles: ['super_admin', 'developer'] },
      { name: 'Roles', href: '/roles', icon: Shield, roles: ['super_admin', 'developer'] },
      { name: 'Currencies', href: '/currencies', icon: DollarSign, roles: ['super_admin', 'developer'] },
      { name: 'System Logs', href: '/system-logs', icon: Database, roles: ['super_admin', 'developer'] },
      { name: 'Reports', href: '/reports', icon: FileText, roles: ['super_admin', 'developer'] },
    ],
  },
  {
    name: 'Master Data',
    icon: Database,
    roles: ['super_admin', 'developer', 'company_admin'],
    children: [
      { name: 'Companies', href: '/companies', icon: Building2, roles: ['super_admin', 'developer', 'company_admin'] },
      { name: 'Transport Types', href: '/transport-types', icon: Truck, roles: ['super_admin', 'developer'] },
      { name: 'Facility Types', href: '/facility-types', icon: Warehouse, roles: ['super_admin', 'developer'] },
      { name: 'Transports', href: '/transports', icon: Bus, roles: ['super_admin', 'developer', 'company_admin', 'staff'] },
      { name: 'Facilities', href: '/facilities', icon: Building2, roles: ['super_admin', 'developer', 'company_admin', 'staff'] },
      { name: 'Stations', href: '/stations', icon: Navigation, roles: ['super_admin', 'developer', 'company_admin', 'staff'] },
      { name: 'Seat Layouts', href: '/seat-layouts', icon: Layout, roles: ['super_admin', 'developer', 'company_admin', 'staff'] },
    ],
  },
  {
    name: 'Operations',
    icon: Settings,
    roles: ['company_admin', 'staff', 'super_admin', 'developer'],
    children: [
      { name: 'Routes', href: '/routes', icon: Route, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Activities', href: '/activities', icon: Film, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Timetables', href: '/timetables', icon: Calendar, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Journeys', href: '/journeys', icon: Clock, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Activity Instances', href: '/activity-instances', icon: Calendar, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Bookings', href: '/bookings', icon: Ticket, roles: ['company_admin', 'staff', 'super_admin', 'developer'] },
    ],
  },
  {
    name: 'Customer',
    icon: Users,
    roles: ['customer', 'company_admin', 'staff', 'super_admin', 'developer'],
    children: [
      { name: 'My Tickets', href: '/tickets', icon: Ticket, roles: ['customer', 'company_admin', 'staff', 'super_admin', 'developer'] },
      { name: 'Profile', href: '/profile', icon: Users, roles: ['customer', 'company_admin', 'staff', 'super_admin', 'developer'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobile = false }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation(); // This now works with react-router
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Master Data', 'Operations']);

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const hasAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.some(role => hasPermission(role));
  };

  const handleNavigation = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!hasAccess(item)) return null;

    const isExpanded = expandedMenus.includes(item.name);
    const isActive = item.href === location.pathname;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.name} className="mb-1">
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-6 mt-1 space-y-1"
              >
                {item.children?.map(child => renderNavItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (!item.href) return null;

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={handleNavigation}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  // Get user role display name
  const getUserRole = () => {
    if (!user?.roles) return 'User';
    const roleNames = user.roles.map(r => r.name).join(', ');
    return roleNames;
  };

  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user?.first_name?.[0] || user?.fullName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {user?.fullName || `${user?.first_name} ${user?.last_name}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};








// import React from 'react';
// import { NavLink } from 'react-router';
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../../../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   Ticket,
//   Building2,
//   Bus,
//   MapPin,
//   Calendar,
//   Users,
//   BarChart3,
//   Warehouse,
//   Film,
//   FileText,
// } from 'lucide-react';

// interface NavItem {
//   path: string;
//   icon: React.ReactNode;
//   label: string;
//   roles: string[];
// }

// export const Sidebar: React.FC<{ onClose?: () => void; isMobile?: boolean }> = ({ onClose, isMobile }) => {
//   const { t } = useTranslation();
//   const { user } = useAuth();

//   const handleNavClick = () => {
//     if (isMobile && onClose) {
//       onClose();
//     }
//   };

//   const navItems: NavItem[] = [
//     {
//       path: '/dashboard',
//       icon: <LayoutDashboard className="w-5 h-5" />,
//       label: t('nav.dashboard'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
//     },
//     {
//       path: '/bookings',
//       icon: <Ticket className="w-5 h-5" />,
//       label: t('nav.bookings'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
//     },
//     {
//       path: '/tickets',
//       icon: <Ticket className="w-5 h-5" />,
//       label: t('nav.tickets'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
//     },
//     {
//       path: '/companies',
//       icon: <Building2 className="w-5 h-5" />,
//       label: t('nav.companies'),
//       roles: ['developer', 'super_admin'],
//     },
//     {
//       path: '/transports',
//       icon: <Bus className="w-5 h-5" />,
//       label: t('nav.transports'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff'],
//     },
//     {
//       path: '/facilities',
//       icon: <Warehouse className="w-5 h-5" />,
//       label: t('nav.facilities'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff'],
//     },
//     {
//       path: '/routes',
//       icon: <MapPin className="w-5 h-5" />,
//       label: t('nav.routes'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff'],
//     },
//     {
//       path: '/activities',
//       icon: <Film className="w-5 h-5" />,
//       label: t('nav.activities'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff'],
//     },
//     {
//       path: '/timetables',
//       icon: <Calendar className="w-5 h-5" />,
//       label: t('nav.timetables'),
//       roles: ['developer', 'super_admin', 'company_admin', 'staff'],
//     },
//     {
//       path: '/users',
//       icon: <Users className="w-5 h-5" />,
//       label: t('nav.users'),
//       roles: ['developer', 'super_admin'],
//     },
//     {
//       path: '/reports',
//       icon: <BarChart3 className="w-5 h-5" />,
//       label: t('nav.reports'),
//       roles: ['developer', 'super_admin', 'company_admin'],
//     },
//     {
//       path: '/system-logs',
//       icon: <FileText className="w-5 h-5" />,
//       label: t('nav.systemLogs'),
//       roles: ['developer', 'super_admin'],
//     },
//   ];

//   const filteredNavItems = navItems.filter(item =>
//     user && item.roles.includes(user.role)
//   );

//   return (
//     <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto lg:w-64 sm:w-56">
//       <div className="p-4 lg:p-6">
//         <div className="flex items-center gap-2 mb-8">
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//             <Ticket className="w-6 h-6 text-white" />
//           </div>
//           <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:inline">BookNow</span>
//         </div>

//         <nav className="space-y-2">
//           {filteredNavItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               onClick={handleNavClick}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                   isActive
//                     ? 'bg-blue-500 text-white'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`
//               }
//             >
//               {item.icon}
//               <span className="font-medium hidden sm:inline">{item.label}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </aside>
//   );
// };
