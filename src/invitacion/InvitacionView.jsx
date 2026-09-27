import { useEffect, useMemo, useState, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Ilustraciones personalizadas
import RingsIllustration from "./illustrations/RingsIllustration";

// Iconos SVG externos
const AltarIcon = (props) => (
  <img src="/assets/altar.svg" alt="Altar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} {...props} />
);

const RegaloIcon = (props) => (
  <img src="/assets/regalo.svg" alt="Regalo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} {...props} />
);

import EnvelopeIllustration from "./illustrations/EnvelopeIllustration";

// Ornamentos botánicos
import BotanicalCornerTL from "./illustrations/botanical/BotanicalCornerTL";
import BotanicalCornerBR from "./illustrations/botanical/BotanicalCornerBR";
import BotanicalSprig from "./illustrations/botanical/BotanicalSprig";

// Icono elegante para dress code con elementos botánicos
const FormalSuitIcon = (props) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Marco circular con hojas */}
    <circle cx="24" cy="24" r="20" stroke="#6B8E7F" strokeWidth="1.5" opacity="0.3"/>
    
    {/* Hojas decorativas */}
    <path d="M24 6 Q26 8, 24 10 Q22 8, 24 6" fill="#6B8E7F" opacity="0.6"/>
    <path d="M38 24 Q36 26, 34 24 Q36 22, 38 24" fill="#6B8E7F" opacity="0.6"/>
    <path d="M24 42 Q22 40, 24 38 Q26 40, 24 42" fill="#6B8E7F" opacity="0.6"/>
    <path d="M10 24 Q12 22, 14 24 Q12 26, 10 24" fill="#6B8E7F" opacity="0.6"/>
    
    {/* Traje elegante simplificado */}
    <path d="M18 16 L20 28 L20 34 L28 34 L28 28 L30 16 Z" fill="none" stroke="#2C5F6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 16 L24 34" stroke="#2C5F6F" strokeWidth="1" opacity="0.4"/>
    
    {/* Corbata con detalle dorado */}
    <path d="M24 16 L22 20 L24 28 L26 20 Z" fill="#B8A07E" opacity="0.7" stroke="#2C5F6F" strokeWidth="0.8"/>
    
    {/* Cuello */}
    <path d="M20 16 L24 18 L28 16" stroke="#2C5F6F" strokeWidth="1.5" strokeLinecap="round"/>
    
    {/* Botones dorados */}
    <circle cx="21" cy="22" r="0.8" fill="#B8A07E"/>
    <circle cx="27" cy="22" r="0.8" fill="#B8A07E"/>
  </svg>
);

// Iconos básicos mejorados
const Icon = ({ children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const MapPin = (p) => (
  <Icon {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const Calendar = (p) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </Icon>
);

const CheckCircle = (p) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

const AlertCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </Icon>
);

const Minus = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);

const Plus = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
);

const Volume2 = (p) => (
  <Icon {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </Icon>
);

const VolumeX = (p) => (
  <Icon {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" x2="17" y1="9" y2="15" />
    <line x1="17" x2="23" y1="9" y2="15" />
  </Icon>
);

/* =========================
   UTILIDADES
========================= */
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("t")?.trim() || "";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function msToCountdown(ms) {
  const total = Math.max(0, ms);
  const s = Math.floor(total / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return { days, hours, mins, secs };
}

function safeNumber(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

// Función para crear evento de Google Calendar
function createGoogleCalendarUrl(title, details, location, startDate, endDate) {
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    location: location,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* =========================
   COMPONENTES UI
========================= */
const SectionTitle = ({ overline, title, subtitle, icon: IconCmp }) => (
  <div className="sectionHeader scroll-animate">
    {IconCmp && (
      <div className="sectionIcon">
        <IconCmp />
      </div>
    )}
    {overline && <p className="overline">{overline}</p>}
    <h2 className="h2">{title}</h2>
    {subtitle && <p className="subtitle">{subtitle}</p>}
    <div className="divider" />
  </div>
);

const InfoCard = ({ icon: IconCmp, title, children, image }) => (
  <div className="infoCard">
    {image ? (
      <div className="cardImage">
        <img src={image} alt={title} />
      </div>
    ) : IconCmp ? (
      <div className="cardIconWrap">
        <IconCmp />
      </div>
    ) : null}
    <h3 className="cardTitle">{title}</h3>
    <div className="cardBody">{children}</div>
  </div>
);

export default function InvitacionView({ token: tokenProp }) {
  const token = useMemo(() => tokenProp?.trim() || getTokenFromUrl(), [tokenProp]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inv, setInv] = useState(null);

  const [pasesConfirmados, setPasesConfirmados] = useState(0);
  const [preferenciaAlimenticia, setPreferenciaAlimenticia] = useState("");

  const [musicOn, setMusicOn] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const MUSIC_URL = "/audio/saxofon.mp3";

  // Scroll animations con Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observar todos los elementos con clase 'scroll-animate'
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  // Datos del evento
  const NOVIOS = "Armando & Mireya";
  const FECHA_EVENTO_TXT = "Sábado 14 de Marzo, 2026";
  const HORA_EVENTO_TXT = "4:00 PM";
  const LUGAR_TXT = "Jardín la Flor";
  const DIRECCION_TXT = "Las Fuentes, 62555 Jiutepec, Mor.";
  const DRESS_CODE = "Formal";
  const MAPS_LINK = "https://maps.app.goo.gl/6a4VErkoB56psRTD6";

  const EVENT_DATE = useMemo(() => new Date("2026-03-14T16:00:00-06:00"), []);
  const EVENT_END_DATE = useMemo(() => new Date("2026-03-14T23:00:00-06:00"), []);
  
  const googleCalendarUrl = useMemo(() => 
    createGoogleCalendarUrl(
      `Boda de ${NOVIOS}`,
      `Celebración de nuestra boda. ${DRESS_CODE}.`,
      `${LUGAR_TXT}, ${DIRECCION_TXT}`,
      EVENT_DATE,
      EVENT_END_DATE
    ),
    []
  );
  const [countdown, setCountdown] = useState(() => msToCountdown(EVENT_DATE - new Date()));
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
  const scheduleScrollRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(msToCountdown(EVENT_DATE - new Date()));
    }, 1000);
    return () => clearInterval(t);
  }, [EVENT_DATE]);

  // Detectar scroll en el itinerario y actualizar el punto activo
  useEffect(() => {
    const container = scheduleScrollRef.current;
    if (!container || loading) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.offsetWidth;
      const scrollWidth = container.scrollWidth;
      const maxScroll = scrollWidth - containerWidth;
      
      // Calcular el índice basado en la posición del scroll
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const newIndex = Math.round(scrollPercentage * 5);
      setActiveScheduleIndex(Math.min(Math.max(newIndex, 0), 5));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading]);

  // Función para navegar a un evento específico al hacer clic en un punto
  const scrollToScheduleItem = (index) => {
    const container = scheduleScrollRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const scrollWidth = container.scrollWidth;
    const maxScroll = scrollWidth - containerWidth;
    const targetScroll = (index / 5) * maxScroll;
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("Enlace incompleto. Verifica que el link tenga ?t=TU_TOKEN");
          return;
        }

        const ref = doc(db, "invitaciones", token);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("No encontramos esta invitación o el link ya no está activo.");
          return;
        }

        const data = snap.data();

        if (data.tokenActivo !== true) {
          setError("Esta invitación ya no está activa.");
          return;
        }

        setInv({ id: snap.id, ...data });
        setPasesConfirmados(safeNumber(data.pasesConfirmados, 0));
        setPreferenciaAlimenticia(String(data.preferenciaAlimenticia ?? "").trim());
      } catch (e) {
        console.error(e);
        setError("Ocurrió un error cargando la invitación. Intenta recargar.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const maxPases = inv?.pasesAsignados ?? 0;
  const estatus = inv?.estatus || "pendiente";
  const isConfirmed = estatus === "confirmado";
  const isDeclined = estatus === "declinado";

  async function guardarConfirmacion(nuevoEstatus) {
    try {
      setSaving(true);
      setError("");

      if (!token) return;

      const n = safeNumber(pasesConfirmados, 0);

      if (n < 0) {
        setError("Pon un número válido.");
        return;
      }
      if (n > maxPases) {
        setError(`No puedes confirmar más de ${maxPases} pases.`);
        return;
      }

      const nota = String(preferenciaAlimenticia || "").trim();

      const ref = doc(db, "invitaciones", token);
      await updateDoc(ref, {
        pasesConfirmados: n,
        estatus: nuevoEstatus,
        preferenciaAlimenticia: nota,
        confirmadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });

      setInv((prev) => ({
        ...(prev || {}),
        pasesConfirmados: n,
        estatus: nuevoEstatus,
        preferenciaAlimenticia: nota,
      }));
    } catch (e) {
      console.error(e);
      setError("No pudimos guardar. Revisa conexión/permisos.");
    } finally {
      setSaving(false);
    }
  }

  function inc() {
    setPasesConfirmados((p) => {
      const n = safeNumber(p, 0);
      return n < maxPases ? n + 1 : n;
    });
  }
  function dec() {
    setPasesConfirmados((p) => {
      const n = safeNumber(p, 0);
      return n > 0 ? n - 1 : n;
    });
  }

  useEffect(() => {
    if (!MUSIC_URL) return;
    const a = document.getElementById("wedding-audio");
    if (!a) return;
    const onCanPlay = () => setAudioReady(true);
    a.addEventListener("canplay", onCanPlay);
    return () => a.removeEventListener("canplay", onCanPlay);
  }, [MUSIC_URL]);

  useEffect(() => {
    if (!MUSIC_URL) return;
    const a = document.getElementById("wedding-audio");
    if (!a) return;

    if (musicOn) {
      a.volume = 0.55;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, [musicOn, MUSIC_URL]);

  if (loading) {
    return (
      <div className="page center">
        <div className="spinner" />
        <p className="subtle mt-3">Cargando invitación…</p>
        <Style />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page center">
        <div className="errorBox">
          <AlertCircle width="44" height="44" style={{ color: "#C85A54" }} />
          <h1 className="h3 mt-3">No se pudo abrir</h1>
          <p className="subtle mt-2">{error}</p>
        </div>
        <Style />
      </div>
    );
  }

  return (
    <div className="page">
      <Style />

      {/* Audio */}
      {MUSIC_URL ? <audio id="wedding-audio" src={MUSIC_URL} loop preload="auto" /> : null}

      {/* HERO con fondo */}
      <header className="hero">
        <div className="heroBgImage" style={{ backgroundImage: 'url(/assets/boda1.webp)' }} />
        
        {/* Ornamentos botánicos solo en header */}
        <BotanicalCornerTL className="botanical-corner-hero tl" />
        <BotanicalCornerBR className="botanical-corner-hero br" />
        <BotanicalSprig className="botanical-sprig-hero left" />
        <BotanicalSprig className="botanical-sprig-hero right" flip />
        
        <div className="heroContent">
          {/* Imagen decorativa arriba de NUESTRA BODA */}
          <img src="/assets/1.svg" alt="" className="heroTopImage" />

          <p className="overline overlineLarge">Nuestra Boda</p>
          
          <h1 className="h1">{NOVIOS}</h1>
          <p className="loveQuote">"Nos encontramos, nos elegimos, y hoy queremos compartir con ustedes nuestra felicidad"</p>
        </div>
      </header>

      {/* Divisor SVG 3 + 4 */}
      <div className="sectionDivider">
        <img src="/assets/3.svg" alt="" className="dividerImage scroll-animate" />
        <img src="/assets/4.svg" alt="" className="dividerImage scroll-animate delay-1" />
      </div>

      {/* CEREMONIA */}
      <section className="section">
        <div className="container">
          <SectionTitle
            icon={AltarIcon}
            overline="CEREMONIA"
            title="Celebra con nosotros"
            subtitle="Tenemos el honor de invitarles a celebrar nuestra boda el próximo."
          />

          <div className="heroDate scroll-animate delay-1" style={{ marginTop: '32px', marginBottom: '24px' }}>
            <div className="dateBox">
              <Calendar width="20" height="20" className="dateIcon" />
              <span>{FECHA_EVENTO_TXT}</span>
            </div>
            <div className="dateBox">
              <span>{HORA_EVENTO_TXT}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="countdown scroll-animate delay-2" style={{ marginBottom: '40px' }}>
            <div className="cdBox">
              <div className="cdNum">{countdown.days}</div>
              <div className="cdLbl">Días</div>
            </div>
            <div className="cdBox">
              <div className="cdNum">{pad2(countdown.hours)}</div>
              <div className="cdLbl">Horas</div>
            </div>
            <div className="cdBox">
              <div className="cdNum">{pad2(countdown.mins)}</div>
              <div className="cdLbl">Min</div>
            </div>
            <div className="cdBox">
              <div className="cdNum">{pad2(countdown.secs)}</div>
              <div className="cdLbl">Seg</div>
            </div>
          </div>

         <div className="grid2 scroll-animate">
        <InfoCard icon={Calendar} title="Itinerario">
          <div className="scheduleScroll" ref={scheduleScrollRef}>
            <div className="scheduleItem">
              <p className="scheduleTime">4:00 PM</p>
              <p className="scheduleLabel">Recepción de invitados</p>
            </div>

            <div className="scheduleItem">
              <p className="scheduleTime">4:30 PM</p>
              <p className="scheduleLabel">Ceremonia civil</p>
            </div>

            <div className="scheduleItem">
              <p className="scheduleTime">5:30 PM</p>
              <p className="scheduleLabel">Cóctel de bienvenida</p>
            </div>

            <div className="scheduleItem">
              <p className="scheduleTime">6:50 PM</p>
              <p className="scheduleLabel">Cena</p>
            </div>

            <div className="scheduleItem">
              <p className="scheduleTime">8:00 PM</p>
              <p className="scheduleLabel">Vals y brindis</p>
            </div>

            <div className="scheduleItem">
              <p className="scheduleTime">2:00 AM</p>
              <p className="scheduleLabel">Fin del evento</p>
            </div>
          </div>

          {/* Indicadores de puntos para scroll horizontal */}
          <div className="scheduleDots">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span 
                key={i}
                className={`scheduleDot ${activeScheduleIndex === i ? 'active' : ''}`}
                onClick={() => scrollToScheduleItem(i)}
              />
            ))}
          </div>

          <a className="linkBtn mt-3" href={googleCalendarUrl} target="_blank" rel="noreferrer">
            <Calendar width="16" height="16" style={{ marginRight: "6px" }} />
            Guardar fecha en Google Calendar
          </a>
        </InfoCard>
      


            <InfoCard icon={MapPin} title="Ubicación">
              <p className="strong">{LUGAR_TXT}</p>
              <p className="mt-1">{DIRECCION_TXT}</p>
              <p className="micro mt-3">Fecha: {FECHA_EVENTO_TXT}</p>
              <a className="linkBtn mt-3" href={MAPS_LINK} target="_blank" rel="noreferrer">
                Ver en Google Maps
              </a>
            </InfoCard>
          </div>
        </div>
      </section>

      {/* Divisor SVG 3 + 4 */}
      <div className="sectionDivider">
        <img src="/assets/3.svg" alt="" className="dividerImage scroll-animate" />
        <img src="/assets/4.svg" alt="" className="dividerImage scroll-animate delay-1" />
      </div>

      {/* DRESS CODE */}
      <section className="section soft">
        <div className="container">
          <div className="centerBox scroll-animate">
            <div className="iconBadge">
              <FormalSuitIcon />
            </div>
            <h3 className="h2 mt-4">Código de vestimenta</h3>
            <div className="dressCodeBadge">{DRESS_CODE}</div>
            <p className="subtle mt-3">
              Queremos verlos elegantes para celebrar juntos este momento especial.
            </p>
            <p className="romanticMessage mt-4">"Vístete de amor y alegría para celebrar con nosotros"</p>
            <div className="reservedColorsNote mt-4">
              <div className="reservedColorsIcon">✦</div>
              <p className="reservedColorsText">
                El tono <em>blanco</em> está reservado para la novia
              </p>
              <span className="colorSwatch white" title="Blanco"></span>
              <p className="reservedColorsText mt-3">
                y el <em>azul marino</em> para las damas de honor
              </p>
              <span className="colorSwatch navy" title="Azul marino"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor SVG 3 + 4 */}
      <div className="sectionDivider">
        <img src="/assets/3.svg" alt="" className="dividerImage scroll-animate" />
        <img src="/assets/4.svg" alt="" className="dividerImage scroll-animate delay-1" />
      </div>

      {/* MESA DE REGALOS */}
      <section className="section">
        <div className="container">
          <SectionTitle
            icon={RegaloIcon}
            overline="REGALOS"
            title="Mesa de regalos"
            subtitle="Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle:"
          />
          <p className="romanticMessage scroll-animate delay-1">"Lo más valioso es compartir este día contigo"</p>

          <div className="grid2 scroll-animate">
            {/* Liverpool con LOGO */}
            <a 
              href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/51886558" 
              target="_blank" 
              rel="noreferrer" 
              className="giftCard giftCardLink"
            >
              <div className="giftLogo">
                <img src="/assets/Liverpool.svg" alt="Liverpool" />
              </div>
              <div>
                <div className="giftTitle">Mesa de regalos</div>
                <div className="subtle mt-1">Liverpool</div>
              </div>
            </a>

            {/* Amazon con LOGO */}
            <a 
              href="https://www.amazon.com.mx/wedding/guest-view/1YSJU584RMA3" 
              target="_blank" 
              rel="noreferrer" 
              className="giftCard giftCardLink"
            >
              <div className="giftLogo">
                <img src="/assets/amazon.svg" alt="Amazon" />
              </div>
              <div>
                <div className="giftTitle">Mesa de regalos</div>
                <div className="subtle mt-1">Amazon</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Divisor SVG 3 + 4 */}
      <div className="sectionDivider">
        <img src="/assets/3.svg" alt="" className="dividerImage scroll-animate" />
        <img src="/assets/4.svg" alt="" className="dividerImage scroll-animate delay-1" />
      </div>

      {/* RSVP */}
      <section className="section">
        <div className="container">
          <div className="rsvp scroll-animate">
            <div className="rsvpHeader">
              <p className="overline">RSVP</p>
              <h2 className="h2">Confirma tu asistencia</h2>
              <p className="romanticMessage mt-2">"Tu presencia hará este día aún más especial"</p>
              <p className="subtle mt-3">
                Hola, <span className="strong">{inv?.familiaNombre || "Invitado"}</span>
              </p>
              <p className="micro mt-2">Pases asignados: {maxPases}</p>
            </div>

            <div className="rsvpBody">
              <div className="pases">
                <button className="circleBtn" onClick={dec} disabled={saving || pasesConfirmados <= 0}>
                  <Minus width="18" height="18" />
                </button>

                <div className="pasesMid">
                  <div className="pasesNum">{safeNumber(pasesConfirmados, 0)}</div>
                  <div className="micro">de {maxPases}</div>
                </div>

                <button className="circleBtn" onClick={inc} disabled={saving || pasesConfirmados >= maxPases}>
                  <Plus width="18" height="18" />
                </button>
              </div>

              <div className={`nota ${safeNumber(pasesConfirmados, 0) > 0 ? "open" : ""}`}>
                <label className="label">Alergias o restricciones alimentarias</label>
                <textarea
                  value={preferenciaAlimenticia}
                  onChange={(e) => setPreferenciaAlimenticia(e.target.value)}
                  placeholder="Ej: Alergia a nueces, vegetariano, sin mariscos…"
                  rows={3}
                />
                <div className="micro mt-2">Solo si aplica. Si no, déjalo en blanco.</div>
              </div>

              {isConfirmed && (
                <div className="toast ok">
                  <CheckCircle width="18" height="18" />
                  <span>¡Gracias! Tu asistencia está confirmada.</span>
                </div>
              )}
              {isDeclined && <div className="toast neutral">Lamentamos que no puedas acompañarnos.</div>}

              <div className="actions">
                <button
                  className="primary"
                  onClick={() => guardarConfirmacion("confirmado")}
                  disabled={saving || safeNumber(pasesConfirmados, 0) <= 0}
                >
                  {saving ? "Guardando…" : "Confirmar asistencia"}
                </button>

                <button
                  className="link"
                  onClick={() => guardarConfirmacion("declinado")}
                  disabled={saving}
                >
                  No podré asistir
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container centerText">
          <img src="/assets/aym.webp" alt="A & M" className="footerMonoImage" />
          <div className="micro mt-2">14 • 03 • 2026</div>
          <div className="micro mt-6" style={{ opacity: 0.6 }}>
            Hecho con amor para nuestra boda
          </div>
          <img src="/assets/2.svg" alt="" className="footerImage" />
        </div>
      </footer>

      {/* MINI FOOTER CLICHÉ */}
      <div className="miniFooter">
        <div className="miniFooterContent">
          <div className="miniFooterBrand">
            <img src="/assets/camara.svg" alt="Cliché" className="miniFooterLogo" />
            <span className="miniFooterText">cliché</span>
          </div>
          <div className="miniFooterLinks">
            <a href="mailto:marketing.fd.82@gmail.com" className="miniFooterLink" title="Enviar correo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
            </a>
            <a href="https://wa.me/527774476977" target="_blank" rel="noopener noreferrer" className="miniFooterLink" title="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* BOTÓN MÚSICA */}
      <button
        className="musicFab"
        onClick={() => {
          if (!MUSIC_URL) return;
          setMusicOn((v) => !v);
        }}
        title={!MUSIC_URL ? "Música pendiente" : musicOn ? "Pausar música" : "Reproducir música"}
        style={{ opacity: MUSIC_URL ? 1 : 0.5, cursor: MUSIC_URL ? "pointer" : "not-allowed" }}
      >
        {musicOn ? <Volume2 width="20" height="20" /> : <VolumeX width="20" height="20" />}
      </button>
    </div>
  );
}

/* =========================
   ESTILOS COSMOS BOTÁNICO
========================= */
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@300;400;500;600&display=swap');

      :root {
        --bg: #FDFDFB;
        --paper: #FFFFFF;
        --ink: #1A1A1A;
        --muted: rgba(26,26,26,0.65);
        --micro: rgba(26,26,26,0.50);

        --botanical: #6B8E7F;
        --botanical-light: #A8C5BA;
        --navy: #083d83;
        --navy-light: #1a5bb8;
        --navy-dark: #052a5f;
        --gold: #B8A07E;
        --silver: #C0C5CE;
        --silver-light: #E8EAED;
        --accent: #C85A54;

        --border: rgba(8,61,131,0.15);
        --shadow: 0 8px 24px rgba(8,61,131,0.08);
        --shimmer: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);

        /* =============== */
        /* CONFIGURACIÓN DE OPACIDAD */
        /* Cambia este valor entre 0 y 1 para ajustar la foto del header */
        --hero-img-opacity: 0.8; 
        /* =============== */
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html {
        height: 100%;
        scroll-behavior: smooth;
      }

      body {
        height: 100%;
        margin: 0;
        background: #FFFFFF;
        color: var(--ink);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
        font-family: 'Montserrat', sans-serif;
      }

      .page {
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
      }

      /* Ornamentos botánicos solo en header */
      .botanical-corner-hero {
        position: absolute;
        pointer-events: none;
        z-index: 1;
        opacity: 0.75;
      }
      .botanical-corner-hero.tl {
        top: 0;
        left: 0;
        width: 240px;
        height: 240px;
      }
      .botanical-corner-hero.br {
        bottom: 0;
        right: 0;
        width: 240px;
        height: 240px;
      }

      .botanical-sprig-hero {
        position: absolute;
        pointer-events: none;
        z-index: 1;
        width: 200px;
        height: 130px;
        opacity: 0.5;
      }
      .botanical-sprig-hero.left {
        top: 20%;
        left: 0;
      }
      .botanical-sprig-hero.right {
        bottom: 15%;
        right: 0;
      }

      .sectionDivider {
        width: 100%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0;
        padding: 40px 20px;
        position: relative;
        z-index: 3;
        background: #FFFFFF;
      }

      .dividerImage {
        width: 100%;
        max-width: 600px;
        height: auto;
        object-fit: contain;
        opacity: 0.85;
        filter: drop-shadow(0 4px 12px rgba(27,59,111,0.08));
        flex: 0 0 auto;
      }

      .dividerImage:first-child {
        margin-right: -80px;
        z-index: 1;
      }

      .dividerImage:last-child {
        z-index: 2;
      }

      /* Tipografía */
      .h1, .h2, .h3, .footerMono {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
      }

      .h1 {
        font-size: clamp(48px, 8vw, 72px);
        font-style: italic;
        font-family: 'Cormorant Garamond', serif;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 50%, var(--silver) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.1;
        margin: 16px 0;
        letter-spacing: 0.02em;
        animation: fadeIn 1s ease-out 0.4s backwards;
        filter: drop-shadow(0 2px 8px rgba(8,61,131,0.15));
      }

      .h2 {
        font-size: clamp(32px, 5vw, 48px);
        font-style: italic;
        font-family: 'Cormorant Garamond', serif;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
        margin: 0;
      }

      .h3 {
        font-size: 20px;
        color: var(--ink);
      }

      .overline {
        text-transform: uppercase;
        letter-spacing: 0.24em;
        font-size: 20px;
        background: linear-gradient(90deg, var(--gold) 0%, #D4AF37 50%, var(--gold) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 600;
        margin-bottom: 12px;
        animation: shimmer 3s ease-in-out infinite;
      }

      .overlineLarge {
        font-size: 28px;
        letter-spacing: 0.32em;
        font-weight: 600;
        background: linear-gradient(90deg, var(--gold) 0%, #D4AF37 50%, var(--gold) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s ease-in-out infinite;
      }

      .subtitle {
        color: var(--muted);
        font-size: 17px;
        line-height: 1.7;
        margin-top: 12px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .subtle {
        color: var(--muted);
        line-height: 1.6;
        font-size: 16px;
      }

      .micro {
        color: var(--micro);
        font-size: 14px;
        line-height: 1.5;
      }

      .strong {
        font-weight: 600;
        color: var(--navy);
        font-size: 17px;
      }

      .centerText {
        text-align: center;
      }

      .mt-1 { margin-top: 6px; }
      .mt-2 { margin-top: 10px; }
      .mt-3 { margin-top: 14px; }
      .mt-4 { margin-top: 18px; }
      .mt-6 { margin-top: 24px; }

      /* Mensajes románticos */
      .loveQuote {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(22px, 4vw, 30px);
        font-style: italic;
        color: var(--navy);
        margin: 20px auto;
        letter-spacing: 0.02em;
        animation: fadeIn 1s ease-out 0.6s backwards;
        max-width: min(90%, 800px);
        padding: 0 20px;
        font-weight: 500;
        text-align: center;
        line-height: 1.5;
      }

      .romanticMessage {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(20px, 3.5vw, 26px);
        font-style: italic;
        color: var(--navy);
        text-align: center;
        max-width: 700px;
        margin: 20px auto;
        line-height: 1.6;
        padding: 20px 28px;
        background: linear-gradient(135deg, rgba(192,197,206,0.12), rgba(184,160,126,0.08), rgba(192,197,206,0.08));
        backdrop-filter: blur(8px);
        border-radius: 16px;
        border: 2px solid rgba(192,197,206,0.25);
        box-shadow: 0 6px 20px rgba(8,61,131,0.12), 0 0 15px rgba(192,197,206,0.2);
        animation: fadeInUp 0.8s ease-out backwards;
        font-weight: 500;
        position: relative;
        overflow: hidden;
      }

      .romanticMessage::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 3s ease-in-out infinite;
        z-index: 0;
      }

      /* Nota colores reservados - Estilo elegante */
      .reservedColorsNote {
        text-align: center;
        max-width: 450px;
        margin: 28px auto 0;
        padding: 24px 28px;
        position: relative;
        background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,250,0.95));
        border-radius: 20px;
        border: 1px solid rgba(184,160,126,0.2);
        box-shadow: 0 4px 20px rgba(8,61,131,0.06);
      }

      .reservedColorsIcon {
        font-size: 20px;
        color: var(--gold);
        margin-bottom: 12px;
        letter-spacing: 12px;
      }

      .reservedColorsText {
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        color: var(--ink);
        line-height: 1.8;
        margin: 0;
      }

      .reservedColorsText em {
        font-style: italic;
        color: var(--navy);
        font-weight: 600;
      }

      .colorSwatch {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        animation: floatSwatch 3s ease-in-out infinite;
        display: block;
        margin: 12px auto 0;
      }

      .colorSwatch.navy {
        background: var(--navy);
        box-shadow: 
          0 8px 24px rgba(8,61,131,0.4),
          0 0 20px rgba(8,61,131,0.2);
        animation-delay: 0.5s;
      }

      .colorSwatch.white {
        background: #FFFFFF;
        box-shadow: 
          0 8px 24px rgba(0,0,0,0.12),
          0 0 20px rgba(192,197,206,0.3);
      }

      @keyframes floatSwatch {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      /* Animaciones */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes glow {
        0%, 100% {
          box-shadow: 0 8px 24px rgba(8,61,131,0.12), 0 0 20px rgba(192,197,206,0.3);
        }
        50% {
          box-shadow: 0 12px 32px rgba(8,61,131,0.18), 0 0 30px rgba(192,197,206,0.5);
        }
      }

      /* Layout */
      .container {
        width: min(1100px, calc(100% - 40px));
        margin: 0 auto;
      }

      .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        background: #FFFFFF;
      }

      .section {
        position: relative;
        z-index: 3;
        padding: 80px 0;
        background: #FFFFFF;
      }

      /* Sección Ceremonia - blanco puro */
      .section:nth-of-type(1) {
        background: #FFFFFF;
      }

      /* Sección Dress Code - gris muy claro */
      .section.soft {
        background: #F8F9FA;
        position: relative;
      }

      /* Sección Mesa de Regalos - blanco hueso */
      .section:nth-of-type(3) {
        background: #FEFEFE;
      }

      /* Sección RSVP - blanco cálido */
      .section:nth-of-type(4) {
        background: #FDFCFB;
      }

      .section.soft::before {
        display: none;
      }

      /* HERO */
      .hero {
        position: relative;
        z-index: 1;
        padding: 80px 0 100px 0;
        text-align: center;
        overflow: hidden;
        height: 100vh;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .heroBgImage {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-size: cover;
        background-position: center;
        
        /* USO DE LA VARIABLE GLOBAL */
        opacity: var(--hero-img-opacity);
        
        z-index: 0;
      }

      .heroContent {
        position: relative;
        z-index: 1;
        width: min(1000px, calc(100% - 40px));
        margin: 0 auto;
        padding: 0 20px;
      }

      .heroContent::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120%;
        height: 120%;
        background: radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 40%, transparent 70%);
        z-index: -1;
        filter: blur(40px);
        pointer-events: none;
      }

      .heroContent > * {
        animation: fadeInUp 0.7s ease-out backwards;
      }

      .heroContent > :nth-child(1) { animation-delay: 0.1s; }
      .heroContent > :nth-child(2) { animation-delay: 0.2s; }
      .heroContent > :nth-child(3) { animation-delay: 0.3s; }
      .heroContent > :nth-child(4) { animation-delay: 0.4s; }
      .heroContent > :nth-child(5) { animation-delay: 0.5s; }
      .heroContent > :nth-child(6) { animation-delay: 0.6s; }

      /* Imagen decorativa arriba de NUESTRA BODA */
      .heroTopImage {
        width: 150px;
        height: auto;
        object-fit: contain;
        margin: 0 auto 20px auto;
        display: block;
        opacity: 0.9;
        filter: drop-shadow(0 6px 18px rgba(27,59,111,0.12)) drop-shadow(0 0 20px rgba(192,197,206,0.3));
        animation: scaleIn 1s ease-out 0.2s backwards, float 4s ease-in-out infinite;
      }


      .heroDate {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: nowrap;
        margin-top: 20px;
      }

      .dateBox {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 28px;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(192,197,206,0.1));
        backdrop-filter: blur(8px);
        border: 2px solid rgba(192,197,206,0.3);
        border-radius: 999px;
        font-size: 20px;
        color: var(--navy);
        font-weight: 600;
        box-shadow: 0 6px 20px rgba(8,61,131,0.12), 0 0 15px rgba(192,197,206,0.2);
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .dateBox:hover {
        box-shadow: 0 8px 24px rgba(8,61,131,0.18), 0 0 25px rgba(192,197,206,0.4);
        transform: translateY(-2px);
      }

      .dateIcon {
        color: var(--botanical);
      }

      /* Countdown */
      .countdown {
        margin: 32px auto 0 auto;
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cdBox {
        width: 90px;
        padding: 18px 12px;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(184,160,126,0.08));
        backdrop-filter: blur(8px);
        border: 2px solid rgba(8,61,131,0.2);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(8,61,131,0.12), 0 0 20px rgba(192,197,206,0.2);
        transition: all 0.3s ease;
        animation: glow 3s ease-in-out infinite;
        text-align: center;
      }

      .cdBox:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 12px 32px rgba(8,61,131,0.18), 0 0 30px rgba(192,197,206,0.4);
        border-color: var(--silver);
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(192,197,206,0.15));
      }

      .cdNum {
        font-family: 'Cormorant Garamond', serif;
        font-size: 44px;
        font-weight: 700;
        color: var(--navy);
        line-height: 1;
        text-shadow: 0 2px 8px rgba(8,61,131,0.15);
        text-align: center;
      }

      .cdLbl {
        margin-top: 8px;
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--navy);
        font-weight: 600;
        text-align: center;
      }

      /* Section Header */
      .sectionHeader {
        text-align: center;
        margin-bottom: 50px;
      }

      .sectionIcon {
        margin: 0 auto 20px auto;
        display: inline-flex;
        width: 140px;
        height: 140px;
      }

      .sectionIcon svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 6px 18px rgba(27,59,111,0.12));
      }

      .divider {
        width: 80px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--botanical), transparent);
        margin: 20px auto 0 auto;
        opacity: 0.6;
      }

      /* Grid */
      .grid2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }

      /* Info Cards */
      .infoCard {
        background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(8,61,131,0.02));
        border: 2px solid rgba(8,61,131,0.15);
        border-radius: 24px;
        padding: 40px 32px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(8,61,131,0.12), 0 4px 12px rgba(8,61,131,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeInUp 0.6s ease-out backwards;
        position: relative;
        overflow: hidden;
      }

      .infoCard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--navy) 0%, var(--navy-light) 50%, var(--navy) 100%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .infoCard::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(8,61,131,0.08) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .infoCard:hover::before {
        opacity: 1;
      }

      .infoCard:hover::after {
        opacity: 1;
      }

      .infoCard:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 50px rgba(8,61,131,0.2), 0 8px 20px rgba(8,61,131,0.12), 0 0 40px rgba(192,197,206,0.3), inset 0 1px 0 rgba(255,255,255,1);
        border-color: var(--navy);
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(8,61,131,0.05));
      }

      .grid2 .infoCard:nth-child(1) { animation-delay: 0.1s; }
      .grid2 .infoCard:nth-child(2) { animation-delay: 0.2s; }

      .cardIconWrap {
        margin: 0 auto 20px auto;
        display: inline-flex;
        color: var(--navy);
        width: 56px;
        height: 56px;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(8,61,131,0.08), rgba(192,197,206,0.05));
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(8,61,131,0.1);
        transition: all 0.3s ease;
      }

      .infoCard:hover .cardIconWrap {
        transform: scale(1.1) translateY(-4px);
        box-shadow: 0 8px 20px rgba(8,61,131,0.2);
        background: linear-gradient(135deg, rgba(8,61,131,0.12), rgba(192,197,206,0.08));
      }

      .cardImage {
        margin: 0 auto 16px auto;
        width: 80px;
        height: 80px;
        border-radius: 12px;
        overflow: hidden;
      }

      .cardImage img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cardTitle {
        font-family: 'Cormorant Garamond', serif;
        font-size: 30px;
        font-weight: 700;
        font-style: italic;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 18px;
        position: relative;
        z-index: 1;
      }

      .cardBody {
        color: var(--muted);
        font-size: 16px;
        line-height: 1.8;
        position: relative;
        z-index: 1;
      }

      /* Schedule Items */
      .scheduleItem {
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(8,61,131,0.03));
        border-radius: 16px;
        border: 2px solid rgba(8,61,131,0.12);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(8,61,131,0.08);
      }

      .scheduleItem::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background: linear-gradient(180deg, var(--navy) 0%, var(--navy-light) 50%, var(--navy) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .scheduleItem::after {
        content: '';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--navy);
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .scheduleItem:hover::before {
        opacity: 1;
      }

      .scheduleItem:hover::after {
        opacity: 0.6;
        transform: translateY(-50%) scale(1.2);
      }

      .scheduleItem:hover {
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(8,61,131,0.06));
        border-color: var(--navy);
        transform: translateX(6px);
        box-shadow: 0 6px 16px rgba(8,61,131,0.15), 0 0 20px rgba(192,197,206,0.2);
      }

      .scheduleTime {
        font-family: 'Cormorant Garamond', serif;
        font-size: 28px;
        font-weight: 700;
        font-style: italic;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
        letter-spacing: 0.02em;
      }

      .scheduleLabel {
        font-size: 19px;
        color: var(--muted);
        font-weight: 500;
        line-height: 1.5;
        letter-spacing: 0.01em;
      }

      /* Contenedor de itinerario */
      .scheduleScroll {
        display: flex;
        flex-direction: column;
        gap: 12px;
        position: relative;
      }

      /* Indicadores de puntos para scroll horizontal (timeline dots) */
      .scheduleDots {
        display: none;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
        padding: 8px 0;
      }

      .scheduleDot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(8,61,131,0.2);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .scheduleDot.active {
        background: var(--navy);
        transform: scale(1.3);
      }

      .scheduleDot:hover {
        background: var(--navy-light);
        transform: scale(1.2);
      }

      .linkBtn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        border-radius: 999px;
        border: 2px solid var(--navy);
        color: var(--navy);
        text-decoration: none;
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 600;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, transparent, rgba(192,197,206,0.05));
        position: relative;
        overflow: hidden;
      }

      .linkBtn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s ease;
      }

      .linkBtn:hover::before {
        left: 100%;
      }

      .linkBtn:hover {
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(8,61,131,0.3), 0 0 20px rgba(192,197,206,0.4);
        border-color: var(--silver);
      }

      .linkBtn svg {
        flex-shrink: 0;
      }

      /* Dress Code */
      .centerBox {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
      }

      .iconBadge {
        width: 90px;
        height: 90px;
        margin: 0 auto 20px auto;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(192,197,206,0.15), rgba(184,160,126,0.08));
        border: 2px solid rgba(192,197,206,0.3);
        box-shadow: 0 10px 24px rgba(8,61,131,0.12), 0 0 20px rgba(192,197,206,0.3);
        animation: scaleIn 0.6s ease-out backwards, glow 3s ease-in-out infinite 0.8s;
        animation-delay: 0.2s;
      }

      .dressCodeBadge {
        display: inline-block;
        padding: 12px 28px;
        border-radius: 999px;
        border: 2px solid var(--gold);
        background: linear-gradient(135deg, rgba(184,160,126,0.15), rgba(192,197,206,0.08));
        color: var(--navy);
        font-size: 13px;
        letter-spacing: 0.20em;
        text-transform: uppercase;
        font-weight: 600;
        margin-top: 16px;
        box-shadow: 0 4px 14px rgba(184,160,126,0.15), 0 0 20px rgba(192,197,206,0.2);
        animation: scaleIn 0.6s ease-out backwards, glow 3s ease-in-out infinite 1s;
        animation-delay: 0.3s;
        position: relative;
        overflow: hidden;
      }

      .dressCodeBadge::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: shimmer 4s ease-in-out infinite;
      }

      /* Gift Cards */
      .giftCard {
        display: flex;
        gap: 20px;
        align-items: center;
        background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(8,61,131,0.02));
        border: 2px solid rgba(8,61,131,0.15);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 10px 30px rgba(8,61,131,0.12), 0 4px 12px rgba(8,61,131,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
        transition: all 0.4s ease;
        animation: fadeInUp 0.6s ease-out backwards;
        position: relative;
        overflow: hidden;
      }

      .giftCard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent 0%, var(--navy) 50%, transparent 100%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .giftCard::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 120px;
        height: 120px;
        background: radial-gradient(circle at center, rgba(8,61,131,0.08) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .giftCard:hover::before {
        opacity: 1;
      }

      .giftCard:hover::after {
        opacity: 1;
      }

      .giftCard:hover {
        transform: translateY(-6px) scale(1.01);
        box-shadow: 0 20px 50px rgba(8,61,131,0.2), 0 8px 20px rgba(8,61,131,0.12), 0 0 40px rgba(192,197,206,0.3), inset 0 1px 0 rgba(255,255,255,1);
        border-color: var(--navy);
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(8,61,131,0.05));
      }

      .grid2 .giftCard:nth-child(1) { animation-delay: 0.1s; }
      .grid2 .giftCard:nth-child(2) { animation-delay: 0.2s; }

      .giftLogo {
        width: 130px;
        height: 90px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(8,61,131,0.02));
        border-radius: 16px;
        border: 2px solid rgba(8,61,131,0.1);
        box-shadow: 0 4px 12px rgba(8,61,131,0.08);
        transition: all 0.3s ease;
      }

      .giftCard:hover .giftLogo {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(8,61,131,0.12);
        border-color: rgba(8,61,131,0.2);
      }

      .giftLogo img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .giftIconWrap {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(107,142,127,0.08), rgba(107,142,127,0.02));
        border-radius: 12px;
        border: 1px solid var(--border);
      }

      .giftIconWrap svg {
        width: 100%;
        height: 100%;
      }

      .giftTitle {
        font-family: 'Cormorant Garamond', serif;
        font-size: 26px;
        font-weight: 700;
        font-style: italic;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .giftCardLink {
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .giftCardLink:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 40px rgba(8,61,131,0.22);
        border-color: var(--navy);
      }

      /* RSVP */
      .rsvp {
        max-width: 650px;
        margin: 0 auto;
        background: var(--paper);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 16px 40px rgba(107,142,127,0.12);
        overflow: hidden;
        animation: scaleIn 0.6s ease-out backwards;
        animation-delay: 0.2s;
      }

      .rsvpHeader {
        padding: 40px 32px 24px 32px;
        text-align: center;
        border-bottom: 1px solid var(--border);
      }

      .rsvpBody {
        padding: 32px;
      }

      .pases {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 24px;
      }

      .circleBtn {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--paper);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--navy);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(8,61,131,0.08);
      }

      .circleBtn:hover:not(:disabled) {
        transform: scale(1.08);
        background: var(--navy);
        color: white;
        border-color: var(--navy);
        box-shadow: 0 8px 24px rgba(8,61,131,0.25);
      }

      .circleBtn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .pasesMid {
        width: 100px;
        text-align: center;
      }

      .pasesNum {
        font-family: 'Cormorant Garamond', serif;
        font-size: 48px;
        font-weight: 600;
        color: var(--navy);
        line-height: 1;
      }

      .nota {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.4s ease, opacity 0.3s ease;
        margin-bottom: 20px;
      }

      .nota.open {
        max-height: 250px;
        opacity: 1;
      }

      .label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--navy);
        margin-bottom: 10px;
      }

      textarea {
        width: 100%;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: rgba(44,95,111,0.02);
        padding: 16px;
        font-size: 15px;
        font-family: inherit;
        outline: none;
        resize: none;
        transition: all 0.3s ease;
      }

      textarea:hover {
        border-color: var(--navy);
      }

      textarea:focus {
        border-color: var(--navy);
        box-shadow: 0 0 0 4px rgba(44,95,111,0.10);
        background: white;
      }

      .toast {
        margin-top: 20px;
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 14px;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .toast.ok {
        background: rgba(44,95,111,0.10);
        border: 2px solid rgba(44,95,111,0.25);
        color: var(--navy);
        font-weight: 500;
      }

      .toast.neutral {
        background: rgba(0,0,0,0.03);
        border: 1.5px solid var(--border);
        color: var(--muted);
        justify-content: center;
      }

      .actions {
        margin-top: 24px;
        display: grid;
        gap: 12px;
      }

      .primary {
        width: 100%;
        padding: 16px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 50%, var(--navy-dark) 100%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(8,61,131,0.3), 0 0 20px rgba(192,197,206,0.2);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .primary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
      }

      .primary:hover:not(:disabled)::before {
        transform: translateX(100%);
      }

      .primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(8,61,131,0.4), 0 0 30px rgba(192,197,206,0.4);
        background: linear-gradient(135deg, var(--navy-light) 0%, var(--navy) 50%, var(--navy-light) 100%);
      }

      .primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .link {
        width: 100%;
        background: transparent;
        border: none;
        color: var(--muted);
        text-decoration: underline;
        text-underline-offset: 4px;
        cursor: pointer;
        padding: 10px 0;
        font-size: 14px;
        transition: color 0.2s ease;
      }

      .link:hover:not(:disabled) {
        color: var(--ink);
      }

      /* Footer */
      .footer {
        position: relative;
        z-index: 3;
        padding: 50px 0 80px 0;
        background: #F5F5F5;
      }

      .footerImage {
        width: 180px;
        height: auto;
        object-fit: contain;
        margin: 30px auto 0 auto;
        display: block;
        opacity: 0.85;
        filter: drop-shadow(0 6px 18px rgba(27,59,111,0.1));
        animation: fadeInUp 0.8s ease-out backwards;
      }

      .footerMono {
        font-size: 32px;
        font-style: italic;
        color: var(--navy);
        letter-spacing: 0.16em;
      }

      .footerMonoImage {
        width: 180px;
        height: auto;
        object-fit: contain;
        margin: 0 auto;
        display: block;
        opacity: 0.95;
        filter: drop-shadow(0 4px 12px rgba(8,61,131,0.2));
        animation: fadeIn 0.8s ease-out backwards;
      }

      /* Mini Footer Cliché */
      .miniFooter {
        position: relative;
        z-index: 3;
        padding: 20px 0;
        background: #EFEFEF;
        border-top: 1px solid rgba(8,61,131,0.08);
      }

      .miniFooterContent {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .miniFooterBrand {
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0.65;
        transition: opacity 0.3s ease;
      }

      .miniFooterBrand:hover {
        opacity: 0.85;
      }

      .miniFooterLogo {
        width: 24px;
        height: 24px;
        object-fit: contain;
        opacity: 0.7;
        filter: grayscale(20%);
      }

      .miniFooterText {
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #6b7280;
        letter-spacing: 0.05em;
        text-transform: lowercase;
      }

      .miniFooterLinks {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .miniFooterLink {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 6px;
        background: rgba(107,114,128,0.08);
        color: #6b7280;
        text-decoration: none;
        transition: all 0.25s ease;
        border: 1px solid rgba(107,114,128,0.12);
      }

      .miniFooterLink:hover {
        background: rgba(107,114,128,0.15);
        color: #4b5563;
        border-color: rgba(107,114,128,0.2);
      }

      .miniFooterLink svg {
        flex-shrink: 0;
      }

      /* Music FAB */
      .musicFab {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 100;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid var(--navy);
        background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(44,95,111,0.05));
        box-shadow: 0 10px 30px rgba(44,95,111,0.2);
        color: var(--navy);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        animation: fadeIn 0.8s ease-out 1s backwards;
      }

      .musicFab:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 36px rgba(44,95,111,0.3);
        background: var(--navy);
        color: white;
      }

      .dot {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--accent);
        top: 8px;
        right: 8px;
        animation: pulse 2s ease-in-out infinite;
      }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }

          /* Scroll Animations */
          .scroll-animate {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }

          .scroll-animate.animate-in {
            opacity: 1;
            transform: translateY(0);
          }

          /* Delays elegantes para animaciones escalonadas */
          .scroll-animate.delay-1 {
            transition-delay: 0.15s;
          }
          .scroll-animate.delay-2 {
            transition-delay: 0.3s;
          }
          .scroll-animate.delay-3 {
            transition-delay: 0.45s;
          }
          .scroll-animate.delay-4 {
            transition-delay: 0.6s;
          }

      /* Animación para imágenes de divisores */
      .dividerImage.scroll-animate {
        opacity: 0;
        transform: scale(0.95);
        transition: opacity 1s ease-out, transform 1s ease-out;
      }

      .dividerImage.scroll-animate.animate-in {
        opacity: 0.85;
        transform: scale(1);
      }

      .grid2.scroll-animate {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.9s ease-out 0.2s, transform 0.9s ease-out 0.2s;
      }

      .grid2.scroll-animate.animate-in {
        opacity: 1;
        transform: translateY(0);
      }

      .centerBox.scroll-animate {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
      }

      .centerBox.scroll-animate.animate-in {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      /* Loading */
      .spinner {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid rgba(107,142,127,0.15);
        border-top-color: var(--botanical);
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .errorBox {
        max-width: 500px;
        background: var(--paper);
        border: 1.5px solid rgba(200,90,84,0.20);
        border-radius: 20px;
        padding: 40px 32px;
        box-shadow: 0 12px 32px rgba(200,90,84,0.12);
        text-align: center;
      }

      /* Responsive */
      @media (min-width: 861px) {
        .heroBgImage {
          filter: none;
        }
      }

      @media (max-width: 860px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
        .section {
          padding: 50px 0;
        }
        .hero {
          padding: 50px 0 60px 0;
        }
        .heroBgImage {
          background-position: center center;
          background-size: cover;
          filter: none;
        }
        .botanical-corner-hero.tl,
        .botanical-corner-hero.br {
          width: 180px;
          height: 180px;
        }
        .botanical-sprig-hero {
          width: 160px;
          height: 100px;
        }
        .sectionDivider {
          padding: 30px 15px;
          gap: 0;
        }
        .dividerImage {
          max-width: 450px;
        }
        .dividerImage:first-child {
          margin-right: -60px;
        }
        .heroTopImage {
          width: 120px;
          margin-bottom: 16px;
        }
        .footerImage {
          width: 150px;
          margin-top: 24px;
        }
        .heroBgImage {
          background-position: center center;
          background-size: cover;
          filter: none;
        }
        .heroTopImage {
          width: 120px !important;
          margin-bottom: 12px !important;
        }
        .romanticMessage {
          font-size: clamp(22px, 4vw, 26px) !important;
          padding: 18px 24px;
          margin: 20px auto;
        }
        .h1 {
          font-size: clamp(40px, 8vw, 60px);
        }
        .loveQuote {
          font-size: clamp(20px, 5vw, 28px) !important;
          padding: 0 30px !important;
          max-width: 95% !important;
          line-height: 1.6 !important;
        }
        .overlineLarge {
          font-size: 20px;
        }
        .scheduleLabel {
          font-size: 18px !important;
        }
        .scheduleTime {
          font-size: 24px !important;
        }
        .subtitle {
          font-size: 18px !important;
        }
        .cardTitle {
          font-size: 30px !important;
        }
        .giftLogo {
          width: 100px;
          height: 70px;
        }
        .miniFooterContent {
          justify-content: center;
          flex-direction: row;
          gap: 10px;
        }
        .miniFooterBrand {
          flex-direction: row;
          gap: 8px;
        }
        .miniFooterLogo {
          width: 18px;
          height: 18px;
        }
        .miniFooterText {
          font-size: 11px;
        }
        .miniFooterLinks {
          gap: 8px;
        }
        .miniFooterLink {
          width: 28px;
          height: 28px;
        }
      }

      @media (max-width: 480px) {
        .hero {
          padding: 40px 0 50px 0;
          min-height: 100vh;
        }
        .heroBgImage {
          background-position: center top;
          background-size: cover;
          filter: none;
          height: 100vh;
          min-height: 100%;
        }
        .heroContent {
          padding: 0 15px !important;
        }
        .loveQuote {
          font-size: clamp(18px, 5vw, 24px) !important;
          padding: 0 25px !important;
          max-width: 100% !important;
          line-height: 1.7 !important;
          margin: 16px auto !important;
        }
        .h1 {
          font-size: clamp(36px, 9vw, 52px) !important;
          margin: 12px 0 !important;
        }
        .section {
          padding: 40px 0;
        }
        .cdBox {
          width: 70px;
          padding: 10px 6px;
        }
        .cdNum {
          font-size: 36px;
        }
        .cdLbl {
          font-size: 11px;
          font-weight: 600;
        }
        .countdown {
          gap: 6px;
        }
        .botanical-sprig-hero {
          display: none;
        }
        .botanical-corner-hero.tl,
        .botanical-corner-hero.br {
          width: 140px;
          height: 140px;
          opacity: 0.6;
        }
        .sectionDivider {
          padding: 20px 10px;
          gap: 0;
          flex-direction: row;
        }
        .dividerImage {
          max-width: 55%;
          opacity: 0.8;
        }
        .dividerImage:first-child {
          margin-right: -40px;
        }
        .romanticMessage {
          font-size: 15px;
          padding: 14px 18px;
          margin: 16px auto;
        }
        .heroTopImage {
          width: 100px;
          margin-bottom: 12px;
        }
        .footerImage {
          width: 120px;
          margin-top: 20px;
        }
        .footerMonoImage {
          width: 120px;
        }
        .sectionIcon {
          width: 80px;
          height: 80px;
        }
        .h1 {
          font-size: clamp(32px, 8vw, 48px);
          margin: 12px 0;
        }
        .loveQuote {
          font-size: 15px;
          margin: 8px 0 16px 0;
        }
        .overline {
          font-size: 13px;
          letter-spacing: 0.24em;
        }
        .overlineLarge {
          font-size: 18px;
          letter-spacing: 0.28em;
        }
        .heroDate {
          margin-top: 16px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dateBox {
          padding: 10px 18px;
          font-size: 18px;
        }
        .container {
          padding: 0 16px;
        }
        .heroBgImage {
          /* Eliminado: opacity: 0.3; */
        }
        .giftLogo {
          width: 90px;
          height: 60px;
          padding: 8px;
        }
        .giftCard {
          flex-direction: column;
          text-align: center;
          padding: 20px;
        }
        
        /* Itinerario compacto con scroll horizontal en móvil */
        .scheduleScroll {
          display: flex;
          flex-direction: row;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 8px 4px 16px 4px;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
        }
        
        .scheduleScroll::-webkit-scrollbar {
          height: 4px;
        }
        
        .scheduleScroll::-webkit-scrollbar-track {
          background: rgba(8,61,131,0.08);
          border-radius: 2px;
        }
        
        .scheduleScroll::-webkit-scrollbar-thumb {
          background: var(--navy);
          border-radius: 2px;
        }
        
        .scheduleItem {
          min-width: 200px;
          flex-shrink: 0;
          scroll-snap-align: start;
          padding: 16px 18px;
        }
        
        .scheduleTime {
          font-size: 24px !important;
        }
        
        .scheduleLabel {
          font-size: 16px !important;
        }
        
        /* Mostrar los puntos indicadores en móvil */
        .scheduleDots {
          display: flex;
        }
        
        .miniFooter {
          padding: 14px 0;
        }
        .miniFooterContent {
          flex-direction: row;
          gap: 8px;
          padding: 0 16px;
        }
        .miniFooterBrand {
          gap: 6px;
        }
        .miniFooterLogo {
          width: 16px;
          height: 16px;
        }
        .miniFooterText {
          font-size: 10px;
        }
        .miniFooterLinks {
          gap: 6px;
        }
        .miniFooterLink {
          width: 26px;
          height: 26px;
          border-radius: 5px;
        }
        .miniFooterLink svg {
          width: 13px;
          height: 13px;
        }
      }
    `}</style>
  );
}