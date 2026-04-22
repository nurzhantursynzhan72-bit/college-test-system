import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import { products } from '../data/products.js';

export default function ProductDetailsPage() {
  const { id } = useParams();

  const product = useMemo(() => products.find((p) => String(p.id) === String(id)), [id]);

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }, { label: String(id) }]} />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Product</h1>
          <div style={{ color: 'var(--gray)' }}>ID: {id}</div>
        </div>
        <Link className="btn btn-outline" to="/products">
          ← Тізімге қайту
        </Link>
      </div>

      {!product ? (
        <Card>
          <h2 style={{ marginTop: 0 }}>Табылмады</h2>
          <p style={{ color: 'var(--gray)' }}>Мұндай product жоқ.</p>
        </Card>
      ) : (
        <Card>
          <h2 style={{ marginTop: 0 }}>{product.title}</h2>
          <p style={{ color: 'var(--gray)' }}>{product.description}</p>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{product.price} ₸</div>
        </Card>
      )}
    </div>
  );
}
