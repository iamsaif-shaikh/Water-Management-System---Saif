import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TANK_CAPACITY = 15000;
const UG_COUNT = 5;
const TR_COUNT = 13;
const UG_MOTOR_ON_LEVEL = 0.30;   // auto-start fill when ≤ 30%
const UG_MOTOR_OFF_LEVEL = 0.95;  // auto-cutoff when ≥ 95%
const TR_MOTOR_ON_LEVEL = 0.25;   // terrace auto-fetch when ≤ 25%
const TR_MOTOR_OFF_LEVEL = 0.92;  // terrace auto-off when ≥ 92%

const FILL_RATE = 0.0012;   // per tick
const DRAIN_RATE = 0.0004;  // per tick (natural usage)

const PURITY_LABELS = ["Excellent", "Good", "Fair", "Poor"];
const PURITY_COLORS = ["#00e5a0", "#7ed6df", "#f9ca24", "#ff6b6b"];

function randBetween(a, b) { return a + Math.random() * (b - a); }

function initUGTank(id) {
  const level = randBetween(0.35, 0.85);
  return {
    id, label: `UG-${id}`, type: "underground",
    level, capacity: TANK_CAPACITY,
    purity: Math.floor(randBetween(0, 3.5)),
    motorOn: false, motorManual: false,
    temp: randBetween(22, 28),
    flowRate: 0,
    alert: null,
  };
}

function initTRTank(id) {
  const level = randBetween(0.2, 0.75);
  return {
    id, label: `TR-${String(id).padStart(2,"0")}`, type: "terrace",
    level, capacity: TANK_CAPACITY,
    purity: Math.floor(randBetween(0, 2.5)),
    motorOn: false,
    temp: randBetween(20, 35),
    flowRate: 0,
    linkedUG: ((id - 1) % UG_COUNT) + 1,
    alert: null,
  };
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [drops, setDrops] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 4,
      dur: 2 + Math.random() * 3, size: 4 + Math.random() * 8,
    }))
  );

  const handle = () => {
    if (user === "admin" && pass === "admin123") {
      setLoading(true);
      setTimeout(() => onLogin(), 1200);
    } else {
      setErr("Invalid credentials. Try admin / admin123");
      setTimeout(() => setErr(""), 3000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #071522 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Rajdhani', sans-serif", overflow: "hidden", position: "relative"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />

      {/* Animated drops */}
      {drops.map(d => (
        <div key={d.id} style={{
          position: "absolute", left: `${d.x}%`, top: "-20px",
          width: d.size, height: d.size * 1.4,
          background: "rgba(0,180,255,0.15)", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          animation: `fall ${d.dur}s ${d.delay}s infinite linear`,
          filter: "blur(1px)",
        }} />
      ))}

      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,160,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,160,255,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <style>{`
        @keyframes fall { 0%{transform:translateY(-20px) scaleX(0.8);opacity:0} 10%{opacity:1} 90%{opacity:0.6} 100%{transform:translateY(100vh) scaleX(0.8);opacity:0} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(0,160,255,0.3)} 70%{transform:scale(1);box-shadow:0 0 0 12px rgba(0,160,255,0)} 100%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(0,160,255,0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d2137 inset !important; -webkit-text-fill-color: #e0f4ff !important; }
      `}</style>

      <div style={{
        background: "rgba(10,22,40,0.85)", border: "1px solid rgba(0,160,255,0.2)",
        borderRadius: 20, padding: "50px 44px", width: 380,
        backdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        animation: "fadeUp 0.6s ease",
        position: "relative", zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,160,255,0.15) 0%, transparent 70%)",
              border: "2px solid rgba(0,160,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse-ring 2.5s infinite",
              margin: "0 auto",
            }}>
              <span style={{ fontSize: 32 }}>💧</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700, color: "#00c8ff", letterSpacing: 2 }}>AQUASYNC</div>
          <div style={{ fontSize: 11, color: "rgba(150,200,255,0.5)", letterSpacing: 4, marginTop: 4, textTransform: "uppercase" }}>Society Water Management</div>
        </div>

        {/* Fields */}
        {[["Username", user, setUser, "text", "👤"], ["Password", pass, setPass, "password", "🔒"]].map(([label, val, setter, type, icon]) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, color: "rgba(150,200,255,0.6)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{label}</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>
              <input
                type={type} value={val} onChange={e => setter(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                style={{
                  width: "100%", padding: "13px 14px 13px 42px", boxSizing: "border-box",
                  background: "rgba(0,160,255,0.06)", border: "1px solid rgba(0,160,255,0.2)",
                  borderRadius: 10, color: "#e0f4ff", fontSize: 15, fontFamily: "'Rajdhani', sans-serif",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(0,160,255,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(0,160,255,0.2)"}
              />
            </div>
          </div>
        ))}

        {err && (
          <div style={{
            background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8080", marginBottom: 18,
          }}>{err}</div>
        )}

        <button onClick={handle} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: loading ? "rgba(0,160,255,0.2)" : "linear-gradient(135deg, #0090d0, #00c8ff)",
          border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
          fontFamily: "'Orbitron', monospace", letterSpacing: 2, cursor: loading ? "wait" : "pointer",
          boxShadow: loading ? "none" : "0 4px 20px rgba(0,160,255,0.4)",
          transition: "all 0.2s",
        }}>
          {loading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(150,200,255,0.35)", letterSpacing: 1 }}>
          Demo: admin / admin123
        </p>
      </div>
    </div>
  );
}

// ─── TANK CARD ────────────────────────────────────────────────────────────────
function TankCard({ tank, onToggleMotor, compact }) {
  const pct = Math.round(tank.level * 100);
  const liters = Math.round(tank.level * TANK_CAPACITY);
  const pColor = PURITY_COLORS[tank.purity];
  const isLow = tank.level <= (tank.type === "underground" ? UG_MOTOR_ON_LEVEL : TR_MOTOR_ON_LEVEL);
  const isFull = tank.level >= (tank.type === "underground" ? UG_MOTOR_OFF_LEVEL : TR_MOTOR_OFF_LEVEL);

  const waveAnim = `wave-${tank.id}-${tank.type}`;

  return (
    <div style={{
      background: "rgba(10,22,40,0.8)", border: `1px solid ${tank.motorOn ? "rgba(0,200,255,0.4)" : isLow ? "rgba(255,120,0,0.4)" : "rgba(0,100,160,0.25)"}`,
      borderRadius: 14, padding: compact ? "14px" : "18px",
      position: "relative", overflow: "hidden",
      boxShadow: tank.motorOn ? "0 0 20px rgba(0,200,255,0.1)" : "none",
      transition: "all 0.3s",
    }}>
      <style>{`
        @keyframes ${waveAnim} {
          0%{transform:translateX(0)} 100%{transform:translateX(-50%)}
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: compact ? 11 : 13, fontWeight: 700, color: "#00c8ff", letterSpacing: 1 }}>{tank.label}</div>
          {!compact && <div style={{ fontSize: 10, color: "rgba(150,200,255,0.4)", marginTop: 2 }}>
            {tank.type === "terrace" ? `← UG-${tank.linkedUG}` : "Underground"}
          </div>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: pColor, boxShadow: `0 0 8px ${pColor}` }} title={PURITY_LABELS[tank.purity]} />
          {isLow && <div style={{ fontSize: 9, background: "rgba(255,120,0,0.2)", color: "#ff8c00", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,120,0,0.3)" }}>LOW</div>}
          {isFull && <div style={{ fontSize: 9, background: "rgba(0,200,100,0.15)", color: "#00e57a", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(0,200,100,0.3)" }}>FULL</div>}
        </div>
      </div>

      {/* Water visual */}
      <div style={{
        height: compact ? 60 : 80, borderRadius: 10, overflow: "hidden",
        background: "rgba(0,20,40,0.8)", position: "relative", marginBottom: 12,
        border: "1px solid rgba(0,100,160,0.2)",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct}%`,
          background: isLow
            ? "linear-gradient(180deg, rgba(255,140,0,0.5) 0%, rgba(255,80,0,0.3) 100%)"
            : `linear-gradient(180deg, rgba(0,180,255,0.6) 0%, rgba(0,100,200,0.8) 100%)`,
          transition: "height 0.5s ease",
          overflow: "hidden",
        }}>
          {tank.motorOn && (
            <div style={{
              position: "absolute", top: -8, left: 0, width: "200%", height: 16,
              background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12'%3E%3Cpath d='M0 6 Q25 0 50 6 Q75 12 100 6 Q125 0 150 6 Q175 12 200 6' stroke='rgba(255,255,255,0.4)' stroke-width='2' fill='none'/%3E%3C/svg%3E\") repeat-x center / 100px 12px",
              animation: `${waveAnim} 2s linear infinite`,
            }} />
          )}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: compact ? 18 : 22, fontWeight: 900, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            {pct}<span style={{ fontSize: compact ? 10 : 12 }}>%</span>
          </div>
        </div>
        {/* Level markers */}
        {[25, 50, 75].map(m => (
          <div key={m} style={{
            position: "absolute", left: 0, right: 0, bottom: `${m}%`,
            borderTop: "1px dashed rgba(255,255,255,0.1)",
          }}>
            <span style={{ position: "absolute", right: 4, top: -9, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{m}%</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <Stat label="Volume" value={`${(liters/1000).toFixed(1)}kL`} />
        <Stat label="Purity" value={PURITY_LABELS[tank.purity]} color={pColor} />
        {!compact && <>
          <Stat label="Temp" value={`${tank.temp.toFixed(1)}°C`} />
          <Stat label="Flow" value={tank.motorOn ? `${(tank.flowRate*1000).toFixed(0)} L/m` : "—"} />
        </>}
      </div>

      {/* Motor Control — UG only */}
      {tank.type === "underground" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{ fontSize: 11, color: "rgba(150,200,255,0.6)" }}>
            MOTOR <span style={{ fontSize: 9, color: "rgba(150,200,255,0.4)" }}>{tank.motorManual ? "(MANUAL)" : "(AUTO)"}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onToggleMotor(tank.id, false)} style={motorBtn(!tank.motorOn && !tank.motorManual, "#555")}>AUTO</button>
            <button onClick={() => onToggleMotor(tank.id, true)} style={motorBtn(tank.motorManual && tank.motorOn, "#00c8ff")}>ON</button>
            <button onClick={() => onToggleMotor(tank.id, "off")} style={motorBtn(tank.motorManual && !tank.motorOn, "#ff5050")}>OFF</button>
          </div>
        </div>
      )}

      {tank.type === "terrace" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: tank.motorOn ? "#00ff88" : "#444",
            boxShadow: tank.motorOn ? "0 0 10px #00ff88" : "none",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: "rgba(150,200,255,0.6)" }}>
            PUMP {tank.motorOn ? <span style={{ color: "#00ff88" }}>ACTIVE</span> : <span>STANDBY</span>}
          </span>
        </div>
      )}
    </div>
  );
}

function motorBtn(active, activeColor) {
  return {
    padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)",
    background: active ? activeColor : "rgba(255,255,255,0.05)",
    color: active ? "#fff" : "rgba(255,255,255,0.4)",
    fontSize: 10, fontFamily: "'Orbitron', monospace", cursor: "pointer",
    fontWeight: 600, letterSpacing: 0.5,
  };
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "5px 8px" }}>
      <div style={{ fontSize: 9, color: "rgba(150,200,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: color || "#e0f4ff", marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ─── FLOW CHART ───────────────────────────────────────────────────────────────
function FlowDiagram({ ugTanks, trTanks }) {
  const svgH = 340;
  const ugY = 60, trY = 220;
  const ugXs = ugTanks.map((_, i) => 100 + i * 140);
  const trXs = trTanks.map((_, i) => 40 + i * 73);

  return (
    <div style={{ background: "rgba(5,15,30,0.8)", borderRadius: 16, padding: 20, border: "1px solid rgba(0,100,160,0.2)", overflow: "auto" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "rgba(0,200,255,0.6)", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
        System Flow Diagram
      </div>
      <svg width={Math.max(ugXs[ugXs.length-1]+100, trXs[trXs.length-1]+80)} height={svgH} style={{ display: "block", minWidth: "100%" }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,160,255,0.6)" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#00ff88" />
          </marker>
        </defs>

        {/* Underground tanks */}
        {ugTanks.map((t, i) => {
          const x = ugXs[i], pct = t.level;
          return (
            <g key={t.id}>
              {/* Tank body */}
              <rect x={x-30} y={ugY-20} width={60} height={50} rx={6}
                fill="rgba(0,20,50,0.9)" stroke={t.motorOn ? "rgba(0,200,255,0.7)" : "rgba(0,100,160,0.4)"} strokeWidth={1.5} />
              {/* Water fill */}
              <rect x={x-28} y={ugY-18 + 46*(1-pct)} width={56} height={46*pct} rx={4}
                fill={t.level <= UG_MOTOR_ON_LEVEL ? "rgba(255,100,0,0.5)" : "rgba(0,140,220,0.5)"}
                style={{ transition: "all 0.5s" }} />
              {/* Motor indicator */}
              {t.motorOn && (
                <circle cx={x+20} cy={ugY-28} r={5} fill="none" stroke="#00ff88" strokeWidth={1.5}>
                  <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={x} y={ugY+12} textAnchor="middle" fill="#e0f4ff" fontSize={9} fontFamily="Orbitron">{t.label}</text>
              <text x={x} y={ugY+24} textAnchor="middle" fill={t.level <= UG_MOTOR_ON_LEVEL ? "#ff8c00" : "#00c8ff"} fontSize={10} fontFamily="Orbitron" fontWeight="bold">
                {Math.round(t.level*100)}%
              </text>
            </g>
          );
        })}

        {/* Horizontal main pipe */}
        <line x1={ugXs[0]} y1={ugY+60} x2={ugXs[ugXs.length-1]} y2={ugY+60}
          stroke="rgba(0,140,220,0.4)" strokeWidth={4} strokeDasharray="8,4" />
        <text x={(ugXs[0]+ugXs[ugXs.length-1])/2} y={ugY+75} textAnchor="middle" fill="rgba(0,160,255,0.4)" fontSize={9} fontFamily="Rajdhani">— MAIN UNDERGROUND DISTRIBUTION PIPE —</text>

        {/* Terrace tanks */}
        {trTanks.map((t, i) => {
          const x = trXs[i], pct = t.level;
          const linkedUGX = ugXs[t.linkedUG - 1];
          const active = t.motorOn;
          return (
            <g key={t.id}>
              {/* Connection line to pipe */}
              <line x1={x} y1={trY-20} x2={x} y2={ugY+60}
                stroke={active ? "#00ff88" : "rgba(0,100,160,0.25)"} strokeWidth={active ? 1.5 : 1}
                strokeDasharray={active ? "none" : "3,3"}>
                {active && <animate attributeName="stroke-dashoffset" values="0;-20" dur="0.8s" repeatCount="indefinite" />}
              </line>
              {active && <circle cx={x} cy={trY-55} r={3} fill="#00ff88">
                <animate attributeName="cy" values={`${trY-55};${ugY+62};${trY-55}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
              </circle>}
              {/* Tank */}
              <rect x={x-18} y={trY-20} width={36} height={32} rx={4}
                fill="rgba(0,20,50,0.9)" stroke={t.motorOn ? "rgba(0,200,255,0.6)" : "rgba(0,60,120,0.4)"} strokeWidth={1} />
              <rect x={x-16} y={trY-18 + 28*(1-pct)} width={32} height={28*pct} rx={3}
                fill={t.level <= TR_MOTOR_ON_LEVEL ? "rgba(255,100,0,0.5)" : "rgba(0,160,240,0.5)"}
                style={{ transition: "all 0.5s" }} />
              <text x={x} y={trY+20} textAnchor="middle" fill="rgba(150,200,255,0.7)" fontSize={7.5} fontFamily="Orbitron">{t.label}</text>
              <text x={x} y={trY+31} textAnchor="middle" fill={t.level <= TR_MOTOR_ON_LEVEL ? "#ff8c00" : "#00c8ff"} fontSize={9} fontFamily="Orbitron">
                {Math.round(t.level*100)}%
              </text>
            </g>
          );
        })}

        {/* Labels */}
        <text x={12} y={ugY+5} fill="rgba(0,200,255,0.5)" fontSize={10} fontFamily="Orbitron">UNDERGROUND</text>
        <text x={12} y={trY+5} fill="rgba(0,200,255,0.5)" fontSize={10} fontFamily="Orbitron">TERRACE</text>
      </svg>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [ugTanks, setUGTanks] = useState(() => Array.from({ length: UG_COUNT }, (_, i) => initUGTank(i + 1)));
  const [trTanks, setTRTanks] = useState(() => Array.from({ length: TR_COUNT }, (_, i) => initTRTank(i + 1)));
  const [tab, setTab] = useState("overview");
  const [time, setTime] = useState(new Date());
  const tickRef = useRef(0);

  // ── Simulation tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      setTime(new Date());

      setUGTanks(prev => prev.map(t => {
        let level = t.level;
        let motorOn = t.motorOn;
        let flowRate = t.flowRate;

        // Auto logic (if not manually overridden)
        if (!t.motorManual) {
          if (level <= UG_MOTOR_ON_LEVEL) motorOn = true;
          if (level >= UG_MOTOR_OFF_LEVEL) motorOn = false;
        }

        if (motorOn) {
          level = Math.min(1, level + FILL_RATE);
          flowRate = randBetween(0.8, 1.2);
        } else {
          level = Math.max(0, level - DRAIN_RATE * randBetween(0.5, 1.5));
          flowRate = 0;
        }

        const purity = Math.min(3, Math.max(0, t.purity + (Math.random() < 0.02 ? (Math.random() < 0.5 ? 1 : -1) : 0)));
        const temp = t.temp + randBetween(-0.05, 0.05);

        return { ...t, level, motorOn, flowRate, purity, temp };
      }));

      setTRTanks(prev => prev.map(t => {
        let level = t.level;
        let motorOn = t.motorOn;
        let flowRate = t.flowRate;

        // Auto logic
        if (level <= TR_MOTOR_ON_LEVEL) motorOn = true;
        if (level >= TR_MOTOR_OFF_LEVEL) motorOn = false;

        if (motorOn) {
          level = Math.min(1, level + FILL_RATE * 0.9);
          flowRate = randBetween(0.7, 1.0);
        } else {
          level = Math.max(0, level - DRAIN_RATE * randBetween(0.8, 2.0));
          flowRate = 0;
        }

        const purity = Math.min(3, Math.max(0, t.purity + (Math.random() < 0.015 ? (Math.random() < 0.5 ? 1 : -1) : 0)));
        const temp = t.temp + randBetween(-0.08, 0.08);

        return { ...t, level, motorOn, flowRate, purity, temp };
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const toggleUGMotor = useCallback((id, mode) => {
    setUGTanks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (mode === false) return { ...t, motorManual: false };
      if (mode === true) return { ...t, motorManual: true, motorOn: true };
      if (mode === "off") return { ...t, motorManual: true, motorOn: false };
      return t;
    }));
  }, []);

  // Summary stats
  const ugAvg = ugTanks.reduce((s, t) => s + t.level, 0) / UG_COUNT;
  const trAvg = trTanks.reduce((s, t) => s + t.level, 0) / TR_COUNT;
  const ugMotorsOn = ugTanks.filter(t => t.motorOn).length;
  const trMotorsOn = trTanks.filter(t => t.motorOn).length;
  const totalWater = [...ugTanks, ...trTanks].reduce((s, t) => s + t.level * TANK_CAPACITY, 0);
  const ugLow = ugTanks.filter(t => t.level <= UG_MOTOR_ON_LEVEL).length;
  const trLow = trTanks.filter(t => t.level <= TR_MOTOR_ON_LEVEL).length;

  const tabs = ["overview", "underground", "terrace", "flowchart"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060e1c 0%, #0a1628 60%, #060d1a 100%)",
      fontFamily: "'Rajdhani', sans-serif", color: "#e0f4ff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <style>{`
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:rgba(0,0,0,0.2)} ::-webkit-scrollbar-thumb{background:rgba(0,140,220,0.4);border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{
        background: "rgba(5,15,30,0.95)", borderBottom: "1px solid rgba(0,100,160,0.3)",
        padding: "0 24px", display: "flex", alignItems: "center", gap: 20,
        height: 60, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>💧</span>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#00c8ff", letterSpacing: 2 }}>AQUASYNC</div>
            <div style={{ fontSize: 9, color: "rgba(150,200,255,0.4)", letterSpacing: 2 }}>WATER TANK MGMT SYSTEM</div>
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff88", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: 10, color: "#00ff88", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>LIVE</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Clock */}
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "rgba(0,200,255,0.7)", letterSpacing: 1 }}>
          {time.toLocaleTimeString()}
        </div>

        <button onClick={onLogout} style={{
          padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,80,80,0.3)",
          background: "rgba(255,80,80,0.08)", color: "#ff8080", fontSize: 11,
          fontFamily: "'Orbitron', monospace", cursor: "pointer", letterSpacing: 1,
        }}>LOGOUT</button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, padding: "16px 24px 0",
        borderBottom: "1px solid rgba(0,100,160,0.15)",
      }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", borderRadius: "8px 8px 0 0",
            background: tab === t ? "rgba(0,160,255,0.12)" : "transparent",
            border: tab === t ? "1px solid rgba(0,160,255,0.3)" : "1px solid transparent",
            borderBottom: tab === t ? "1px solid rgba(5,15,30,1)" : "1px solid transparent",
            color: tab === t ? "#00c8ff" : "rgba(150,200,255,0.5)",
            fontSize: 11, fontFamily: "'Orbitron', monospace", letterSpacing: 1,
            cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: "24px", animation: "slideIn 0.3s ease" }} key={tab}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Water", value: `${(totalWater/1000).toFixed(0)} kL`, icon: "💧", color: "#00c8ff" },
                { label: "UG Avg Level", value: `${Math.round(ugAvg*100)}%`, icon: "🏗️", color: ugAvg < 0.3 ? "#ff6b6b" : "#00e5a0" },
                { label: "Terrace Avg", value: `${Math.round(trAvg*100)}%`, icon: "🏢", color: trAvg < 0.25 ? "#ff6b6b" : "#00e5a0" },
                { label: "UG Motors ON", value: `${ugMotorsOn}/${UG_COUNT}`, icon: "⚡", color: "#f9ca24" },
                { label: "TR Pumps ON", value: `${trMotorsOn}/${TR_COUNT}`, icon: "🔄", color: "#a29bfe" },
                { label: "Low Alerts", value: `${ugLow + trLow}`, icon: "⚠️", color: ugLow+trLow > 0 ? "#ff6b6b" : "#00e5a0" },
              ].map(k => (
                <div key={k.label} style={{
                  background: "rgba(10,22,40,0.8)", border: "1px solid rgba(0,100,160,0.2)",
                  borderRadius: 12, padding: "16px 20px",
                  borderLeft: `3px solid ${k.color}`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(150,200,255,0.5)", marginTop: 4, letterSpacing: 1 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Quick grid — all tanks compact */}
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Underground Tanks" count={UG_COUNT} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
                {ugTanks.map(t => <TankCard key={t.id} tank={t} onToggleMotor={toggleUGMotor} compact />)}
              </div>
            </div>
            <div>
              <SectionHeader title="Terrace Tanks" count={TR_COUNT} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
                {trTanks.map(t => <TankCard key={t.id} tank={t} compact />)}
              </div>
            </div>
          </div>
        )}

        {/* ── UNDERGROUND ── */}
        {tab === "underground" && (
          <div>
            <SectionHeader title="Underground Water Tanks" count={UG_COUNT} sub={`${ugMotorsOn} motors running · ${ugLow} low alerts`} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
              {ugTanks.map(t => <TankCard key={t.id} tank={t} onToggleMotor={toggleUGMotor} />)}
            </div>
            <LegendBox items={[
              { color: "#00c8ff", label: `Auto ON threshold: ≤${UG_MOTOR_ON_LEVEL*100}% (${(UG_MOTOR_ON_LEVEL*TANK_CAPACITY/1000).toFixed(0)}kL)` },
              { color: "#00ff88", label: `Auto OFF / cutoff: ≥${UG_MOTOR_OFF_LEVEL*100}% (${(UG_MOTOR_OFF_LEVEL*TANK_CAPACITY/1000).toFixed(0)}kL)` },
              { color: "#ff8c00", label: "Orange fill = LOW level alert" },
              { color: "#f9ca24", label: "Motor can be set to Manual ON / Manual OFF / Auto" },
            ]} />
          </div>
        )}

        {/* ── TERRACE ── */}
        {tab === "terrace" && (
          <div>
            <SectionHeader title="Terrace Water Tanks" count={TR_COUNT} sub={`${trMotorsOn} pumps active · ${trLow} low alerts`} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
              {trTanks.map(t => <TankCard key={t.id} tank={t} />)}
            </div>
            <LegendBox items={[
              { color: "#a29bfe", label: `Auto pump ON: ≤${TR_MOTOR_ON_LEVEL*100}% — fetches from linked UG tank` },
              { color: "#00ff88", label: `Auto pump OFF: ≥${TR_MOTOR_OFF_LEVEL*100}%` },
              { color: "#ff8c00", label: "Orange fill = LOW level alert" },
            ]} />
          </div>
        )}

        {/* ── FLOW CHART ── */}
        {tab === "flowchart" && (
          <div>
            <SectionHeader title="System Flow Diagram" sub="Live water flow — Underground → Distribution Pipe → Terrace" />
            <FlowDiagram ugTanks={ugTanks} trTanks={trTanks} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 20 }}>
              <MiniFlowGroup title="Underground Distribution" tanks={ugTanks} />
              <MiniFlowGroup title="Terrace Distribution" tanks={trTanks} isTerace />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#00c8ff", letterSpacing: 1 }}>{title}</span>
        {count && <span style={{ background: "rgba(0,160,255,0.15)", color: "#00c8ff", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: "'Orbitron', monospace" }}>{count}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: "rgba(150,200,255,0.4)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function LegendBox({ items }) {
  return (
    <div style={{
      marginTop: 24, background: "rgba(0,10,25,0.6)", border: "1px solid rgba(0,100,160,0.15)",
      borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 14,
    }}>
      {items.map(it => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: it.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(150,200,255,0.55)" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniFlowGroup({ title, tanks, isTerace }) {
  return (
    <div style={{ background: "rgba(5,15,30,0.8)", borderRadius: 14, padding: 18, border: "1px solid rgba(0,100,160,0.2)" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "rgba(0,200,255,0.6)", letterSpacing: 1, marginBottom: 14 }}>{title.toUpperCase()}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tanks.map(t => {
          const pct = Math.round(t.level * 100);
          const low = t.level <= (isTerace ? TR_MOTOR_ON_LEVEL : UG_MOTOR_ON_LEVEL);
          return (
            <div key={t.id} style={{
              width: 60, textAlign: "center",
              background: "rgba(0,20,50,0.7)", borderRadius: 8, padding: "8px 4px",
              border: `1px solid ${t.motorOn ? "rgba(0,200,255,0.4)" : "rgba(0,60,120,0.3)"}`,
            }}>
              <div style={{
                height: 32, background: "rgba(0,0,0,0.4)", borderRadius: 4,
                position: "relative", overflow: "hidden", margin: "0 4px 6px",
              }}>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`,
                  background: low ? "rgba(255,100,0,0.6)" : "rgba(0,160,255,0.6)",
                  transition: "height 0.5s",
                }} />
              </div>
              <div style={{ fontSize: 9, fontFamily: "'Orbitron', monospace", color: "#00c8ff" }}>{t.label}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: low ? "#ff8c00" : "#e0f4ff" }}>{pct}%</div>
              {t.motorOn && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88", margin: "4px auto 0", boxShadow: "0 0 6px #00ff88" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn
    ? <Dashboard onLogout={() => setLoggedIn(false)} />
    : <LoginScreen onLogin={() => setLoggedIn(true)} />;
}
