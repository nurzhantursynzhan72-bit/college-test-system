import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';

export default function Layout({ user, onLogout }) {
  const location = useLocation();

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <div key={location.pathname} className="route-view">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
