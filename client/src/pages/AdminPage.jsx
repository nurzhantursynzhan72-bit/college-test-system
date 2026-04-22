import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Button from '../components/Button/Button.jsx';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ users }, { results }] = await Promise.all([
        api('/api/admin/users'),
        api('/api/admin/results')
      ]);
      setUsers(users || []);
      setResults(results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Пайдаланушыны өшіруді растайсыз ба?')) return;
    try {
      const res = await api(`/api/admin/user/${id}`, { method: 'DELETE' });
      if (res.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert(res.message || 'Қате');
      }
    } catch (e) {
      alert('Желі қатесі');
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Админ панель</h1>
          <p style={{ color: 'var(--gray)', margin: '0.25rem 0 0 0' }}>Жүйені басқару және нәтижелерді бақылау</p>
        </div>
        <Button variant="primary" onClick={handleExport}>Excel-ге жүктеу</Button>
      </div>

      <div className="tab-nav">
        <button className={`tab-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Пайдаланушылар ({users.length})</button>
        <button className={`tab-link ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Тест нәтижелері ({results.length})</button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'users' && (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Аты-жөні</th>
                  <th>Email / Телефон</th>
                  <th>Тобы</th>
                  <th>Рөлі</th>
                  <th style={{ textAlign: 'right' }}>Әрекет</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>
                      <div>{u.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{u.phone}</div>
                    </td>
                    <td>{u.group || '—'}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button className="action-btn" onClick={() => handleDeleteUser(u.id)}>Өшіру</button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>Пайдаланушылар жоқ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Оқушы</th>
                  <th>Тест</th>
                  <th>Нәтиже</th>
                  <th>Уақыт</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.userName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{r.userGroup} | {r.userEmail}</div>
                    </td>
                    <td>{r.testTitle}</td>
                    <td>
                      <span className={`badge ${r.score >= 50 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                        {r.correct} / {r.total} ({r.score}%)
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>
                      {new Date(r.submittedAt).toLocaleString('kk-KZ')}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>Нәтижелер жоқ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
