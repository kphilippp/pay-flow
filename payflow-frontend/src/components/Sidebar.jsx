import { NavLink } from 'react-router-dom';
import { DollarSign, LayoutDashboard, List } from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses',  icon: List },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#111827',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 36 }}>
        <div style={{ background: 'var(--accent)', borderRadius: 8, padding: 7, display: 'flex', alignItems: 'center' }}>
          <DollarSign size={18} color="#fff" />
        </div>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
          PayFlow
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
