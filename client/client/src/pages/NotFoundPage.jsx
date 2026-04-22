import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';

export default function NotFoundPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: '404' }]} />
      <Card>
        <h2 style={{ marginTop: 0 }}>404</h2>
        <p style={{ color: 'var(--gray)' }}>Бұл бет табылмады.</p>
        <Link className="btn btn-primary" to="/">
          Басты бет →
        </Link>
      </Card>
    </div>
  );
}
