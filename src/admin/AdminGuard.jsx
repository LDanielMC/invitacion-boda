import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function AdminGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setChecking(true);
      setAllowed(false);

      try {
        if (!user) return;

        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        setAllowed(adminSnap.exists());
      } catch {
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (checking) return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Verificando acceso...</p>
    </div>
  );
  
  if (!allowed) return (
    <div style={styles.container}>
      <div style={styles.deniedCard}>
        <span style={styles.icon}>🔒</span>
        <h2 style={styles.deniedTitle}>Acceso Denegado</h2>
        <p style={styles.deniedText}>No tienes permisos para acceder a esta sección.</p>
      </div>
    </div>
  );

  return children;
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F7F6 100%)',
    padding: '20px',
    fontFamily: "'Montserrat', sans-serif"
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(44,95,111,0.2)',
    borderTop: '4px solid #2C5F6F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    fontSize: '16px',
    color: 'rgba(26,26,26,0.7)',
    fontWeight: '500',
    margin: 0
  },
  deniedCard: {
    background: '#FFFFFF',
    padding: '40px 32px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(44,95,111,0.15)',
    border: '1.5px solid rgba(200,90,84,0.2)',
    textAlign: 'center',
    maxWidth: '440px'
  },
  icon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px'
  },
  deniedTitle: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: '600',
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic',
    color: '#C85A54'
  },
  deniedText: {
    margin: 0,
    fontSize: '15px',
    color: 'rgba(26,26,26,0.65)',
    lineHeight: '1.6'
  }
};

// Agregar animación de spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
