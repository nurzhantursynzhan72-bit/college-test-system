import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const label = item?.label ?? '';
        const to = item?.to ?? null;
        if (isLast || !to) {
          return (
            <span key={`${label}-${idx}`} className="crumb current">
              {label}
            </span>
          );
        }
        return (
          <span key={`${label}-${idx}`} className="crumb">
            <Link to={to}>{label}</Link>
            <span className="sep">/</span>
          </span>
        );
      })}
    </nav>
  );
}

