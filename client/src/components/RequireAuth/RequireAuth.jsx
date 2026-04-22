import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../Loader/Loader.jsx';

export default function RequireAuth({ me, role, children }) {
  const location = useLocation();

  if (me.loading) {
    return (
      <div className="page">
        <Loader />
      </div>
    );
  }

  if (!me.loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && me.user?.role !== role) {
    return (
      <div className="page">
        <div className="alert alert-danger">Рұқсат жоқ. Сіздің рөліңіз бұл бетке кіруге мүмкіндік бермейді.</div>
      </div>
    );
  }

  return children;
}
