import React from 'react';
import Button from '../Button/Button.jsx';

export default function TestCard({ subject, title, questionCount, duration, group, onClick }) {
  return (
    <div className="test-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' ? onClick?.() : null)}>
      <div className="test-card-subject">{subject || 'Жалпы'}</div>
      <div className="test-card-title">{title}</div>
      <div className="test-card-meta">
        <span>❓ {questionCount} сұрақ</span>
        <span>⏱️ {duration} мин</span>
      </div>
      <div className="test-card-footer">
        <span className="group-badge">{group}</span>
        <Button variant="outline" size="sm" onClick={(e) => (e.stopPropagation(), onClick?.())}>
          Ақпарат →
        </Button>
      </div>
    </div>
  );
}

