import { useState, useEffect, useMemo } from "react";

// ====== LOGIN (સાદું લૉક) ======
// ધ્યાન: આ ફાઇલમાં લખેલો પાસવર્ડ કોડ જોનાર કોઈને પણ દેખાય.
// એટલે GitHub repository હંમેશા PRIVATE રાખો.
const ADMIN_ID = "Admin01";
const ADMIN_PASS = "30092026";

const DATA_KEY = "hisab-data-v1";
const AUTH_KEY = "hisab-auth-v1";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 9);
const total = (k) => k.entries.reduce((s, e) => s + Number(e.amount || 0), 0);

// ====== શરૂઆતનો ડેટા: નોટબુકના પહેલા 8 ખાતા ======
// naam/gaon ? વાળા હસ્તાક્ષર પરથી વાંચ્યા છે - નોટબુક સાથે મેળવીને એપમાં સુધારી લેજો.
const mk = (naam, gaon, amounts, kirayaIdx = [], note = "") => {
  const id = uid();
  return {
    id,
    naam,
    gaon,
    note,
    entries: amounts.map((a, i) => ({
      id: id + "-" + i,
      amount: a,
      date: "",
      kiraya: kirayaIdx.includes(i),
    })),
  };
};

const SEED = {
  month: "સપ્ટેમ્બર 2026",
  khatas: [
    mk("Mahesh?", "Magatra?", [1000, 200, 200, 1500, 1500]),
    mk("Soma?", "Kudiya", [2000, 1450, 1400, 100, 700, 700, 1400, 1000], [5, 6], "1450/1400 નોટબુકમાં ચેક કરો"),
    mk("Sohiy?", "", [1500, 2020, 1350, 200, 1000, 200, 2530, 1330], [], "છેલ્લી 1330 અને 2020 ચેક કરો"),
    mk("Sahil?", "Ghodapat", [700, 1000, 1000, 1000, 1000], [], "ભાડાની બીજી વ્યક્તિ અસ્પષ્ટ"),
    mk("Rahil?", "Bhoiwadi", [1000, 1000, 1500, 850, 200, 1000, 900, 1500, 1350, 1500]),
    mk("Soma?", "", [1350, 1000, 300, 900, 1000], [], "ભાડું: Raju / Bhoiwadi. પહેલી 1350 કપાયેલી લાગે છે"),
    mk("Sajil?", "Kudiya", [1300, 100, 5050, 1200, 150, 1350, 200, 1200, 1000], [], "5050 ચેક કરો"),
    mk("", "Kudiya", [100, 1800, 1000, 1000, 5000, 200, 1000, 1000, 1000], [], "નામ વંચાયું નથી. 1800 ચેક કરો"),
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED;
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "1");
  const [data, setData] = useState(load);
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const grand = useMemo(() => data.khatas.reduce((s, k) => s + total(k), 0), [data]);

  const updateKhata = (id, patch) =>
    setData((d) => ({ ...d, khatas: d.khatas.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setOpenId(null);
  };

  if (!authed)
    return (
      <Shell>
        <Login
          onOk={() => {
            localStorage.setItem(AUTH_KEY, "1");
            setAuthed(true);
          }}
        />
      </Shell>
    );

  const open = data.khatas.find((k) => k.id === openId);

  if (open)
    return (
      <Shell>
        <Detail
          k={open}
          onBack={() => setOpenId(null)}
          onChange={(patch) => updateKhata(open.id, patch)}
          onDelete={() => {
            if (window.confirm("આ ખાતું કાયમ માટે કાઢી નાખવું?")) {
              setData((d) => ({ ...d, khatas: d.khatas.filter((k) => k.id !== open.id) }));
              setOpenId(null);
            }
          }}
        />
      </Shell>
    );

  const list = data.khatas
    .map((k, i) => ({ k, no: i + 1 }))
    .filter(({ k }) => (k.naam + " " + k.gaon).toLowerCase().includes(q.trim().toLowerCase()));

  const addKhata = (naam, gaon) =>
    setData((d) => ({ ...d, khatas: [...d.khatas, { id: uid(), naam, gaon, note: "", entries: [] }] }));

  const backup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hisab-backup.json";
    a.click();
  };

  return (
    <Shell>
      <div className="top">
        <input
          className="month"
          value={data.month}
          onChange={(e) => setData({ ...data, month: e.target.value })}
        />
        <button className="ghost noprint" onClick={logout}>બહાર નીકળો</button>
      </div>

      <div className="grand">
        <div>કુલ સરવાળો</div>
        <b>{inr(grand)}</b>
        <small>{data.khatas.length} ખાતા</small>
      </div>

      <input
        className="noprint search"
        placeholder="🔍 નામ કે ગામ શોધો"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.map(({ k, no }) => (
        <div key={k.id} className="card" onClick={() => setOpenId(k.id)}>
          <div>
            <div className="nm">{no}. {k.naam || "(નામ નથી)"}</div>
            <small>{k.gaon || "ગામ નથી"} · {k.entries.length} એન્ટ્રી</small>
            {k.note && <div className="warn">⚠ {k.note}</div>}
          </div>
          <b>{inr(total(k))}</b>
        </div>
      ))}
      {list.length === 0 && <p className="mut">કંઈ મળ્યું નથી.</p>}

      <NewKhata onAdd={addKhata} />

      <div className="row noprint">
        <button className="ghost" onClick={() => window.print()}>🖨 PDF / પ્રિન્ટ</button>
        <button className="ghost" onClick={backup}>💾 બેકઅપ</button>
      </div>
    </Shell>
  );
}

function Login({ onOk }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    if (id.trim() === ADMIN_ID && pw === ADMIN_PASS) onOk();
    else setErr("યુઝર આઈડી અથવા પાસવર્ડ ખોટો છે");
  };
  return (
    <div className="login">
      <h1>📒 હિસાબ</h1>
      <input placeholder="યુઝર આઈડી" value={id} onChange={(e) => setId(e.target.value)} />
      <input
        placeholder="પાસવર્ડ"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && go()}
      />
      {err && <div className="err">{err}</div>}
      <button onClick={go}>લૉગિન</button>
    </div>
  );
}

function NewKhata({ onAdd }) {
  const [naam, setNaam] = useState("");
  const [gaon, setGaon] = useState("");
  return (
    <div className="box noprint">
      <b>+ નવું ખાતું</b>
      <div className="row">
        <input placeholder="નામ" value={naam} onChange={(e) => setNaam(e.target.value)} />
        <input placeholder="ગામ" value={gaon} onChange={(e) => setGaon(e.target.value)} />
      </div>
      <button
        onClick={() => {
          if (!naam.trim()) return;
          onAdd(naam.trim(), gaon.trim());
          setNaam("");
          setGaon("");
        }}
      >
        ઉમેરો
      </button>
    </div>
  );
}

function Detail({ k, onBack, onChange, onDelete }) {
  const [amt, setAmt] = useState("");
  const [date, setDate] = useState("");
  const [kiraya, setKiraya] = useState(false);

  const add = () => {
    const a = Number(amt);
    if (!a) return;
    onChange({ entries: [...k.entries, { id: uid(), amount: a, date, kiraya }] });
    setAmt("");
    setKiraya(false);
  };
  const del = (id) => onChange({ entries: k.entries.filter((e) => e.id !== id) });
  const fmtDate = (d) => (d ? d.split("-").reverse().join("/") : "—");

  return (
    <>
      <button className="ghost noprint" onClick={onBack}>← પાછા</button>

      <div className="box">
        <div className="row">
          <input placeholder="નામ" value={k.naam} onChange={(e) => onChange({ naam: e.target.value })} />
          <input placeholder="ગામ" value={k.gaon} onChange={(e) => onChange({ gaon: e.target.value })} />
        </div>
        <input placeholder="નોંધ" value={k.note} onChange={(e) => onChange({ note: e.target.value })} />
      </div>

      <div className="grand">
        <div>આ ખાતાનો સરવાળો</div>
        <b>{inr(total(k))}</b>
        <small>{k.entries.length} એન્ટ્રી</small>
      </div>

      {k.entries.map((e, i) => (
        <div key={e.id} className="card slim">
          <div>
            {i + 1}. <b>{inr(e.amount)}</b> {e.kiraya && <span className="tag">ભાડું</span>}
            <small> · {fmtDate(e.date)}</small>
          </div>
          <button className="x noprint" onClick={() => del(e.id)}>✕</button>
        </div>
      ))}

      <div className="box noprint">
        <b>+ નવી એન્ટ્રી</b>
        <div className="row">
          <input type="number" inputMode="numeric" placeholder="રકમ" value={amt} onChange={(e) => setAmt(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <label className="chk">
          <input type="checkbox" checked={kiraya} onChange={(e) => setKiraya(e.target.checked)} /> ભાડું
        </label>
        <button onClick={add}>ઉમેરો</button>
      </div>

      <button className="danger noprint" onClick={onDelete}>આ ખાતું કાઢી નાખો</button>
    </>
  );
}

function Shell({ children }) {
  return (
    <div className="wrap">
      <style>{css}</style>
      {children}
    </div>
  );
}

const css = `
*{box-sizing:border-box}
body{margin:0;background:#eef2f7;font-family:system-ui,-apple-system,"Noto Sans Gujarati","Shruti",sans-serif;color:#1b1f24}
.wrap{max-width:520px;margin:0 auto;padding:12px 12px 40px}
h1{text-align:center;color:#1F3A5F}
input{width:100%;padding:11px;border:1px solid #c5d0dc;border-radius:8px;font-size:16px;margin:4px 0;background:#fff}
button{padding:11px 14px;border:0;border-radius:8px;background:#1F3A5F;color:#fff;font-size:15px;width:100%;margin-top:6px}
button.ghost{background:#fff;color:#1F3A5F;border:1px solid #1F3A5F;width:auto}
button.danger{background:#b3261e;margin-top:16px}
button.x{width:auto;background:#fff;color:#b3261e;border:1px solid #e3b5b1;padding:6px 10px;margin:0}
.top{display:flex;gap:8px;align-items:center}
.month{font-size:20px;font-weight:700;border:0;background:transparent;color:#1F3A5F}
.grand{background:#1F3A5F;color:#fff;border-radius:12px;padding:14px;margin:8px 0;text-align:center}
.grand b{display:block;font-size:30px}
.grand small{opacity:.8}
.card{background:#fff;border-radius:10px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;gap:8px;box-shadow:0 1px 2px #0002}
.card.slim{padding:8px 12px}
.nm{font-weight:600}
small,.mut{color:#5a6672}
.warn{font-size:12px;color:#8a5a00;margin-top:3px}
.box{background:#fff;border-radius:10px;padding:12px;margin:10px 0}
.row{display:flex;gap:8px}
.chk{display:flex;align-items:center;gap:8px;margin:4px 0}
.chk input{width:auto}
.tag{background:#fde9c9;color:#8a5a00;border-radius:6px;padding:1px 7px;font-size:12px}
.err{color:#b3261e;margin:4px 0}
.login{margin-top:20vh}
@media print{.noprint{display:none!important}body{background:#fff}.card{box-shadow:none;border:1px solid #ccc}}
`;
