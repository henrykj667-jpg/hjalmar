import { useState } from "react";

export default function App() {
  const [view, setView] = useState("start");

window.onpopstate = () => {
  setView("start");
};

  return (
    <>
      {view === "start" && <StartPage setView={setView} />}
      {view === "tenant" && <TenantLogin setView={setView} />}
      {view === "landlord" && <LandlordLogin setView={setView} />}
      {view === "admin" && <AdminPage setView={setView} />}
    </>
  );
}

function StartPage({ setView }) {
  return (
    <div style={hero}>
      <div style={softShade} />

      <div style={heroContent}>
        <div style={brandBox}>
          <div style={logoIcon}>🧺</div>
          <div style={logoText}>HJALMAR</div>
          <p style={tagline}>Boka tvättstugan, enkelt.</p>
        </div>

        <button style={heroButton} onClick={() => {
  window.history.pushState({}, "");
  setView("tenant");
}}>
          <span style={buttonIcon}>👤</span>
          <span>Hyresgäst</span>
          <span style={buttonArrow}>›</span>
        </button>

        <button style={heroButton} onClick={() => {
  window.history.pushState({}, "");
  setView("landlord");
}}>
          <span style={buttonIcon}>🏢</span>
          <span>Hyresvärd</span>
          <span style={buttonArrow}>›</span>
        </button>

        <button style={adminButton} onClick={() => {
  window.history.pushState({}, "");
  setView("admin");
}}>
          <span>🔒</span>
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
}

function TenantLogin({ setView }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Hyresgäst</h2>
        <p style={pageText}>Logga in till din tvättstuga.</p>

        <input style={inputStyle} placeholder="Stad" />
        <input style={inputStyle} placeholder="Adress" />
        <input style={inputStyle} placeholder="PIN-kod" type="password" inputMode="numeric" maxLength="4" />

        <button style={primaryButton}>Logga in</button>

        <button style={backButton} onClick={() => setView("start")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

function LandlordLogin({ setView }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Hyresvärd</h2>
        <p style={pageText}>Logga in och hantera dina fastigheter.</p>

        <input style={inputStyle} placeholder="Företagsnamn" />
        <input style={inputStyle} placeholder="PIN-kod" type="password" inputMode="numeric" />

        <button style={primaryButton}>Logga in</button>

        <button style={backButton} onClick={() => setView("start")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

function AdminPage({ setView }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Admin</h2>
        <p style={pageText}>Systemadmin för HJALMAR.</p>

        <button style={primaryButton}>Öppna admin</button>

        <button style={backButton} onClick={() => setView("start")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

const hero = {
  position: "relative",
  width: "100%",
  height: "100vh",
  backgroundImage: "url('/hero.jpg')",
  backgroundSize: "auto 100%",
backgroundRepeat: "no-repeat",
backgroundColor: "#eef2f7",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "system-ui, sans-serif",
  overflow: "hidden",
};

const softShade = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.35))",
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  width: "310px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  alignItems: "center",
};

const brandBox = {
  textAlign: "center",
  padding: "18px 16px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  width: "100%",
};

const logoIcon = {
  fontSize: "34px",
  marginBottom: "6px",
};

const logoText = {
  fontSize: "34px",
  fontWeight: "900",
  letterSpacing: "1px",
  color: "#102f70",
};

const tagline = {
  margin: "8px 0 0",
  fontSize: "17px",
  color: "#173b80",
};

const heroButton = {
  width: "100%",
  padding: "18px 20px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, #1f6feb, #1249b8)",
  color: "white",
  fontSize: "20px",
  fontWeight: "800",
  boxShadow: "0 18px 38px rgba(20,70,160,0.45)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const buttonIcon = {
  fontSize: "24px",
};

const buttonArrow = {
  fontSize: "34px",
  lineHeight: "20px",
};

const adminButton = {
  width: "86%",
  padding: "15px 20px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.7)",
  background: "rgba(255,255,255,0.82)",
  color: "#4b5563",
  fontSize: "18px",
  fontWeight: "700",
  boxShadow: "0 10px 25px rgba(0,0,0,0.16)",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const pageContainer = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f2f4f7",
  fontFamily: "system-ui, sans-serif",
  padding: "20px",
};

const card = {
  width: "100%",
  maxWidth: "360px",
  background: "white",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const pageTitle = {
  margin: 0,
  color: "#1f3a8a",
  textAlign: "center",
};

const pageText = {
  margin: 0,
  marginBottom: "8px",
  color: "#555",
  textAlign: "center",
  fontSize: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
};

const primaryButton = {
  width: "100%",
  padding: "15px",
  borderRadius: "14px",
  border: "none",
  background: "#4f75d8",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "4px",
};

const backButton = {
  background: "transparent",
  border: "none",
  color: "#555",
  fontSize: "14px",
  cursor: "pointer",
  marginTop: "4px",
};





