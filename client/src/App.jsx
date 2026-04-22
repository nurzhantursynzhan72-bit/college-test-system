import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import RequireAuth from './components/RequireAuth/RequireAuth.jsx';
import HomePage from './pages/HomePage.jsx';
import TestsPage from './pages/TestsPage.jsx';
import { useSession } from './hooks/useSession.js';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TestDetailsPage from './pages/TestDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import TeacherPage from './pages/TeacherPage.jsx';

export default function App() {
  const { me, login, logout } = useSession();

  return (
    <Routes>
      <Route element={<Layout user={me.loggedIn ? me.user : null} onLogout={logout} />}>
        <Route index element={<HomePage />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth me={me} role="admin">
              <AdminPage />
            </RequireAuth>
          }
        />

        <Route
          path="/teacher"
          element={
            <RequireAuth me={me} role="teacher">
              <TeacherPage />
            </RequireAuth>
          }
        />

        <Route
          path="/test"
          element={
            <RequireAuth me={me}>
              <TestsPage me={me} />
            </RequireAuth>
          }
        />
        <Route
          path="/test/:id"
          element={
            <RequireAuth me={me}>
              <TestDetailsPage />
            </RequireAuth>
          }
        />

        <Route path="/tests" element={<Navigate to="/test" replace />} />

        <Route
          path="/login"
          element={
            <LoginPage
              me={me}
              onLogin={async (values) => {
                await login(values);
              }}
            />
          }
        />
        <Route path="/register" element={<RegisterPage me={me} />} />

        <Route path="/auth" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
