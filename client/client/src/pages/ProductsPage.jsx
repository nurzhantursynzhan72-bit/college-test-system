import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import { products } from '../data/products.js';
import { filterByQuery } from '../utils/search.js';

export default function ProductsPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterByQuery(products, query, ['title', 'description']), [query]);

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Products' }]} />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Products</h1>
          <p>Қарапайым demo өнімдер тізімі (алдыңғы JS жобадан дерек көшіру мысалы).</p>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="Іздеу..."
          style={{ minWidth: 250, borderRadius: 20 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--gray)' }}>Өнім табылмады.</div>
      ) : (
        <div className="tests-grid">
          {filtered.map((p) => (
            <Card key={p.id} className="lab-card" style={{ cursor: 'pointer' }}>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>{p.title}</h3>
              <div style={{ color: 'var(--gray)', marginBottom: 10 }}>{p.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 700 }}>{p.price} ₸</div>
                <Link className="btn btn-outline" to={`/products/${p.id}`}>
                  Ашық →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
