// ─────────────────────────────────────────────────────────────────────────────
//  Case Manager — risk-case tracking · comment thread · care quality review
// ─────────────────────────────────────────────────────────────────────────────

const { useState: usC, useMemo: umC, useRef: urC, useEffect: ueC } = React;

const CM_USER = {
  name: "พญ.สุนิสา  วรกิจ",
  role: "Case Manager",
  initials: "สว"
};

// ─── Seed: build cases from VISITS, grouped by PID ──────────────────────────
function buildCases() {
  // group by patient
  const byPid = {};
  VISITS.forEach(v => {
    if (!byPid[v.pid]) byPid[v.pid] = { pid: v.pid, name: v.name, village: v.village, visits: [] };
    byPid[v.pid].visits.push(v);
  });

  const cases = Object.values(byPid).map(c => {
    c.visits.sort((a,b) => a.date.localeCompare(b.date));
    const last = c.visits[c.visits.length - 1];
    let status =
      last.q8 > 0                                  ? "urgent"   :
      last.q9 >= 7 || last.adl <= 4                ? "watch"    :
      last.adl <= 11                               ? "qa"       :
                                                     "resolved";
    return {
      ...c,
      adl: last.adl, q9: last.q9, q8: last.q8,
      risk: last.risk,
      cg: last.cg,
      last_visit: last.date,
      status,
      qa_score: 4.2 - Math.random()*0.8,
      qa_pending: status === "qa" || status === "watch"
    };
  });

  return cases;
}

// Seed comment threads keyed by PID
const SEED_COMMENTS = {
  "1490800234567": [
    { author: "พญ.สุนิสา  วรกิจ", role: "Case Manager", time: "24/05/2569 14:32", text: "ผลประเมิน 9Q เพิ่มขึ้น 4 คะแนนใน 2 สัปดาห์ — ขอให้ Care Giver ติดตามภายใน 3 วัน และส่งผลให้ทีมจิตเวช รพ.อำเภอ" },
    { author: "ขนิษฐา  ภูเวียงคำ", role: "Care Giver",   time: "24/05/2569 16:10", text: "รับทราบค่ะ จะเข้าเยี่ยมพรุ่งนี้เช้า พร้อมประเมินสภาพจิตซ้ำและประสานญาติ" }
  ],
  "1490800567890": [
    { author: "พญ.สุนิสา  วรกิจ", role: "Case Manager", time: "22/05/2569 09:15", text: "8Q = 17 — ส่งต่อ รพ.มุกดาหาร แผนกจิตเวชโดยด่วน · เปิด refer note และจัดรถพยาบาล" },
    { author: "ยุพิน  จันทร์สว่าง", role: "Care Giver", time: "22/05/2569 10:42", text: "ประสาน รพ.มุกดาหารแล้ว รับเคสไป admit เรียบร้อย กำหนดติดตาม 1 สัปดาห์" },
    { author: "พญ.สุนิสา  วรกิจ", role: "Case Manager", time: "23/05/2569 08:00", text: "ขอบคุณค่ะ — ขอให้ผู้ดูแลในครัวเรือนเข้าร่วม family-based intervention หลังออก รพ." }
  ]
};

const QA_RUBRIC = [
  { id: "complete",   label: "ความครบถ้วนของข้อมูล",      hint: "กรอกครบทุก section · ไม่มีช่องว่าง" },
  { id: "accuracy",   label: "ความถูกต้องของการประเมิน",  hint: "BMI · ADL · 2Q/9Q สอดคล้องกับอาการ" },
  { id: "photos",     label: "หลักฐานภาพถ่าย",            hint: "ภาพชัด แสดงกิจกรรมจริง" },
  { id: "timeliness", label: "ความตรงต่อเวลา",            hint: "บันทึกภายใน 24 ชม. หลังเยี่ยม" },
  { id: "followup",   label: "การติดตามและประสาน",         hint: "แจ้งทีมเมื่อพบความเสี่ยง" }
];

const STATUS_META = {
  urgent:   { label: "เร่งด่วน",        tone: "danger",  icon: "!" },
  watch:    { label: "ติดตาม",         tone: "warning", icon: "›" },
  qa:       { label: "ตรวจสอบคุณภาพ",  tone: "neutral", icon: "Q" },
  resolved: { label: "แก้ไขแล้ว",       tone: "ok",      icon: "✓" }
};

// ─────────────────────────────────────────────────────────── CASE LIST
function CaseManagerScreen({ onLogout, onOpenCase }) {
  const [cases] = usC(() => buildCases());
  const [tab, setTab] = usC("urgent");
  const [q, setQ] = usC("");

  const filtered = umC(() => cases.filter(c => {
    if (tab !== "all" && c.status !== tab) return false;
    if (q && !(c.name + c.pid + c.village).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cases, tab, q]);

  const counts = umC(() => ({
    all: cases.length,
    urgent: cases.filter(c => c.status === "urgent").length,
    watch: cases.filter(c => c.status === "watch").length,
    qa: cases.filter(c => c.qa_pending).length,
    resolved: cases.filter(c => c.status === "resolved").length
  }), [cases]);

  return (
    <div className="phone phone-bg pb-12">
      <StatusBar/>

      <header className="px-5 pt-2 pb-3 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-ink-800 text-white grid place-items-center font-medium text-[15px]">
          {CM_USER.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] text-ink-500">{CM_USER.role}</div>
          <div className="text-[15px] font-medium text-ink-900 truncate">{CM_USER.name}</div>
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

      <div className="px-5 mb-3">
        <div className="text-[11.5px] tracking-[0.18em] text-ink-500 uppercase">Case Tracking</div>
        <h1 className="text-[22px] font-medium text-ink-900 leading-tight">ติดตามเคสและคุณภาพการดูแล</h1>
        <div className="text-[12px] text-ink-500 mt-0.5">รพ.สต.บ้านทรายไหลแล้ง · ปรับล่าสุด {thaiDateString()}</div>
      </div>

      {/* Hero — urgent summary */}
      <div className="mx-5 mb-5 rounded-3xl bg-ink-800 text-white p-5 shadow-pop relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5"></div>
        <div className="relative grid grid-cols-3 gap-4">
          <div>
            <div className="text-[40px] font-medium tnum leading-none text-accent-coral">{counts.urgent}</div>
            <div className="text-[11.5px] mt-1 opacity-80">เร่งด่วน<br/>8Q &gt; 0</div>
          </div>
          <div>
            <div className="text-[40px] font-medium tnum leading-none">{counts.watch}</div>
            <div className="text-[11.5px] mt-1 opacity-80">ติดตาม<br/>9Q ≥ 7 หรือ ADL ≤ 4</div>
          </div>
          <div>
            <div className="text-[40px] font-medium tnum leading-none">{counts.qa}</div>
            <div className="text-[11.5px] mt-1 opacity-80">QA<br/>รอตรวจสอบ</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="flex items-stretch rounded-xl bg-white border border-ink-200">
          <span className="self-center pl-3 text-ink-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ค้นหา ชื่อเคส / PID / หมู่บ้าน"
            className="flex-1 h-11 px-3 bg-transparent outline-none text-[13.5px]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "urgent",   label: "เร่งด่วน · " + counts.urgent },
          { id: "watch",    label: "ติดตาม · "   + counts.watch },
          { id: "qa",       label: "ตรวจ QA · "  + counts.qa },
          { id: "resolved", label: "แก้ไขแล้ว · "+ counts.resolved },
          { id: "all",      label: "ทั้งหมด · "  + counts.all }
        ].map(t => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={"shrink-0 h-9 px-3.5 rounded-full text-[12.5px] " +
                (on ? "bg-ink-800 text-white" : "bg-white border border-ink-200 text-ink-700")}
            >{t.label}</button>
          );
        })}
      </div>

      {/* Cases */}
      <div className="px-5 space-y-3">
        {filtered.map(c => <CaseCard key={c.pid} c={c} onOpen={() => onOpenCase(c)}/>)}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
            ไม่พบเคสในหมวดนี้
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CaseCard({ c, onOpen }) {
  const meta = STATUS_META[c.status];
  const commentCount = (SEED_COMMENTS[c.pid] || []).length;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-3xl bg-white border border-ink-100 shadow-card p-4 active:scale-[.995] transition"
    >
      <div className="flex items-start gap-3">
        <span className={"w-10 h-10 rounded-2xl grid place-items-center text-[15px] font-medium shrink-0 " + TONE[meta.tone].bg + " " + TONE[meta.tone].fg}>
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-[14.5px] font-medium text-ink-900 truncate">{c.name}</div>
            <ScoreChip tone={meta.tone}>{meta.label}</ScoreChip>
          </div>
          <div className="text-[11px] text-ink-500 tnum">PID {c.pid} · {c.village}</div>
          <div className="text-[12px] text-ink-600 mt-1.5 truncate">CG: {c.cg}</div>
        </div>
      </div>
      <div className="dotted-rule my-3"></div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ScoreChip tone={c.adl <= 4 ? "danger" : c.adl <= 11 ? "warning" : "ok"}>ADL {c.adl}</ScoreChip>
          <ScoreChip tone={c.q9 >= 7 ? "warning" : "neutral"}>9Q {c.q9}</ScoreChip>
          {c.q8 > 0 ? <ScoreChip tone="danger">8Q {c.q8}</ScoreChip> : null}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1 tnum">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-1.5 4.8L21 21l-4.7-1.5a8.4 8.4 0 1 1 4.7-8z"/></svg>
            {commentCount}
          </span>
          <span className="tnum">{c.last_visit}</span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────── CASE DETAIL
function CaseDetailScreen({ kase, onBack }) {
  const [tab, setTab] = usC("thread");
  const [comments, setComments] = usC(() => SEED_COMMENTS[kase.pid] || []);
  const [draft, setDraft] = usC("");
  const [qa, setQa] = usC(() => Object.fromEntries(QA_RUBRIC.map(r => [r.id, 4])));
  const [status, setStatus] = usC(kase.status);

  const post = () => {
    if (!draft.trim()) return;
    setComments([...comments, {
      author: CM_USER.name, role: "Case Manager",
      time: `${thaiDateString()} ${thaiTimeString()}`,
      text: draft.trim()
    }]);
    setDraft("");
  };

  const qaAvg = umC(() => {
    const vals = Object.values(qa);
    return (vals.reduce((s,v)=>s+v,0) / vals.length).toFixed(1);
  }, [qa]);

  const escalate = () => {
    Swal.fire({
      icon: "warning",
      title: "ส่งต่อ รพ.อำเภอ?",
      html: `<b>${kase.name}</b><br/><span style="color:#506aa3">PID ${kase.pid}</span><br/><br/>
             ระบบจะสร้าง refer note และแจ้งทีมจิตเวช รพ.มุกดาหาร`,
      showCancelButton: true,
      confirmButtonText: "ส่งต่อ",
      cancelButtonText: "ยกเลิก"
    }).then(r => {
      if (r.isConfirmed) {
        setStatus("watch");
        Swal.fire({ icon: "success", title: "ส่ง refer note สำเร็จ", timer: 1200, showConfirmButton: false });
      }
    });
  };

  const markResolved = () => {
    Swal.fire({
      icon: "question",
      title: "ปิดเคส?",
      text: "เคสนี้จะถูกย้ายไปหมวดแก้ไขแล้ว",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then(r => {
      if (r.isConfirmed) {
        setStatus("resolved");
        Swal.fire({ icon: "success", title: "ปิดเคสแล้ว", timer: 1100, showConfirmButton: false });
      }
    });
  };

  const meta = STATUS_META[status];

  return (
    <div className="phone phone-bg pb-32">
      <StatusBar/>
      <AppHeader
        title={kase.name}
        subtitle={`PID ${kase.pid} · ${kase.village}`}
        onBack={onBack}
        right={<ScoreChip tone={meta.tone}>{meta.label}</ScoreChip>}
      />

      {/* Score timeline */}
      <SectionCard title="ไทม์ไลน์การเยี่ยม" subtitle={`${kase.visits.length} ครั้ง · แสดงคะแนน ADL / 9Q / 8Q`}>
        <ScoreTimeline visits={kase.visits}/>
      </SectionCard>

      <div className="h-4"></div>

      {/* Tabs */}
      <div className="px-5">
        <div className="rounded-2xl bg-ink-100 p-1 grid grid-cols-3 gap-1 text-[12.5px]">
          {[
            { id: "thread",  label: "ความเห็น" },
            { id: "qa",      label: "คุณภาพ QA" },
            { id: "history", label: "ประวัติเยี่ยม" }
          ].map(t => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={"h-9 rounded-xl transition " + (on ? "bg-white text-ink-900 shadow-card font-medium" : "text-ink-600")}
              >{t.label}</button>
            );
          })}
        </div>
      </div>

      <div className="h-3"></div>

      {tab === "thread" ? (
        <div className="px-5 space-y-3">
          {comments.map((c,i) => <CommentBubble key={i} c={c}/>)}
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500 text-[13px]">
              ยังไม่มีความเห็นในเคสนี้ — เริ่มสนทนาเพื่อประสานการดูแล
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "qa" ? (
        <div className="px-5">
          <SectionCard
            title="ตรวจสอบคุณภาพการดูแล"
            subtitle={`Care Giver: ${kase.cg}`}
            right={<ScoreChip tone={qaAvg >= 4 ? "ok" : qaAvg >= 3 ? "warning" : "danger"}>{qaAvg} / 5</ScoreChip>}
          >
            {QA_RUBRIC.map(r => (
              <div key={r.id} className="space-y-2 pb-2">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-ink-800">{r.label}</div>
                    <div className="text-[11px] text-ink-500">{r.hint}</div>
                  </div>
                  <div className="text-[13px] font-medium text-ink-900 tnum">{qa[r.id]}/5</div>
                </div>
                <StarRow value={qa[r.id]} onChange={v => setQa(prev => ({ ...prev, [r.id]: v }))}/>
              </div>
            ))}
            <div className="dotted-rule"></div>
            <Field label="ข้อเสนอแนะถึง Care Giver">
              <textarea
                placeholder="เช่น ภาพถ่ายในการเยี่ยมครั้งล่าสุดยังไม่ชัด ขอให้ปรับ..."
                className="w-full min-h-[80px] p-3 rounded-xl bg-white border border-ink-200 focus:border-ink-700 focus:shadow-ring outline-none text-[13.5px]"
              />
            </Field>
            <PrimaryButton onClick={() => Swal.fire({ icon: "success", title: "ส่งผลตรวจสอบเรียบร้อย", timer: 1100, showConfirmButton: false })} className="w-full">
              บันทึกผลตรวจสอบคุณภาพ
            </PrimaryButton>
          </SectionCard>
        </div>
      ) : null}

      {tab === "history" ? (
        <div className="px-5 space-y-2">
          {[...kase.visits].reverse().map(v => (
            <div key={v.id} className="rounded-2xl bg-white border border-ink-100 shadow-card p-3 flex items-start gap-3">
              <div className="text-center w-12 shrink-0">
                <div className="text-[11px] text-ink-400 tnum">{v.date.slice(0,5)}</div>
                <div className="text-[11px] text-ink-400 tnum">{v.date.slice(6)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-ink-700">โดย {v.cg}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <ScoreChip tone={v.adl <= 4 ? "danger" : v.adl <= 11 ? "warning" : "ok"}>ADL {v.adl}</ScoreChip>
                  <ScoreChip tone={v.q9 >= 7 ? "warning" : "neutral"}>9Q {v.q9}</ScoreChip>
                  {v.q8 > 0 ? <ScoreChip tone="danger">8Q {v.q8}</ScoreChip> : null}
                </div>
              </div>
              <span className="text-[10.5px] text-ink-400 tnum self-center">{v.id}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Sticky action bar — composer for thread, escalate/resolve always present */}
      {tab === "thread" ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="phone mx-auto pointer-events-auto px-3 pt-2 pb-3 bg-paper-warm/95 backdrop-blur border-t border-ink-100">
            <div className="flex items-end gap-2">
              <div className="flex-1 flex flex-col rounded-2xl border border-ink-200 bg-white">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={1}
                  placeholder="พิมพ์ความเห็น / ข้อเสนอแนะ..."
                  className="w-full p-3 bg-transparent outline-none text-[13.5px] resize-none"
                  style={{ minHeight: 44, maxHeight: 120 }}
                />
                <div className="flex items-center gap-2 px-2 pb-2">
                  <button onClick={escalate} className="text-[11px] px-2 py-1 rounded-full bg-accent-coral/10 text-accent-coral">↗ ส่งต่อ รพ.</button>
                  <button onClick={markResolved} className="text-[11px] px-2 py-1 rounded-full bg-accent-sage/10 text-accent-sage">✓ ปิดเคส</button>
                </div>
              </div>
              <button
                onClick={post}
                disabled={!draft.trim()}
                className="w-12 h-12 rounded-2xl bg-ink-800 text-white grid place-items-center disabled:opacity-40 active:scale-95"
                aria-label="ส่งความเห็น"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="phone mx-auto pointer-events-auto px-4 pt-3 pb-4 bg-paper-warm/95 backdrop-blur border-t border-ink-100 flex gap-2">
            <GhostButton onClick={escalate} className="flex-1 text-accent-coral border-accent-coral/30">↗ ส่งต่อ รพ.อำเภอ</GhostButton>
            <PrimaryButton onClick={markResolved} className="flex-1">✓ ปิดเคส</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ScoreTimeline({ visits }) {
  return (
    <div className="space-y-3">
      {visits.map((v, i) => {
        const isLast = i === visits.length - 1;
        return (
          <div key={v.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span className={"w-3 h-3 rounded-full ring-4 " + (isLast ? "bg-ink-800 ring-ink-100" : "bg-ink-300 ring-paper")}></span>
              {i < visits.length - 1 ? <span className="w-px flex-1 bg-ink-200 mt-1 min-h-[36px]"></span> : null}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-baseline gap-2">
                <div className="text-[12.5px] font-medium text-ink-800 tnum">{v.date}</div>
                <div className="text-[11px] text-ink-500 truncate">โดย {v.cg}</div>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <ScoreChip tone={v.adl <= 4 ? "danger" : v.adl <= 11 ? "warning" : "ok"}>ADL {v.adl}</ScoreChip>
                <ScoreChip tone={v.q9 >= 7 ? "warning" : "neutral"}>9Q {v.q9}</ScoreChip>
                {v.q8 > 0 ? <ScoreChip tone="danger">8Q {v.q8}</ScoreChip> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommentBubble({ c }) {
  const isCM = c.role === "Case Manager";
  return (
    <div className={"flex items-start gap-2.5 " + (isCM ? "" : "flex-row-reverse")}>
      <div className={"w-9 h-9 rounded-2xl grid place-items-center text-[11px] font-medium shrink-0 " +
        (isCM ? "bg-ink-800 text-white" : "bg-accent-sage/15 text-accent-sage")}>
        {c.author.split(/\s+/).filter(Boolean).map(p => p.slice(0,1)).slice(0,2).join("")}
      </div>
      <div className={"flex-1 " + (isCM ? "" : "text-right")}>
        <div className="flex items-baseline gap-2" style={{ justifyContent: isCM ? "flex-start" : "flex-end" }}>
          <div className="text-[12px] font-medium text-ink-800">{c.author}</div>
          <div className="text-[10.5px] text-ink-400 tnum">{c.time}</div>
        </div>
        <div className={"mt-1 inline-block max-w-full text-left p-3 rounded-2xl text-[13px] text-ink-800 leading-snug " +
          (isCM ? "bg-white border border-ink-100 shadow-card rounded-tl-sm" : "bg-accent-sage/10 rounded-tr-sm")}>
          {c.text}
        </div>
      </div>
    </div>
  );
}

function StarRow({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => {
        const on = n <= value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-9 h-9 grid place-items-center active:scale-90 transition"
            aria-label={`คะแนน ${n}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? "#b58a3c" : "none"} stroke={on ? "#b58a3c" : "#b3c0d6"} strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 2l3 7 7 .5-5.5 4.5L18 22l-6-4-6 4 1.5-8L2 9.5 9 9z"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { CaseManagerScreen, CaseDetailScreen });
