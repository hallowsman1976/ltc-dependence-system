// ─────────────────────────────────────────────────────────────────────────────
//  Login + Care Giver Home screens
// ─────────────────────────────────────────────────────────────────────────────

const { useState: uS1, useEffect: uE1 } = React;

// ──────────────────────────────────────────────────────────────── LOGIN
function LoginScreen({ onLogin }) {
  const [role, setRole] = uS1("caregiver");
  const [username, setUsername] = uS1("caregiver01");
  const [password, setPassword] = uS1("••••••");
  const [show, setShow] = uS1(false);
  const [loading, setLoading] = uS1(false);

  const submit = () => {
    if (!username || !password) {
      Swal.fire({ icon: "warning", title: "กรอกข้อมูลไม่ครบ", text: "กรุณาระบุชื่อผู้ใช้และรหัสผ่าน" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role);
    }, 700);
  };

  return (
    <div className="phone phone-bg">
      <StatusBar/>
      <div className="px-6 pt-6 pb-8 flex flex-col gap-6 min-h-[calc(100dvh-28px)]">
        {/* Identity */}
        <div className="flex flex-col items-center gap-3 pt-6">
          <LogoMark size={88}/>
          <div className="text-center">
            <div className="text-[12px] tracking-[0.2em] text-ink-500 uppercase">LTC Dependence Care</div>
            <h1 className="text-[22px] font-medium text-ink-900 leading-tight mt-1">
              ระบบรายงานการดูแล<br/>ผู้สูงอายุที่มีภาวะพึ่งพิง
            </h1>
            <div className="text-[12.5px] text-ink-600 mt-1.5">
              โรงพยาบาลส่งเสริมสุขภาพตำบล<br/>บ้านทรายไหลแล้ง · จังหวัดมุกดาหาร
            </div>
          </div>
        </div>

        {/* Role tabs */}
        <div>
          <div className="text-[12px] text-ink-500 mb-2">เข้าใช้งานในบทบาท</div>
          <div className="grid grid-cols-3 gap-2">
            {ALL_ROLES.map(r => {
              const on = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={
                    "rounded-2xl p-3 text-left border transition " +
                    (on
                      ? "border-ink-800 bg-white shadow-card"
                      : "border-ink-200 bg-white/60 text-ink-600")
                  }
                >
                  <div className={"text-[20px] " + (on ? "" : "opacity-70")}>{r.icon}</div>
                  <div className={"text-[12px] font-medium leading-tight mt-1 " + (on ? "text-ink-900" : "text-ink-700")}>
                    {r.label}
                  </div>
                  <div className="text-[10.5px] text-ink-500 mt-0.5 leading-snug">{r.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-ink-100 space-y-4">
          <Field label="ชื่อผู้ใช้งาน" required>
            <TextInput
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              prefix={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>
                </svg>
              }
            />
          </Field>
          <Field label="รหัสผ่าน" required>
            <TextInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="••••••"
              prefix={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                </svg>
              }
              suffix={
                <button onClick={() => setShow(s => !s)} className="text-[12px] text-ink-700 px-1">
                  {show ? "ซ่อน" : "แสดง"}
                </button>
              }
            />
          </Field>
          <div className="flex items-center justify-between text-[12px]">
            <label className="inline-flex items-center gap-2 text-ink-600">
              <input type="checkbox" defaultChecked className="accent-ink-800 w-4 h-4"/>
              จดจำการเข้าสู่ระบบ
            </label>
            <button className="text-ink-700 underline-offset-2 underline">ลืมรหัสผ่าน?</button>
          </div>
          <PrimaryButton loading={loading} onClick={submit} className="w-full">
            เข้าสู่ระบบ
          </PrimaryButton>
        </div>

        <div className="text-center text-[11.5px] text-ink-500 mt-auto">
          v1.0 · พัฒนาเพื่อการดูแลในชุมชน · 2569
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── HOME (Care Giver)
function HomeScreen({ onOpenNewVisit, onOpenPatient, onLogout }) {
  const [tab, setTab] = uS1("all");
  const [q, setQ] = uS1("");

  const today = thaiDateString();
  const filtered = PATIENTS.filter(p => {
    if (tab === "risk" && p.risk === "ปกติ") return false;
    if (tab === "bed" && p.adl_group !== "ติดเตียง") return false;
    if (q) {
      const needle = q.toLowerCase();
      return (p.name + p.pid + p.village).toLowerCase().includes(needle);
    }
    return true;
  });

  const riskCount = PATIENTS.filter(p => p.risk !== "ปกติ").length;
  const todayPlanned = 3;

  return (
    <div className="phone phone-bg pb-32">
      <StatusBar/>

      {/* Greeting header */}
      <header className="px-5 pt-2 pb-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-ink-800 text-white grid place-items-center font-medium text-[15px]">
          {CURRENT_USER.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-ink-500">สวัสดี · {today}</div>
          <div className="text-[15px] font-medium text-ink-900 truncate">{CURRENT_USER.name}</div>
        </div>
        <button
          onClick={onLogout}
          className="w-10 h-10 grid place-items-center rounded-full bg-white border border-ink-200 text-ink-700"
          aria-label="ออกจากระบบ"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
          </svg>
        </button>
      </header>

      {/* Today summary */}
      <div className="mx-5 mb-5 rounded-3xl bg-ink-800 text-white p-5 shadow-pop overflow-hidden relative">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-10 -right-2 w-32 h-32 rounded-full bg-white/5"></div>
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">วันนี้</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-[40px] font-medium leading-none tnum">{todayPlanned}</div>
            <div className="text-[13px] text-white/80 pb-1">เคสที่ต้องเยี่ยม</div>
          </div>
          <div className="mt-3 flex gap-2 text-[12px]">
            <div className="px-2.5 py-1 rounded-full bg-white/10 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-coral"></span>
              เสี่ยงสูง {riskCount}
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/10">เยี่ยมแล้ว 1 / {todayPlanned}</div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-accent-sage2" style={{ width: "33%" }}></div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="flex items-stretch rounded-2xl bg-white border border-ink-200 focus-within:border-ink-700">
          <span className="self-center pl-4 text-ink-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ค้นหา ชื่อ / PID / หมู่บ้าน"
            className="flex-1 h-12 px-3 bg-transparent outline-none text-[14px] placeholder:text-ink-400"
          />
          <button className="self-center pr-4 text-ink-500" aria-label="กรอง">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "all",  label: "ทั้งหมด · " + PATIENTS.length },
          { id: "risk", label: "เคสเสี่ยง · " + riskCount },
          { id: "bed",  label: "ติดเตียง · " + PATIENTS.filter(p=>p.adl_group==="ติดเตียง").length },
          { id: "today",label: "วันนี้ · " + todayPlanned }
        ].map(t => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "shrink-0 h-9 px-3.5 rounded-full text-[12.5px] transition " +
                (on ? "bg-ink-800 text-white" : "bg-white border border-ink-200 text-ink-700")
              }
            >{t.label}</button>
          );
        })}
      </div>

      {/* Patient cards */}
      <div className="px-5 space-y-3">
        {filtered.map(p => <PatientCard key={p.pid} p={p} onOpen={() => onOpenPatient(p)}/>)}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
            ไม่พบเคสที่ตรงกับเงื่อนไข
          </div>
        ) : null}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="phone mx-auto pointer-events-auto bg-white/95 backdrop-blur border-t border-ink-100 px-3 py-2 flex items-center justify-around">
          {[
            { id: "home", label: "เคส", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
            { id: "rep",  label: "รายงาน", icon: "M4 4h12l4 4v12H4z M14 4v6h6" },
            { id: "fab",  fab: true },
            { id: "map",  label: "แผนที่", icon: "M9 3l-6 3v15l6-3 6 3 6-3V3l-6 3z" },
            { id: "me",   label: "บัญชี", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.5-4 5-6 8-6s6.5 2 8 6" }
          ].map(item => item.fab ? (
            <button
              key="fab"
              onClick={onOpenNewVisit}
              className="-mt-7 w-14 h-14 rounded-2xl bg-ink-800 text-white grid place-items-center shadow-pop active:scale-95 transition"
              aria-label="บันทึกเยี่ยมใหม่"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          ) : (
            <button key={item.id} className="flex-1 flex flex-col items-center gap-0.5 py-1 text-ink-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {item.icon.split(" ").map((d,i) => <path key={i} d={d}/>)}
              </svg>
              <span className="text-[10.5px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function PatientCard({ p, onOpen }) {
  const riskTone = p.risk === "เสี่ยงสูง" ? "danger" : p.risk === "เฝ้าระวัง" ? "warning" : "ok";
  const adlTone = p.adl_group === "ติดเตียง" ? "danger" : p.adl_group === "ติดบ้าน" ? "warning" : "ok";
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white rounded-3xl border border-ink-100 shadow-card p-4 active:scale-[.995] transition"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-paper grid place-items-center text-ink-700 font-medium">
          {p.name.replace(/^น(าง|าย|.ส.)\s*/, "").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-[15px] font-medium text-ink-900 truncate">{p.name}</div>
            <div className="text-[12px] text-ink-500 tnum shrink-0">{p.age} ปี · {p.sex}</div>
          </div>
          <div className="text-[11.5px] text-ink-500 tnum mt-0.5">PID {p.pid}</div>
          <div className="text-[12px] text-ink-600 mt-1.5 truncate">{p.village}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ScoreChip tone={adlTone}>{p.adl_group}</ScoreChip>
            <ScoreChip tone={riskTone}>{p.risk}</ScoreChip>
            <span className="text-[11px] text-ink-500 ml-auto tnum">เยี่ยมล่าสุด {p.last_visit}</span>
          </div>
        </div>
      </div>
      <div className="dotted-rule my-3"></div>
      <div className="flex items-center justify-between text-[12px] text-ink-600">
        <span className="inline-flex items-center gap-1.5 tnum">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ห่าง {p.distance_km} กม.
        </span>
        <span className="tnum">เยี่ยมรวม {p.visit_count} ครั้ง</span>
        <span className="inline-flex items-center gap-1 text-ink-800 font-medium">
          เปิดเคส
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </div>
    </button>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, PatientCard });
