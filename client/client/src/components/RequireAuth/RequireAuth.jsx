import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../Loader/Loader.jsx';

export default function RequireAuth({ me, children }) {
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

  return children;
}
