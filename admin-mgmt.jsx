// ─────────────────────────────────────────────────────────────────────────────
//  Admin: User Management + Patient Registry (CRUD UIs)
// ─────────────────────────────────────────────────────────────────────────────

const { useState: usM, useMemo: umM, useRef: urM, useEffect: ueM } = React;

const ROLE_BADGE = {
  "Care Giver":   { tone: "ok",      label: "Care Giver" },
  "Admin":        { tone: "neutral", label: "Admin" },
  "Case Manager": { tone: "warning", label: "Case Manager" }
};

// Seed an editable list from data.jsx CAREGIVERS + a couple admin/CM accounts.
function seedUsers() {
  const cgs = (CAREGIVERS || []).map(c => ({
    user_id: c.id,
    name: c.name,
    role: "Care Giver",
    username: c.id.toLowerCase().replace("-",""),
    village: c.village,
    phone: "08" + Math.floor(10000000 + Math.random()*89999999),
    cases: c.cases,
    active: c.active
  }));
  return [
    {
      user_id: "AD-001", name: "นพ.ธีรพงศ์  ภูวสิน", role: "Admin",
      username: "admin01", village: "—", phone: "0851112233", cases: 0, active: true
    },
    {
      user_id: "CM-001", name: "พญ.สุนิสา  วรกิจ", role: "Case Manager",
      username: "cm01", village: "—", phone: "0852223344", cases: 0, active: true
    },
    ...cgs
  ];
}

// ────────────────────────────────────────────────────────────── Bottom Sheet
function BottomSheet({ open, onClose, title, children, actions }) {
  ueM(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={onClose}></div>
      <div className="phone relative bg-paper-warm rounded-t-3xl max-h-[88dvh] w-full overflow-hidden animate-[slideUp_.25s_ease-out] flex flex-col"
           style={{ animation: "slideUp .25s ease-out" }}>
        <div className="pt-3 pb-1 grid place-items-center">
          <div className="w-12 h-1.5 rounded-full bg-ink-200"></div>
        </div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-ink-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full bg-ink-100 text-ink-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4 space-y-4 flex-1">{children}</div>
        {actions ? (
          <div className="px-4 pt-3 pb-4 border-t border-ink-100 bg-paper-warm flex gap-2">{actions}</div>
        ) : null}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── User Management
function UsersScreen({ onBack }) {
  const [users, setUsers] = usM(() => seedUsers());
  const [role, setRole] = usM("all");
  const [q, setQ] = usM("");
  const [editing, setEditing] = usM(null);    // user object or "new"

  const filtered = umM(() => users.filter(u => {
    if (role !== "all" && u.role !== role) return false;
    if (q) {
      const n = q.toLowerCase();
      if (!(u.name + u.user_id + u.username + u.village).toLowerCase().includes(n)) return false;
    }
    return true;
  }), [users, role, q]);

  const counts = umM(() => ({
    all: users.length,
    "Care Giver":   users.filter(u => u.role === "Care Giver").length,
    "Case Manager": users.filter(u => u.role === "Case Manager").length,
    "Admin":        users.filter(u => u.role === "Admin").length
  }), [users]);

  const openNew = () => setEditing({
    user_id: `CG-${String(Math.floor(20 + Math.random()*900)).padStart(3,"0")}`,
    name: "", role: "Care Giver", username: "", village: "หมู่ 4", phone: "", cases: 0, active: true
  });

  const save = (next) => {
    if (!next.name || !next.username || !next.phone) {
      Swal.fire({ icon: "warning", title: "ข้อมูลไม่ครบ", text: "กรุณาระบุชื่อ · username · เบอร์ติดต่อ" });
      return;
    }
    if (!/^\d{9,10}$/.test(next.phone)) {
      Swal.fire({ icon: "warning", title: "เบอร์ไม่ถูกต้อง", text: "ต้องเป็นตัวเลข 9-10 หลัก" });
      return;
    }
    const exists = users.some(u => u.user_id === next.user_id);
    setUsers(exists ? users.map(u => u.user_id === next.user_id ? next : u) : [next, ...users]);
    setEditing(null);
    Swal.fire({ icon: "success", title: exists ? "อัปเดตสำเร็จ" : "เพิ่มผู้ใช้สำเร็จ", timer: 1100, showConfirmButton: false });
  };

  const remove = (u) => {
    Swal.fire({
      icon: "warning", title: "ลบผู้ใช้?", html: `<b>${u.name}</b><br/><span style="color:#506aa3">${u.user_id}</span>`,
      showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก"
    }).then(r => {
      if (r.isConfirmed) {
        setUsers(users.filter(x => x.user_id !== u.user_id));
        setEditing(null);
        Swal.fire({ icon: "success", title: "ลบแล้ว", timer: 900, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="phone phone-bg pb-28">
      <StatusBar/>
      <AppHeader
        title="จัดการผู้ใช้งาน"
        subtitle={`${users.length} บัญชี · ทั้งหน่วยงาน`}
        onBack={onBack}
      />

      {/* Search */}
      <div className="px-5">
        <div className="flex items-stretch rounded-xl bg-white border border-ink-200">
          <span className="self-center pl-3 text-ink-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ค้นหา ชื่อ / username / หมู่บ้าน"
            className="flex-1 h-11 px-3 bg-transparent outline-none text-[13.5px]"
          />
        </div>
      </div>

      {/* Role tabs */}
      <div className="px-5 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "all",          label: "ทั้งหมด · " + counts.all },
          { id: "Care Giver",   label: "Care Giver · " + counts["Care Giver"] },
          { id: "Case Manager", label: "Case Manager · " + counts["Case Manager"] },
          { id: "Admin",        label: "Admin · " + counts["Admin"] }
        ].map(t => {
          const on = role === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setRole(t.id)}
              className={"shrink-0 h-9 px-3.5 rounded-full text-[12.5px] " +
                (on ? "bg-ink-800 text-white" : "bg-white border border-ink-200 text-ink-700")}
            >{t.label}</button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-5 mt-3 space-y-2">
        {filtered.map(u => (
          <button
            key={u.user_id}
            onClick={() => setEditing(u)}
            className="w-full text-left rounded-2xl bg-white border border-ink-100 shadow-card p-3 flex items-center gap-3 active:scale-[.995] transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-paper border border-ink-100 grid place-items-center font-medium text-ink-800 text-[14px]">
              {u.name.split(/\s+/).filter(Boolean).map(p => p.slice(0,1)).slice(0,2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <div className="text-[14px] font-medium text-ink-900 truncate">{u.name}</div>
              </div>
              <div className="text-[11px] text-ink-500 tnum">{u.user_id} · @{u.username}</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <ScoreChip tone={ROLE_BADGE[u.role]?.tone}>{ROLE_BADGE[u.role]?.label || u.role}</ScoreChip>
                <span className="text-[11px] text-ink-500">{u.village}</span>
                {u.cases ? <span className="text-[11px] text-ink-500 tnum">· {u.cases} เคส</span> : null}
                <span className="ml-auto flex items-center gap-1 text-[11px]">
                  <span className={"w-1.5 h-1.5 rounded-full " + (u.active ? "bg-accent-sage" : "bg-ink-300")}></span>
                  {u.active ? "ใช้งาน" : "ปิด"}
                </span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
            ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
          </div>
        ) : null}
      </div>

      {/* FAB */}
      <button
        onClick={openNew}
        className="fixed bottom-6 right-[max(1.25rem,calc(50vw-220px+1.25rem))] w-14 h-14 rounded-2xl bg-ink-800 text-white grid place-items-center shadow-pop active:scale-95 z-20"
        aria-label="เพิ่มผู้ใช้"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* Editor */}
      <UserEditor user={editing} onSave={save} onDelete={remove} onClose={() => setEditing(null)}/>
    </div>
  );
}

function UserEditor({ user, onSave, onDelete, onClose }) {
  const [d, setD] = usM(user || {});
  ueM(() => { setD(user || {}); }, [user]);
  if (!user) return null;
  const isNew = !user.user_id || user.user_id.startsWith("CG-") && !user.name;
  const set = (p) => setD(prev => ({ ...prev, ...p }));

  return (
    <BottomSheet
      open={!!user}
      onClose={onClose}
      title={user.name ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
      actions={
        <>
          {user.name ? (
            <GhostButton onClick={() => onDelete(user)} className="text-accent-coral border-accent-coral/30">
              ลบ
            </GhostButton>
          ) : null}
          <GhostButton onClick={onClose} className="flex-1">ยกเลิก</GhostButton>
          <PrimaryButton onClick={() => onSave(d)} className="flex-1">บันทึก</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="รหัสผู้ใช้">
          <TextInput value={d.user_id} readOnly/>
        </Field>
        <Field label="บทบาท" required>
          <Select
            value={d.role}
            onChange={e => set({ role: e.target.value })}
            options={["Care Giver","Case Manager","Admin"]}
          />
        </Field>
      </div>
      <Field label="ชื่อ - นามสกุล" required>
        <TextInput value={d.name} onChange={e => set({ name: e.target.value })} placeholder="เช่น นางสมพร  ใจดี"/>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="username" required>
          <TextInput value={d.username} onChange={e => set({ username: e.target.value.replace(/\s/g,"") })} placeholder="username"/>
        </Field>
        <Field label="เบอร์ติดต่อ" required>
          <TextInput
            value={d.phone}
            onChange={e => set({ phone: e.target.value.replace(/[^\d]/g,"").slice(0,10) })}
            inputMode="numeric" placeholder="0812345678"
          />
        </Field>
      </div>
      <Field label="พื้นที่รับผิดชอบ">
        <Select
          value={d.village}
          onChange={e => set({ village: e.target.value })}
          options={["หมู่ 4","หมู่ 5","หมู่ 6","หมู่ 7","ทั้งตำบล","—"]}
        />
      </Field>
      <Toggle
        value={!!d.active}
        onChange={v => set({ active: v })}
        label="สถานะใช้งาน"
        sub={d.active ? "สามารถเข้าสู่ระบบได้" : "ระงับการเข้าสู่ระบบ"}
      />
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────── Patient Registry
function PatientsScreen({ onBack }) {
  const [list, setList] = usM(() => [...(PATIENTS||[]),
    // a couple more rows so the registry feels populated
    { pid:"1490800555111", name:"นางวรรณี  ศรีสุวรรณ", age:69, sex:"หญิง", village:"หมู่ 5 บ้านดอนสวรรค์", address:"55 ม.5", caregiver_at_home:"นายเอก  ศรีสุวรรณ", relation:"บุตร", contact:"0856667777", adl_group:"ติดสังคม", last_visit:"19/05/2569", visit_count:3, risk:"ปกติ", distance_km:1.8 },
    { pid:"1490800666222", name:"นายสุพจน์  จันทร์ฉาย", age:80, sex:"ชาย", village:"หมู่ 7 บ้านโนนหินดำ", address:"7/2 ม.7", caregiver_at_home:"นางคำพา  จันทร์ฉาย", relation:"ภรรยา", contact:"0867778888", adl_group:"ติดเตียง", last_visit:"15/05/2569", visit_count:9, risk:"เสี่ยงสูง", distance_km:4.5 }
  ]);
  const [q, setQ] = usM("");
  const [grp, setGrp] = usM("all");
  const [editing, setEditing] = usM(null);

  const filtered = umM(() => list.filter(p => {
    if (grp !== "all" && p.adl_group !== grp) return false;
    if (q) {
      const n = q.toLowerCase();
      if (!(p.name + p.pid + p.village).toLowerCase().includes(n)) return false;
    }
    return true;
  }), [list, q, grp]);

  const groupCounts = umM(() => ({
    all: list.length,
    "ติดสังคม": list.filter(p=>p.adl_group==="ติดสังคม").length,
    "ติดบ้าน":   list.filter(p=>p.adl_group==="ติดบ้าน").length,
    "ติดเตียง":  list.filter(p=>p.adl_group==="ติดเตียง").length
  }), [list]);

  const openNew = () => setEditing({
    pid:"", name:"", age:"", sex:"หญิง", village:"หมู่ 4 บ้านทรายไหลแล้ง",
    address:"", caregiver_at_home:"", relation:"บุตร", contact:"",
    adl_group:"ติดบ้าน", last_visit:"—", visit_count:0, risk:"ปกติ", distance_km:1
  });

  const save = (next) => {
    if (!/^\d{13}$/.test(next.pid)) {
      Swal.fire({ icon: "warning", title: "PID ไม่ถูกต้อง", text: "ต้องเป็นตัวเลข 13 หลัก" });
      return;
    }
    if (!next.name) {
      Swal.fire({ icon: "warning", title: "ระบุชื่อผู้สูงอายุ" });
      return;
    }
    if (next.contact && !/^\d{9,10}$/.test(next.contact)) {
      Swal.fire({ icon: "warning", title: "เบอร์ไม่ถูกต้อง", text: "ต้องเป็นตัวเลข 9-10 หลัก" });
      return;
    }
    const exists = list.some(p => p.pid === next.pid);
    setList(exists ? list.map(p => p.pid === next.pid ? next : p) : [next, ...list]);
    setEditing(null);
    Swal.fire({ icon: "success", title: exists ? "อัปเดตสำเร็จ" : "เพิ่มผู้สูงอายุสำเร็จ", timer: 1100, showConfirmButton: false });
  };

  const remove = (p) => {
    Swal.fire({
      icon: "warning", title: "ลบเคส?", html: `<b>${p.name}</b><br/>PID ${p.pid}`,
      showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก"
    }).then(r => {
      if (r.isConfirmed) {
        setList(list.filter(x => x.pid !== p.pid));
        setEditing(null);
        Swal.fire({ icon: "success", title: "ลบแล้ว", timer: 900, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="phone phone-bg pb-28">
      <StatusBar/>
      <AppHeader
        title="ทะเบียนผู้สูงอายุ"
        subtitle={`${list.length} เคส · ทั้งตำบล`}
        onBack={onBack}
      />

      <div className="px-5">
        <div className="flex items-stretch rounded-xl bg-white border border-ink-200">
          <span className="self-center pl-3 text-ink-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ค้นหา ชื่อ / PID / หมู่บ้าน"
            className="flex-1 h-11 px-3 bg-transparent outline-none text-[13.5px]"
          />
        </div>
      </div>

      <div className="px-5 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "all",       label: "ทั้งหมด · " + groupCounts.all },
          { id: "ติดสังคม",  label: "ติดสังคม · " + groupCounts["ติดสังคม"] },
          { id: "ติดบ้าน",   label: "ติดบ้าน · " + groupCounts["ติดบ้าน"] },
          { id: "ติดเตียง",  label: "ติดเตียง · " + groupCounts["ติดเตียง"] }
        ].map(t => {
          const on = grp === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setGrp(t.id)}
              className={"shrink-0 h-9 px-3.5 rounded-full text-[12.5px] " +
                (on ? "bg-ink-800 text-white" : "bg-white border border-ink-200 text-ink-700")}
            >{t.label}</button>
          );
        })}
      </div>

      <div className="px-5 mt-3 space-y-3">
        {filtered.map(p => (
          <button
            key={p.pid}
            onClick={() => setEditing(p)}
            className="w-full text-left rounded-3xl bg-white border border-ink-100 shadow-card p-4 active:scale-[.995] transition"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-paper grid place-items-center font-medium text-ink-700">
                {p.name.replace(/^น(าง|าย|.ส.)\s*/,"").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <div className="text-[14.5px] font-medium text-ink-900 truncate">{p.name}</div>
                  <div className="text-[11px] text-ink-500 tnum shrink-0">{p.age} ปี · {p.sex}</div>
                </div>
                <div className="text-[11px] text-ink-500 tnum">PID {p.pid}</div>
                <div className="text-[12px] text-ink-600 mt-1 truncate">{p.village}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <ScoreChip tone={p.adl_group==="ติดเตียง"?"danger":p.adl_group==="ติดบ้าน"?"warning":"ok"}>{p.adl_group}</ScoreChip>
                  <ScoreChip tone={p.risk==="เสี่ยงสูง"?"danger":p.risk==="เฝ้าระวัง"?"warning":"ok"}>{p.risk}</ScoreChip>
                  <span className="ml-auto text-[11px] text-ink-500 tnum">{p.visit_count} ครั้ง</span>
                </div>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
            ไม่พบเคสที่ตรงกับเงื่อนไข
          </div>
        ) : null}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-6 right-[max(1.25rem,calc(50vw-220px+1.25rem))] w-14 h-14 rounded-2xl bg-ink-800 text-white grid place-items-center shadow-pop active:scale-95 z-20"
        aria-label="เพิ่มผู้สูงอายุ"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <PatientEditor patient={editing} onSave={save} onDelete={remove} onClose={() => setEditing(null)}/>
    </div>
  );
}

function PatientEditor({ patient, onSave, onDelete, onClose }) {
  const [d, setD] = usM(patient || {});
  ueM(() => { setD(patient || {}); }, [patient]);
  if (!patient) return null;
  const set = (p) => setD(prev => ({ ...prev, ...p }));

  return (
    <BottomSheet
      open={!!patient}
      onClose={onClose}
      title={patient.name ? "แก้ไขข้อมูลผู้สูงอายุ" : "เพิ่มผู้สูงอายุ"}
      actions={
        <>
          {patient.name ? (
            <GhostButton onClick={() => onDelete(patient)} className="text-accent-coral border-accent-coral/30">
              ลบ
            </GhostButton>
          ) : null}
          <GhostButton onClick={onClose} className="flex-1">ยกเลิก</GhostButton>
          <PrimaryButton onClick={() => onSave(d)} className="flex-1">บันทึก</PrimaryButton>
        </>
      }
    >
      <Field label="เลขประจำตัวประชาชน (PID)" required hint="13 หลัก">
        <TextInput
          value={d.pid}
          onChange={e => set({ pid: e.target.value.replace(/[^\d]/g,"").slice(0,13) })}
          inputMode="numeric"
          placeholder="1490800000000"
        />
      </Field>
      <Field label="ชื่อ - นามสกุล" required>
        <TextInput value={d.name} onChange={e => set({ name: e.target.value })} placeholder="เช่น นางบุญมี  สุขสมบัติ"/>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="อายุ" required>
          <TextInput value={d.age} onChange={e => set({ age: e.target.value.replace(/[^\d]/g,"") })} inputMode="numeric" suffix="ปี"/>
        </Field>
        <Field label="เพศ">
          <Select
            value={d.sex}
            onChange={e => set({ sex: e.target.value })}
            options={["หญิง","ชาย"]}
          />
        </Field>
      </div>
      <Field label="หมู่บ้าน">
        <Select
          value={d.village}
          onChange={e => set({ village: e.target.value })}
          options={[
            "หมู่ 4 บ้านทรายไหลแล้ง",
            "หมู่ 5 บ้านดอนสวรรค์",
            "หมู่ 6 บ้านนาทุ่ง",
            "หมู่ 7 บ้านโนนหินดำ"
          ]}
        />
      </Field>
      <Field label="ที่อยู่">
        <TextInput value={d.address} onChange={e => set({ address: e.target.value })} placeholder="บ้านเลขที่ / หมู่ที่ / ตำบล"/>
      </Field>
      <div className="dotted-rule"></div>
      <div className="text-[12px] text-ink-500 -mb-2">ผู้ดูแลในครัวเรือน</div>
      <Field label="ชื่อผู้ดูแล">
        <TextInput value={d.caregiver_at_home} onChange={e => set({ caregiver_at_home: e.target.value })} placeholder="เช่น นายสมพร  สุขสมบัติ"/>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ความสัมพันธ์">
          <Select value={d.relation} onChange={e => set({ relation: e.target.value })} options={RELATIONS}/>
        </Field>
        <Field label="เบอร์ติดต่อ">
          <TextInput
            value={d.contact}
            onChange={e => set({ contact: e.target.value.replace(/[^\d]/g,"").slice(0,10) })}
            inputMode="numeric"
            placeholder="0812345678"
          />
        </Field>
      </div>
      <div className="dotted-rule"></div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ระดับการพึ่งพิง">
          <Select value={d.adl_group} onChange={e => set({ adl_group: e.target.value })} options={["ติดสังคม","ติดบ้าน","ติดเตียง"]}/>
        </Field>
        <Field label="ระดับความเสี่ยง">
          <Select value={d.risk} onChange={e => set({ risk: e.target.value })} options={["ปกติ","เฝ้าระวัง","เสี่ยงสูง"]}/>
        </Field>
      </div>
    </BottomSheet>
  );
}

Object.assign(window, { UsersScreen, PatientsScreen, BottomSheet });
