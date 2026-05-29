// ─────────────────────────────────────────────────────────────────────────────
//  Visit-form Wizard — stitches header + 9 sections into a stepper
// ─────────────────────────────────────────────────────────────────────────────

const { useState: usF, useEffect: ueF, useRef: urF, useMemo: umF } = React;

const STEPS = [
  { id: "hdr",   short: "ส่วนหัว",        title: "ข้อมูลส่วนหัว" },
  { id: "s1",    short: "สุขภาพ",        title: "ประเมินสุขภาพแรกรับ" },
  { id: "s2",    short: "สัญญาณชีพ",     title: "สัญญาณชีพ" },
  { id: "s3",    short: "ADL",          title: "ประเมิน ADL" },
  { id: "s4",    short: "สุขภาพจิต",    title: "สุขภาพจิต 2Q/9Q/8Q" },
  { id: "s5",    short: "การช่วยเหลือ",  title: "กิจกรรมประจำวัน" },
  { id: "s6",    short: "สุขภาพพื้นฐาน", title: "กิจกรรมสุขภาพ" },
  { id: "s7",    short: "อื่น ๆ",          title: "กิจกรรมอื่น ๆ" },
  { id: "s8",    short: "ภาพถ่าย",       title: "อัปโหลดภาพ" },
  { id: "s9",    short: "พิกัด",         title: "GPS" }
];

function blankForm(patient) {
  return {
    // header
    visit_date: thaiDateString(),
    time_start: thaiTimeString(),
    time_end: "",
    cg_at_home: patient?.caregiver_at_home || "",
    relation: patient?.relation || "",
    contact: patient?.contact || "",
    // s1
    weight: "", height: "",
    // s2
    temp: "", pulse: "", resp: "", bp: "",
    // s3
    adl_enabled: true,
    adl: {},
    // s4
    mh_enabled: true,
    twoQ: [null, null],
    nineQ: Array(9).fill(null),
    eightQ: Array(8).fill(null),
    eight_q3_control: "",
    // s5/6/7
    daily: { checked: [], other: "" },
    health: { checked: [], other: "" },
    other: { checked: [], other: "" },
    // s8
    photos: [],
    // s9
    gps_enabled: true,
    lat: null, lng: null,
    // risk
    risk_level: "ปกติ"
  };
}

function VisitFormScreen({ patient, onSaved, onCancel }) {
  const [step, setStep] = usF(0);
  const [form, setForm] = usF(() => blankForm(patient));
  const [saving, setSaving] = usF(false);
  const [completed, setCompleted] = usF(Array(STEPS.length).fill(false));
  const [riskFlag, setRiskFlag] = usF(false);
  const scrollRef = urF(null);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  // Roll completed state forward when leaving a step
  const goto = (i) => {
    setCompleted(c => c.map((v, idx) => idx < i ? true : v));
    setStep(i);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const next = () => {
    if (step < STEPS.length - 1) goto(step + 1);
    else trySave();
  };
  const prev = () => {
    if (step > 0) goto(step - 1);
    else onCancel();
  };

  const onRisk = (risk, info) => {
    setRiskFlag(risk);
    set({ risk_level: risk ? "เสี่ยงสูง" : "ปกติ" });
  };

  const trySave = () => {
    // light validation summary
    const issues = [];
    if (!form.cg_at_home) issues.push("ชื่อผู้ดูแลในครัวเรือน");
    if (!form.relation)   issues.push("ความสัมพันธ์");
    if (!form.contact || !/^\d{9,10}$/.test(form.contact)) issues.push("เบอร์ติดต่อ (9-10 หลัก)");
    if (!form.weight || !form.height) issues.push("น้ำหนัก / ส่วนสูง");

    if (issues.length) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        html: "กรุณาตรวจสอบ:<br/><br/>• " + issues.join("<br/>• "),
        confirmButtonText: "รับทราบ"
      });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const totalADL = Object.values(form.adl).reduce((s,v)=>s+(v||0),0);
      const total9Q = (form.nineQ || []).reduce((s,v)=>s+(v||0),0);
      Swal.fire({
        icon: "success",
        title: "บันทึกการเยี่ยมสำเร็จ",
        html: `
          <div style="text-align:left; font-size:14px; color:#13224a">
            <div><b>${patient.name}</b></div>
            <div style="color:#506aa3; font-size:12px">PID ${patient.pid} · ครั้งที่ ${(patient.visit_count||0)+1}</div>
            <hr style="margin:10px 0; border-color:#ecf0f7"/>
            <div>ADL รวม: <b>${totalADL}/20</b> · ${interpretADL(totalADL).label}</div>
            <div>9Q รวม: <b>${total9Q}</b> · ${interpret9Q(total9Q).label}</div>
            <div>ภาพถ่าย: <b>${form.photos.length}</b> ภาพ</div>
            ${form.lat ? `<div>พิกัด: <b>${form.lat}, ${form.lng}</b></div>` : ""}
            ${riskFlag ? `<div style="color:#c0533f; margin-top:6px"><b>⚠︎ risk_level = เสี่ยงสูง</b></div>` : ""}
          </div>
        `,
        confirmButtonText: "เสร็จสิ้น"
      }).then(() => onSaved(form));
    }, 1100);
  };

  const renderStep = () => {
    switch (STEPS[step].id) {
      case "hdr": return <SectionHeader patient={patient} value={form} set={set}/>;
      case "s1":  return <SectionInitialHealth value={form} set={set}/>;
      case "s2":  return <SectionVitals value={form} set={set}/>;
      case "s3":  return <SectionADL value={form} set={set}/>;
      case "s4":  return <SectionMental value={form} set={set} onRisk={onRisk}/>;
      case "s5":  return <ChecklistSection
                            title="5 · กิจกรรมการดูแลด้านการช่วยเหลือประจำวัน"
                            subtitle="เลือกได้หลายรายการ"
                            items={DAILY_CARE}
                            value={form.daily}
                            set={v => set({ daily: v })}/>;
      case "s6":  return <ChecklistSection
                            title="6 · กิจกรรมการดูแลด้านสุขภาพพื้นฐาน"
                            subtitle="เลือกได้หลายรายการ"
                            items={HEALTH_CARE}
                            value={form.health}
                            set={v => set({ health: v })}/>;
      case "s7":  return <ChecklistSection
                            title="7 · กิจกรรมการดูแลด้านอื่น ๆ"
                            subtitle="เลือกได้หลายรายการ"
                            items={OTHER_CARE}
                            value={form.other}
                            set={v => set({ other: v })}/>;
      case "s8":  return <SectionPhotos value={form} set={set}/>;
      case "s9":  return <SectionGPS value={form} set={set}/>;
      default: return null;
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="phone phone-bg pb-28">
      <StatusBar/>
      <AppHeader
        title="บันทึกการเยี่ยมบ้าน"
        subtitle={`${patient.name} · ครั้งที่ ${(patient.visit_count||0)+1}`}
        onBack={prev}
        right={
          <button
            onClick={() => {
              Swal.fire({
                icon: "question",
                title: "ออกจากการบันทึก?",
                text: "ข้อมูลที่กรอกยังไม่ได้บันทึกจะหายไป",
                showCancelButton: true,
                confirmButtonText: "ออก",
                cancelButtonText: "อยู่ต่อ"
              }).then(r => r.isConfirmed && onCancel());
            }}
            className="text-[12px] text-ink-700 px-3 h-9 rounded-full bg-ink-100"
          >ยกเลิก</button>
        }
      />
      <Stepper steps={STEPS} current={step} onJump={goto} completed={completed}/>

      <div ref={scrollRef} className="px-5 pt-3 space-y-5">
        {/* Risk pinned alert across all subsequent steps */}
        {riskFlag && step > 4 ? (
          <div className="rounded-2xl bg-accent-coral/10 border border-accent-coral/30 text-accent-coral px-4 py-3 flex items-center gap-3 text-[12.5px]">
            <span className="w-7 h-7 rounded-lg bg-accent-coral text-white grid place-items-center text-[14px]">!</span>
            <span>ผู้สูงอายุรายนี้ถูกระบุเป็น <b>เสี่ยงสูง</b> จากการประเมินสุขภาพจิต — กำหนดติดตามภายใน 7 วัน</span>
          </div>
        ) : null}

        {renderStep()}

        <div className="text-[11.5px] text-ink-500 text-center pt-2">
          ส่วนที่ {step + 1} จาก {STEPS.length} · {STEPS[step].title}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="phone mx-auto pointer-events-auto px-4 pt-3 pb-4 bg-paper-warm/95 backdrop-blur border-t border-ink-100">
          <div className="flex gap-2">
            <GhostButton onClick={prev} className="px-4">
              {step === 0 ? "ยกเลิก" : "ย้อนกลับ"}
            </GhostButton>
            <PrimaryButton
              onClick={next}
              loading={saving}
              className="flex-1"
              icon={
                isLast ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10"/></svg>
                ) : null
              }
            >
              {saving ? "กำลังบันทึก..." : isLast ? "บันทึกการเยี่ยม" : "ขั้นตอนถัดไป"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VisitFormScreen, blankForm, STEPS });
