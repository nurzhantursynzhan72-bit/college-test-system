import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import { api } from '../api.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TestDetailsPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('');
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [testPassword, setTestPassword] = useState('');
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setStatus('');
    setTest(null);
    setNeedsPassword(false);
    api(`/api/test/${encodeURIComponent(id)}`)
      .then((data) => {
        if (!alive) return;
        if (data?.success) {
          setTest(data.test);
          setAttempt(data.attempt || null);
          setStatus('');
          if (typeof data?.attempt?.timeLeftSec === 'number') {
            setTimeLeft(data.attempt.timeLeftSec);
          } else {
            setTimeLeft(null);
          }
        } else {
          if (data?.requiresPassword) {
            setNeedsPassword(true);
            setStatus(data?.message || 'Тестке пароль керек');
            return;
          }
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
    if (!test || result || status !== '' || submitting || timeLeft === null) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            alert('Сіз 3 рет басқа бетке өттіңіз! Тест автоматты түрде аяқталды.');
            handleSubmit(true);
          } else {
            alert(`ЕСКЕРТУ! Тест кезінде басқа бетке өтуге немесе жабуға болмайды.\nСізде тағы ${3 - newWarnings} мүмкіндік қалды. Одан кейін тест автоматты түрде тапсырылады.`);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [test, result, status, submitting, timeLeft, answers]); // Added answers to deps if handleSubmit needs it, but it's okay because we use autoSubmit=true

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
        body: JSON.stringify({
          testId: id,
          answers,
          attemptId: attempt?.id || null,
          timeTakenSec: test?.duration ? (test.duration * 60 - (timeLeft ?? 0)) : null
        })
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

  const downloadCertificate = async () => {
    const certDiv = document.createElement('div');
    certDiv.style.width = '800px';
    certDiv.style.height = '600px';
    certDiv.style.padding = '40px';
    certDiv.style.background = 'white';
    certDiv.style.border = '20px solid var(--primary)';
    certDiv.style.boxSizing = 'border-box';
    certDiv.style.textAlign = 'center';
    certDiv.style.fontFamily = 'Arial, sans-serif';
    certDiv.style.position = 'absolute';
    certDiv.style.top = '-9999px';
    
    certDiv.innerHTML = `
      <h1 style="font-size: 48px; color: var(--primary); margin-top: 50px;">ЖЕТІСТІК СЕРТИФИКАТЫ</h1>
      <p style="font-size: 24px; margin-top: 40px;">Осы сертификат</p>
      <h2 style="font-size: 36px; border-bottom: 2px solid #ccc; display: inline-block; padding-bottom: 10px; margin: 20px 0;">Оқушы</h2>
      <p style="font-size: 24px;">келесі тестті сәтті аяқтағаны үшін беріледі:</p>
      <h3 style="font-size: 30px; color: #333;">${test?.title}</h3>
      <p style="font-size: 28px; margin-top: 30px;">Нәтиже: <strong>${result?.score}%</strong></p>
      <div style="margin-top: 60px; display: flex; justify-content: space-between; padding: 0 50px;">
        <div>
          <div style="border-bottom: 1px solid #000; width: 150px; margin-bottom: 5px;"></div>
          <span>Колледж Тест Жүйесі</span>
        </div>
        <div>
          <div style="border-bottom: 1px solid #000; width: 150px; margin-bottom: 5px;">${new Date().toLocaleDateString('kk-KZ')}</div>
          <span>Күні</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(certDiv);
    try {
      const canvas = await html2canvas(certDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`Сертификат_${test?.title}.pdf`);
    } catch(e) {
      alert('Сертификат жүктеу кезінде қате кетті');
    } finally {
      document.body.removeChild(certDiv);
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
      ) : needsPassword ? (
        <Card className="auth-card">
          <h1>Тестке пароль керек</h1>
          <p style={{ color: 'var(--gray)', marginTop: 0 }}>Парольді енгізіңіз.</p>
          <div className="form">
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                className="form-control"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              className="btn btn-primary btn-lg"
              disabled={!testPassword || submitting}
              onClick={async () => {
                setSubmitting(true);
                try {
                  const ok = await api('/api/test/access', {
                    method: 'POST',
                    body: JSON.stringify({ testId: id, password: testPassword })
                  });
                  if (!ok.success) {
                    alert(ok.message || 'Пароль қате');
                    return;
                  }
                  setTestPassword('');
                  setNeedsPassword(false);
                  setLoading(true);
                  const data = await api(`/api/test/${encodeURIComponent(id)}`);
                  if (data?.success) {
                    setTest(data.test);
                    setAttempt(data.attempt || null);
                    if (typeof data?.attempt?.timeLeftSec === 'number') setTimeLeft(data.attempt.timeLeftSec);
                    setStatus('');
                  } else {
                    setStatus(data?.message || 'Қате');
                  }
                } catch (e) {
                  alert(e?.message || 'Желі қатесі');
                } finally {
                  setSubmitting(false);
                  setLoading(false);
                }
              }}
            >
              Ашу
            </button>
          </div>
        </Card>
      ) : status ? (
        <div className="alert alert-danger">{status}</div>
      ) : result ? (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--dark)' }}>Тест аяқталды!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--gray)', marginBottom: '2rem' }}>
            Сіздің нәтижеңіз: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{result.correct} / {result.total}</strong> ({result.score}%)
          </p>
          {Array.isArray(result.breakdown) ? (
            <div style={{ textAlign: 'left', maxWidth: 720, margin: '0 auto 2rem' }}>
              <h3 style={{ margin: '0 0 0.75rem' }}>Түсіндірмелер</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.breakdown.map((b, idx) => (
                  <div key={b.questionId} className="card" style={{ padding: '1rem', borderColor: b.isCorrect ? '#bbf7d0' : '#fecaca' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {idx + 1}. {b.isCorrect ? 'Дұрыс' : 'Қате'}
                    </div>
                    {b.explanation ? <div style={{ color: 'var(--gray)' }}>{b.explanation}</div> : <div style={{ color: 'var(--gray-light)' }}>Түсіндірме жоқ</div>}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/test" className="btn btn-primary btn-lg">
              Тізімге қайту
            </Link>
            {result.score >= 80 && (
              <button className="btn btn-outline btn-lg" onClick={downloadCertificate} style={{ borderColor: '#fbbf24', color: '#b45309', background: '#fef3c7' }}>
                🎓 Сертификат жүктеу
              </button>
            )}
          </div>
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
              {warnings > 0 && (
                <span style={{ padding: '0.2rem 0.6rem', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', border: '1px solid #f87171' }}>
                  Ескертулер: {warnings}/3
                </span>
              )}
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
                  {q.mediaUrl ? (
                    <div style={{ margin: '-0.5rem 0 1rem' }}>
                      <img
                        src={q.mediaUrl}
                        alt="question media"
                        style={{ width: '100%', maxWidth: 560, borderRadius: 12, border: '1px solid var(--border)' }}
                        loading="lazy"
                      />
                    </div>
                  ) : null}
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
