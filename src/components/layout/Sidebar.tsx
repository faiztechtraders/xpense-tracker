import type { Route } from '../../hooks/useHashRoute';
import { NAV_ITEMS } from './navItems';

interface SidebarProps {
  route: Route;
  navigate: (route: Route) => void;
}

export function Sidebar({ route, navigate }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white print:hidden md:flex dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl" aria-hidden="true">
          💳
        </span>
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">ClaimTrack</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(route);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                active
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        Data stays on this device
      </div>
    </aside>
  );
}
