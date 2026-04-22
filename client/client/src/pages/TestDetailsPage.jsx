import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Button from '../components/Button/Button.jsx';
import { api } from '../api.js';

export default function TestDetailsPage() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(`/api/test/${encodeURIComponent(id)}`)
      .then((data) => {
        if (!alive) return;
        if (data?.success) {
          setTest(data.test);
          setTimeLeft(data.test.duration * 60);
        } else {
          setStatus(data?.message || 'Тест табылмады.');
        }
      })
      .catch((e) => { if (alive) setStatus(e?.message || 'Қате'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  // Таймер
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const timerColor = timeLeft < 60 ? 'var(--danger)' : timeLeft < 180 ? 'var(--warning)' : 'var(--primary)';

  async function handleSubmit(auto = false) {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const data = await api('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ testId: id, answers }),
      });
      if (data?.success) {
        setResult(data);
        setSubmitted(true);
      } else {
        setStatus(data?.message || 'Жіберу қатесі');
      }
    } catch (e) {
      setStatus(e?.message || 'Қате');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page"><Loader /></div>;
  if (status && !test) return <div className="page"><div style={{ color: 'var(--danger)' }}>{status}</div></div>;

  // Нәтиже экраны
  if (submitted && result) {
    const pct = result.score;
    const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
    return (
      <div className="page">
        <Breadcrumbs items={[{ to: '/', label: 'Home' }, { to: '/test', label: 'Тесттер' }, { label: 'Нәтиже' }]} />
        <Card style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color, lineHeight: 1, marginBottom: 8 }}>
            {pct}%
          </div>
          <h2 style={{ margin: '0 0 8px' }}>
            {pct >= 80 ? '🎉 Керемет!' : pct >= 50 ? '👍 Жақсы!' : '😔 Қайталап көріңіз'}
          </h2>
          <p style={{ color: 'var(--gray)', margin: '0 0 24px' }}>
            {result.correct} / {result.total} дұрыс жауап
          </p>
          <Link className="btn btn-primary" to="/test">← Тесттер тізіміне қайту</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { to: '/test', label: 'Тесттер' }, { label: test?.title }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800 }}>{test?.title}</h1>
          <div style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
            Пәні: <b style={{ color: 'var(--dark)' }}>{test?.subject}</b> · Тобы: <b style={{ color: 'var(--dark)' }}>{test?.group}</b>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {timeLeft !== null && (
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: 12,
              border: `2px solid ${timerColor}`,
              color: timerColor,
              fontWeight: 800,
              fontSize: '1.1rem',
              fontFamily: 'var(--font-mono)',
              minWidth: 90,
              textAlign: 'center',
            }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          )}
          <Link className="btn btn-outline" to="/test">← Тізімге</Link>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(test?.questions || []).map((q, idx) => (
          <Card key={q.id}>
            <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--primary)', marginRight: 8 }}>{idx + 1}.</span>
              {q.text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(q.options || []).map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <label
                    key={oi}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 1rem',
                      borderRadius: 10,
                      border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                      background: selected ? 'var(--primary-light)' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={oi}
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <div style={{ color: 'var(--gray)', fontSize: '0.875rem', alignSelf: 'center' }}>
          {Object.keys(answers).length} / {test?.questions?.length} жауап берілді
        </div>
        <Button
          variant="primary"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          style={{ minWidth: 160, justifyContent: 'center' }}
        >
          {submitting ? 'Жіберілуде...' : 'Тапсыру →'}
        </Button>
      </div>
    </div>
  );
}
