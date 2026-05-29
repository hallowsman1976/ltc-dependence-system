// ─────────────────────────────────────────────────────────────────────────────
//  Visit-form sections (8 of 9 — Sections 1‒9; intro/header is its own step in form.jsx)
// ─────────────────────────────────────────────────────────────────────────────

const { useState: us2, useEffect: ue2, useRef: ur2, useMemo } = React;

// ───────────────────────────────────────────────────────────── HEADER (Step 0)
function SectionHeader({ patient, value, set }) {
  const visitCount = (patient.visit_count || 0) + 1;
  const phoneErr =
    value.contact && !/^\d{9,10}$/.test(value.contact)
      ? "เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก" : null;

  return (
    <SectionCard
      title="ข้อมูลส่วนหัว"
      subtitle="ข้อมูลผู้สูงอายุ · ผู้เยี่ยม · ผู้ดูแลในครัวเรือน"
      right={<ScoreChip tone="ok">ครั้งที่ {visitCount}</ScoreChip>}
    >
      {/* Patient identity locked card */}
      <div className="rounded-2xl bg-paper p-4 border border-ink-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-ink-200 grid place-items-center font-medium text-ink-800">
            {patient.name.replace(/^น(าง|าย|.ส.)\s*/, "").slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium text-ink-900 truncate">{patient.name}</div>
            <div className="text-[11.5px] text-ink-500 tnum">PID {patient.pid} · {patient.age} ปี · {patient.sex}</div>
          </div>
          <ScoreChip tone={patient.adl_group === "ติดเตียง" ? "danger" : patient.adl_group === "ติดบ้าน" ? "warning" : "ok"}>
            {patient.adl_group}
          </ScoreChip>
        </div>
        <div className="dotted-rule my-3"></div>
        <div className="text-[12px] text-ink-600">{patient.address}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="วันที่เยี่ยม">
          <TextInput value={value.visit_date} readOnly suffix="พ.ศ."/>
        </Field>
        <Field label="ครั้งที่เยี่ยม" hint="คำนวณอัตโนมัติ">
          <TextInput value={String(visitCount)} readOnly/>
        </Field>
        <Field label="เวลาเยี่ยม">
          <TextInput value={value.time_start} onChange={e => set({ time_start: e.target.value })} type="time"/>
        </Field>
        <Field label="เวลาสิ้นสุด">
          <TextInput value={value.time_end} onChange={e => set({ time_end: e.target.value })} type="time"/>
        </Field>
      </div>

      <Field label="ผู้เยี่ยม" hint="จากบัญชีที่เข้าสู่ระบบ">
        <TextInput value={CURRENT_USER.name} readOnly
          prefix={<span className="text-accent-sage">●</span>}/>
      </Field>

      <Field label="ชื่อผู้ดูแลในครัวเรือน" required>
        <TextInput
          value={value.cg_at_home}
          onChange={e => set({ cg_at_home: e.target.value })}
          placeholder="เช่น นายสมพร  สุขสมบัติ"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ความสัมพันธ์" required>
          <Select
            value={value.relation}
            onChange={e => set({ relation: e.target.value })}
            options={RELATIONS}
            placeholder="เลือก…"
          />
        </Field>
        <Field label="เบอร์ติดต่อ" required error={phoneErr}>
          <TextInput
            value={value.contact}
            onChange={e => {
              const v = e.target.value.replace(/[^\d]/g, "").slice(0,10);
              set({ contact: v });
            }}
            inputMode="numeric"
            placeholder="0812345678"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 1 · BMI & Initial
function SectionInitialHealth({ value, set }) {
  const bmi = useMemo(() => {
    const w = parseFloat(value.weight), h = parseFloat(value.height) / 100;
    if (!w || !h) return null;
    return Math.round((w / (h*h)) * 10) / 10;
  }, [value.weight, value.height]);
  const interp = interpretBMI(bmi);

  return (
    <SectionCard title="1 · การประเมินสุขภาพแรกรับ" subtitle="น้ำหนัก · ส่วนสูง · ดัชนีมวลกาย">
      <div className="grid grid-cols-2 gap-3">
        <Field label="น้ำหนัก" required>
          <TextInput value={value.weight} onChange={e => set({ weight: e.target.value.replace(/[^\d.]/g,"") })}
            inputMode="decimal" suffix="กก."/>
        </Field>
        <Field label="ส่วนสูง" required>
          <TextInput value={value.height} onChange={e => set({ height: e.target.value.replace(/[^\d.]/g,"") })}
            inputMode="decimal" suffix="ซม."/>
        </Field>
      </div>
      <ResultBanner
        tone={interp.tone === "neutral" ? "neutral" : interp.tone}
        title="ดัชนีมวลกาย (BMI)"
        value={bmi ? bmi.toFixed(1) + " kg/m²" : "—"}
        sub={interp.label}
      />
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 2 · Vital signs
function SectionVitals({ value, set }) {
  const bpErr =
    value.bp && !/^\d{2,3}\/\d{2,3}$/.test(value.bp)
      ? "รูปแบบเช่น 110/86" : null;
  return (
    <SectionCard title="2 · การประเมินสัญญาณชีพ" subtitle="ตรวจวัด ณ จุดเยี่ยม">
      <div className="grid grid-cols-2 gap-3">
        <Field label="อุณหภูมิ"><TextInput value={value.temp} onChange={e => set({ temp: e.target.value })} inputMode="decimal" suffix="°C"/></Field>
        <Field label="ชีพจร"><TextInput value={value.pulse} onChange={e => set({ pulse: e.target.value.replace(/[^\d]/g,"") })} inputMode="numeric" suffix="ครั้ง/นาที"/></Field>
        <Field label="การหายใจ"><TextInput value={value.resp} onChange={e => set({ resp: e.target.value.replace(/[^\d]/g,"") })} inputMode="numeric" suffix="ครั้ง/นาที"/></Field>
        <Field label="ความดันโลหิต" error={bpErr}>
          <TextInput value={value.bp} onChange={e => set({ bp: e.target.value.replace(/[^\d/]/g,"") })}
            placeholder="110/86" suffix="mmHg"/>
        </Field>
      </div>
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 3 · ADL Barthel
function SectionADL({ value, set }) {
  const enabled = value.adl_enabled;
  const total = useMemo(
    () => ADL_ITEMS.reduce((s, it) => s + (value.adl[it.n] ?? 0), 0),
    [value.adl]
  );
  const interp = interpretADL(total);

  return (
    <SectionCard title="3 · ประเมิน ADL (Barthel Index)" subtitle="แบบประเมินกิจวัตรประจำวัน 10 ข้อ">
      <Toggle
        value={enabled}
        onChange={v => set({ adl_enabled: v })}
        label="เปิดการประเมิน ADL ครั้งนี้"
        sub="ปิดได้ในกรณีไม่สามารถประเมินได้ในการเยี่ยมครั้งนี้"
      />
      {enabled ? (
        <>
          {ADL_ITEMS.map(it => (
            <div key={it.n} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-[13.5px] font-medium text-ink-800">
                  <span className="text-ink-400 tnum mr-1.5">{String(it.n).padStart(2,"0")}</span>
                  {it.title}
                </div>
                <ScoreChip tone={value.adl[it.n] != null ? "ok" : "neutral"}>
                  {value.adl[it.n] ?? "—"} คะแนน
                </ScoreChip>
              </div>
              <RadioCardGroup
                items={it.options}
                value={value.adl[it.n]}
                onChange={v => set({ adl: { ...value.adl, [it.n]: v } })}
                columns={it.options.length}
              />
            </div>
          ))}
          <div className="dotted-rule"></div>
          <ResultBanner
            tone={interp.tone}
            title="คะแนน ADL รวม"
            value={`${total} / 20 คะแนน`}
            sub={interp.label + " · " + interp.sub}
          />
        </>
      ) : (
        <div className="text-[12.5px] text-ink-500 bg-paper rounded-2xl p-4 border border-dashed border-ink-200">
          การประเมิน ADL ถูกข้ามในการเยี่ยมครั้งนี้
        </div>
      )}
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 4 · Mental Health
function SectionMental({ value, set, onRisk }) {
  const enabled = value.mh_enabled;
  const twoQAny = (value.twoQ || []).some(Boolean);
  const nineTotal = useMemo(
    () => (value.nineQ || []).reduce((s, v) => s + (Number(v) || 0), 0),
    [value.nineQ]
  );
  const nine = interpret9Q(nineTotal);
  const showNine = enabled && twoQAny;
  const showEight = showNine && nineTotal >= 7;
  const eightTotal = useMemo(
    () => EIGHT_Q.reduce((s, q, i) => s + ((value.eightQ?.[i] === true) ? q.yes : 0), 0),
    [value.eightQ]
  );
  const eight = interpret8Q(eightTotal);

  // surface risk upward
  ue2(() => {
    const q9_9 = (value.nineQ?.[8] || 0) > 0;
    const risk = (showEight && eightTotal > 0) || q9_9;
    onRisk(risk, { nineTotal, eightTotal, q9_9 });
  }, [eightTotal, nineTotal, value.nineQ, showEight]);

  return (
    <SectionCard title="4 · ประเมินสุขภาพจิต" subtitle="2Q → 9Q → 8Q (ตามเกณฑ์กรมสุขภาพจิต)">
      <Toggle
        value={enabled}
        onChange={v => set({ mh_enabled: v })}
        label="เปิดการประเมินสุขภาพจิต"
        sub="ครั้งนี้ดำเนินการประเมินภาวะซึมเศร้าและการฆ่าตัวตาย"
      />

      {enabled ? (
        <>
          {/* 2Q */}
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink-700">2Q · คัดกรองภาวะซึมเศร้าเบื้องต้น</div>
            {TWO_Q.map((t, i) => (
              <div key={i} className="rounded-2xl border border-ink-100 bg-white p-3 space-y-2">
                <div className="text-[13px] text-ink-800 leading-snug">
                  <span className="text-ink-400 tnum mr-1.5">{i+1}.</span>{t}
                </div>
                <YesNoGroup
                  value={value.twoQ?.[i]}
                  onChange={v => {
                    const next = [...(value.twoQ || [null,null])];
                    next[i] = v;
                    set({ twoQ: next });
                  }}
                />
              </div>
            ))}
            {!twoQAny && (value.twoQ || []).every(v => v === false) ? (
              <div className="text-[12px] text-accent-sage bg-accent-sage/10 px-3 py-2 rounded-xl">
                ✓ ตอบ "ไม่มี" ทั้ง 2 ข้อ — ไม่ต้องประเมิน 9Q
              </div>
            ) : null}
          </div>

          {/* 9Q */}
          {showNine ? (
            <>
              <div className="dotted-rule my-1"></div>
              <div className="text-[13px] font-medium text-ink-700">9Q · ระดับภาวะซึมเศร้า</div>
              {NINE_Q.map((t, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-[13px] text-ink-800 leading-snug flex items-baseline">
                    <span className="text-ink-400 tnum mr-1.5 shrink-0">{i+1}.</span>
                    <span className="flex-1">{t}</span>
                    <ScoreChip tone={value.nineQ?.[i] != null ? "ok" : "neutral"}>{value.nineQ?.[i] ?? "—"}</ScoreChip>
                  </div>
                  <RadioCardGroup
                    items={NINE_Q_OPTS}
                    value={value.nineQ?.[i]}
                    onChange={v => {
                      const next = [...(value.nineQ || Array(9).fill(null))];
                      next[i] = v;
                      set({ nineQ: next });
                    }}
                    columns={4}
                  />
                </div>
              ))}
              <ResultBanner tone={nine.tone} title="คะแนน 9Q รวม" value={`${nineTotal} คะแนน`} sub={nine.label}/>
            </>
          ) : null}

          {/* 8Q */}
          {showEight ? (
            <>
              <div className="dotted-rule my-1"></div>
              <div className="text-[13px] font-medium text-ink-700">8Q · แนวโน้มการฆ่าตัวตาย</div>
              <div className="text-[11.5px] text-ink-500 -mt-2">
                แสดงเนื่องจาก 9Q ≥ 7
              </div>
              {EIGHT_Q.map((q, i) => {
                const v = value.eightQ?.[i];
                return (
                  <div key={i} className="rounded-2xl border border-ink-100 bg-white p-3 space-y-2">
                    <div className="text-[13px] text-ink-800 leading-snug flex items-baseline">
                      <span className="text-ink-400 tnum mr-1.5 shrink-0">{q.n}.</span>
                      <span className="flex-1">{q.text}</span>
                      <span className="text-[11px] text-ink-500 tnum shrink-0 ml-2">มี = {q.yes}</span>
                    </div>
                    <YesNoGroup
                      value={v}
                      onChange={val => {
                        const next = [...(value.eightQ || Array(8).fill(null))];
                        next[i] = val;
                        set({ eightQ: next });
                      }}
                    />
                    {q.followUp && v === true ? (
                      <div className="pt-2">
                        <div className="text-[12px] text-ink-600 mb-1.5">{q.followUp}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {["ควบคุมได้","ควบคุมไม่ได้"].map(opt => {
                            const on = value.eight_q3_control === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => set({ eight_q3_control: opt })}
                                className={
                                  "h-11 rounded-xl border text-[13px] " +
                                  (on
                                    ? (opt === "ควบคุมไม่ได้" ? "bg-accent-coral text-white border-accent-coral" : "bg-ink-800 text-white border-ink-800")
                                    : "bg-white border-ink-200 text-ink-700")
                                }
                              >{opt}</button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <ResultBanner tone={eight.tone} title="คะแนน 8Q รวม" value={`${eightTotal} คะแนน`} sub={eight.label}/>
            </>
          ) : null}

          {/* Risk alert */}
          {(() => {
            const q9_9 = (value.nineQ?.[8] || 0) > 0;
            const risk = (showEight && eightTotal > 0) || q9_9;
            if (!risk) return null;
            return (
              <div className="rounded-2xl bg-accent-coral text-white p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center text-[20px] shrink-0">!</div>
                <div className="text-[13px] leading-snug">
                  <div className="font-medium text-[14px]">พบความเสี่ยงด้านสุขภาพจิต</div>
                  <div className="opacity-90 mt-0.5">
                    {q9_9 ? "9Q ข้อ 9 (ความคิดทำร้ายตนเอง) > 0 · " : ""}
                    {eightTotal > 0 ? `8Q = ${eightTotal} · ` : ""}
                    ระบบจะบันทึก <span className="font-medium">risk_level</span> และแจ้งทีม Case Manager
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="text-[12.5px] text-ink-500 bg-paper rounded-2xl p-4 border border-dashed border-ink-200">
          การประเมินสุขภาพจิตถูกข้ามในการเยี่ยมครั้งนี้
        </div>
      )}
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── Generic checklist section
function ChecklistSection({ title, subtitle, items, value, set, otherKey = "other" }) {
  const set_ = value || { checked: [], other: "" };
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="space-y-2">
        {items.map(label => {
          const on = set_.checked.includes(label);
          return (
            <CheckRow
              key={label}
              label={label}
              checked={on}
              onToggle={() => {
                const next = on ? set_.checked.filter(x => x !== label) : [...set_.checked, label];
                set({ checked: next, other: set_.other });
              }}
            />
          );
        })}
        <CheckRow
          label={set_.other ? `อื่น ๆ: ${set_.other}` : "อื่น ๆ (ระบุ)"}
          checked={!!set_.other}
          onToggle={() => set({ checked: set_.checked, other: set_.other ? "" : " " })}
        />
        {set_.other !== "" ? (
          <TextInput
            value={set_.other.trim()}
            onChange={e => set({ checked: set_.checked, other: e.target.value })}
            placeholder="ระบุกิจกรรมอื่น ๆ"
          />
        ) : null}
      </div>
      <div className="text-[11.5px] text-ink-500 tnum">
        เลือกแล้ว {set_.checked.length + (set_.other.trim() ? 1 : 0)} รายการ
      </div>
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 8 · Photos
function SectionPhotos({ value, set }) {
  const inputRef = ur2(null);
  const onPick = (e) => {
    const files = Array.from(e.target.files || []);
    const next = [...value.photos];
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      next.push({ name: f.name, url, size: f.size });
    });
    set({ photos: next });
    e.target.value = "";
  };
  const remove = (i) => {
    const next = value.photos.filter((_, idx) => idx !== i);
    set({ photos: next });
  };
  return (
    <SectionCard title="8 · อัปโหลดภาพกิจกรรมการดูแล" subtitle="รองรับหลายภาพ · เก็บใน Google Drive ของหน่วยงาน">
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment" onChange={onPick} className="hidden"/>
      <div className="grid grid-cols-3 gap-2">
        {value.photos.map((p, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-paper border border-ink-100">
            <img src={p.url} alt={p.name} className="w-full h-full object-cover"/>
            <button onClick={() => remove(i)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-[11px] grid place-items-center">×</button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-2xl ph-stripes border border-dashed border-ink-300 text-ink-600 grid place-items-center text-[11px] font-mono"
        >
          + เพิ่มภาพ
        </button>
      </div>
      <div className="flex items-center justify-between text-[12px] text-ink-500">
        <span>เพิ่มแล้ว {value.photos.length} ภาพ</span>
        <button onClick={() => inputRef.current?.click()} className="text-ink-800 underline underline-offset-2">เลือกจากแกลเลอรี</button>
      </div>
    </SectionCard>
  );
}

// ───────────────────────────────────────────────── SECTION 9 · GPS / Leaflet
function SectionGPS({ value, set }) {
  const mapRef = ur2(null);
  const elRef = ur2(null);
  const markerRef = ur2(null);
  const enabled = value.gps_enabled;

  // initialize map when enabled
  ue2(() => {
    if (!enabled || !elRef.current || mapRef.current) return;
    const center = [value.lat || 16.5418, value.lng || 104.7237]; // Mukdahan
    const map = L.map(elRef.current, { zoomControl: false }).setView(center, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© OpenStreetMap"
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const marker = L.marker(center, { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const { lat, lng } = marker.getLatLng();
      set({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) });
    });
    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 100);
  }, [enabled]);

  // update marker if lat/lng changed externally
  ue2(() => {
    if (mapRef.current && markerRef.current && value.lat && value.lng) {
      markerRef.current.setLatLng([value.lat, value.lng]);
      mapRef.current.panTo([value.lat, value.lng]);
    }
  }, [value.lat, value.lng]);

  const getCurrent = () => {
    if (!navigator.geolocation) {
      Swal.fire({ icon: "error", title: "ไม่รองรับ GPS", text: "อุปกรณ์ไม่รองรับการหาตำแหน่ง" });
      return;
    }
    Swal.fire({ title: "กำลังดึงพิกัด...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        Swal.close();
        set({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) });
      },
      () => {
        Swal.close();
        // fallback to a Mukdahan-ish coordinate so the prototype still feels live
        set({ lat: 16.541823, lng: 104.723712 });
        Swal.fire({ icon: "info", title: "ใช้พิกัดตัวอย่าง", text: "ไม่สามารถเข้าถึง GPS — ใช้พิกัด รพ.สต. แทน" });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mapLink = value.lat && value.lng ? `https://maps.google.com/?q=${value.lat},${value.lng}` : "";

  return (
    <SectionCard title="9 · บันทึกพิกัดเยี่ยมบ้าน" subtitle="Latitude / Longitude · Google Maps link">
      <Toggle
        value={enabled}
        onChange={v => set({ gps_enabled: v })}
        label="เปิดบันทึกพิกัด"
        sub="ลากหมุดบนแผนที่หรือกดปุ่มดึงพิกัดปัจจุบัน"
      />
      {enabled ? (
        <>
          <div ref={elRef} className="rounded-2xl overflow-hidden border border-ink-200" style={{ height: 220 }}></div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <TextInput value={value.lat ? String(value.lat) : ""} readOnly/>
            </Field>
            <Field label="Longitude">
              <TextInput value={value.lng ? String(value.lng) : ""} readOnly/>
            </Field>
          </div>
          {mapLink ? (
            <div className="text-[12px] text-ink-500 break-all">
              <span className="text-ink-400">Map link:</span>{" "}
              <a href={mapLink} target="_blank" rel="noreferrer" className="text-accent-sky underline underline-offset-2">{mapLink}</a>
            </div>
          ) : null}
          <PrimaryButton onClick={getCurrent} className="w-full" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
            </svg>
          }>ดึงพิกัดปัจจุบัน</PrimaryButton>
        </>
      ) : (
        <div className="text-[12.5px] text-ink-500 bg-paper rounded-2xl p-4 border border-dashed border-ink-200">
          ไม่บันทึกพิกัดสำหรับการเยี่ยมครั้งนี้
        </div>
      )}
    </SectionCard>
  );
}

Object.assign(window, {
  SectionHeader, SectionInitialHealth, SectionVitals,
  SectionADL, SectionMental,
  ChecklistSection,
  SectionPhotos, SectionGPS
});
