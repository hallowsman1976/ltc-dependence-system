// ─────────────────────────────────────────────────────────────────────────────
//  Shared UI atoms — buttons, fields, score cards, toggles, etc.
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } = React;

// Tone → palette
const TONE = {
  ok:       { bg: "bg-accent-sage/10",   fg: "text-accent-sage",   ring: "ring-accent-sage/30",  dot: "bg-accent-sage" },
  warning:  { bg: "bg-accent-gold/10",   fg: "text-accent-gold",   ring: "ring-accent-gold/30",  dot: "bg-accent-gold" },
  danger:   { bg: "bg-accent-coral/10",  fg: "text-accent-coral",  ring: "ring-accent-coral/30", dot: "bg-accent-coral" },
  neutral:  { bg: "bg-ink-100",          fg: "text-ink-700",       ring: "ring-ink-300",         dot: "bg-ink-400" }
};

// ──────────────────────────────────────────────────────────────── Status bar
function StatusBar() {
  const [time, setTime] = useState(thaiTimeString());
  useEffect(() => {
    const t = setInterval(() => setTime(thaiTimeString()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="sbar flex items-center justify-between px-5 pt-3 pb-1 text-[12px] text-ink-700 tnum">
      <span className="font-medium">{time}</span>
      <span className="flex items-center gap-1.5">
        <span>●●●●●</span>
        <span className="opacity-70">LTE</span>
        <span className="inline-flex items-center gap-0.5">
          <span className="w-4 h-2 border border-ink-700 rounded-[2px] relative">
            <span className="absolute inset-0.5 bg-ink-700 rounded-[1px]" style={{ width: "75%" }}></span>
          </span>
          <span>74%</span>
        </span>
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── App header
function AppHeader({ title, subtitle, onBack, right }) {
  return (
    <header className="px-5 pt-2 pb-3 flex items-center gap-3 sticky top-0 z-30 bg-paper-warm/95 backdrop-blur">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-1 grid place-items-center rounded-full bg-ink-100 text-ink-800 active:scale-95 transition"
          aria-label="ย้อนกลับ"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
               strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
      ) : null}
      <div className="flex-1 min-w-0">
        <h1 className="font-medium text-[17px] leading-tight text-ink-900 truncate">{title}</h1>
        {subtitle ? <div className="text-[12px] text-ink-500 truncate">{subtitle}</div> : null}
      </div>
      {right}
    </header>
  );
}

// ──────────────────────────────────────────────────────────────── Buttons
function PrimaryButton({ children, onClick, loading, disabled, className = "", icon }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={
        "relative h-12 px-5 rounded-2xl bg-ink-800 text-white font-medium text-[15px] " +
        "active:scale-[0.99] transition disabled:opacity-60 disabled:active:scale-100 " +
        "flex items-center justify-center gap-2 overflow-hidden " + className
      }
    >
      {loading ? <span className="absolute inset-0 saving"></span> : null}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ) : icon}
        {children}
      </span>
    </button>
  );
}

function GhostButton({ children, onClick, className = "", icon }) {
  return (
    <button
      onClick={onClick}
      className={"h-12 px-5 rounded-2xl border border-ink-200 bg-white text-ink-800 font-medium text-[15px] active:scale-[0.99] transition flex items-center justify-center gap-2 " + className}
    >
      {icon}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────── Fields
function Field({ label, hint, error, required, children, right }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] text-ink-700 font-medium">
          {label}{required ? <span className="text-accent-coral ml-1">*</span> : null}
        </span>
        {right || (hint ? <span className="text-[11px] text-ink-400">{hint}</span> : null)}
      </div>
      {children}
      {error ? <div className="text-[11px] text-accent-coral mt-1">{error}</div> : null}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, inputMode, type = "text", suffix, prefix, maxLength, readOnly, className = "" }) {
  return (
    <div className={"flex items-stretch rounded-xl bg-white border border-ink-200 focus-within:border-ink-700 focus-within:shadow-ring transition " + className}>
      {prefix ? <span className="self-center pl-3 text-ink-500 text-[13px]">{prefix}</span> : null}
      <input
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
        maxLength={maxLength}
        readOnly={readOnly}
        className="flex-1 h-12 px-4 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400 tnum"
      />
      {suffix ? <span className="self-center pr-3 text-ink-500 text-[13px]">{suffix}</span> : null}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={onChange}
        className="w-full h-12 pl-4 pr-10 rounded-xl bg-white border border-ink-200 text-[15px] text-ink-900 appearance-none outline-none focus:border-ink-700 focus:shadow-ring"
      >
        <option value="" disabled>{placeholder || "เลือก…"}</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── Toggle
function Toggle({ value, onChange, label, sub }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-ink-200 active:scale-[.995] transition"
    >
      <span className="text-left">
        <div className="text-[14px] font-medium text-ink-900">{label}</div>
        {sub ? <div className="text-[12px] text-ink-500 mt-0.5">{sub}</div> : null}
      </span>
      <span
        className={
          "relative w-12 h-7 rounded-full transition shrink-0 " +
          (value ? "bg-ink-800" : "bg-ink-200")
        }
      >
        <span
          className={"absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition " + (value ? "left-[22px]" : "left-0.5")}
        />
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────── Radio Card (style 1 — outlined card with score)
function RadioCardGroup({ items, value, onChange, columns }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns ?? items.length}, minmax(0, 1fr))` }}
    >
      {items.map(it => {
        const on = value === it.v;
        return (
          <button
            key={it.v}
            type="button"
            onClick={() => onChange(it.v)}
            className={
              "text-left rounded-2xl border border-ink-200 bg-white p-3 transition " +
              "min-h-[72px] flex flex-col gap-1 " +
              (on ? "radio-card-on" : "")
            }
          >
            <span className={"inline-flex items-center justify-center w-7 h-7 rounded-lg text-[13px] font-medium tnum " +
              (on ? "bg-ink-800 text-white" : "bg-ink-100 text-ink-700")}>{it.v}</span>
            <span className="text-[11.5px] leading-snug text-ink-700">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Yes / No pill group (for 2Q / 8Q)
function YesNoGroup({ value, onChange, yesLabel = "มี", noLabel = "ไม่มี" }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { v: false, label: noLabel },
        { v: true,  label: yesLabel }
      ].map(o => {
        const on = value === o.v;
        return (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={
              "h-12 rounded-2xl border text-[14px] font-medium transition " +
              (on
                ? (o.v ? "bg-accent-coral text-white border-accent-coral" : "bg-ink-800 text-white border-ink-800")
                : "bg-white border-ink-200 text-ink-700")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── Score chip
function ScoreChip({ tone = "neutral", children, dot = true }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium " + t.bg + " " + t.fg}>
      {dot ? <span className={"w-1.5 h-1.5 rounded-full " + t.dot}></span> : null}
      {children}
    </span>
  );
}

function ResultBanner({ tone = "neutral", title, value, sub }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <div className={"rounded-2xl p-4 ring-1 " + t.bg + " " + t.ring}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-500">{title}</div>
          <div className={"text-[18px] font-medium leading-tight " + t.fg}>{value}</div>
          {sub ? <div className="text-[12px] text-ink-600 mt-0.5">{sub}</div> : null}
        </div>
        <span className={"w-10 h-10 rounded-2xl grid place-items-center " + t.dot + " text-white"}>
          {tone === "danger" ? "!" : tone === "warning" ? "›" : "✓"}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── Stepper
function Stepper({ steps, current, onJump, completed }) {
  const total = steps.length;
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="px-5 pb-3">
      <div className="flex items-center justify-between text-[11px] text-ink-500 tnum mb-1.5">
        <span>ขั้นตอนที่ {current + 1} จาก {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full bg-ink-800 transition-all"
          style={{ width: pct + "%" }}
        ></div>
      </div>
      <div className="mt-3 -mx-5 px-5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {steps.map((s, i) => {
          const isDone = completed[i];
          const isCur = i === current;
          return (
            <button
              key={s.id}
              onClick={() => onJump(i)}
              className={
                "shrink-0 px-3 h-8 rounded-full text-[12px] flex items-center gap-1.5 transition " +
                (isCur
                  ? "bg-ink-800 text-white"
                  : isDone
                    ? "bg-accent-sage/15 text-accent-sage"
                    : "bg-white border border-ink-200 text-ink-500")
              }
            >
              <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.short}</span>
              {isDone && !isCur ? <span>✓</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── Section card
function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="bg-white rounded-3xl shadow-card border border-ink-100 overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-medium text-ink-900 leading-tight">{title}</h2>
          {subtitle ? <div className="text-[12px] text-ink-500 mt-0.5">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="px-5 pb-5 space-y-4">{children}</div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────── Checkbox row
function CheckRow({ checked, onToggle, label, accent }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        "w-full text-left flex items-start gap-3 p-3 rounded-xl border transition " +
        (checked ? "border-ink-700 bg-ink-50" : "border-ink-200 bg-white")
      }
    >
      <span
        className={
          "shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 grid place-items-center transition " +
          (checked ? "bg-ink-800 border-ink-800 text-white" : "border-ink-300 bg-white")
        }
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4 10-10"/>
          </svg>
        ) : null}
      </span>
      <span className="text-[13.5px] text-ink-800 leading-snug">{label}</span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────── Logo mark
function LogoMark({ size = 56 }) {
  return (
    <img
      src="assets/logo.png"
      alt="ตราโรงพยาบาลส่งเสริมสุขภาพตำบลบ้านทรายไหลแล้ง"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-full object-cover"
    />
  );
}

Object.assign(window, {
  StatusBar, AppHeader,
  PrimaryButton, GhostButton,
  Field, TextInput, Select,
  Toggle, RadioCardGroup, YesNoGroup,
  ScoreChip, ResultBanner,
  Stepper, SectionCard, CheckRow,
  LogoMark, TONE
});
