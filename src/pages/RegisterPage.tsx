import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handle = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Registration failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 24,
    }}>
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}>🗜️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Create account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Start compressing your media files
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#fca5a5', marginBottom: 20,
            }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {[
              { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { id: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id} style={{ marginBottom: 18 }}>
                <label className="form-label">{label}</label>
                <input
                  id={id}
                  type={type}
                  className="form-input"
                  placeholder={placeholder}
                  value={form[id as keyof typeof form]}
                  onChange={handle(id)}
                  required
                />
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : '🚀 Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#c4b5fd', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
