import React from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  Bus,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Warehouse,
  Film,
  FileText,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t('nav.dashboard'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
    },
    {
      path: '/bookings',
      icon: <Ticket className="w-5 h-5" />,
      label: t('nav.bookings'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
    },
    {
      path: '/tickets',
      icon: <Ticket className="w-5 h-5" />,
      label: t('nav.tickets'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff', 'customer'],
    },
    {
      path: '/companies',
      icon: <Building2 className="w-5 h-5" />,
      label: t('nav.companies'),
      roles: ['developer', 'super_admin'],
    },
    {
      path: '/transports',
      icon: <Bus className="w-5 h-5" />,
      label: t('nav.transports'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff'],
    },
    {
      path: '/facilities',
      icon: <Warehouse className="w-5 h-5" />,
      label: t('nav.facilities'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff'],
    },
    {
      path: '/routes',
      icon: <MapPin className="w-5 h-5" />,
      label: t('nav.routes'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff'],
    },
    {
      path: '/activities',
      icon: <Film className="w-5 h-5" />,
      label: t('nav.activities'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff'],
    },
    {
      path: '/timetables',
      icon: <Calendar className="w-5 h-5" />,
      label: t('nav.timetables'),
      roles: ['developer', 'super_admin', 'company_admin', 'staff'],
    },
    {
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      label: t('nav.users'),
      roles: ['developer', 'super_admin'],
    },
    {
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      label: t('nav.reports'),
      roles: ['developer', 'super_admin', 'company_admin'],
    },
    {
      path: '/system-logs',
      icon: <FileText className="w-5 h-5" />,
      label: t('nav.systemLogs'),
      roles: ['developer', 'super_admin'],
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">BookNow</span>
        </div>

        <nav className="space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
