import { useState, useEffect, useMemo } from "react";

// ====== LOGIN (સાદું લૉક) ======
// ધ્યાન: આ ફાઇલમાં લખેલો પાસવર્ડ કોડ જોનાર કોઈને પણ દેખાય.
// એટલે GitHub repository હંમેશા PRIVATE રાખો.
const ADMIN_ID = "Admin01";
const ADMIN_PASS = "30092026";

// બીજું લૉગિન: સાઇટ / કર્મચારી / હાજરી / ઉપાડ સિસ્ટમ
const NV_ID = "Nitesh";
const NV_PASS = "72warnafutlo";

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
  const [role, setRole] = useState(() => {
    const v = localStorage.getItem(AUTH_KEY);
    return v === "1" || v === "admin" ? "admin" : v === "nitesh" ? "nitesh" : null;
  });
  const authed = !!role;
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
    setRole(null);
    setOpenId(null);
  };

  if (!authed)
    return (
      <Shell>
        <Login
          onOk={(r) => {
            localStorage.setItem(AUTH_KEY, r);
            setRole(r);
          }}
        />
      </Shell>
    );

  if (role === "nitesh") return <SiteApp onLogout={logout} />;

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
    const i = id.trim();
    if (i === ADMIN_ID && pw === ADMIN_PASS) onOk("admin");
    else if (i === NV_ID && pw === NV_PASS) onOk("nitesh");
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

// ======================================================================
// નિતેશ સિસ્ટમ: સાઇટ → કર્મચારી (પહેલો હંમેશા Supervisor) → હાજરી કેલેન્ડર + ઉપાડ
// ======================================================================
const SITE_KEY = "site-data-v1";
const newEmp = (name, role = "emp") => ({ id: uid(), name, role, att: {}, upad: [] });
const num = (n) => Number(n || 0).toLocaleString("en-IN");
const upadSum = (arr, pre = "") =>
  arr.filter((u) => (u.date || "").startsWith(pre)).reduce((s, u) => s + Number(u.amount || 0), 0);

function loadSites() {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { sites: [] };
}

function SiteApp({ onLogout }) {
  const [data, setData] = useState(loadSites);
  const [sid, setSid] = useState(null);
  const [eid, setEid] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(SITE_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const upSite = (id, fn) =>
    setData((d) => ({ ...d, sites: d.sites.map((s) => (s.id === id ? fn(s) : s)) }));
  const upEmp = (siteId, empId, fn) =>
    upSite(siteId, (s) => ({ ...s, emps: s.emps.map((e) => (e.id === empId ? fn(e) : e)) }));

  const site = data.sites.find((s) => s.id === sid);
  const emp = site && site.emps.find((e) => e.id === eid);

  const addSite = (name, location) =>
    setData((d) => ({
      ...d,
      sites: [...d.sites, { id: uid(), name, location, emps: [newEmp("Supervisor", "sup")] }],
    }));

  const backup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-backup.json";
    a.click();
  };

  let body;
  if (site && emp)
    body = (
      <EmpPage
        site={site}
        emp={emp}
        onBack={() => setEid(null)}
        onChange={(fn) => upEmp(site.id, emp.id, fn)}
        onDelete={() => {
          if (window.confirm("આ કર્મચારીને કાઢી નાખવો?")) {
            upSite(site.id, (s) => ({ ...s, emps: s.emps.filter((e) => e.id !== emp.id) }));
            setEid(null);
          }
        }}
      />
    );
  else if (site)
    body = (
      <SitePage
        site={site}
        onBack={() => setSid(null)}
        onOpen={setEid}
        onChange={(fn) => upSite(site.id, fn)}
        onDelete={() => {
          if (window.confirm("આ સાઇટ અને તેના બધા કર્મચારી કાયમ માટે કાઢી નાખવા?")) {
            setData((d) => ({ ...d, sites: d.sites.filter((s) => s.id !== site.id) }));
            setSid(null);
          }
        }}
      />
    );
  else
    body = <SitesPage data={data} onOpen={setSid} onAdd={addSite} onLogout={onLogout} onBackup={backup} />;

  return (
    <div className="nv">
      <style>{nvCss}</style>
      {body}
    </div>
  );
}

function SitesPage({ data, onOpen, onAdd, onLogout, onBackup }) {
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const totalMp = data.sites.reduce((s, x) => s + x.emps.length, 0);
  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <div>
            <div className="sub">ડેશબોર્ડ</div>
            <div className="h1">Site Overview</div>
          </div>
          <button className="line-btn noprint" onClick={onLogout}>લૉગ આઉટ</button>
        </div>
      </div>

      <div className="cards">
        <div className="card"><small>કુલ સાઇટ</small><b>{data.sites.length}</b></div>
        <div className="card"><small>કુલ MP</small><b>{totalMp}</b></div>
      </div>

      <div className="sec">Site List</div>
      <div className="tbl">
        <div className="tr th"><span>Site Name</span><span>Location</span><span className="r">MP</span></div>
        {data.sites.map((s, i) => (
          <div key={s.id} className={"tr " + (i % 2 ? "odd" : "even") + " click"} onClick={() => onOpen(s.id)}>
            <b>{s.name}</b>
            <span className="loc">{s.location || "—"}</span>
            <span className="r"><span className="mp">{s.emps.length}</span></span>
          </div>
        ))}
        {data.sites.length > 0 && (
          <div className="tr th tot"><span>કુલ</span><span></span><span className="r">{totalMp}</span></div>
        )}
      </div>
      {data.sites.length === 0 && <p className="mut pad">હજી કોઈ સાઇટ નથી. નીચેથી પહેલી સાઇટ ઉમેરો.</p>}
      <p className="mut pad">MP = કર્મચારીઓની સંખ્યા (Manpower). સાઇટ પર ટેપ કરો તો કર્મચારી ખુલશે.</p>

      <div className="form">
        <b>+ નવી સાઇટ</b>
        <input placeholder="Site Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
        <button
          onClick={() => {
            if (!name.trim()) return;
            onAdd(name.trim(), loc.trim());
            setName("");
            setLoc("");
          }}
        >
          ઉમેરો
        </button>
      </div>

      <div className="rowb noprint">
        <button className="line-btn dark" onClick={() => window.print()}>🖨 PDF / પ્રિન્ટ</button>
        <button className="line-btn dark" onClick={onBackup}>💾 બેકઅપ</button>
      </div>
    </>
  );
}

function SitePage({ site, onBack, onOpen, onChange, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const today = iso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const presentToday = site.emps.filter((e) => e.att[today] === "P").length;

  const addEmp = () => {
    if (!name.trim()) return;
    onChange((s) => ({ ...s, emps: [...s.emps, newEmp(name.trim())] }));
    setName("");
  };
  const removeEmp = (e) => {
    if (e.role === "sup") return;
    if (window.confirm(e.name + " ને કાઢી નાખવો?"))
      onChange((s) => ({ ...s, emps: s.emps.filter((x) => x.id !== e.id) }));
  };

  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <button className="back" onClick={onBack}>← Site List</button>
          <button className="line-btn noprint" onClick={() => setEdit(!edit)}>✎ સુધારો</button>
        </div>
        <div className="h1">{site.name}</div>
        <div className="sub">{site.location || "Location નથી"}</div>
      </div>

      {edit && (
        <div className="form">
          <input placeholder="Site Name" value={site.name} onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))} />
          <input placeholder="Location" value={site.location} onChange={(e) => onChange((s) => ({ ...s, location: e.target.value }))} />
          <button className="danger" onClick={onDelete}>આ સાઇટ કાઢી નાખો</button>
        </div>
      )}

      <div className="cards">
        <div className="card"><small>કુલ MP</small><b>{site.emps.length}</b></div>
        <div className="card"><small>આજે હાજર</small><b className="g">{presentToday}</b></div>
      </div>

      <div className="sec">Employees</div>
      <div className="pad">
        {site.emps.map((e, i) => {
          const st = e.att[today];
          return (
            <div key={e.id} className={"emp " + (e.role === "sup" ? "sup" : i % 2 ? "odd" : "even")}>
              <div className="empmain" onClick={() => onOpen(e.id)}>
                <span className="no">{i + 1}</span>
                <b>{e.name || "(નામ નથી)"}</b>
                {e.role === "sup" && <span className="badge">Supervisor</span>}
                <span className={"st " + (st || "n")}>{st === "P" ? "હાજર" : st === "A" ? "ગેરહાજર" : "—"}</span>
              </div>
              {e.role !== "sup" && (
                <button className="x noprint" aria-label="કાઢી નાખો" onClick={() => removeEmp(e)}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="form noprint">
        <b>+ નવો કર્મચારી</b>
        <div className="rowb">
          <input placeholder="કર્મચારીનું નામ" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmp()} />
          <button style={{ width: "auto" }} onClick={addEmp}>ઉમેરો</button>
        </div>
      </div>
      <p className="mut pad">Supervisor હંમેશા પહેલો રહેશે અને કાઢી શકાશે નહીં. કર્મચારી પર ટેપ કરો તો હાજરી કેલેન્ડર ખુલશે.</p>
    </>
  );
}

function EmpPage({ site, emp, onBack, onChange, onDelete }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(iso(now.getFullYear(), now.getMonth(), now.getDate()));
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(false);

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const prefix = `${ym.y}-${pad(ym.m + 1)}`;
  const first = new Date(ym.y, ym.m, 1).getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const upByDate = useMemo(() => {
    const o = {};
    emp.upad.forEach((u) => {
      if (u.date) o[u.date] = (o[u.date] || 0) + Number(u.amount || 0);
    });
    return o;
  }, [emp.upad]);

  const monthKeys = Object.keys(emp.att).filter((k) => k.startsWith(prefix));
  const present = monthKeys.filter((k) => emp.att[k] === "P").length;
  const absent = monthKeys.filter((k) => emp.att[k] === "A").length;
  const monthUpad = upadSum(emp.upad, prefix);
  const monthList = emp.upad.filter((u) => (u.date || "").startsWith(prefix)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const dayUpad = emp.upad.filter((u) => u.date === sel);
  const status = emp.att[sel];

  const go = (delta) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
    setSel(iso(d.getFullYear(), d.getMonth(), 1));
  };
  const setAtt = (val) =>
    onChange((e) => {
      const att = { ...e.att };
      if (val) att[sel] = val;
      else delete att[sel];
      return { ...e, att };
    });
  const addUpad = () => {
    const a = Number(amt);
    if (!a) return;
    onChange((e) => ({ ...e, upad: [...e.upad, { id: uid(), date: sel, amount: a, note: note.trim() }] }));
    setAmt("");
    setNote("");
  };
  const editUpad = (id, patch) =>
    onChange((e) => ({ ...e, upad: e.upad.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  const delUpad = (id) => onChange((e) => ({ ...e, upad: e.upad.filter((u) => u.id !== id) }));

  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <button className="back" onClick={onBack}>← {site.name}</button>
          <button className="line-btn noprint" onClick={() => setEdit(!edit)}>✎ સુધારો</button>
        </div>
        <div className="h1">{emp.name || "(નામ નથી)"}</div>
        <div className="sub">{site.name}{site.location ? " · " + site.location : ""}{emp.role === "sup" ? " · Supervisor" : ""}</div>
      </div>

      {edit && (
        <div className="form">
          <input placeholder="નામ" value={emp.name} onChange={(e) => onChange((x) => ({ ...x, name: e.target.value }))} />
          {emp.role !== "sup" && <button className="danger" onClick={onDelete}>આ કર્મચારી કાઢી નાખો</button>}
        </div>
      )}

      <div className="cards three">
        <div className="card"><small>હાજર</small><b className="g">{present}</b></div>
        <div className="card"><small>ગેરહાજર</small><b className="rd">{absent}</b></div>
        <div className="card"><small>આ મહિનાનો ઉપાડ</small><b>{num(monthUpad)}</b></div>
      </div>

      <div className="calnav">
        <button className="sq" aria-label="પાછલો મહિનો" onClick={() => go(-1)}>‹</button>
        <b>{MONTHS[ym.m]} {ym.y}</b>
        <button className="sq" aria-label="આવતો મહિનો" onClick={() => go(1)}>›</button>
      </div>

      <div className="calgrid">
        {DAYS.map((d) => <div key={d} className="dn">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={"e" + i} />;
          const key = iso(ym.y, ym.m, d);
          const st = emp.att[key];
          return (
            <div
              key={key}
              className={"cd " + (st === "P" ? "p" : st === "A" ? "a" : "n") + (key === sel ? " sel" : "") + (key === todayIso ? " today" : "")}
              onClick={() => setSel(key)}
            >
              <b>{d}</b>
              {upByDate[key] ? <em>{num(upByDate[key])}</em> : null}
              {st && <i>{st}</i>}
            </div>
          );
        })}
      </div>
      <div className="legend pad">
        <span><b className="g">■</b> P = હાજર</span>
        <span><b className="rd">■</b> A = ગેરહાજર</span>
        <span><b className="y">પીળી રકમ</b> = ઉપાડ</span>
      </div>

      <div className="form">
        <b>📅 {fmtDate(sel)}</b>
        <div className="rowb noprint">
          <button className={"pa p" + (status === "P" ? " on" : "")} onClick={() => setAtt("P")}>હાજર</button>
          <button className={"pa a" + (status === "A" ? " on" : "")} onClick={() => setAtt("A")}>ગેરહાજર</button>
          <button className="pa c" onClick={() => setAtt(null)}>ભૂંસો</button>
        </div>
        <div className="sub2">આ તારીખનો ઉપાડ: {num(upadSum(dayUpad))}</div>
        {dayUpad.map((u) => (
          <div key={u.id} className="rowb up">
            <input type="number" inputMode="numeric" value={u.amount} onChange={(e) => editUpad(u.id, { amount: e.target.value })} style={{ flex: 1 }} />
            <input placeholder="વિગત" value={u.note || ""} onChange={(e) => editUpad(u.id, { note: e.target.value })} style={{ flex: 1.4 }} />
            <button className="x noprint" aria-label="કાઢી નાખો" onClick={() => delUpad(u.id)}>✕</button>
          </div>
        ))}
        <div className="rowb noprint">
          <input type="number" inputMode="numeric" placeholder="ઉપાડ રકમ" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ flex: 1 }} />
          <input placeholder="વિગત (વૈકલ્પિક)" value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1.4 }} />
        </div>
        <button className="noprint" onClick={addUpad}>{fmtDate(sel)} નો ઉપાડ ઉમેરો</button>
      </div>

      <div className="sec">ઉપાડ (Upad) — {MONTHS[ym.m]}</div>
      <div className="pad">
        {monthList.length === 0 && <p className="mut">આ મહિનામાં કોઈ ઉપાડ નથી.</p>}
        {monthList.map((u) => (
          <div key={u.id} className="uprow" onClick={() => setSel(u.date)}>
            <div><b>{fmtDate(u.date)}</b>{u.note && <small> · {u.note}</small>}</div>
            <b>{num(u.amount)}</b>
          </div>
        ))}
        <div className="uprow tot"><b>કુલ (આ મહિનો)</b><b>{num(monthUpad)}</b></div>
        <div className="uprow tot"><b>કુલ ઉપાડ (બધા મહિના)</b><b>{num(upadSum(emp.upad))}</b></div>
      </div>
    </>
  );
}

const nvCss = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#E4EAF4;font-family:"Hind Vadodara",sans-serif;color:#0B2545}
.nv{max-width:520px;margin:0 auto;min-height:100vh;background:#F3F6FB;padding-bottom:40px;box-shadow:0 0 18px #0002}
.nv .hd{background:#0B2545;color:#fff;padding:20px 16px 16px}
.nv .hdrow{display:flex;justify-content:space-between;align-items:center;gap:8px}
.nv .h1{font-size:26px;font-weight:700;color:#fff;margin-top:4px}
.nv .sub{font-size:14px;color:#9DB8E6}
.nv .sub2{font-size:14px;color:#5A6B86;margin:10px 0 4px}
.nv .back{width:auto;background:transparent;color:#9DB8E6;padding:6px 0;margin:0;font-size:15px;font-weight:600}
.nv button{padding:11px 14px;border:0;border-radius:10px;background:#0B2545;color:#fff;font-size:16px;font-weight:600;width:100%;margin-top:8px;font-family:inherit;min-height:44px}
.nv button.line-btn{width:auto;margin:0;background:transparent;color:#fff;border:1px solid #5B7DB8;font-size:14px;padding:8px 14px;min-height:40px}
.nv button.line-btn.dark{color:#0B2545;border-color:#0B2545}
.nv button.danger{background:#B3261E}
.nv button.x{width:44px;margin:0;background:transparent;color:#FF9C94;font-size:22px;padding:0}
.nv .form button.x{color:#B3261E}
.nv button.sq{width:44px;margin:0;background:#fff;color:#0B2545;border:1px solid #BCC9DE;font-size:22px;padding:0}
.nv input{width:100%;height:46px;border:1px solid #BCC9DE;border-radius:10px;padding:0 12px;font-size:16px;margin:4px 0;background:#fff;color:#0B2545;font-family:inherit}
.nv input:focus{outline:2px solid #5B8DEF;border-color:#5B8DEF}
.nv .cards{display:flex;gap:10px;padding:16px 16px 4px}
.nv .card{flex:1;background:#fff;border:1px solid #D5DEEC;border-radius:14px;padding:10px 14px}
.nv .card small{display:block;font-size:12px;color:#5A6B86}
.nv .card b{font-size:28px;color:#0B2545}
.nv .cards.three .card{padding:8px 10px}
.nv .cards.three .card b{font-size:24px}
.nv .g{color:#1E7A45}.nv .rd{color:#B3261E}.nv .y{color:#B48A00}
.nv .sec{font-size:18px;font-weight:700;padding:14px 16px 8px}
.nv .pad{padding:0 16px}
.nv .mut{color:#5A6B86;font-size:13px}
.nv small{color:#5A6B86}
.nv .tbl{margin:0 16px;border-radius:14px;overflow:hidden;border:1px solid #0B2545}
.nv .tr{display:grid;grid-template-columns:1.1fr 1.3fr 60px;align-items:center;gap:8px;padding:13px 16px;color:#fff;font-size:16px}
.nv .tr.th{background:#06172E;font-size:14px;font-weight:700;color:#9DB8E6;letter-spacing:.5px}
.nv .tr.tot{border-top:2px solid #5B8DEF;color:#fff;font-size:17px}
.nv .tr.even{background:#0F2F5C}.nv .tr.odd{background:#143A70}
.nv .tr.click{cursor:pointer}.nv .tr.click:active{background:#1B4F9C}
.nv .loc{color:#C9D8F2}
.nv .r{justify-self:end;text-align:right}
.nv .mp{display:inline-block;min-width:44px;text-align:center;border-radius:20px;padding:2px 10px;font-weight:700;background:#DCE8FF;color:#0B2545}
.nv .form{margin:14px 16px;background:#fff;border:1px solid #D5DEEC;border-radius:14px;padding:12px}
.nv .rowb{display:flex;gap:8px;align-items:center}
.nv .rowb button{margin-top:4px}
.nv .rowb.noprint:last-child{margin:0 16px}
.nv .emp{display:flex;align-items:center;border-radius:12px;color:#fff;margin-bottom:8px}
.nv .emp.even{background:#0F2F5C}.nv .emp.odd{background:#143A70}.nv .emp.sup{background:#1B4F9C}
.nv .empmain{flex:1;display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;min-height:48px;min-width:0}
.nv .empmain b{font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nv .no{width:30px;height:30px;flex:none;border-radius:50%;background:#DCE8FF;color:#0B2545;font-weight:700;display:flex;align-items:center;justify-content:center}
.nv .badge{background:#F2C14E;color:#3A2C06;font-size:12px;font-weight:700;border-radius:10px;padding:2px 10px;flex:none}
.nv .st{margin-left:auto;font-size:12px;font-weight:700;border-radius:10px;padding:2px 8px;flex:none}
.nv .st.P{background:#1E7A45;color:#fff}.nv .st.A{background:#B3261E;color:#fff}.nv .st.n{color:#9DB8E6}
.nv .calnav{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 8px;font-size:20px}
.nv .calgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;padding:0 14px}
.nv .dn{text-align:center;font-size:12px;color:#5A6B86;font-weight:600}
.nv .cd{min-height:54px;border-radius:8px;border:1px solid #D5DEEC;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;cursor:pointer;color:#0B2545;padding:2px}
.nv .cd b{font-size:16px}
.nv .cd em{font-style:normal;font-size:10px;font-weight:700;color:#8A5A00}
.nv .cd i{font-style:normal;font-size:9px;opacity:.9}
.nv .cd.p{background:#1E7A45;border-color:#1E7A45;color:#fff}
.nv .cd.a{background:#B3261E;border-color:#B3261E;color:#fff}
.nv .cd.p em,.nv .cd.a em{color:#FFE08A}
.nv .cd.today{box-shadow:inset 0 0 0 2px #F2C14E}
.nv .cd.sel{outline:3px solid #0B2545;outline-offset:2px}
.nv .legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:13px;color:#2B3A55}
.nv .pa{margin-top:10px!important}
.nv .pa.p{background:#DCEFE4;color:#1E7A45;border:2px solid #1E7A45}.nv .pa.p.on{background:#1E7A45;color:#fff}
.nv .pa.a{background:#F8DEDC;color:#B3261E;border:2px solid #B3261E}.nv .pa.a.on{background:#B3261E;color:#fff}
.nv .pa.c{background:#DCE8FF;color:#0B2545}
.nv .up input{margin:4px 0}
.nv .uprow{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #D5DEEC;border-radius:12px;padding:10px 14px;margin-bottom:8px;cursor:pointer}
.nv .uprow.tot{background:#0B2545;color:#fff;cursor:default}
@media print{body{background:#fff}.nv{box-shadow:none}.noprint{display:none!important}}
`;
