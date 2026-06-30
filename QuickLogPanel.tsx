import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '../Header';

const NAV = [
  { to: '/admin/overview', label: 'Overview' },
  { to: '/admin/users', label: 'Consultants' },
  { to: '/admin/activities', label: 'Activities' },
  { to: '/admin/revenue', label: 'Revenue' },
  { to: '/admin/backfill', label: 'Add entry' },
  { to: '/admin/bullhorn', label: 'Bullhorn' },
];

export function AdminLayout() {
  return (
    <div className="min-h-full">
      <Header />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row">
        <nav className="md:w-48 md:shrink-0">
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    'block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                    (isActive
                      ? 'bg-brand-blue text-white'
                      : 'text-slate-300 hover:bg-navy-700 hover:text-white')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
