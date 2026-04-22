import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import RegisterForm from '../components/Form/RegisterForm.jsx';
import { api } from '../api.js';

export default function RegisterPage({ me }) {
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');
  const navigate = useNavigate();

  if (!me.loading && me.loggedIn) {
    return <Navigate to="/test" replace />;
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Register' }]} />
      <Card className="auth-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Тіркелу</h1>
        <p style={{ color: 'var(--gray)' }}>Жаңа студент аккаунтын жасаңыз.</p>

        {alert ? (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            {alert}
          </div>
        ) : null}

        <RegisterForm
          busy={busy}
          onSubmit={async (values) => {
            setBusy(true);
            setAlert('');
            try {
              const data = await api('/api/register', {
                method: 'POST',
                body: JSON.stringify(values)
              });
              if (!data?.success) throw new Error(data?.message || 'Тіркелу кезінде қате шықты.');
              setAlert('Сәтті тіркелдіңіз! Енді кіріңіз.');
              navigate('/login', { replace: true });
            } finally {
              setBusy(false);
            }
          }}
        />

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          Аккаунт бар ма? <Link to="/login">Кіру</Link>
        </div>
      </Card>
    </div>
  );
}
