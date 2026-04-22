import React from 'react';

export default function Loader({ label = 'Жүктеліп жатыр…' }) {
  return (
    <div className="loader" role="status" aria-live="polite" aria-busy="true">
      <div className="loader-spinner" aria-hidden="true" />
      <div className="loader-label">{label}</div>
    </div>
  );
}

