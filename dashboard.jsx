// ─────────────────────────────────────────────────────────────────────────────
//  Admin Dashboard — KPIs, charts, recent visits, search/filter, export
// ─────────────────────────────────────────────────────────────────────────────

const { useState: usD, useMemo: umD, useRef: urD } = React;

const ADMIN_USER = {
  name: "นพ.ธีรพงศ์  ภูวสิน",
  role: "ผู้อำนวยการ รพ.สต.",
  initials: "ธภ"
};

function AdminDashboard({ onLogout, onNav }) {
  const [range, setRange] = usD("7d");
  const [query, setQuery] = usD("");
  const [riskFilter, setRiskFilter] = usD("all");
  const [village, setVillage] = usD("all");

  // ─── KPIs derived from VISITS + PATIENTS ─────────────────────────────────
  const k = umD(() => {
    const cases = PATIENTS.length + 12;          // mocked roster size
    const visits = VISITS.length + 24;            // total visits to-date
    const lowADL = VISITS.filter(v => v.adl <= 11).length;
    const high9Q = VISITS.filter(v => v.q9 >= 7).length;
    const has8Q = VISITS.filter(v => v.q8 > 0).length;
    const visitsToday = VISITS.filter(v => v.date === "24/05/2569").length;
    return { cases, visits, lowADL, high9Q, has8Q, visitsToday };
  }, []);

  // ─── Filtered visits ─────────────────────────────────────────────────────
  const filtered = umD(() => VISITS.filter(v => {
    if (riskFilter !== "all" && v.risk !== riskFilter) return false;
    if (village !== "all" && v.village !== village) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!(v.name + v.pid + v.cg).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [query, riskFilter, village]);

  const exportFile = (kind) => {
    Swal.fire({
      title: `กำลังสร้างไฟล์ ${kind.toUpperCase()}...`,
      didOpen: () => Swal.showLoading(),
      timer: 1100,
      timerProgressBar: true
    }).then(() => {
      Swal.fire({
        icon: "success",
        title: "ส่งออกสำเร็จ",
        html: `ดาวน์โหลดรายงาน <b>visit-log_${range}.${kind}</b><br/><span style="color:#506aa3; font-size:12px">${filtered.length} รายการ</span>`,
        confirmButtonText: "ตกลง"
      });
    });
  };

  return (
    <div className="phone phone-bg pb-28">
      <StatusBar/>

      {/* Identity header */}
      <header className="px-5 pt-2 pb-3 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-ink-800 text-white grid place-items-center font-medium text-[15px]">
          {ADMIN_USER.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] text-ink-500">{ADMIN_USER.role}</div>
          <div className="text-[15px] font-medium text-ink-900 truncate">{ADMIN_USER.name}</div>
        </div>
        <button
          onClick={onLogout}
          className="w-10 h-10 grid place-items-center rounded-full bg-white border border-ink-200 text-ink-700"
          aria-label="ออกจากระบบ"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
          </svg>
        </button>
      </header>

      {/* Title row + range */}
      <div className="px-5 mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11.5px] tracking-[0.18em] text-ink-500 uppercase">Dashboard</div>
          <h1 className="text-[22px] font-medium text-ink-900 leading-tight">ภาพรวมการดูแล</h1>
          <div className="text-[12px] text-ink-500 mt-0.5">รพ.สต.บ้านทรายไหลแล้ง · ปรับล่าสุด {thaiDateString()} {thaiTimeString()}</div>
        </div>
      </div>

      {/* Date range pills */}
      <div className="px-5 mb-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "today", label: "วันนี้" },
          { id: "7d",    label: "7 วัน" },
          { id: "30d",   label: "30 วัน" },
          { id: "qtr",   label: "ไตรมาส" },
          { id: "year",  label: "ปีงบ 2569" }
        ].map(r => {
          const on = range === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={
                "shrink-0 h-9 px-3.5 rounded-full text-[12.5px] transition " +
                (on ? "bg-ink-800 text-white" : "bg-white border border-ink-200 text-ink-700")
              }
            >{r.label}</button>
          );
        })}
      </div>

      {/* KPI tiles */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        <KPI value={k.cases}   label="จำนวนเคสทั้งหมด" sub="เคสในความรับผิดชอบ" tone="neutral" trend="+3"/>
        <KPI value={k.visits}  label="ครั้งเยี่ยมทั้งหมด" sub={`วันนี้ ${k.visitsToday} ครั้ง`} tone="ok" trend="+12"/>
        <KPI value={k.lowADL}  label="เคส ADL ≤ 11" sub="ติดบ้าน / ติดเตียง" tone="warning" trend="0"/>
        <KPI value={k.high9Q}  label="เคส 9Q ≥ 7" sub="ภาวะซึมเศร้า" tone="warning" trend="+1"/>
      </div>

      {/* Critical risk callout */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl bg-accent-coral text-white p-4 shadow-pop overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/8"></div>
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 grid place-items-center text-[20px] shrink-0">!</div>
            <div className="flex-1">
              <div className="text-[11px] tracking-[0.16em] uppercase opacity-80">เร่งด่วน</div>
              <div className="text-[15px] font-medium leading-tight mt-0.5">
                {k.has8Q} เคสมี 8Q &gt; 0 — แนวโน้มฆ่าตัวตาย
              </div>
              <div className="text-[12px] opacity-90 mt-1">ติดตามภายใน 7 วัน · ส่งต่อ รพ.อำเภอตามแผน CPG</div>
            </div>
            <button className="self-center w-9 h-9 rounded-xl bg-white/15 grid place-items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Visits trend chart */}
      <SectionCard title="แนวโน้มการเยี่ยม · 14 วันที่ผ่านมา" subtitle="จำนวนครั้งต่อวัน">
        <VisitsBarChart data={VISITS_14D}/>
        <div className="flex items-center justify-between text-[12px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-ink-800"></span> ทั้งหมด
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-accent-coral"></span> เคสเสี่ยง
          </span>
          <span className="tnum">เฉลี่ย 6.1 ครั้ง/วัน</span>
        </div>
      </SectionCard>

      <div className="h-4"></div>

      {/* ADL distribution donut */}
      <div className="px-5 grid grid-cols-1 gap-4">
        <SectionCard title="การกระจายระดับการพึ่งพิง" subtitle="จากการประเมิน ADL ล่าสุด">
          <ADLDonut/>
        </SectionCard>
      </div>

      <div className="h-4"></div>

      {/* Care giver leaderboard */}
      <SectionCard title="Care Giver ในพื้นที่" subtitle={`${CAREGIVERS.filter(c=>c.active).length} คนปฏิบัติงาน`}>
        <div className="space-y-2">
          {CAREGIVERS.map((c,i) => (
            <div key={c.id} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-xl bg-paper border border-ink-100 grid place-items-center text-[12px] font-medium text-ink-700">
                {c.name.split(" ").filter(Boolean)[0].slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] text-ink-900 truncate">{c.name}</div>
                <div className="text-[11.5px] text-ink-500">{c.id} · {c.village}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-medium text-ink-900 tnum">{c.cases}</div>
                <div className="text-[10.5px] text-ink-500">เคสที่ดูแล</div>
              </div>
              <span className={"w-2 h-2 rounded-full " + (c.active ? "bg-accent-sage" : "bg-ink-300")}></span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="h-4"></div>

      {/* Recent visits list + filters + export */}
      <SectionCard
        title="รายงานการเยี่ยมล่าสุด"
        subtitle={`${filtered.length} รายการ`}
        right={
          <div className="flex gap-1.5">
            <button onClick={() => exportFile("xlsx")} className="px-2.5 h-8 rounded-full bg-accent-sage/10 text-accent-sage text-[11px] font-medium inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>
              XLSX
            </button>
            <button onClick={() => exportFile("pdf")} className="px-2.5 h-8 rounded-full bg-accent-coral/10 text-accent-coral text-[11px] font-medium inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>
              PDF
            </button>
          </div>
        }
      >
        {/* Search */}
        <div className="flex items-stretch rounded-xl bg-paper border border-ink-100">
          <span className="self-center pl-3 text-ink-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหา ชื่อ / PID / Care Giver"
            className="flex-1 h-11 px-3 bg-transparent outline-none text-[13.5px] placeholder:text-ink-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pt-1">
          {["all","เสี่ยงสูง","เฝ้าระวัง","ปกติ"].map(r => {
            const on = riskFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={"shrink-0 h-8 px-3 rounded-full text-[11.5px] transition border " +
                  (on
                    ? "bg-ink-800 text-white border-ink-800"
                    : "bg-white border-ink-200 text-ink-600")
                }
              >{r === "all" ? "ทุกระดับเสี่ยง" : r}</button>
            );
          })}
          <span className="w-px shrink-0 bg-ink-200 mx-1 self-stretch"></span>
          {["all","หมู่ 4","หมู่ 5","หมู่ 7"].map(v => {
            const on = village === v;
            return (
              <button
                key={v}
                onClick={() => setVillage(v)}
                className={"shrink-0 h-8 px-3 rounded-full text-[11.5px] transition border " +
                  (on
                    ? "bg-ink-800 text-white border-ink-800"
                    : "bg-white border-ink-200 text-ink-600")
                }
              >{v === "all" ? "ทุกหมู่บ้าน" : v}</button>
            );
          })}
        </div>

        {/* Visit rows */}
        <div className="space-y-2">
          {filtered.map(v => <VisitRow key={v.id} v={v}/>)}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
              ไม่พบรายการที่ตรงกับเงื่อนไข
            </div>
          ) : null}
        </div>
      </SectionCard>

      <div className="h-6"></div>

      {/* Admin quick actions */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <AdminAction icon="users"    label="จัดการผู้ใช้งาน" sub={`${CAREGIVERS.length} คน`}     onClick={() => onNav?.("users")}/>
        <AdminAction icon="patients" label="ทะเบียนผู้สูงอายุ" sub={`${k.cases} เคส`}        onClick={() => onNav?.("patients")}/>
        <AdminAction icon="settings" label="ตั้งค่าระบบ"     sub="role · ฟอร์ม · พื้นที่"/>
        <AdminAction icon="audit"    label="audit log"        sub="กิจกรรมการแก้ไข"/>
      </div>

      <div className="text-center text-[11px] text-ink-400 pb-6">
        v1.0 · LTC Care · 2569
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── KPI tile
function KPI({ value, label, sub, tone = "neutral", trend }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-4">
      <div className="flex items-start justify-between">
        <span className={"w-8 h-8 rounded-xl grid place-items-center " + t.bg}>
          <span className={"w-2 h-2 rounded-full " + t.dot}></span>
        </span>
        {trend ? (
          <span className="text-[11px] text-ink-500 tnum inline-flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 15l6-6 6 6"/>
            </svg>
            {trend}
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-[28px] font-medium leading-none text-ink-900 tnum">{value}</div>
      <div className="text-[12px] text-ink-700 mt-1.5 leading-tight">{label}</div>
      {sub ? <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div> : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────── Bar chart
function VisitsBarChart({ data }) {
  const max = Math.max(...data);
  const labels = ["จ","อ","พ","พฤ","ศ","ส","อา"];
  return (
    <div>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((v, i) => {
          const h = Math.max(6, (v / max) * 100);
          const isRecent = i >= data.length - 3;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div className="text-[10px] text-ink-500 tnum">{v}</div>
              <div
                className={"w-full rounded-t-md transition " +
                  (isRecent ? "bg-ink-800" : "bg-ink-200")}
                style={{ height: h + "%" }}
              ></div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5 text-[10px] text-ink-400 tnum">
        {data.map((_,i) => (
          <div key={i} className="flex-1 text-center">{labels[i % 7]}</div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── ADL donut
function ADLDonut() {
  const seg = [
    { label: "ติดสังคม", value: 18, color: "#3e8e6a" },
    { label: "ติดบ้าน",   value: 9,  color: "#b58a3c" },
    { label: "ติดเตียง",  value: 5,  color: "#c0533f" }
  ];
  const total = seg.reduce((s,x)=>s+x.value, 0);
  let acc = 0;
  const R = 42, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#ecf0f7" strokeWidth="14"/>
        {seg.map((s, i) => {
          const dash = (s.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="60" cy="60" r={R}
              fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
              transform="rotate(-90 60 60)"
              strokeLinecap="butt"
            />
          );
          acc += dash;
          return el;
        })}
        <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="500" fill="#0b1530" fontFamily="Mitr">{total}</text>
        <text x="60" y="76" textAnchor="middle" fontSize="10" fill="#506aa3" fontFamily="Mitr">เคสรวม</text>
      </svg>
      <div className="flex-1 space-y-2">
        {seg.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-[12.5px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }}></span>
            <span className="text-ink-800 flex-1">{s.label}</span>
            <span className="tnum text-ink-500">{s.value}</span>
            <span className="tnum text-ink-400 w-9 text-right">{Math.round(s.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── Visit row
function VisitRow({ v }) {
  const tone = v.risk === "เสี่ยงสูง" ? "danger" : v.risk === "เฝ้าระวัง" ? "warning" : "ok";
  const adlTone = v.adl <= 4 ? "danger" : v.adl <= 11 ? "warning" : "ok";
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="text-center shrink-0 w-12">
          <div className="text-[10px] text-ink-400 tnum">{v.date.slice(0,5)}</div>
          <div className="text-[10px] text-ink-400 tnum">{v.date.slice(6)}</div>
          <div className="mt-1 text-[10px] text-ink-500 tnum">{v.id}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-[13.5px] font-medium text-ink-900 truncate">{v.name}</div>
          </div>
          <div className="text-[10.5px] text-ink-500 tnum">PID {v.pid} · {v.village}</div>
          <div className="text-[11.5px] text-ink-600 mt-1 truncate">โดย {v.cg}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ScoreChip tone={adlTone}>ADL {v.adl}</ScoreChip>
            <ScoreChip tone={v.q9 >= 7 ? "warning" : "neutral"}>9Q {v.q9}</ScoreChip>
            {v.q8 > 0 ? <ScoreChip tone="danger">8Q {v.q8}</ScoreChip> : null}
            <ScoreChip tone={tone}>{v.risk}</ScoreChip>
          </div>
        </div>
        <button className="self-center text-ink-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── Admin actions
function AdminAction({ icon, label, sub, onClick }) {
  const ICON = {
    users:    <path d="M16 21v-2a4 4 0 0 0-3-3.87M3 21v-2a4 4 0 0 1 3-3.87M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>,
    patients: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>,
    settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12l2 1-1 3-2-1 M5 12l-2 1 1 3 2-1 M12 5l1-2h3l-1 2 M12 19l1 2h3l-1-2"/>,
    audit:    <path d="M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5"/>
  };
  return (
    <button onClick={onClick} className="rounded-2xl bg-white border border-ink-100 shadow-card p-4 text-left flex items-start gap-3 active:scale-[.99] transition">
      <span className="w-9 h-9 rounded-xl bg-ink-100 text-ink-800 grid place-items-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ICON[icon]}
        </svg>
      </span>
      <span className="min-w-0">
        <div className="text-[13.5px] font-medium text-ink-900 leading-tight">{label}</div>
        <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>
      </span>
    </button>
  );
}

Object.assign(window, { AdminDashboard });
