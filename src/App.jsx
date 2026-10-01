import { useState, useEffect, useMemo } from "react";

// ====== LOGIN (સાદું લૉક) ======
// ધ્યાન: આ ફાઇલમાં લખેલો પાસવર્ડ કોડ જોનાર કોઈને પણ દેખાય.
// એટલે GitHub repository હંમેશા PRIVATE રાખો.
const ADMIN_ID = "Admin01";
const ADMIN_PASS = "30092026";

const DATA_KEY = "hisab-data-v2";
const AUTH_KEY = "hisab-auth-v1";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 9);
const total = (k) => k.entries.reduce((s, e) => s + Number(e.amount || 0), 0);

// ====== શરૂઆતનો ડેટા: સપ્ટેમ્બર 2026 હિસાબ (PDF મુજબ) ======
// [તારીખ, રકમ] — તારીખ 0 એટલે તારીખ વંચાઈ નથી (નીચે "તારીખ વગરની" માં રહેશે)
const mk = (naam, gaon, list, note = "") => {
  const id = uid();
  return {
    id,
    naam,
    gaon,
    note,
    entries: list.map(([d, amount], i) => ({
      id: id + "-" + i,
      amount,
      date: d ? `2026-09-${String(d).padStart(2, "0")}` : "",
      kiraya: false,
      vigat: "",
    })),
  };
};

const SEED = {
  month: "સપ્ટેમ્બર 2026",
  khatas: [
    mk("Mahesh", "", [[6, 1000], [11, 200], [14, 200], [20, 1500], [27, 1500]]),
    mk("Soma?", "Kudadiya", [[11, 2000], [14, 1450], [0, 1400], [0, 100], [0, 700], [0, 700], [0, 1400]]),
    mk("Sohil?", "", [[3, 1500], [5, 2020], [11, 1350], [14, 200], [15, 1000], [0, 200], [22, 2530], [0, 1330], [27, 1000]]),
    mk("Kalpesh?", "Ghodapat", [[0, 700], [3, 1000], [14, 1000], [21, 1000], [27, 1000]]),
    mk("Rajesh?", "", [[0, 1000], [0, 1000], [0, 1500], [0, 850], [0, 200], [0, 1000], [0, 900], [0, 1500], [0, 1350], [0, 1500]]),
    mk("Soma? / Raju", "", [[4, 1350], [10, 1000], [12, 300], [26, 900], [27, 1000]], "ભાડું (rent)"),
    mk("Sanjay?", "", [[3, 1300], [5, 100], [6, 5050], [8, 1200], [15, 150], [15, 1350], [0, 200], [22, 1200], [27, 1000]]),
    mk("Vyas?", "", [[0, 100], [0, 1800], [0, 1000], [0, 1000], [0, 5000], [0, 200], [0, 1000], [0, 800], [0, 1000]]),
    mk("Girish? / Ganesh", "", [[20, 1000], [24, 1230]]),
    mk("Mahendra?", "", [[0, 800], [0, 100], [0, 1350], [0, 1000], [0, 700], [0, 2000], [27, 1000]]),
    mk("Manoj?", "", [[11, 2000], [12, 1000], [14, 200], [19, 1000], [0, 600], [22, 1000]]),
    mk("(નામ વંચાયું નથી)", "", [[0, 700], [3, 1000], [14, 1000], [0, 1000], [0, 2020]]),
    mk("Kailash?", "Ghodapat", [[2, 1000], [5, 1600], [14, 2020], [16, 300], [26, 1000]]),
    mk("Pavan", "", [[0, 1000], [3, 1000], [5, 1500], [10, 1000], [0, 70], [17, 1500], [0, 1500]]),
    mk("Dipak?", "", [[3, 2000], [14, 1000], [28, 1000]]),
    mk("Hiram?", "", [[3, 1500], [8, 1500], [0, 500], [14, 10100], [17, 1500], [25, 1500]]),
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
        <h2 className="title">📒</h2>
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

      <div className="ruled">
        {list.map(({ k, no }) => (
          <div key={k.id} className="line" onClick={() => setOpenId(k.id)}>
            <div>
              <div className="nm">{no}. {k.naam || "(નામ નથી)"}</div>
              <small>{k.gaon || "ગામ નથી"} · {k.entries.length} એન્ટ્રી</small>
              {k.note && <div className="warn">⚠ {k.note}</div>}
            </div>
            <b className="amt">{inr(total(k))}</b>
          </div>
        ))}
        {list.length === 0 && <p className="mut">કંઈ મળ્યું નથી.</p>}
      </div>

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
      <div className="box">
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

const MONTHS = ["જાન્યુઆરી","ફેબ્રુઆરી","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઓગસ્ટ","સપ્ટેમ્બર","ઓક્ટોબર","નવેમ્બર","ડિસેમ્બર"];
const DAYS = ["રવિ","સોમ","મંગળ","બુધ","ગુરુ","શુક્ર","શનિ"];
const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const fmtDate = (d) => (d ? d.split("-").reverse().join("/") : "—");

function Detail({ k, onBack, onChange, onDelete }) {
  const now = new Date();
  // કેલેન્ડર છેલ્લી એન્ટ્રીવાળા મહિનામાં ખૂલે; એન્ટ્રી ન હોય તો આજના મહિનામાં
  const latest = k.entries.map((e) => e.date).filter(Boolean).sort().pop();
  const start = latest ? new Date(latest + "T00:00:00") : now;
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [sel, setSel] = useState(iso(start.getFullYear(), start.getMonth(), start.getDate()));
  const [amt, setAmt] = useState("");
  const [vigat, setVigat] = useState("");
  const [kiraya, setKiraya] = useState(false);
  const [edit, setEdit] = useState(false);

  const byDate = useMemo(() => {
    const o = {};
    k.entries.forEach((e) => {
      if (e.date) o[e.date] = (o[e.date] || 0) + Number(e.amount || 0);
    });
    return o;
  }, [k.entries]);

  const first = new Date(ym.y, ym.m, 1).getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const prefix = `${ym.y}-${pad(ym.m + 1)}`;
  const monthTotal = k.entries.filter((e) => (e.date || "").startsWith(prefix)).reduce((s, e) => s + Number(e.amount || 0), 0);
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const go = (delta) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const add = () => {
    const a = Number(amt);
    if (!a) return;
    onChange({ entries: [...k.entries, { id: uid(), amount: a, date: sel, kiraya, vigat: vigat.trim() }] });
    setAmt("");
    setVigat("");
    setKiraya(false);
  };
  const del = (id) => onChange({ entries: k.entries.filter((e) => e.id !== id) });
  const setDate = (id, date) => onChange({ entries: k.entries.map((e) => (e.id === id ? { ...e, date } : e)) });

  const dayList = k.entries.filter((e) => e.date === sel);
  const undated = k.entries.filter((e) => !e.date);

  const Row = ({ e, undatedRow }) => (
    <div className="line slim">
      <div>
        <b className="amt">{inr(e.amount)}</b> {e.kiraya && <span className="tag">ભાડું</span>}
        {e.vigat && <div><small>{e.vigat}</small></div>}
      </div>
      <div className="row" style={{ width: "auto" }}>
        {undatedRow && (
          <button className="ghost noprint" style={{ margin: 0, padding: "5px 8px", fontSize: 12 }} onClick={() => setDate(e.id, sel)}>
            {fmtDate(sel)} મૂકો
          </button>
        )}
        <button className="x noprint" onClick={() => del(e.id)}>✕</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="row noprint" style={{ justifyContent: "space-between" }}>
        <button className="ghost" onClick={onBack}>← પાછા</button>
        <button className="ghost" onClick={() => setEdit(!edit)}>✎ નામ સુધારો</button>
      </div>

      <div className="khname">
        <h2>{k.naam || "(નામ નથી)"}</h2>
        <small>{k.gaon || "ગામ નથી"}</small>
        {k.note && <div className="warn">⚠ {k.note}</div>}
      </div>

      {edit && (
        <div className="box noprint">
          <div className="row">
            <input placeholder="નામ" value={k.naam} onChange={(e) => onChange({ naam: e.target.value })} />
            <input placeholder="ગામ" value={k.gaon} onChange={(e) => onChange({ gaon: e.target.value })} />
          </div>
          <input placeholder="નોંધ" value={k.note} onChange={(e) => onChange({ note: e.target.value })} />
          <button className="danger" onClick={onDelete}>આ ખાતું કાઢી નાખો</button>
        </div>
      )}

      <div className="grand">
        <div>આ ખાતાનો કુલ સરવાળો</div>
        <b>{inr(total(k))}</b>
        <small>{MONTHS[ym.m]}: {inr(monthTotal)}</small>
      </div>

      <div className="cal">
        <div className="calhd">
          <button className="ghost noprint" onClick={() => go(-1)}>‹</button>
          <b>{MONTHS[ym.m]} {ym.y}</b>
          <button className="ghost noprint" onClick={() => go(1)}>›</button>
        </div>
        <div className="grid">
          {DAYS.map((d) => <div key={d} className="dn">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} />;
            const key = iso(ym.y, ym.m, d);
            return (
              <div key={key} className={"day" + (key === sel ? " sel" : "") + (key === todayIso ? " today" : "") + (byDate[key] ? " has" : "")} onClick={() => setSel(key)}>
                <span>{d}</span>
                {byDate[key] && <em>{Number(byDate[key]).toLocaleString("en-IN")}</em>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="box">
        <b>📅 {fmtDate(sel)}</b>
        {dayList.length === 0 && <div className="mut" style={{ margin: "6px 0" }}>આ તારીખે કોઈ એન્ટ્રી નથી.</div>}
        {dayList.map((e) => <Row key={e.id} e={e} />)}
        <div className="noprint">
          <div className="row">
            <input type="number" inputMode="numeric" placeholder="રકમ" value={amt} onChange={(e) => setAmt(e.target.value)} />
            <input placeholder="વિગત (વૈકલ્પિક)" value={vigat} onChange={(e) => setVigat(e.target.value)} />
          </div>
          <label className="chk">
            <input type="checkbox" checked={kiraya} onChange={(e) => setKiraya(e.target.checked)} /> ભાડું
          </label>
          <button onClick={add}>{fmtDate(sel)} ની એન્ટ્રી ઉમેરો</button>
        </div>
      </div>

      {undated.length > 0 && (
        <div className="box">
          <b>તારીખ વગરની એન્ટ્રી ({undated.length})</b>
          <div className="mut" style={{ fontSize: 13 }}>ઉપર તારીખ પસંદ કરી "મૂકો" દબાવો</div>
          {undated.map((e) => <Row key={e.id} e={e} undatedRow />)}
        </div>
      )}
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

// ====== નોટબુક ડિઝાઇન ======
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;600;700&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#e9e1c8;font-family:"Noto Serif Gujarati",Georgia,serif;color:#2b2a26}
.wrap{max-width:520px;margin:0 auto;min-height:100vh;padding:14px 14px 40px;background:#fbf6e9;border-left:3px double #d9a79c;box-shadow:0 0 18px #0002}
h1{text-align:center;color:#7a2e1d;margin:0 0 14px}
input{width:100%;padding:11px;border:1px dashed #b9ac82;border-radius:6px;font-size:16px;margin:4px 0;background:#fffdf5;color:#2b2a26;font-family:inherit}
input:focus{outline:2px solid #7a2e1d55;border-style:solid}
button{padding:11px 14px;border:0;border-radius:6px;background:#7a2e1d;color:#fff;font-size:15px;width:100%;margin-top:6px;font-family:inherit}
button.ghost{background:transparent;color:#7a2e1d;border:1px solid #7a2e1d;width:auto}
button.danger{background:#a3261b;margin-top:16px}
button.x{width:auto;background:transparent;color:#a3261b;border:1px solid #dcb1ab;padding:5px 10px;margin:0}
.top{display:flex;gap:8px;align-items:center}
.title{margin:0;font-size:24px}
.month{font-size:21px;font-weight:700;border:0;background:transparent;color:#7a2e1d;margin:0}
.grand{border:2px solid #7a2e1d;border-radius:6px;background:#fff8e1;color:#7a2e1d;padding:12px;margin:12px 0;text-align:center}
.grand b{display:block;font-size:32px}
.grand small{color:#7b7562}
.search{background:#fffdf5}
.ruled{margin:6px 0 10px;border-top:2px solid #7a2e1d}
.line{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 4px;border-bottom:1px solid #d9cfae;cursor:pointer}
.line:active{background:#f3ead0}
.line.slim{padding:8px 4px;cursor:default}
.nm{font-weight:700}
.amt{color:#7a2e1d;font-size:17px}
small,.mut{color:#7b7562}
.warn{font-size:12px;color:#8a5a00;margin-top:3px}
.box{background:#fff8e1;border:1px solid #d9cfae;border-radius:6px;padding:12px;margin:12px 0}
.row{display:flex;gap:8px}
.chk{display:flex;align-items:center;gap:8px;margin:4px 0}
.chk input{width:auto}
.tag{background:#f6dfae;color:#7a4a00;border-radius:4px;padding:1px 7px;font-size:12px}
.err{color:#a3261b;margin:4px 0}
.login{margin-top:16vh}
.khname{text-align:center;margin:10px 0 0}
.khname h2{margin:0;font-size:26px;color:#7a2e1d}
.cal{background:#fffdf5;border:1px solid #d9cfae;border-radius:6px;padding:10px;margin:12px 0}
.calhd{display:flex;justify-content:space-between;align-items:center;color:#7a2e1d;margin-bottom:6px}
.calhd button{margin:0;padding:4px 14px;font-size:20px}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.dn{text-align:center;font-size:12px;color:#7b7562;padding:2px 0}
.day{min-height:46px;border:1px solid #e6dcbb;border-radius:5px;padding:3px;display:flex;flex-direction:column;align-items:center;cursor:pointer;background:#fff}
.day span{font-size:14px}
.day em{font-style:normal;font-size:9.5px;color:#7a2e1d;font-weight:700;margin-top:auto}
.day.has{background:#c8ebc9;border-color:#2e8b3d}
.day.today{border-color:#7a2e1d}
.day.has em{color:#14532d}
.day.sel{outline:3px solid #7a2e1d;outline-offset:1px}
@media print{body{background:#fff}.wrap{box-shadow:none;border:0}.noprint{display:none!important}}
`;
