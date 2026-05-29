// ─────────────────────────────────────────────────────────────────────────────
//  Root App — navigation between Login, Home, and Visit Form
// ─────────────────────────────────────────────────────────────────────────────

const { useState: uSA } = React;

function App() {
  const [route, setRoute] = uSA({ name: "login" });

  const goHomeForRole = (role) => {
    if (role === "admin") setRoute({ name: "admin" });
    else if (role === "case_manager") setRoute({ name: "cm" });
    else setRoute({ name: "home" });
  };

  const openNewVisit = () => {
    // ask which patient
    const opts = PATIENTS.map(p => `<option value="${p.pid}">${p.name} (${p.adl_group})</option>`).join("");
    Swal.fire({
      title: "เลือกผู้สูงอายุที่จะเยี่ยม",
      html: `<select id="pick" class="swal2-select" style="width:90%; height:44px; border:1px solid #d9e0eb; border-radius:12px; padding:0 12px; font-family:Mitr">${opts}</select>`,
      showCancelButton: true,
      confirmButtonText: "เริ่มบันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => document.getElementById("pick").value
    }).then(r => {
      if (r.isConfirmed) {
        const p = PATIENTS.find(x => x.pid === r.value);
        setRoute({ name: "visit", patient: p });
      }
    });
  };

  const openPatient = (p) => setRoute({ name: "visit", patient: p });

  const logout = () => {
    Swal.fire({
      icon: "question",
      title: "ออกจากระบบ?",
      showCancelButton: true,
      confirmButtonText: "ออก",
      cancelButtonText: "อยู่ต่อ"
    }).then(r => r.isConfirmed && setRoute({ name: "login" }));
  };

  switch (route.name) {
    case "login":
      return <LoginScreen onLogin={goHomeForRole}/>;
    case "home":
      return <HomeScreen
        onOpenNewVisit={openNewVisit}
        onOpenPatient={openPatient}
        onLogout={logout}
      />;
    case "admin":
      return <AdminDashboard onLogout={logout} onNav={(name) => setRoute({ name })}/>;
    case "users":
      return <UsersScreen onBack={() => setRoute({ name: "admin" })}/>;
    case "patients":
      return <PatientsScreen onBack={() => setRoute({ name: "admin" })}/>;
    case "cm":
      return <CaseManagerScreen
        onLogout={logout}
        onOpenCase={(kase) => setRoute({ name: "cm_detail", kase })}
      />;
    case "cm_detail":
      return <CaseDetailScreen
        kase={route.kase}
        onBack={() => setRoute({ name: "cm" })}
      />;
    case "visit":
      return <VisitFormScreen
        patient={route.patient}
        onSaved={() => setRoute({ name: "home" })}
        onCancel={() => setRoute({ name: "home" })}
      />;
    default: return null;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
