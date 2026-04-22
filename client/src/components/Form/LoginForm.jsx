import React, { useMemo, useState } from 'react';
import Button from '../Button/Button.jsx';
import Form from './Form.jsx';

function validate({ email, password }) {
  const errors = {};
  if (!email || !email.includes('@')) errors.email = 'Email дұрыс емес';
  if (!password || password.length < 3) errors.password = 'Пароль тым қысқа';
  return errors;
}

export default function LoginForm({ onSubmit, busy = false }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError('');
    if (!canSubmit) return;
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err?.message || 'Қате');
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          placeholder="email@college.kz"
          value={values.email}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {touched.email && errors.email && (
          <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.email}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Пароль</label>
        <input
          className="form-control"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
        {touched.password && errors.password && (
          <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.password}</div>
        )}
      </div>

      <Button type="submit" variant="primary" disabled={!canSubmit} style={{ width: '100%', justifyContent: 'center' }}>
        {busy ? 'Кіру...' : 'Кіру →'}
      </Button>

      {serverError && (
        <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{serverError}</div>
      )}

      <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 10, fontSize: '0.82rem', color: 'var(--gray)', textAlign: 'center' }}>
        Demo: <code>student1@college.kz</code> / <code>student123</code>
      </div>
    </Form>
  );
}
