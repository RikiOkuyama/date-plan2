import { NavLink } from 'react-router-dom';
import { Home, Map, PlusCircle, Image, Award } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'ホーム' },
  { to: '/plan/new', icon: PlusCircle, label: 'プラン' },
  { to: '/memories', icon: Map, label: '地図' },
  { to: '/gallery', icon: Image, label: '思い出' },
  { to: '/badges', icon: Award, label: 'バッジ' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-rose-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
