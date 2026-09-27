import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import * as XLSX from "xlsx";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "confirmado", label: "Confirmados" },
  { key: "pendiente", label: "Pendientes" },
  { key: "declinado", label: "Declinados" },
  { key: "con_nota", label: "Con nota alimenticia" }, // ✅ ahora es un filtro normal
];

function safeStatus(s) {
  if (s === "confirmado" || s === "pendiente" || s === "declinado") return s;
  return "pendiente";
}

function labelStatus(s) {
  if (s === "confirmado") return "Confirmado";
  if (s === "declinado") return "Declinado";
  return "Pendiente";
}

function normalizeText(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const s = normalizeText(a);
  const t = normalizeText(b);

  const m = s.length;
  const n = t.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function matchesFlexible(name, query) {
  const n = normalizeText(name);
  const q = normalizeText(query);

  if (!q) return true;
  if (n.includes(q)) return true;

  const tol = q.length <= 4 ? 1 : q.length <= 8 ? 2 : 3;

  const words = n.split(" ").filter(Boolean);
  for (const w of words) {
    if (levenshtein(w, q) <= tol) return true;
  }

  if (levenshtein(n, q) <= tol) return true;
  return false;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // {familiaNombre, texto}

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut(auth);
    } catch (e) {
      setErr(e);
    } finally {
      setLoggingOut(false);
    }
  }

  async function loadInvitaciones() {
    setLoading(true);
    setErr(null);

    try {
      const snap = await getDocs(collection(db, "invitaciones"));

      const data = snap.docs.map((d) => {
        const x = d.data();
        const nota = String(x.preferenciaAlimenticia ?? "").trim();

        return {
          id: d.id,
          familiaNombre: x.familiaNombre ?? "",
          estatus: safeStatus(x.estatus),
          pasesAsignados: Number(x.pasesAsignados ?? 0),
          pasesConfirmados: Number(x.pasesConfirmados ?? 0),
          preferenciaAlimenticia: nota,
          tieneNota: nota.length > 0,
        };
      });

      data.sort((a, b) =>
        String(a.familiaNombre || "").localeCompare(String(b.familiaNombre || ""), "es")
      );

      setItems(data);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvitaciones();
  }, []);

  const counts = useMemo(() => {
    const total = items.length;
    const confirmados = items.filter((x) => x.estatus === "confirmado").length;
    const pendientes = items.filter((x) => x.estatus === "pendiente").length;
    const declinados = items.filter((x) => x.estatus === "declinado").length;

    const totalPasesConfirmados = items.reduce(
      (acc, x) => acc + (Number(x.pasesConfirmados) || 0),
      0
    );

    const conNota = items.filter((x) => x.tieneNota).length;

    return { total, confirmados, pendientes, declinados, totalPasesConfirmados, conNota };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      // ✅ filtro principal único (mutuamente excluyente)
      const byFilter =
        filter === "todos"
          ? true
          : filter === "con_nota"
          ? x.tieneNota
          : x.estatus === filter;

      if (!byFilter) return false;

      // buscador flexible
      return matchesFlexible(x.familiaNombre, search);
    });
  }, [items, filter, search]);

  function openNota(x) {
    setModalData({
      familiaNombre: x.familiaNombre || "—",
      texto: x.preferenciaAlimenticia || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalData(null);
  }

  function exportToExcel() {
    // Obtener nombre del filtro actual para el archivo
    const filterLabel = FILTERS.find(f => f.key === filter)?.label || "Todos";
    const fileName = `invitados_${filterLabel.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Datos para la hoja
    const data = [
      ["Familia", "Estatus", "Pases Asignados", "Pases Confirmados", "Nota Alimenticia"],
      ...filtered.map(x => [
        x.familiaNombre || "—",
        labelStatus(x.estatus),
        x.pasesAsignados,
        x.pasesConfirmados,
        x.preferenciaAlimenticia || ""
      ])
    ];

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 30 },  // Familia
      { wch: 14 },  // Estatus
      { wch: 16 },  // Pases Asignados
      { wch: 18 },  // Pases Confirmados
      { wch: 50 },  // Nota Alimenticia
    ];

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Invitados");

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
  }

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Cargando invitados...</p>
    </div>
  );
  
  if (err) return (
    <div style={styles.errorContainer}>
      <span style={styles.errorIcon}>⚠️</span>
      <p style={styles.errorText}>Error: {String(err.message || err)}</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de Administración</h1>
          <p style={styles.subtitle}>Gestión de Invitados</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            ...styles.logoutButton,
            opacity: loggingOut ? 0.6 : 1,
            cursor: loggingOut ? "not-allowed" : "pointer",
          }}
        >
          {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>

      {/* Resúmenes */}
      <div style={styles.statsGrid}>
        <Card title="Total Invitados" value={counts.total} color="#2C5F6F" />
        <Card title="Confirmados" value={counts.confirmados} color="#3A7A8A" />
        <Card title="Pendientes" value={counts.pendientes} color="#5A8FA0" />
        <Card title="Declinados" value={counts.declinados} color="#C85A54" />
        <Card title="Pases Confirmados" value={counts.totalPasesConfirmados} color="#1B4A5A" />
        <Card title="Con Nota Alimenticia" value={counts.conNota} color="#4A6F7F" />
      </div>

      {/* Filtros + buscador */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterButtons}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setSearch("");
              }}
              style={{
                ...styles.filterButton,
                ...(filter === f.key ? styles.filterButtonActive : {})
              }}
            >
              {f.key === "con_nota" ? `Con nota (${counts.conNota})` : f.label}
            </button>
          ))}
        </div>

        <div style={styles.searchContainer}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar familia..."
            style={styles.searchInput}
          />

          <button
            onClick={loadInvitaciones}
            style={styles.reloadButton}
          >
            🔄 Recargar
          </button>

          <button
            onClick={exportToExcel}
            style={styles.exportButton}
            disabled={filtered.length === 0}
          >
            📥 Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <Th>Familia</Th>
              <Th>Estatus</Th>
              <Th>Pases Asignados</Th>
              <Th>Pases Confirmados</Th>
              <Th>Nota Alimenticia</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x, idx) => (
              <tr key={x.id} style={{
                ...styles.tableRow,
                backgroundColor: idx % 2 === 0 ? '#FDFDFB' : '#FFFFFF'
              }}>
                <Td style={styles.familyCell}>{x.familiaNombre || "—"}</Td>
                <Td>
                  <span style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(x.estatus)
                  }}>
                    {labelStatus(x.estatus)}
                  </span>
                </Td>
                <Td style={styles.numberCell}>{x.pasesAsignados}</Td>
                <Td style={styles.numberCell}>{x.pasesConfirmados}</Td>
                <Td>
                  {!x.tieneNota ? (
                    <span style={{ opacity: 0.5, fontSize: '14px' }}>—</span>
                  ) : (
                    <button
                      onClick={() => openNota(x)}
                      style={styles.viewNoteButton}
                    >
                      📋 Ver nota
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.tableFooter}>
        Mostrando <strong>{filtered.length}</strong> de <strong>{items.length}</strong> invitados
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onClose={closeModal} title={`Nota alimenticia — ${modalData?.familiaNombre || ""}`}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {modalData?.texto || "—"}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1.5px solid rgba(44,95,111,0.15)',
      borderRadius: '12px',
      padding: '16px',
      minWidth: '140px',
      flex: '1 1 140px',
      boxShadow: '0 2px 8px rgba(44,95,111,0.08)',
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '600',
        color: 'rgba(26,26,26,0.6)',
        marginBottom: '6px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>{title}</div>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700',
        color: color || '#2C5F6F',
        fontFamily: "'Cormorant Garamond', serif"
      }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ 
    padding: '16px', 
    fontSize: '13px', 
    fontWeight: '600',
    color: 'rgba(26,26,26,0.7)',
    textAlign: 'left',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  }}>{children}</th>;
}

function Td({ children, style }) {
  return <td style={{ 
    padding: '16px', 
    verticalAlign: 'middle',
    fontSize: '15px',
    ...style
  }}>{children}</td>;
}

function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: '20px',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          background: "#FFFFFF",
          color: "#1A1A1A",
          borderRadius: '20px',
          border: "1.5px solid rgba(44,95,111,0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: "1.5px solid rgba(44,95,111,0.15)",
            display: "flex",
            alignItems: "center",
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(44,95,111,0.08) 0%, rgba(44,95,111,0.03) 100%)'
          }}
        >
          <div style={{ 
            fontWeight: '600',
            fontSize: '18px',
            fontFamily: "'Cormorant Garamond', serif",
            color: '#2C5F6F'
          }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              padding: "10px 18px",
              borderRadius: '12px',
              border: "1.5px solid rgba(44,95,111,0.3)",
              background: "#FFFFFF",
              cursor: "pointer",
              fontSize: '14px',
              fontWeight: '500',
              color: '#2C5F6F',
              transition: 'all 0.2s ease'
            }}
          >
            Cerrar
          </button>
        </div>

        <div style={{ 
          padding: '24px',
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#1A1A1A'
        }}>{children}</div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const styles = {
    confirmado: {
      backgroundColor: 'rgba(90,154,107,0.12)',
      color: '#5A9A6B',
      border: '1.5px solid rgba(90,154,107,0.3)'
    },
    pendiente: {
      backgroundColor: 'rgba(184,160,126,0.12)',
      color: '#8B7355',
      border: '1.5px solid rgba(184,160,126,0.3)'
    },
    declinado: {
      backgroundColor: 'rgba(200,90,84,0.12)',
      color: '#C85A54',
      border: '1.5px solid rgba(200,90,84,0.3)'
    }
  };
  return styles[status] || styles.pendiente;
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F7F6 100%)'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(44,95,111,0.2)',
    borderTop: '4px solid #2C5F6F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '16px',
    color: 'rgba(26,26,26,0.7)',
    fontWeight: '500'
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F7F6 100%)',
    padding: '20px'
  },
  errorIcon: {
    fontSize: '48px'
  },
  errorText: {
    fontSize: '16px',
    color: '#C85A54',
    textAlign: 'center',
    maxWidth: '500px'
  },
  container: {
    minHeight: '100vh',
    padding: '20px 16px',
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F7F6 100%)',
    fontFamily: "'Montserrat', sans-serif"
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(44,95,111,0.1)',
    border: '1.5px solid rgba(44,95,111,0.1)',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: '600',
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic',
    color: '#2C5F6F'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(26,26,26,0.6)',
    letterSpacing: '0.5px'
  },
  logoutButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#C85A54',
    background: '#FFFFFF',
    border: '1.5px solid rgba(200,90,84,0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Montserrat', sans-serif"
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  },
  filtersContainer: {
    background: '#FFFFFF',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(44,95,111,0.08)',
    border: '1.5px solid rgba(44,95,111,0.1)'
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  filterButton: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#2C5F6F',
    background: '#FFFFFF',
    border: '1.5px solid rgba(44,95,111,0.25)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Montserrat', sans-serif",
    whiteSpace: 'nowrap'
  },
  filterButtonActive: {
    background: 'linear-gradient(135deg, #2C5F6F 0%, #1B4A5A 100%)',
    color: '#FFFFFF',
    border: '1.5px solid #2C5F6F',
    boxShadow: '0 4px 12px rgba(44,95,111,0.25)'
  },
  searchContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1 1 250px',
    padding: '10px 14px',
    fontSize: '14px',
    border: '1.5px solid rgba(44,95,111,0.25)',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: '#FDFDFB'
  },
  reloadButton: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#2C5F6F',
    background: '#FFFFFF',
    border: '1.5px solid rgba(44,95,111,0.25)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Montserrat', sans-serif",
    whiteSpace: 'nowrap'
  },
  exportButton: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, #5A9A6B 0%, #4A8A5B 100%)',
    border: '1.5px solid #5A9A6B',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Montserrat', sans-serif",
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(90,154,107,0.25)'
  },
  tableContainer: {
    background: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'auto',
    boxShadow: '0 4px 16px rgba(44,95,111,0.1)',
    border: '1.5px solid rgba(44,95,111,0.1)',
    WebkitOverflowScrolling: 'touch'
  },
  table: {
    width: '100%',
    minWidth: '700px',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    background: 'linear-gradient(135deg, rgba(44,95,111,0.08) 0%, rgba(44,95,111,0.03) 100%)',
    borderBottom: '2px solid rgba(44,95,111,0.15)'
  },
  tableRow: {
    borderBottom: '1px solid rgba(44,95,111,0.08)',
    transition: 'background-color 0.2s ease'
  },
  familyCell: {
    fontWeight: '500',
    color: '#2C5F6F'
  },
  numberCell: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#2C5F6F'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  viewNoteButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#2C5F6F',
    background: 'rgba(44,95,111,0.08)',
    border: '1.5px solid rgba(44,95,111,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Montserrat', sans-serif",
    whiteSpace: 'nowrap'
  },
  tableFooter: {
    padding: '16px 20px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(26,26,26,0.65)',
    background: '#FFFFFF',
    borderRadius: '0 0 16px 16px',
    marginTop: '-1px'
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
