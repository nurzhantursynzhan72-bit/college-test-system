import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '1 200+', label: 'Студент' },
  { value: '340', label: 'Жарияланған тест' },
  { value: '87%', label: 'Орташа нәтиже' },
  { value: '12', label: 'Оқытушы' },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Колледж <span>Онлайн Тест</span> Жүйесі</h1>
          <p>Мұғалімдер тест жариялайды — студенттер тобы бойынша тапсырады. Нәтиже бірден шығады.</p>
          <div className="hero-btns">
            <Link to="/login" className="btn btn-primary btn-lg">Тіркелу / Кіру</Link>
            <Link to="/test" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
              Тесттерді көру
            </Link>
          </div>
        </div>
      </section>

      <div className="features-grid">
        {[
          { title: 'Мұғалім тест жасайды', desc: 'Сұрақтар, жауаптар жазады. Топты таңдайды (БҚ-2405). Уақыт белгілейді.' },
          { title: 'Студент тапсырады', desc: 'Тобының тесттерін ғана көреді. Тапсырып, нәтижесін бірден алады.' },
          { title: 'Таймер бар', desc: 'Тест уақыты шектелген. Уақыт бітсе автоматты жіберіледі.' },
          { title: 'Excel экспорт', desc: 'Admin барлық нәтижелерді .xlsx форматта жүктеп алады.' },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon" />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <section className="stats-section">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
