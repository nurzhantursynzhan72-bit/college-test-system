import React from 'react';

export default function Card({ className = '', children }) {
  return <section className={['card', className].filter(Boolean).join(' ')}>{children}</section>;
}

