import React from 'react';

export default function Form({ className = '', children, ...props }) {
  return (
    <form className={['form', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </form>
  );
}

