import type { Route } from '../../hooks/useHashRoute';
import { ThemeToggle } from '../ThemeToggle';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  title: string;
  route: Route;
  navigate: (route: Route) => void;
  onBack?: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, route, navigate, onBack, headerAction, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar route={route} navigate={navigate} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-screen-sm items-center gap-2 px-4 py-3 sm:max-w-2xl sm:px-6 md:max-w-4xl md:px-8 lg:max-w-6xl xl:max-w-7xl lg:px-10">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
              >
                ←
              </button>
            )}
            <h1 className="flex-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
            {headerAction}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-screen-sm px-4 pb-24 pt-4 sm:max-w-2xl sm:px-6 sm:pt-6 md:max-w-4xl md:px-8 md:pb-10 lg:max-w-6xl xl:max-w-7xl lg:px-10 print:max-w-none print:p-0">
          {children}
        </main>

        <BottomNav route={route} navigate={navigate} />
      </div>
    </div>
  );
}
