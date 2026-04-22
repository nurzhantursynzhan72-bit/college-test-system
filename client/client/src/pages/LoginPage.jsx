import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs.jsx';
import Card from '../components/Card/Card.jsx';
import LoginForm from '../components/Form/LoginForm.jsx';

export default function LoginPage({ me, onLogin }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || '/test';

  if (!me.loading && me.loggedIn) {
    return <Navigate to={fromPath} replace />;
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Home' }, { label: 'Login' }]} />
      <Card className="auth-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Кіру</h1>
        <p style={{ color: 'var(--gray)' }}>Email және пароль арқылы жүйеге кіріңіз.</p>

        <LoginForm
          busy={busy}
          onSubmit={async (values) => {
            setBusy(true);
            try {
              await onLogin(values);
              navigate(fromPath, { replace: true });
            } finally {
              setBusy(false);
            }
          }}
        />

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          Аккаунт жоқ па? <Link to="/register">Тіркелу</Link>
        </div>
      </Card>
    </div>
  );
}
