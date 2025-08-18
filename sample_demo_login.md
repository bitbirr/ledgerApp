import React, { useMemo, useState } from "react";

/**
 * LedgerFlow Tenant Login Demo — Business → Branch → Credentials
 * - Green/teal navbar with white text + hover underline
 * - Artistic gradient background (no images)
 * - Step-based flow enforcing tenant scope
 * - Client-side validation to mimic server rules
 *
 * Note: This is a self‑contained demo (no external UI libs). Tailwind classes are used for styling.
 */

// --- Mock Data (replace with API calls in production) ---
const BUSINESSES = [
  { id: "biz-1", name: "Hajjelec Trading PLC" },
  { id: "biz-2", name: "Blue Nile Retail" },
];

const BRANCHES = [
  { id: "br-1", businessId: "biz-1", name: "Main Branch" },
  { id: "br-2", businessId: "biz-1", name: "Warehouse" },
  { id: "br-3", businessId: "biz-2", name: "Bole" },
];

const USERS = [
  { id: "u-1", username: "admin@hajjelec.com", password: "admin123", businessId: "biz-1", branchId: "br-1", role: "admin" },
  { id: "u-2", username: "staff@hajjelec.com", password: "staff123", businessId: "biz-1", branchId: "br-2", role: "staff" },
  { id: "u-3", username: "owner@bluenile.com", password: "owner123", businessId: "biz-2", branchId: "br-3", role: "owner" },
];

function encodeFakeJWT(claims: Record<string, any>) {
  const base64 = (obj: any) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  return `${base64({ alg: "none", typ: "JWT" })}.${base64(claims)}.`;
}

// --- Small UI helpers ---
const BrandNavbar = () => (
  <div className="sticky top-0 z-10 border-b border-white/10 bg-emerald-600/95 text-white backdrop-blur">
    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/15" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"/></svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">LedgerFlow</span>
      </div>
      <nav className="hidden gap-6 md:flex">
        {["Dashboard","Accounts","Cashbook","Settings"].map((label)=> (
          <a key={label} href="#" className="group relative text-sm text-white/90 transition-colors hover:text-white">
            {label}
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white/70 transition-all group-hover:w-full"/>
          </a>
        ))}
      </nav>
      <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10">Help</button>
    </div>
  </div>
);

const Backdrop = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#14b8a6_0deg,#059669_140deg,#1e3a8a_260deg,#f59e0b_340deg)]"/>
    <div className="absolute inset-0 mix-blend-overlay opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_40%,#000,transparent_70%)]" style={{
      backgroundImage:
        "radial-gradient(40rem_30rem_at_20%_10%,rgba(255,255,255,.08),transparent),radial-gradient(50rem_40rem_at_80%_30%,rgba(255,255,255,.08),transparent),radial-gradient(60rem_40rem_at_50%_80%,rgba(255,255,255,.10),transparent)",
    }}/>
  </div>
);

const Card: React.FC<React.PropsWithChildren<{title?: string; subtitle?: string; icon?: React.ReactNode;}>> = ({children, title, subtitle, icon}) => (
  <div className="mx-auto w-full max-w-xl rounded-2xl border bg-white/90 p-6 shadow-xl backdrop-blur">
    <div className="mb-4 text-center">
      <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600/10 text-emerald-700">{icon ?? (
        <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 2l9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9l9-7z"/></svg>
      )}</div>
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "solid"|"outline"|"ghost"}> = ({variant="solid", className="", ...props}) => {
  const cls = variant === "solid"
    ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
    : variant === "outline"
      ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100"
      : "text-emerald-700 hover:bg-emerald-50";
  return <button {...props} className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${cls} ${className}`}/>;
};

function ErrorMsg({msg}:{msg?:string}){ return msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null; }

// --- Main Component ---
export default function App(){
  const [step, setStep] = useState<0|1|2|3>(0); // 0 Business, 1 Branch, 2 Credentials, 3 Success
  const [businessId, setBusinessId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [token, setToken] = useState<string | null>(null);

  const branchesForBiz = useMemo(() => BRANCHES.filter(b => b.businessId === businessId), [businessId]);
  const selectedBusiness = BUSINESSES.find(b => b.id === businessId);

  function nextFromBusiness(){
    setError(undefined);
    if(!businessId) return setError("Please select your business to continue.");
    setStep(1);
  }

  function nextFromBranch(){
    setError(undefined);
    if(!branchId) return setError("Please choose a branch.");
    const ok = BRANCHES.some(b => b.id === branchId && b.businessId === businessId);
    if(!ok) return setError("Selected branch does not belong to the chosen business.");
    setStep(2);
  }

  function submitCredentials(e: React.FormEvent){
    e.preventDefault();
    setError(undefined);
    // server-like checks
    if(!username || !password) return setError("Enter username and password.");

    const user = USERS.find(u => u.username.toLowerCase() === username.toLowerCase() && u.businessId === businessId);
    if(!user) return setError("Invalid credentials for this business.");
    if(user.password !== password) return setError("Invalid username or password.");
    if(user.branchId && user.branchId !== branchId) return setError("User is not permitted for this branch.");

    // success → issue fake token
    const jwt = encodeFakeJWT({ sub: user.id, role: user.role, businessId, branchId, iat: Math.floor(Date.now()/1000) });
    setToken(jwt);
    setStep(3);
  }

  return (
    <div className="min-h-screen">
      <Backdrop/>
      <BrandNavbar/>

      <div className="mx-auto grid max-w-5xl place-items-center px-4 py-10">
        {step===0 && (
          <Card title="Select Your Business" subtitle="Choose the tenant you belong to" icon={<BuildingIcon/>}>
            <div className="space-y-3">
              {BUSINESSES.map((biz)=> (
                <button key={biz.id} onClick={()=> setBusinessId(biz.id)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:bg-emerald-50 ${businessId===biz.id?"border-emerald-600 bg-emerald-50":"border-slate-200"}`}>
                  <div>
                    <div className="font-medium">{biz.name}</div>
                    <div className="text-xs text-slate-500">ID: {biz.id}</div>
                  </div>
                  {businessId===biz.id && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Selected</span>}
                </button>
              ))}
              <ErrorMsg msg={error}/>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-600">Step 1 of 3</span>
                <Button onClick={nextFromBusiness} className="min-w-[120px]">Continue</Button>
              </div>
            </div>
          </Card>
        )}

        {step===1 && (
          <Card title="Select Branch" subtitle={selectedBusiness? selectedBusiness.name : "Choose a business first"} icon={<StoreIcon/>}>
            <div className="space-y-3">
              {branchesForBiz.length===0 && (
                <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">No branches found for this business.</div>
              )}
              {branchesForBiz.map((br)=> (
                <button key={br.id} onClick={()=> setBranchId(br.id)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:bg-emerald-50 ${branchId===br.id?"border-emerald-600 bg-emerald-50":"border-slate-200"}`}>
                  <div>
                    <div className="font-medium">{br.name}</div>
                    <div className="text-xs text-slate-500">ID: {br.id}</div>
                  </div>
                  {branchId===br.id && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Selected</span>}
                </button>
              ))}
              <ErrorMsg msg={error}/>
              <div className="mt-2 flex items-center justify-between">
                <Button variant="ghost" onClick={()=> setStep(0)} className="text-emerald-700">Back</Button>
                <Button onClick={nextFromBranch} className="min-w-[120px]">Continue</Button>
              </div>
            </div>
          </Card>
        )}

        {step===2 && (
          <Card title="Sign In" subtitle="Enter your credentials" icon={<LockIcon/>}>
            <form onSubmit={submitCredentials} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Username / Email</label>
                <input value={username} onChange={(e)=> setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="admin@hajjelec.com" autoComplete="username"/>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input type="password" value={password} onChange={(e)=> setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="••••••••" autoComplete="current-password"/>
                <div className="mt-1 text-xs text-slate-500">Business: <span className="font-medium">{selectedBusiness?.name}</span> · Branch: <span className="font-medium">{BRANCHES.find(b=>b.id===branchId)?.name}</span></div>
              </div>
              <ErrorMsg msg={error}/>
              <div className="mt-2 flex items-center justify-between">
                <Button variant="ghost" onClick={()=> setStep(1)} className="text-emerald-700">Back</Button>
                <Button type="submit" className="min-w-[120px]">Sign In</Button>
              </div>
            </form>
          </Card>
        )}

        {step===3 && (
          <Card title="Authenticated" subtitle="Tenant checks passed" icon={<CheckIcon/>}>
            <div className="space-y-3">
              <div className="rounded-xl border bg-emerald-50 p-4 text-sm">
                <div className="font-medium text-emerald-800">JWT (demo):</div>
                <code className="block break-all text-xs text-emerald-800/90">{token}</code>
              </div>
              <ul className="list-inside list-disc text-sm text-slate-700">
                <li>All API calls must include this token. Server validates <b>businessId</b> and <b>branchId</b> in claims.</li>
                <li>Queries are always scoped by <b>businessId</b> (and <b>branchId</b> where relevant).</li>
              </ul>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={()=> { setStep(0); setBusinessId(""); setBranchId(""); setUsername(""); setPassword(""); setToken(null); }}>Restart</Button>
                <Button onClick={()=> alert("Navigate to Dashboard… (wire your router here)")}>Continue to Dashboard</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Icons ---
function BuildingIcon(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16h-3v-4H6v4H3zm15 0V9h3v12h-3zM6 7h2v2H6V7zm0 4h2v2H6v-2zm5-4h2v2h-2V7zm0 4h2v2h-2v-2z"/></svg>
  );
}
function StoreIcon(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3 9l1-5h16l1 5H3zm1 2h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9zm3 2v6h2v-6H7zm4 0v6h2v-6h-2z"/></svg>
  );
}
function LockIcon(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1zm2 0h8V8a4 4 0 0 0-8 0v2z"/></svg>
  );
}
function CheckIcon(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M9 16.17l-3.88-3.88L3.7 13.7 9 19l12-12-1.41-1.41z"/></svg>
  );
}
