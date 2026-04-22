import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import Card from '../components/Card/Card.jsx';
import Loader from '../components/Loader/Loader.jsx';
import Button from '../components/Button/Button.jsx';

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Test Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [availableGroups] = useState(['БҚ-2305', 'БҚ-2304', 'БҚ-2404', 'БҚ-2405', 'БҚ-2504', 'БҚ-2505']);
  const [newDuration, setNewDuration] = useState('20');
  const [questions, setQuestions] = useState([{ id: 1, text: '', options: ['', '', '', ''], correct: 0 }]);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testsRes, resultsRes] = await Promise.all([
        api('/api/teacher/tests'),
        api('/api/teacher/results')
      ]);
      setTests(testsRes.tests || []);
      setResults(resultsRes.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Тестті өшіруді растайсыз ба? Ол қайтарылмайды.')) return;
    try {
      const res = await api(`/api/teacher/test/${id}`, { method: 'DELETE' });
      if (res.success) {
        setTests(tests.filter(t => t.id !== id));
      } else {
        alert(res.message || 'Қате');
      }
    } catch (e) {
      alert('Желі қатесі');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert('Кем дегенде 1 сұрақ қосыңыз');
    if (selectedGroups.length === 0) return alert('Кем дегенде 1 топ таңдаңыз');
    
    // Validate empty fields
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim() || questions[i].options.some(opt => !opt.trim())) {
        return alert(`Сұрақ ${i + 1} толық емес. Барлық өрістерді толтырыңыз.`);
      }
    }

    setCreating(true);
    try {
      const res = await api('/api/teacher/test', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle, subject: newSubject, group: selectedGroups.join(', '), duration: newDuration,
          questions: questions.map((q, idx) => ({ id: String(idx + 1), text: q.text, options: q.options, correct: q.correct }))
        })
      });
      if (res.success) {
        alert('Тест сәтті жасалды!');
        setActiveTab('tests');
        // Reset form
        setNewTitle(''); setNewSubject(''); setSelectedGroups([]); setNewDuration('20');
        setQuestions([{ id: 1, text: '', options: ['', '', '', ''], correct: 0 }]);
        loadData();
      } else {
        alert(res.message || 'Қате шықты');
      }
    } catch (err) {
      alert('Желі қатесі');
    } finally {
      setCreating(false);
    }
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
          <h1 className="dashboard-title">Мұғалім панелі</h1>
          <p style={{ color: 'var(--gray)', margin: '0.25rem 0 0 0' }}>Өз тесттеріңізді құру және нәтижелерді тексеру</p>
        </div>
        <Button variant="primary" onClick={() => setActiveTab('create')}>+ Жаңа тест құру</Button>
      </div>

      <div className="tab-nav">
        <button className={`tab-link ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>Менің тесттерім ({tests.length})</button>
        <button className={`tab-link ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Оқушылар нәтижесі ({results.length})</button>
        <button className={`tab-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Тест құру</button>
      </div>

      {activeTab === 'tests' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Тест атауы</th>
                  <th>Тобы</th>
                  <th>Уақыты</th>
                  <th>Сұрақтар</th>
                  <th style={{ textAlign: 'right' }}>Әрекет</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{t.subject}</div>
                    </td>
                    <td><span className="badge badge-student">{t.group}</span></td>
                    <td>{t.duration} мин</td>
                    <td>{t.questionCount}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn" onClick={() => handleDeleteTest(t.id)}>Өшіру</button>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>Сізде әлі тест жоқ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'results' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
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
        </Card>
      )}

      {activeTab === 'create' && (
        <Card>
          <form className="form" onSubmit={handleCreateTest}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Тест атауы</label>
                <input className="form-control" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Мысалы: JavaScript негіздері" />
              </div>
              <div className="form-group">
                <label className="form-label">Пәні</label>
                <input className="form-control" value={newSubject} onChange={e => setNewSubject(e.target.value)} required placeholder="Мысалы: Бағдарламалау" />
              </div>
              <div className="form-group">
                <label className="form-label">Арналған тобы</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg)', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '42px' }}>
                  {availableGroups.map(g => (
                    <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', background: 'var(--card-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedGroups.includes(g)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedGroups([...selectedGroups, g]);
                          else setSelectedGroups(selectedGroups.filter(sg => sg !== g));
                        }}
                      />
                      {g}
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>Тест кімдерге арналғанын белгілеңіз</div>
              </div>
              <div className="form-group">
                <label className="form-label">Уақыты (минут)</label>
                <input type="number" className="form-control" value={newDuration} onChange={e => setNewDuration(e.target.value)} required min="5" />
              </div>
            </div>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Сұрақтар</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.map((q, qIndex) => (
                <div key={q.id} style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Сұрақ {qIndex + 1}</span>
                    {questions.length > 1 && (
                      <button type="button" className="action-btn" onClick={() => handleRemoveQuestion(qIndex)}>Өшіру</button>
                    )}
                  </div>
                  
                  <textarea 
                    className="form-control" 
                    placeholder="Сұрақты жазыңыз..." 
                    value={q.text} 
                    onChange={e => { const n = [...questions]; n[qIndex].text = e.target.value; setQuestions(n); }} 
                    style={{ minHeight: '80px', marginBottom: '1rem' }}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          checked={q.correct === oIndex} 
                          onChange={() => { const n = [...questions]; n[qIndex].correct = oIndex; setQuestions(n); }} 
                          style={{ accentColor: 'var(--success)' }}
                        />
                        <input 
                          className="form-control" 
                          placeholder={`Нұсқа ${oIndex + 1}`} 
                          value={opt} 
                          onChange={e => { const n = [...questions]; n[qIndex].options[oIndex] = e.target.value; setQuestions(n); }}
                          required
                          style={q.correct === oIndex ? { borderColor: 'var(--success)', boxShadow: '0 0 0 1px var(--success-light)' } : {}}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.75rem' }}>* Дұрыс жауапты белгілеу үшін радио-батырманы басыңыз.</div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={handleAddQuestion} style={{ marginTop: '1.5rem', width: '100%' }}>
              + Жаңа сұрақ қосу
            </Button>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? 'Жасалуда...' : 'Тестті Сақтау'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
