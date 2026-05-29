// ─────────────────────────────────────────────────────────────────────────────
//  Mock data + Thai-language reference tables for the LTC visit reporting app.
//  Exposed via window.* so other Babel scripts can read.
// ─────────────────────────────────────────────────────────────────────────────

// Current login (Care Giver)
const CURRENT_USER = {
  user_id: "CG-007",
  name: "ขนิษฐา  ภูเวียงคำ",
  role: "Care Giver",
  village: "หมู่ 4 บ้านทรายไหลแล้ง",
  phone: "081-234-5678",
  initials: "ขภ"
};

const ALL_ROLES = [
  { id: "caregiver",    label: "Care Giver",   sub: "บันทึกการเยี่ยมรายเคส", icon: "🩺" },
  { id: "case_manager", label: "Case Manager", sub: "ติดตามเคสเสี่ยง · QA", icon: "🗂" },
  { id: "admin",        label: "Admin",        sub: "Dashboard · จัดการระบบ", icon: "⚙︎" }
];

// Patient roster assigned to the current Care Giver
const PATIENTS = [
  {
    pid: "1490800123456",
    name: "นางบุญมี  สุขสมบัติ",
    age: 78,
    sex: "หญิง",
    village: "หมู่ 4 บ้านทรายไหลแล้ง",
    address: "บ้านเลขที่ 42/1 ม.4 ต.บ้านทรายไหลแล้ง",
    caregiver_at_home: "นายสมพร  สุขสมบัติ",
    relation: "บุตร",
    contact: "0812345001",
    adl_group: "ติดบ้าน",
    last_visit: "21/05/2569",
    visit_count: 6,
    risk: "ปกติ",
    distance_km: 1.2
  },
  {
    pid: "1490800234567",
    name: "นายเสริม  คำมูล",
    age: 82,
    sex: "ชาย",
    village: "หมู่ 4 บ้านทรายไหลแล้ง",
    address: "บ้านเลขที่ 88 ม.4 ต.บ้านทรายไหลแล้ง",
    caregiver_at_home: "นางวิภา  คำมูล",
    relation: "บุตร",
    contact: "0823456002",
    adl_group: "ติดเตียง",
    last_visit: "18/05/2569",
    visit_count: 11,
    risk: "เสี่ยงสูง",
    distance_km: 0.6
  },
  {
    pid: "1490800345678",
    name: "นางจำปา  อินทร์ทอง",
    age: 71,
    sex: "หญิง",
    village: "หมู่ 5 บ้านดอนสวรรค์",
    address: "บ้านเลขที่ 12 ม.5 ต.บ้านทรายไหลแล้ง",
    caregiver_at_home: "นายอนุชา  อินทร์ทอง",
    relation: "หลาน",
    contact: "0834567003",
    adl_group: "ติดบ้าน",
    last_visit: "23/05/2569",
    visit_count: 4,
    risk: "เฝ้าระวัง",
    distance_km: 2.4
  },
  {
    pid: "1490800456789",
    name: "นายทองคำ  พิมพ์โพธิ์",
    age: 76,
    sex: "ชาย",
    village: "หมู่ 4 บ้านทรายไหลแล้ง",
    address: "บ้านเลขที่ 105 ม.4 ต.บ้านทรายไหลแล้ง",
    caregiver_at_home: "นางสร้อย  พิมพ์โพธิ์",
    relation: "ภรรยา",
    contact: "0845678004",
    adl_group: "ติดสังคม",
    last_visit: "10/05/2569",
    visit_count: 2,
    risk: "ปกติ",
    distance_km: 3.1
  }
];

const RELATIONS = ["พ่อ", "แม่", "บุตร", "พี่", "น้อง", "หลาน", "ญาติ", "อื่น ๆ"];

// ─── ADL Barthel (10 items) ─────────────────────────────────────────────────
const ADL_ITEMS = [
  {
    n: 1, title: "รับประทานอาหาร",
    options: [
      { v: 0, label: "ไม่สามารถตักอาหารเข้าปากได้ ต้องมีคนป้อน" },
      { v: 1, label: "ตักอาหารเองได้ แต่ต้องมีคนช่วย เช่น หั่นเป็นชิ้นเล็ก ๆ" },
      { v: 2, label: "ตักอาหารและช่วยตัวเองได้ปกติ" }
    ]
  },
  {
    n: 2, title: "ล้างหน้า หวีผม แปรงฟัน โกนหนวด",
    options: [
      { v: 0, label: "ต้องการความช่วยเหลือ" },
      { v: 1, label: "ทำได้เอง (รวมการใช้อุปกรณ์)" }
    ]
  },
  {
    n: 3, title: "ลุกนั่งจากที่นอน/เตียง ไปยังเก้าอี้",
    options: [
      { v: 0, label: "ไม่สามารถนั่งทรงตัวได้" },
      { v: 1, label: "ต้องใช้คน 2 คนช่วยพยุง" },
      { v: 2, label: "ใช้คน 1 คนช่วยพยุงและบอกวิธี" },
      { v: 3, label: "ทำได้เอง" }
    ]
  },
  {
    n: 4, title: "การใช้ห้องน้ำ",
    options: [
      { v: 0, label: "ช่วยตัวเองไม่ได้" },
      { v: 1, label: "ทำได้เองบ้าง" },
      { v: 2, label: "ทำได้เองอย่างปกติ" }
    ]
  },
  {
    n: 5, title: "การเคลื่อนที่ภายในห้อง/บ้าน",
    options: [
      { v: 0, label: "เคลื่อนที่ไม่ได้" },
      { v: 1, label: "ต้องใช้รถเข็นและช่วยจัดล้อ" },
      { v: 2, label: "เดินหรือเคลื่อนได้ โดยมีคนช่วย" },
      { v: 3, label: "เดิน/เคลื่อนได้เอง" }
    ]
  },
  {
    n: 6, title: "การสวมใส่เสื้อผ้า",
    options: [
      { v: 0, label: "ต้องมีคนแต่งตัวให้" },
      { v: 1, label: "ทำได้ครึ่งหนึ่ง ต้องมีคนช่วย" },
      { v: 2, label: "ทำได้เอง" }
    ]
  },
  {
    n: 7, title: "การขึ้นลงบันได 1 ชั้น",
    options: [
      { v: 0, label: "ไม่สามารถทำได้" },
      { v: 1, label: "ต้องมีคนช่วย" },
      { v: 2, label: "ทำได้เอง" }
    ]
  },
  {
    n: 8, title: "การอาบน้ำ",
    options: [
      { v: 0, label: "ต้องมีคนช่วย" },
      { v: 1, label: "อาบเองได้" }
    ]
  },
  {
    n: 9, title: "การกลั้นอุจจาระ",
    options: [
      { v: 0, label: "กลั้นไม่ได้" },
      { v: 1, label: "กลั้นไม่ได้บางครั้ง (เดือนละ ≥ 1)" },
      { v: 2, label: "กลั้นได้เป็นปกติ" }
    ]
  },
  {
    n: 10, title: "การกลั้นปัสสาวะ",
    options: [
      { v: 0, label: "กลั้นไม่ได้" },
      { v: 1, label: "กลั้นไม่ได้บางครั้ง" },
      { v: 2, label: "กลั้นได้เป็นปกติ" }
    ]
  }
];

// Interpret ADL total
function interpretADL(total) {
  if (total <= 4)   return { label: "ติดเตียง",   tone: "danger",  sub: "พึ่งพิงทั้งหมด" };
  if (total <= 11)  return { label: "ติดบ้าน",    tone: "warning", sub: "พึ่งพิงปานกลาง" };
  return              { label: "ติดสังคม",  tone: "ok",      sub: "ช่วยเหลือตนเองได้" };
}

// ─── 2Q ─────────────────────────────────────────────────────────────────────
const TWO_Q = [
  "ใน 2 สัปดาห์ที่ผ่านมา รู้สึกหดหู่ เศร้า ท้อแท้ สิ้นหวัง",
  "ใน 2 สัปดาห์ที่ผ่านมา รู้สึกเบื่อ ไม่อยากทำอะไร"
];

// ─── 9Q ─────────────────────────────────────────────────────────────────────
const NINE_Q = [
  "เบื่อ ไม่สนใจอยากทำอะไร",
  "ไม่สบายใจ ซึมเศร้า ท้อแท้",
  "หลับยาก หรือหลับ ๆ ตื่น ๆ หรือหลับมากเกินไป",
  "เหนื่อยง่าย หรือไม่ค่อยมีแรง",
  "เบื่ออาหาร หรือกินมากเกินไป",
  "รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว",
  "สมาธิไม่ดี เวลาทำอะไร เช่น ดูทีวี ฟังวิทยุ ทำงาน",
  "พูดช้า ทำอะไรช้าจนคนอื่นสังเกตเห็น หรือกระสับกระส่ายไม่เหมือนเดิม",
  "คิดทำร้ายตนเอง หรือคิดว่าตายไปจะดีกว่า"
];
const NINE_Q_OPTS = [
  { v: 0, label: "ไม่มีเลย" },
  { v: 1, label: "เป็นบางวัน" },
  { v: 2, label: "เป็นบ่อย" },
  { v: 3, label: "เป็นทุกวัน" }
];
function interpret9Q(total) {
  if (total <= 6)   return { label: "ไม่มีภาวะซึมเศร้า",      tone: "ok" };
  if (total <= 12)  return { label: "ซึมเศร้าระดับน้อย",       tone: "warning" };
  if (total <= 18)  return { label: "ซึมเศร้าระดับปานกลาง",    tone: "warning" };
  return              { label: "ซึมเศร้าระดับรุนแรง",     tone: "danger" };
}

// ─── 8Q (suicide risk) — score weights from spec ────────────────────────────
const EIGHT_Q = [
  { n: 1, text: "คิดอยากตาย หรือคิดว่าตายไปจะดีกว่า",        yes: 1  },
  { n: 2, text: "อยากทำร้ายตัวเอง",                            yes: 2  },
  { n: 3, text: "คิดเกี่ยวกับการฆ่าตัวตาย",                    yes: 6, followUp: "ควบคุมความอยากฆ่าตัวตายได้หรือไม่" },
  { n: 4, text: "มีแผนการที่จะฆ่าตัวตาย",                      yes: 8  },
  { n: 5, text: "เตรียมการทำร้ายตนเอง/ฆ่าตัวตาย",              yes: 9  },
  { n: 6, text: "ทำให้ตนเองบาดเจ็บ แต่ไม่ตั้งใจเสียชีวิต",     yes: 4  },
  { n: 7, text: "พยายามฆ่าตัวตาย โดยตั้งใจให้ตาย",             yes: 10 },
  { n: 8, text: "ตลอดชีวิตที่ผ่านมา เคยพยายามฆ่าตัวตาย",       yes: 4  }
];
function interpret8Q(total) {
  if (total === 0)  return { label: "ไม่มีแนวโน้มฆ่าตัวตายในปัจจุบัน", tone: "ok" };
  if (total <= 8)   return { label: "แนวโน้มระดับน้อย",                 tone: "warning" };
  if (total <= 16)  return { label: "แนวโน้มระดับปานกลาง",              tone: "warning" };
  return              { label: "แนวโน้มระดับรุนแรง",                tone: "danger" };
}

function interpretBMI(bmi) {
  if (!bmi || isNaN(bmi)) return { label: "—", tone: "neutral" };
  if (bmi < 18.5)  return { label: "ผอม / น้ำหนักน้อย", tone: "warning" };
  if (bmi < 23)    return { label: "สมส่วน",            tone: "ok" };
  if (bmi < 25)    return { label: "ท้วม / น้ำหนักเกิน", tone: "warning" };
  if (bmi < 30)    return { label: "อ้วน",              tone: "warning" };
  return              { label: "อ้วนมาก",         tone: "danger" };
}

// ─── Care-activity checklists ────────────────────────────────────────────────
const DAILY_CARE = [
  "การเปลี่ยนผ้าอ้อม / แผ่นรองซับ",
  "การพลิกตะแคงตัว",
  "จัดท่านอนป้องกันแผลกดทับ / ป้องกันเท้าตก",
  "การเคลื่อนย้ายผู้สูงอายุบนเตียง / ที่นอน",
  "ช่วยเคลื่อนย้ายจากจุดหนึ่งไปยังอีกจุดหนึ่ง"
];
const HEALTH_CARE = [
  "ประเมินภาวะซึมเศร้า",
  "ประเมินสัญญาณชีพ",
  "ทำแผล",
  "ดูแลสายสวนต่าง ๆ ให้สะอาดและอยู่ในตำแหน่งที่เหมาะสม",
  "นวดผ่อนคลายกล้ามเนื้อ / กระตุ้นระบบไหลเวียน",
  "บริหารข้อและกล้ามเนื้อ",
  "ฝึกทรงตัว / ฝึกเดิน",
  "สมาธิบำบัด",
  "ฝึกหายใจ"
];
const OTHER_CARE = [
  "ดูแลที่อยู่อาศัยให้สะอาด ปลอดภัย อากาศถ่ายเท",
  "ให้คำปรึกษาด้านสุขภาพแก่ผู้สูงอายุ",
  "ให้คำปรึกษาด้านสุขภาพแก่ครอบครัว / ผู้ดูแล",
  "อ่านหนังสือ / บทสวดมนต์ / เอกสารให้ผู้สูงอายุฟัง",
  "พาไปพบแพทย์ / บุคลากรสาธารณสุขตามนัด",
  "จัดพาหนะรับ-ส่งผู้สูงอายุ",
  "ช่วยบุคลากรสาธารณสุขในการทำหัตถการ",
  "ประสานการเบิกจ่ายวัสดุอุปกรณ์การแพทย์จาก รพ./รพ.สต.",
  "ประสานบุคลากรสาธารณสุขกรณีฉุกเฉิน"
];

// ─── Admin: Care Givers + recent Visits log ──────────────────────────
const CAREGIVERS = [
  { id: "CG-001", name: "พิมลดา  ถิรมะจิตร์",  village: "หมู่ 4", cases: 8, active: true },
  { id: "CG-007", name: "ขนิษฐา  ภูเวียงคำ",  village: "หมู่ 4", cases: 6, active: true },
  { id: "CG-012", name: "สมพงษ์  แก้วสีขาว",  village: "หมู่ 5", cases: 5, active: true },
  { id: "CG-015", name: "ประภา  สิงห์ทอง",   village: "หมู่ 7", cases: 4, active: false },
  { id: "CG-019", name: "ยุพิน  จันทร์สว่าง", village: "หมู่ 5", cases: 7, active: true }
];

const VISITS = [
  { id: "V-2406", date: "24/05/2569", pid: "1490800234567", name: "นายเสริม  คำมูล",         cg: "ขนิษฐา  ภูเวียงคำ",  village: "หมู่ 4", adl: 4,  q9: 14, q8: 6,  risk: "เสี่ยงสูง" },
  { id: "V-2405", date: "24/05/2569", pid: "1490800345678", name: "นางจำปา  อินทร์ทอง",         cg: "สมพงษ์  แก้วสีขาว",  village: "หมู่ 5", adl: 9,  q9: 8,  q8: 0,  risk: "เฝ้าระวัง" },
  { id: "V-2404", date: "23/05/2569", pid: "1490800456789", name: "นายทองคำ  พิมพ์โพธิ์",     cg: "พิมลดา  ถิรมะจิตร์",   village: "หมู่ 4", adl: 16, q9: 4,  q8: 0,  risk: "ปกติ" },
  { id: "V-2403", date: "23/05/2569", pid: "1490800123456", name: "นางบุญมี  สุขสมบัติ",       cg: "ขนิษฐา  ภูเวียงคำ",  village: "หมู่ 4", adl: 11, q9: 5,  q8: 0,  risk: "ปกติ" },
  { id: "V-2402", date: "22/05/2569", pid: "1490800567890", name: "นางสมบูรณ์  ยิ้มแย้ม",     cg: "ยุพิน  จันทร์สว่าง", village: "หมู่ 5", adl: 3,  q9: 19, q8: 17, risk: "เสี่ยงสูง" },
  { id: "V-2401", date: "22/05/2569", pid: "1490800678901", name: "นายสมพงษ์  จันทร์ผ่อง",   cg: "สมพงษ์  แก้วสีขาว",  village: "หมู่ 5", adl: 14, q9: 3,  q8: 0,  risk: "ปกติ" },
  { id: "V-2400", date: "21/05/2569", pid: "1490800789012", name: "นางเสงี่ยม  หล้าฟ้า",       cg: "ประภา  สิงห์ทอง",    village: "หมู่ 7", adl: 7,  q9: 11, q8: 1,  risk: "เฝ้าระวัง" },
  { id: "V-2399", date: "21/05/2569", pid: "1490800890123", name: "นายมานพ  เงินหลาย",          cg: "พิมลดา  ถิรมะจิตร์",   village: "หมู่ 4", adl: 18, q9: 2,  q8: 0,  risk: "ปกติ" },
  { id: "V-2398", date: "20/05/2569", pid: "1490800901234", name: "นางติ๋งหลี  บุญมา",            cg: "ยุพิน  จันทร์สว่าง", village: "หมู่ 5", adl: 12, q9: 6,  q8: 0,  risk: "ปกติ" },
  { id: "V-2397", date: "20/05/2569", pid: "1490800012345", name: "นายปิ่น  แก้วบุตร",           cg: "ขนิษฐา  ภูเวียงคำ",  village: "หมู่ 4", adl: 6,  q9: 9,  q8: 0,  risk: "เฝ้าระวัง" }
];

// 14-day visit volume — for sparkline / bar chart
const VISITS_14D = [4,3,5,6,4,2,7,8,5,6,9,7,11,8];

// ─── Thai date utilities ────────────────────────────────────────────────────
function thaiDateString(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yyyy}`;
}
function thaiTimeString(d = new Date()) {
  return d.toTimeString().slice(0, 5);
}

// expose
Object.assign(window, {
  CURRENT_USER, ALL_ROLES, PATIENTS, RELATIONS,
  CAREGIVERS, VISITS, VISITS_14D,
  ADL_ITEMS, interpretADL, interpretBMI,
  TWO_Q, NINE_Q, NINE_Q_OPTS, interpret9Q,
  EIGHT_Q, interpret8Q,
  DAILY_CARE, HEALTH_CARE, OTHER_CARE,
  thaiDateString, thaiTimeString
});
