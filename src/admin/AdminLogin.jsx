import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e2) {
      setErr(e2);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Panel de Administración</h2>
          <p style={styles.subtitle}>Armando & Mireya</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <input 
              placeholder="admin@ejemplo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              type="email"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              placeholder="••••••••"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button disabled={loading} type="submit" style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {err && (
            <div style={styles.error}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>Credenciales incorrectas. Intenta nuevamente.</span>
            </div>
          )}
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Acceso exclusivo para novios</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F7F6 100%)',
    fontFamily: "'Montserrat', sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(44,95,111,0.15)',
    border: '1px solid rgba(44,95,111,0.1)',
    overflow: 'hidden'
  },
  header: {
    padding: '40px 32px 32px',
    background: 'linear-gradient(135deg, #2C5F6F 0%, #1B4A5A 100%)',
    textAlign: 'center',
    color: '#FFFFFF'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '600',
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic',
    letterSpacing: '0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    opacity: 0.95,
    fontWeight: '400',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontSize: '13px'
  },
  form: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A1A1A',
    letterSpacing: '0.3px'
  },
  input: {
    padding: '14px 16px',
    fontSize: '15px',
    border: '1.5px solid rgba(44,95,111,0.25)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: '#FDFDFB'
  },
  button: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, #2C5F6F 0%, #1B4A5A 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(44,95,111,0.25)',
    marginTop: '8px',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.5px'
  },
  error: {
    padding: '14px 16px',
    backgroundColor: 'rgba(200,90,84,0.08)',
    border: '1.5px solid rgba(200,90,84,0.25)',
    borderRadius: '12px',
    color: '#C85A54',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.5'
  },
  errorIcon: {
    fontSize: '18px'
  },
  footer: {
    padding: '20px 32px',
    borderTop: '1px solid rgba(44,95,111,0.1)',
    textAlign: 'center',
    background: 'rgba(44,95,111,0.03)'
  },
  footerText: {
    fontSize: '13px',
    color: 'rgba(26,26,26,0.6)',
    letterSpacing: '0.5px'
  }
};
