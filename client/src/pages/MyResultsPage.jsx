import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';

export default function MyResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api('/api/my-results')
      .then(res => {
        if (!alive) return;
        if (res.success) setResults(res.results || []);
      })
      .catch(console.error)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Менің нәтижелерім' }]} />
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Менің нәтижелерім</h1>
        <p style={{ color: 'var(--gray)', margin: 0 }}>Өткен тесттердің тарихы мен ұпайлары.</p>
      </div>

      {loading ? <Loader /> : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Тест атауы</th>
                  <th style={{ textAlign: 'center' }}>Мүмкіндік №</th>
                  <th style={{ textAlign: 'center' }}>Тапсырған күн</th>
                  <th style={{ textAlign: 'right' }}>Нәтиже</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{r.testTitle}</td>
                    <td style={{ textAlign: 'center' }}>{r.attempt_no}</td>
                    <td style={{ color: 'var(--gray)', textAlign: 'center', fontSize: '0.85rem' }}>
                      {new Date(r.submitted_at).toLocaleString('kk-KZ')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${r.score >= 50 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                        {r.correct} / {r.total} ({r.score}%)
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>Сіз әлі тест тапсырмадыңыз</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
