import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [view, setView] = useState("start");
  const [loggedInTenant, setLoggedInTenant] = useState(null);
  const [currentHouse, setCurrentHouse] = useState(null);
  const [landlordHouses, setLandlordHouses] = useState([]);
const [selectedLandlordHouse, setSelectedLandlordHouse] = useState(null);
  window.onpopstate = () => {
    setView("start");
  };

  return (
    <>
      {view === "start" && <StartPage setView={setView} />}

      {view === "tenant" && (
        <TenantLogin
          setView={setView}
          setLoggedInTenant={setLoggedInTenant}
          setCurrentHouse={setCurrentHouse}
        />
      )}

      {view === "tenantHome" && (
        <TenantHome
          setView={setView}
          tenant={loggedInTenant}
          house={currentHouse}
        />
      )}

      {view === "booking" && (
        <BookingPage
          setView={setView}
          tenant={loggedInTenant}
          house={currentHouse}
        />
      )}

      {view === "landlord" && (
        <LandlordLogin
          setView={setView}
          setLandlordHouses={setLandlordHouses}
        />
      )}

      {view === "landlordHome" && (
  <LandlordHome
    setView={setView}
    houses={landlordHouses}
    setSelectedLandlordHouse={setSelectedLandlordHouse}
  />
)}

{view === "houseDetails" && (
  <LandlordHousePage
    setView={setView}
    house={selectedLandlordHouse}
  />
)}

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

        <button
          style={heroButton}
          onClick={() => {
            window.history.pushState({}, "");
            setView("tenant");
          }}
        >
          <span style={buttonIcon}>👤</span>
          <span>Hyresgäst</span>
          <span style={buttonArrow}>›</span>
        </button>

        <button
          style={heroButton}
          onClick={() => {
            window.history.pushState({}, "");
            setView("landlord");
          }}
        >
          <span style={buttonIcon}>🏢</span>
          <span>Hyresvärd</span>
          <span style={buttonArrow}>›</span>
        </button>

        <button
          style={adminButton}
          onClick={() => {
            window.history.pushState({}, "");
            setView("admin");
          }}
        >
          <span>🔒</span>
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
}

function TenantLogin({ setView, setLoggedInTenant, setCurrentHouse }) {
  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [address, setAddress] = useState(
    localStorage.getItem("address") || ""
  );
  const [pin, setPin] = useState("");

  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Hyresgäst</h2>
        <p style={pageText}>Logga in till din tvättstuga.</p>

        <input
          style={inputStyle}
          placeholder="Stad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Adress"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="PIN-kod"
          type="password"
          inputMode="numeric"
          maxLength="4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button
          style={primaryButton}
          onClick={async () => {
            const { data: houses, error: houseError } = await supabase
              .from("houses")
              .select("*")
              .eq("city", city)
              .eq("address", address);

            if (houseError) {
              console.log("HOUSE ERROR:", houseError);
              return;
            }

            if (!houses || houses.length === 0) {
              alert("Fastigheten hittades inte");
              return;
            }

            const house = houses[0];

            const { data: tenants, error: tenantError } = await supabase
              .from("tenants")
              .select("*")
              .eq("house_id", house.id)
              .eq("pin", pin);

            if (tenantError) {
              console.log("TENANT ERROR:", tenantError);
              return;
            }

            if (!tenants || tenants.length === 0) {
              alert("Fel PIN-kod");
              return;
            }

            localStorage.setItem("city", city);
            localStorage.setItem("address", address);

            setLoggedInTenant(tenants[0]);
            setCurrentHouse(house);
            setView("tenantHome");
          }}
        >
          Logga in
        </button>

        <button style={backButton} onClick={() => setView("start")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

function TenantHome({ setView, tenant, house }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Välkommen {tenant?.name}</h2>
        <p style={pageText}>
          {house?.address}, {house?.city}
        </p>

        <button style={primaryButton} onClick={() => setView("booking")}>
          Boka tvättid
        </button>

        <button style={backButton} onClick={() => setView("start")}>
          Logga ut
        </button>
      </div>
    </div>
  );
}

function BookingPage({ setView, tenant, house }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState([]);

  

  const morningBooked = bookings.find((b) =>
    b.start_time.startsWith("07:00")
  );

  const afternoonBooked = bookings.find((b) =>
    b.start_time.startsWith("14:00")
  );

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  async function loadBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("house_id", house.id)
      .eq("date", selectedDate);

    setBookings(data || []);
  }

  async function bookSlot(startTime, endTime) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("*")
      .eq("house_id", house.id)
      .eq("date", selectedDate)
      .eq("start_time", startTime);

    if (existing && existing.length > 0) {
      alert("Passet är redan bokat");
      return;
    }

    const { data: myBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("tenant_id", tenant.id);

    const otherDayBooking = myBookings?.find(
      (b) => b.date !== selectedDate
    );

    if (otherDayBooking) {
      alert(
        "Du har redan en bokning på ett annat datum. Avboka den först om du vill byta dag."
      );
      return;
    }

    const { error } = await supabase.from("bookings").insert([
      {
        house_id: house.id,
        tenant_id: tenant.id,
        name: tenant.name,
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
      },
    ]);

    if (error) {
      console.log("BOOKING ERROR:", error);
      alert("Kunde inte boka tiden");
      return;
    }

    loadBookings();
    alert("Tvättid bokad!");
  }

  async function cancelBooking(bookingId) {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.log("CANCEL ERROR:", error);
      alert("Kunde inte avboka tiden");
      return;
    }

    loadBookings();
    alert("Tiden är avbokad");
  }

  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Välj tvättpass</h2>

        <input
          style={inputStyle}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <p style={pageText}>{house?.address}</p>
        {house?.notice && (
  <div
    style={{
      background: "#fef3c7",
      padding: "15px",
      borderRadius: "12px",
      marginBottom: "15px",
      whiteSpace: "pre-line",
    }}
  >
    <strong>📌 Meddelande från hyresvärden</strong>
    <br />
    {house.notice}
  </div>
)}
        <p style={pageText}>Datum: {selectedDate}</p>

        <button
          style={{
            ...primaryButton,
            background: morningBooked ? "#9ca3af" : "#4f75d8",
          }}
          onClick={() => bookSlot("07:00", "14:00")}
        >
          {morningBooked
            ? `07:00–14:00 Bokad av ${morningBooked.name}`
            : "07:00–14:00"}
        </button>

        <button
          style={{
            ...primaryButton,
            background: afternoonBooked ? "#9ca3af" : "#4f75d8",
          }}
          onClick={() => bookSlot("14:00", "21:00")}
        >
          {afternoonBooked
            ? `14:00–21:00 Bokad av ${afternoonBooked.name}`
            : "14:00–21:00"}
        </button>

        <h3>Dagens bokningar</h3>

        {bookings.map((booking) => (
          <div key={booking.id}>
            {booking.start_time} - {booking.end_time} ({booking.name})

            {booking.tenant_id === tenant.id && (
              <button
                onClick={() => cancelBooking(booking.id)}
                style={{
                  marginLeft: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Avboka
              </button>
            )}
          </div>
        ))}

        <button style={backButton} onClick={() => setView("tenantHome")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

function LandlordLogin({ setView, setLandlordHouses }) {
 const [companyName, setCompanyName] = useState(
  localStorage.getItem("companyName") || ""
);
  const [pin, setPin] = useState("");

  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Hyresvärd</h2>
        <p style={pageText}>Logga in och hantera dina fastigheter.</p>

        <input
          style={inputStyle}
          placeholder="Företagsnamn"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="PIN-kod"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button
          style={primaryButton}
          onClick={async () => {
            const { data: houses, error } = await supabase
              .from("houses")
              .select("*")
              .eq("company_name", companyName)
              .eq("landlord_pin", pin);

              console.log("HOUSES:", houses);
console.log("ERROR:", error);
console.log("COMPANY:", companyName);
console.log("PIN:", pin);

            if (error) {
              console.log("LANDLORD LOGIN ERROR:", error);
              alert("Kunde inte logga in");
              return;
            }

            if (!houses || houses.length === 0) {
              alert("Fel företagsnamn eller PIN");
              return;
            }
localStorage.setItem("companyName", companyName);
            setLandlordHouses(houses);
            setView("landlordHome");
          }}
        >
          Logga in
        </button>

        <button style={backButton} onClick={() => setView("start")}>
          ← Tillbaka
        </button>
      </div>
    </div>
  );
}

function LandlordHome({ setView, houses, setSelectedLandlordHouse }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>Hyresvärd</h2>

        <h3>Mina fastigheter</h3>

        {houses.map((house) => (
  <button
    key={house.id}
    style={primaryButton}
    onClick={() => {
      setSelectedLandlordHouse(house);
      setView("houseDetails");
    }}
  >
    {house.address}, {house.city}
  </button>
))}

        <button style={backButton} onClick={() => setView("start")}>
          Logga ut
        </button>
      </div>
    </div>
  );
}

function LandlordHousePage({ setView, house }) {
  const [bookings, setBookings] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [notice, setNotice] = useState(house?.notice || "");
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantPin, setNewTenantPin] = useState("");
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editPin, setEditPin] = useState("");

  useEffect(() => {
    loadBookings();
    loadTenants();
  }, []);

  async function loadBookings() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("house_id", house.id)
      .eq("date", today);

    setBookings(data || []);
  }

  async function loadTenants() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .eq("house_id", house.id);

    setTenants(data || []);
  }

  async function saveNotice() {
    const { error } = await supabase
      .from("houses")
      .update({ notice })
      .eq("id", house.id);

    if (error) {
      alert("Kunde inte spara anslaget");
      return;
    }

    alert("Anslag sparat");
  }

  async function addTenant() {
    const { error } = await supabase.from("tenants").insert([
      {
        house_id: house.id,
        name: newTenantName,
        pin: newTenantPin,
      },
    ]);

    if (error) {
      alert("Kunde inte lägga till hyresgäst");
      return;
    }

    await loadTenants();
    setNewTenantName("");
    setNewTenantPin("");
    alert("Hyresgäst tillagd!");
  }

  async function saveTenantPin(id) {
    if (!editPin.trim()) {
      alert("PIN får inte vara tom");
      return;
    }

    const { error } = await supabase
      .from("tenants")
      .update({ pin: editPin.trim() })
      .eq("id", id);

    if (error) {
      alert("Kunde inte ändra PIN");
      return;
    }

    await loadTenants();
    setEditingTenantId(null);
    setEditPin("");
    alert("PIN uppdaterad");
  }

  async function deleteTenant(id) {
    if (!window.confirm("Ta bort hyresgästen?")) return;

    const { error } = await supabase
      .from("tenants")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Kunde inte ta bort hyresgästen");
      return;
    }

    await loadTenants();
    alert("Hyresgäst borttagen");
  }
async function deleteBooking(id) {
  if (!window.confirm("Ta bort bokningen?")) return;

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Kunde inte ta bort bokningen");
    return;
  }

  loadBookings();
  alert("Bokning borttagen");
}
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2 style={pageTitle}>{house?.address}</h2>
        <p style={pageText}>{house?.city}</p>

        <h3>📌 Anslagstavla</h3>

        <textarea
          style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
          placeholder="Skriv meddelande till hyresgästerna..."
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
        />

        <button style={primaryButton} onClick={saveNotice}>
          Spara anslag
        </button>

        <h3>📅 Dagens bokningar</h3>

        {bookings.length === 0 ? (
  <p>Inga bokningar idag.</p>
) : (
  bookings.map((booking) => (
    <div
      key={booking.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}
    >
      <div>
        {booking.start_time} - {booking.end_time} ({booking.name})
      </div>

      <button
        style={{
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "5px 10px",
          cursor: "pointer",
        }}
        onClick={() => deleteBooking(booking.id)}
      >
        ❌
      </button>
    </div>
  ))
)}

        <h3>👥 Hyresgäster</h3>

        {tenants.map((tenant) => (
          <div key={tenant.id} style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div>👤 {tenant.name}</div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  style={{
                    background: "#4f75d8",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setEditingTenantId(tenant.id);
                    setEditPin("");
                  }}
                >
                  🔑
                </button>

                <button
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteTenant(tenant.id)}
                >
                  ❌
                </button>
              </div>
            </div>

            {editingTenantId === tenant.id && (
              <div style={{ marginTop: "8px" }}>
                <input
                  style={inputStyle}
                  placeholder="Ny PIN"
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                />

                <button
                  style={primaryButton}
                  onClick={() => saveTenantPin(tenant.id)}
                >
                  Spara ny PIN
                </button>
              </div>
            )}
          </div>
        ))}

        <input
          style={inputStyle}
          placeholder="Namn"
          value={newTenantName}
          onChange={(e) => setNewTenantName(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="PIN-kod"
          value={newTenantPin}
          onChange={(e) => setNewTenantPin(e.target.value)}
        />

        <button style={primaryButton} onClick={addTenant}>
          Lägg till hyresgäst
        </button>

        <button style={backButton} onClick={() => setView("landlordHome")}>
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
  background:
    "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.35))",
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

