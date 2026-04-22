import React from 'react';

export default function Button({ variant = 'primary', size, className = '', type = 'button', ...props }) {
  const cls = [
    'btn',
    variant ? `btn-${variant}` : '',
    size ? `btn-${size}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={cls} {...props} />;
}

