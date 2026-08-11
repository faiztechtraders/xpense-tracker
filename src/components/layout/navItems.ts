import type { Route } from '../../hooks/useHashRoute';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: Route;
  isActive: (route: Route) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'events',
    label: 'Events',
    icon: '🎫',
    route: { name: 'dashboard' },
    isActive: (route) => route.name === 'dashboard' || route.name === 'event-detail',
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: '🧾',
    route: { name: 'general-expenses' },
    isActive: (route) => route.name === 'general-expenses' || route.name === 'transaction-form-general',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: '📊',
    route: { name: 'analytics' },
    isActive: (route) => route.name === 'analytics',
  },
];
