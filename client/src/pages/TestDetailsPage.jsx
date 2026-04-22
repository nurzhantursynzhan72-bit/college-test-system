import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import { api } from '../api.js';

export default function TestDetailsPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('');
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setStatus('');
    setTest(null);
    api(`/api/test/${encodeURIComponent(id)}`)
      .then((data) => {
        if (!alive) return;
        if (data?.success) {
          setTest(data.test);
          setStatus('');
        } else {
          setStatus(data?.message || 'Тест табылмады.');
        }
      })
      .catch((e) => {
        if (!alive) return;
        setStatus(e?.message || 'Қате');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (test?.duration && !result && status === '' && timeLeft === null) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, result, status, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || result || status !== '' || submitting) return;
    
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, result, status, submitting, test]); // Need to wrap handleSubmit logic appropriately, but handleSubmit has dependencies. We can just use the function directly.

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelect = (qId, optIdx) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!test || !test.questions) return;
    if (!autoSubmit && Object.keys(answers).length < test.questions.length) {
      if (!window.confirm('Барлық сұрақтарға жауап берілген жоқ! Жалғастырасыз ба?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ testId: id, answers })
      });
      if (res.success) {
        setResult(res);
      } else {
        alert(res.message || 'Қате шықты');
      }
    } catch(e) {
      alert('Желі қатесі');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { to: '/test', label: 'Test' }, { label: String(id) }]} />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Тест тапсыру</h1>
          <div style={{ color: 'var(--gray)' }}>ID: {id}</div>
        </div>
        <Link className="btn btn-outline" to="/test">
          ← Тізімге қайту
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : status ? (
        <div className="alert alert-danger">{status}</div>
      ) : result ? (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--dark)' }}>Тест аяқталды!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--gray)', marginBottom: '2rem' }}>
            Сіздің нәтижеңіз: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{result.correct} / {result.total}</strong> ({result.score}%)
          </p>
          <Link to="/test" className="btn btn-primary btn-lg">
            Тізімге қайту
          </Link>
        </Card>
      ) : (
        <Card>
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.75rem', marginBottom: '0.5rem' }}>{test?.title}</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--gray)', fontSize: '0.9rem' }}>
              <span style={{ padding: '0.2rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{test?.subject || '—'}</span>
              <span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', color: 'var(--gray)', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>Тобы: {test?.group || '—'}</span>
              <span style={{ padding: '0.2rem 0.6rem', background: '#fef3c7', color: '#d97706', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>⏳ {test?.duration} мин</span>
              <span style={{ padding: '0.2rem 0.6rem', background: timeLeft <= 60 ? '#fee2e2' : '#dcfce7', color: timeLeft <= 60 ? '#dc2626' : '#16a34a', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1rem' }}>
                Таймер: {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Сұрақтар</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: 400 }}>
              {Object.keys(answers).length} / {test?.questions?.length || 0} белгіленген
            </span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(test?.questions || []).map((q, qIndex) => {
              const isAnswered = Object.keys(answers).includes(q.id);
              return (
                <div key={q.id} style={{ 
                  background: 'var(--bg)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius)', 
                  border: isAnswered ? '1px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: isAnswered ? '0 0 0 1px var(--primary-light)' : 'none',
                  transition: 'border 0.2s'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '1.2rem', color: 'var(--dark)' }}>
                    <span style={{ color: 'var(--primary)', marginRight: '0.4rem' }}>{qIndex + 1}.</span> {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(q.options || []).map((opt, optIndex) => {
                      const isSelected = answers[q.id] === optIndex;
                      return (
                        <label 
                          key={optIndex} 
                          style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.8rem 1rem', 
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-dark)',
                            background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            gap: '0.75rem'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, optIndex)}
                            style={{ margin: 0, width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--primary)' : 'var(--dark)' }}>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              {submitting ? 'Тапсырылуда...' : 'Аяқтау және Тапсыру'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
