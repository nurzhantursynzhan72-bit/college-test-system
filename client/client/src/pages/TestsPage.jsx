import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import TestCard from '../components/TestCard/TestCard.jsx';
import { api } from '../api.js';
import { filterByQuery } from '../utils/search.js';

export default function TestsPage({ me }) {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!me.loggedIn) {
      setTests([]);
      return;
    }
    setLoading(true);
    setStatus('');
    api('/api/tests')
      .then((data) => {
        if (data?.success) setTests(data.tests || []);
        else setTests([]);
        setStatus('');
      })
      .catch((e) => setStatus(e?.message || 'Қате'))
      .finally(() => setLoading(false));
  }, [me.loggedIn]);

  const filtered = useMemo(() => {
    // Search/filter: алдыңғы JS жобадан қарапайым түрде көшірілген логика (utils/search.js)
    return filterByQuery(tests, query, ['title', 'subject']);
  }, [tests, query]);

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Test' }]} />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Тесттер</h1>
          <p>Барлық қолжетімді тесттер (топқа/рөлге байланысты).</p>
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Атауы бойынша іздеу..."
            style={{ minWidth: 250, borderRadius: 20 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {!me.loggedIn ? (
        <Card>
          <h2 style={{ marginTop: 0 }}>Кіру қажет</h2>
          <p style={{ color: 'var(--gray)' }}>Тесттерді көру үшін жүйеге кіріңіз.</p>
          <Link className="btn btn-primary" to="/login">
            Кіру / Тіркелу
          </Link>
        </Card>
      ) : loading ? (
        <Loader />
      ) : status ? (
        <div style={{ color: 'var(--danger)' }}>{status}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          <h3>Тест жоқ</h3>
          <p>Іздеу бойынша немесе тобыңызға белсенді тест табылмады.</p>
        </div>
      ) : (
        <div className="tests-grid">
          {filtered.map((t) => (
            <TestCard
              key={t.id}
              subject={t.subject}
              title={t.title}
              questionCount={t.questionCount}
              duration={t.duration}
              group={t.group}
              onClick={() => navigate(`/test/${t.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
