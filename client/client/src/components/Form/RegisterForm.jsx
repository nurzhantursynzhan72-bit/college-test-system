import React, { useMemo, useState } from 'react';
import Button from '../Button/Button.jsx';
import Form from './Form.jsx';

function validate({ name, email, phone, group, password }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Аты-жөні бос болмауы керек';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email форматы қате';
  if (!phone || !/^\+?\d{11}$/.test(phone.replace(/\s/g, ''))) errors.phone = 'Телефон 11 саннан тұруы керек';
  if (!group) errors.group = 'Топты таңдаңыз';
  if (!password || password.length < 6) errors.password = 'Кемінде 6 символ';
  return errors;
}

export default function RegisterForm({ onSubmit, busy = false }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', group: '', password: '' });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, group: true, password: true });
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
        <label className="form-label">Аты-жөні</label>
        <input
          className="form-control"
          placeholder="Айгерім Сейткали"
          value={values.name}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        {touched.name && errors.name ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.name}</div> : null}
      </div>

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
        {touched.email && errors.email ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.email}</div> : null}
      </div>

      <div className="form-group">
        <label className="form-label">Телефон</label>
        <input
          className="form-control"
          placeholder="+77001112233"
          value={values.phone}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
        {touched.phone && errors.phone ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.phone}</div> : null}
      </div>

      <div className="form-group">
        <label className="form-label">Тобы (Студенттер үшін)</label>
        <select
          className="form-control form-select"
          value={values.group}
          onBlur={() => setTouched((t) => ({ ...t, group: true }))}
          onChange={(e) => setValues((v) => ({ ...v, group: e.target.value }))}
        >
          <option value="">— Топ таңдаңыз —</option>
          <option value="БҚ-2405">БҚ-2405</option>
          <option value="БҚ-2406">БҚ-2406</option>
          <option value="БҚ-2407">БҚ-2407</option>
          <option value="ИТ-2401">ИТ-2401</option>
          <option value="ИТ-2402">ИТ-2402</option>
          <option value="ЭК-2401">ЭК-2401</option>
        </select>
        {touched.group && errors.group ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.group}</div> : null}
      </div>

      <div className="form-group">
        <label className="form-label">Пароль</label>
        <input
          className="form-control"
          type="password"
          placeholder="Кемінде 6 символ"
          value={values.password}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
        {touched.password && errors.password ? (
          <div style={{ color: 'var(--danger)', fontSize: 13 }}>{errors.password}</div>
        ) : null}
      </div>

      <Button type="submit" variant="primary" disabled={!canSubmit} style={{ width: '100%', justifyContent: 'center' }}>
        {busy ? 'Тіркелу...' : 'Тіркелу →'}
      </Button>

      {serverError ? <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{serverError}</div> : null}
    </Form>
  );
}
