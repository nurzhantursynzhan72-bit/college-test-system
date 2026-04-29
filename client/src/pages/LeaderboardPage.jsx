import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api('/api/leaderboard')
      .then(res => {
        if (!alive) return;
        if (res.success) setLeaderboard(res.leaderboard || []);
      })
      .catch(console.error)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Рейтинг' }]} />
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🏆 Көшбасшылар рейтингі</h1>
        <p style={{ color: 'var(--gray)', margin: 0 }}>Ең жоғары балл жинаған үздік оқушылар тақтасы.</p>
      </div>

      {loading ? <Loader /> : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>№</th>
                  <th>Оқушы</th>
                  <th>Тобы</th>
                  <th style={{ textAlign: 'center' }}>Тест саны</th>
                  <th style={{ textAlign: 'right' }}>Орташа ұпай</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => (
                  <tr key={idx} style={idx < 3 ? { backgroundColor: 'var(--primary-light)' } : {}}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--gray)' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/profile/${user.userId}`} style={{ textDecoration: 'none', color: 'inherit' }} onMouseOver={e => e.target.style.textDecoration='underline'} onMouseOut={e => e.target.style.textDecoration='none'}>
                        {user.userName}
                      </Link>
                    </td>
                    <td><span className="badge badge-student">{user.userGroup || '—'}</span></td>
                    <td style={{ textAlign: 'center' }}>{user.attempts}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                      {Math.round(user.avgScore)}%
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>Әзірге нәтижелер жоқ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
