import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../Button/Button.jsx';

export default function Header({ user, onLogout }) {
  const isLoggedIn = !!user;

  const linkClass = ({ isActive }) => ['nav-link', isActive ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon" />
        <span>EduTest</span>
      </Link>

      <div className="navbar-nav">
        <NavLink to="/" end className={linkClass}>
          Басты бет
        </NavLink>
        <NavLink to="/products" className={linkClass}>
          Products
        </NavLink>
        
        {isLoggedIn && user.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}>
            Админ панель
          </NavLink>
        )}
        
        {isLoggedIn && user.role === 'teacher' && (
          <NavLink to="/teacher" className={linkClass}>
            Мұғалім панелі
          </NavLink>
        )}

        {(!isLoggedIn || user.role === 'student') && (
          <NavLink to="/test" className={linkClass}>
            Тесттер
          </NavLink>
        )}

        {!isLoggedIn ? (
          <>
            <NavLink to="/login" className={linkClass}>
              Кіру
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Тіркелу
            </NavLink>
          </>
        ) : null}

        {isLoggedIn ? <span className={`nav-badge badge-${user.role}`} style={{ marginLeft: '1rem' }}>{user.name}</span> : null}
        {isLoggedIn ? (
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Шығу
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
