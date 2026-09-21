import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle2, Calendar, BarChart2, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const navItems = [
    { to: '/', label: 'Today', icon: CheckCircle2 },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/progress', label: 'Progress', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Main Navigation">
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <div className={styles.iconWrapper}>
                <Icon size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
