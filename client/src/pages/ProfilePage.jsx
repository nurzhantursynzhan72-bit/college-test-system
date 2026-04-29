import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import { Bar } from 'react-chartjs-2';

export default function ProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api(`/api/profile/${id}`)
      .then(res => {
        if (!alive) return;
        if (res.success) setData(res.profile);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="page"><Loader /></div>;
  if (!data) return <div className="page"><h2>Оқушы табылмады</h2></div>;

  const { user, results, totalSubmissions, avgScore } = data;

  const subjectScores = {};
  results.forEach(r => {
    const s = r.subject || r.testTitle;
    if (!subjectScores[s]) subjectScores[s] = [];
    subjectScores[s].push(r.score);
  });
  const chartLabels = Object.keys(subjectScores);
  const chartData = chartLabels.map(l => Math.round(subjectScores[l].reduce((a,b)=>a+b,0) / subjectScores[l].length));

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { to: '/leaderboard', label: 'Рейтинг' }, { label: user.name }]} />
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{user.name}</h1>
        <p style={{ color: 'var(--gray)', margin: 0 }}>Тобы: <span className="badge badge-student">{user.groupName || '—'}</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalSubmissions}</div>
          <div style={{ color: 'var(--gray)' }}>Тапсырған тест саны</div>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{avgScore}%</div>
          <div style={{ color: 'var(--gray)' }}>Орташа ұпайы</div>
        </Card>
      </div>

      <Card style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Пәндер бойынша үлгерім</h3>
        <div style={{ height: '300px' }}>
          {chartLabels.length > 0 ? (
            <Bar 
              data={{
                labels: chartLabels,
                datasets: [{
                  label: 'Орташа балл (%)',
                  data: chartData,
                  backgroundColor: 'rgba(52, 211, 153, 0.6)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 1,
                }]
              }}
              options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }}
            />
          ) : (
            <div style={{ color: 'var(--gray)', textAlign: 'center', paddingTop: '2rem' }}>Нәтижелер жоқ</div>
          )}
        </div>
      </Card>

      <h3 style={{ marginTop: '2rem' }}>Тапсырған тесттер тарихы</h3>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Тест</th>
                <th>Пән</th>
                <th>Уақыт</th>
                <th style={{ textAlign: 'right' }}>Нәтиже</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{r.testTitle}</td>
                  <td>{r.subject}</td>
                  <td style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>
                    {new Date(r.submitted_at).toLocaleString('kk-KZ')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${r.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                      {r.score}%
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>Нәтиже жоқ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
