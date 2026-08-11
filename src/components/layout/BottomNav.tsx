import type { Route } from '../../hooks/useHashRoute';
import { NAV_ITEMS } from './navItems';

interface BottomNavProps {
  route: Route;
  navigate: (route: Route) => void;
}

export function BottomNav({ route, navigate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] print:hidden md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-screen-sm">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(route);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.route)}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${
                active ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
