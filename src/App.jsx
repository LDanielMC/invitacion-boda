import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import InvitacionView from "./invitacion/InvitacionView";
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminGuard = lazy(() => import("./admin/AdminGuard"));

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function App() {
  const query = useQuery();

  const token = query.get("t")?.trim() || "";
  const isAdminMode = query.get("admin") === "1";

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  // 1) ADMIN
  if (isAdminMode) {
    if (!authReady) return <div style={{ padding: 16 }}>Cargando…</div>;
    if (!user) return (
      <Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
        <AdminLogin />
      </Suspense>
    );

    // Aquí ya NO decidimos "denegado" en App.jsx, lo hace AdminGuard
    return (
      <Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
        <AdminGuard>
          <AdminDashboard />
        </AdminGuard>
      </Suspense>
    );
  }

  // 2) INVITACIÓN
  if (token) return <InvitacionView token={token} />;

  // 3) HOME
  return (
    <div style={{ padding: 16 }}>
      <h3>App de Invitaciones</h3>
      <p>Invitación:</p>
      <code>?t=TU_TOKEN</code>

      <hr style={{ margin: "16px 0" }} />

      <p>Panel admin:</p>
      <code>?admin=1</code>
    </div>
  );
}
