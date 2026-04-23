import { useEffect, useState } from "react";
import { Link, Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, Box, CheckCircle2, ChevronRight,
  ClipboardCheck, Gauge, Home, LayoutDashboard, Lock, LogOut,
  Menu, RadioTower, ShieldCheck, Sparkles, Thermometer, User, Waves, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const queryClient = new QueryClient();

// ─── TYPES ────────────────────────────────────────────────────────────────────
type User = { id: number; name: string; email: string; company: string; role: string };
type Shipment = {
  id: number; userId: number; unitId: string; cargo: string; origin: string;
  destination: string; route: string; status: string; temp: number; humidity: number;
  ethylene: number; co2: number; eta: string; health: number; departure: string;
  arrival: string; duration: string; compliance: string;
  shelfLifeTotal: number; shelfLifeRemaining: number;
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── AUTH HOOK ────────────────────────────────────────────────────────────────
function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("kryo:token"));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem("kryo:user");
    return u ? JSON.parse(u) : null;
  });

  const login = async (email: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("kryo:token", data.token);
    localStorage.setItem("kryo:user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
    return data.user;
  };

  const signup = async (form: { name: string; email: string; password: string; company: string; phone: string }) => {
    const data = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });
    localStorage.setItem("kryo:token", data.token);
    localStorage.setItem("kryo:user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast({ title: "Account created!", description: "Welcome to KRYO." });
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("kryo:token");
    localStorage.removeItem("kryo:user");
    setToken(null);
    setUser(null);
  };

  return { token, user, login, signup, logout, isAdmin: user?.role === "admin" };
}

// ─── SHIPMENTS HOOK ───────────────────────────────────────────────────────────
function useShipments(token: string | null) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch("/shipments", {}, token)
      .then(setShipments)
      .catch(() => toast({ title: "Failed to load shipments", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [token]);

  return { shipments, loading };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("k-panel", className)}>{children}</div>;
}

function StatusDot({ severity = "safe" }: { severity?: "safe" | "warn" | "danger" }) {
  return <span className={cx("status-dot", severity === "warn" && "warn", severity === "danger" && "danger")} />;
}

function KInput({ label, type = "text", value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">{label}</span>
      <input className="k-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell({ children, user, isAdmin, logout }: {
  children: React.ReactNode; user: User | null; isAdmin: boolean; logout: () => void;
}) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", show: true },
    { href: "/dashboard", label: "Dashboard", show: !!user },
    { href: "/contact", label: "Contact", show: true },
    { href: "/demo", label: "Request Demo", show: true },
    { href: "/admin", label: "Admin", show: isAdmin },
  ];

  return (
    <div className="k-app min-h-screen text-[#e9fff4]">
      <div className="noise" />
      <div className="scanline" />
      <header className="sticky top-0 z-40 border-b border-[#123624] bg-[#041009]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1220px] items-center justify-between px-5 py-4 md:px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="font-black tracking-tight text-white">KRYO</div>
            <div className="h-3 w-px bg-[#1b3f2d]" />
            <div className="font-mono text-[9px] uppercase tracking-[0.38em] text-[#84b899]">Mission Control</div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.filter(l => l.show).map(({ href, label }) => (
              <Link key={href} href={href} className={cx("nav-pill", (href === "/" ? location === "/" : location.startsWith(href)) && "active")}>
                {label}
              </Link>
            ))}
            {user
              ? <button onClick={logout} className="nav-pill"><LogOut size={14} />Logout</button>
              : <Link href="/login" className={cx("nav-pill", location === "/login" && "active")}><User size={14} />Login</Link>}
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{background:'transparent', border:'1px solid rgba(34,255,153,0.3)', padding:'8px', color:'#22ff99', cursor:'pointer'}}>
  {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-[#123624] bg-[#041009]/95 md:hidden">
            <div className="flex flex-col px-5 py-4 gap-2">
              {links.filter(l => l.show).map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className={cx("nav-pill w-full justify-center", (href === "/" ? location === "/" : location.startsWith(href)) && "active")}>
                  {label}
                </Link>
              ))}
              {user
                ? <button onClick={() => { logout(); setMenuOpen(false); }} className="nav-pill w-full justify-center"><LogOut size={14} />Logout</button>
                : <Link href="/login" onClick={() => setMenuOpen(false)} className="nav-pill w-full justify-center"><User size={14} />Login</Link>}
              {user && <div className="mt-2 text-center font-mono text-[10px] text-[#22ff99]">Logged in as {user.name}</div>}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-[1220px] px-4 py-6 md:px-7 md:py-9">{children}</main>
    </div>
  );
}

function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#0f2d1d] pb-7 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[#55d58d]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <section className="relative overflow-hidden pb-12 pt-5 md:pt-16">
      <div className="hero-grid" />
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <div className="chip mb-8"><StatusDot />Molecular Surveillance Platform</div>
          <h1 className="max-w-2xl text-6xl font-black leading-[0.98] tracking-[-0.07em] text-white md:text-7xl lg:text-8xl">
            AI-Native Cold Chain <span className="neon-text">Intelligence</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#a8b9ad]">
            Real-time molecular monitoring for pharmaceutical cold chains and perishable cargo. FT-NIR spectroscopy meets predictive AI. Never lose another shipment to spoilage.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup" className="primary-btn">Start Free Trial <ChevronRight size={17} /></Link>
            <Link href="/demo" className="secondary-btn">Request Demo</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-[#95aa9b]">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#22ff99]" />WHO PQS Certified</span>
            <span className="flex items-center gap-2"><RadioTower size={16} className="text-cyan-300" />ISO 9001:2015</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#22ff99]" />HIPAA Compliant</span>
          </div>
        </div>
        <div className="relative mx-auto h-[430px] w-full max-w-[470px]">
          <div className="live-card absolute inset-0">
            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
            <div className="active-pill"><StatusDot />Live</div>
            <div className="sensor-field">
              <div className="pulse-core" />
              <div className="metric-tile absolute left-[12%] top-[34%]"><div>TEMP</div><strong>2.4°C</strong></div>
              <div className="metric-tile absolute right-[6%] top-[43%]"><div>ETHYLENE</div><strong>8 PPM</strong></div>
              <div className="metric-tile absolute left-[9%] bottom-[23%]"><div>SHELF LIFE</div><strong>14d 6h</strong></div>
              <div className="metric-tile absolute right-[9%] bottom-[16%]"><div>HUMIDITY</div><strong>65%</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-6 border-t border-[#0f2d1d] pt-8 md:grid-cols-4">
        {[["12K+", "Sensors Deployed"], ["98.7%", "Compliance Rate"], ["$45M", "Cargo Protected"], ["24/7", "Live Monitoring"]].map(([v, l]) => (
          <div key={l} className="text-center">
            <div className="text-4xl font-light tracking-tight text-[#22ff99]">{v}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#789184]">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────
function SignupPage({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signup(form);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-12">
      <Panel className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Start Free Trial</h1>
          <p className="mt-1 text-sm text-[#8fa597]">Create your KRYO account and monitor your cold chain in real time.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <KInput label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="John Smith" />
          <KInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="john@company.com" />
          <KInput label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Min 8 characters" />
          <KInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Pharma Ltd." />
          <KInput label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : <><Sparkles size={16} />Create Account</>}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[#7a9186]">Already have an account? <Link href="/login" className="text-link">Login</Link></p>
      </Panel>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await auth.login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-12">
      <Panel className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <Lock className="text-[#22ff99]" />
          <div>
            <h1 className="text-2xl font-black text-white">Login</h1>
            <p className="text-sm text-[#8fa597]">Access your KRYO dashboard.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <KInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
          <KInput label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : <><Lock size={16} />Login</>}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[#7a9186]">No account? <Link href="/signup" className="text-link">Start free trial</Link></p>
      </Panel>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/inquiries", { method: "POST", body: JSON.stringify({ ...form, type: "inquiry" }) });
      setDone(true);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="mx-auto max-w-md pt-12 text-center">
      <CheckCircle2 size={48} className="mx-auto text-[#22ff99]" />
      <h2 className="mt-4 text-2xl font-black text-white">Message Received</h2>
      <p className="mt-2 text-[#8fa597]">We'll get back to you within 24 hours.</p>
      <Link href="/" className="primary-btn mt-6 inline-flex">Back to Home</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-lg pt-8">
      <PageTitle title="Contact Us" subtitle="Get in touch with the KRYO team." />
      <Panel className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <KInput label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="John Smith" />
            <KInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="john@company.com" />
            <KInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Pharma Ltd." />
            <KInput label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
          </div>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Message</span>
            <textarea className="k-input min-h-[120px] resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your cold chain needs..." />
          </label>
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </Panel>
    </div>
  );
}

// ─── DEMO REQUEST PAGE ────────────────────────────────────────────────────────
function DemoPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/inquiries", { method: "POST", body: JSON.stringify({ ...form, type: "demo", message: form.message || "Demo request" }) });
      setDone(true);
      toast({ title: "Demo requested!", description: "Our team will schedule a call with you shortly." });
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="mx-auto max-w-md pt-12 text-center">
      <Sparkles size={48} className="mx-auto text-[#22ff99]" />
      <h2 className="mt-4 text-2xl font-black text-white">Demo Requested!</h2>
      <p className="mt-2 text-[#8fa597]">Our team will reach out within 1 business day to schedule your demo.</p>
      <Link href="/" className="primary-btn mt-6 inline-flex">Back to Home</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-lg pt-8">
      <PageTitle title="Request a Demo" subtitle="See KRYO in action with a live walkthrough from our team." />
      <Panel className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <KInput label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="John Smith" />
            <KInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="john@company.com" />
            <KInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Pharma Ltd." />
            <KInput label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
          </div>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">What are you monitoring?</span>
            <textarea className="k-input min-h-[100px] resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="e.g. Pharmaceutical vaccines, perishable produce, biologics..." />
          </label>
          <button className="primary-btn w-full" type="submit" disabled={loading}>
            {loading ? "Submitting..." : <><Sparkles size={16} />Request Demo</>}
          </button>
        </form>
      </Panel>
    </div>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function DashboardPage({ token }: { token: string | null }) {
  const { shipments, loading } = useShipments(token);
  const telemetry = [
    { time: "00:00", temperature: 2.1, humidity: 63, ethylene: 5 },
    { time: "04:00", temperature: 2.3, humidity: 64, ethylene: 6 },
    { time: "08:00", temperature: 2.2, humidity: 66, ethylene: 7 },
    { time: "12:00", temperature: 2.4, humidity: 65, ethylene: 8 },
    { time: "16:00", temperature: 2.5, humidity: 67, ethylene: 8.4 },
    { time: "20:00", temperature: 2.4, humidity: 65, ethylene: 8 },
  ];

  if (loading) return <div className="py-24 text-center text-[#22ff99] font-mono">Loading shipments...</div>;

  return (
    <div>
      <PageTitle title="My Dashboard" subtitle="Monitor your cold chain shipments in real time" action={<div className="live-monitor"><StatusDot />Live Monitoring</div>} />
      {shipments.length === 0 ? (
        <Panel className="p-12 text-center">
          <Box size={48} className="mx-auto text-[#22ff99] opacity-40" />
          <h2 className="mt-4 text-xl font-bold text-white">No shipments yet</h2>
          <p className="mt-2 text-[#8fa597]">Your shipments will appear here once assigned by the KRYO team.</p>
          <Link href="/contact" className="primary-btn mt-6 inline-flex">Contact Us</Link>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatCard icon={Box} value={shipments.length.toString()} unit="UNITS" label="Your Shipments" />
            <StatCard icon={Thermometer} value={(shipments.reduce((s, x) => s + x.temp, 0) / shipments.length).toFixed(1)} unit="°C" label="Avg Temperature" />
            <StatCard icon={AlertTriangle} value={shipments.filter(s => s.status === "Alert").length.toString()} unit="ALERTS" label="Active Alerts" />
            <StatCard icon={Activity} value={(shipments.reduce((s, x) => s + x.health, 0) / shipments.length).toFixed(1)} unit="%" label="Fleet Health" />
          </div>
          <Panel className="mb-6 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Telemetry — Last 24 Hours</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={telemetry} margin={{ left: -20, right: 15, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#103321" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#63806f" tick={{ fontSize: 11 }} />
                <YAxis stroke="#63806f" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#07150c", border: "1px solid #174e30", color: "#dfffee" }} />
                <Line type="monotone" dataKey="temperature" stroke="#22ff99" strokeWidth={2} dot={{ r: 3, fill: "#22ff99" }} />
                <Line type="monotone" dataKey="humidity" stroke="#2ee8ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ethylene" stroke="#ff9f38" strokeWidth={2} dot={{ r: 3, fill: "#ff9f38" }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
          <Panel className="overflow-hidden p-0">
            <div className="border-b border-[#113722] p-6"><h2 className="text-xl font-bold text-white">Your Shipments</h2></div>
            <div className="overflow-x-auto">
              <table className="k-table">
                <thead><tr><th>Unit ID</th><th>Cargo</th><th>Route</th><th>Status</th><th>Temp</th><th>Humidity</th><th>Ethylene</th><th>Shelf Life</th><th>ETA</th><th>Health</th></tr></thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-[#dffff0]">{s.unitId}</td>
                      <td>{s.cargo}</td>
                      <td>{s.route}</td>
                      <td><span className={cx("status-badge", s.status === "Alert" && "alert")}>{s.status}</span></td>
                      <td className="text-[#22ff99]">{s.temp.toFixed(1)}°C</td>
                      <td>{s.humidity}%</td>
                      <td>{s.ethylene} PPM</td>
                      <td>{s.shelfLifeRemaining}h / {s.shelfLifeTotal}h</td>
                      <td>{s.eta}</td>
                      <td><span className="text-[#22ff99]">{s.health}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, unit, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; value: string; unit: string; label: string }) {
  return <Panel className="stat-card"><Icon size={22} className="text-[#22ff99]" /><div className="mt-6"><span className="text-4xl font-light text-white">{value}</span><span className="ml-3 font-mono text-xs text-[#a2b5a9]">{unit}</span></div><div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6e8978]">{label}</div></Panel>;
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ token, isAdmin }: { token: string | null; isAdmin: boolean }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<"inquiries" | "users" | "shipments">("inquiries");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [shipmentForm, setShipmentForm] = useState({
    unitId: "", cargo: "", origin: "", destination: "", route: "",
    status: "Monitoring", temp: "2.4", humidity: "65", ethylene: "8",
    co2: "0.42", eta: "4h", health: "98", departure: "", arrival: "",
    duration: "", compliance: "All readings compliant.",
    shelfLifeTotal: "336", shelfLifeRemaining: "336",
  });
  const [assignUserId, setAssignUserId] = useState("");
  const [savingShipment, setSavingShipment] = useState(false);

  const loadData = () => {
    if (!token || !isAdmin) return;
    apiFetch("/inquiries", {}, token).then(setInquiries).catch(() => {});
    apiFetch("/users", {}, token).then(setUsers).catch(() => {});
  };

  useEffect(() => { loadData(); }, [token, isAdmin]);

  const deleteInquiry = async (id: number) => {
    await apiFetch(`/inquiries/${id}`, { method: "DELETE" }, token!);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setSelectedInquiry(null);
    toast({ title: "Inquiry deleted" });
  };

  const assignShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return toast({ title: "Select a user first", variant: "destructive" });
    setSavingShipment(true);
    try {
      await apiFetch(`/users/${assignUserId}/shipments`, {
        method: "POST",
        body: JSON.stringify({
          ...shipmentForm,
          temp: Number(shipmentForm.temp),
          humidity: Number(shipmentForm.humidity),
          ethylene: Number(shipmentForm.ethylene),
          co2: Number(shipmentForm.co2),
          health: Number(shipmentForm.health),
          shelfLifeTotal: Number(shipmentForm.shelfLifeTotal),
          shelfLifeRemaining: Number(shipmentForm.shelfLifeRemaining),
        }),
      }, token!);
      toast({ title: "Shipment assigned!", description: `${shipmentForm.unitId} assigned to user.` });
      setShipmentForm({ unitId: "", cargo: "", origin: "", destination: "", route: "", status: "Monitoring", temp: "2.4", humidity: "65", ethylene: "8", co2: "0.42", eta: "4h", health: "98", departure: "", arrival: "", duration: "", compliance: "All readings compliant.", shelfLifeTotal: "336", shelfLifeRemaining: "336" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingShipment(false);
    }
  };

  const deleteUser = async (id: number) => {
    await apiFetch(`/users/${id}`, { method: "DELETE" }, token!);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast({ title: "User deleted" });
  };

  if (!isAdmin) return (
    <div className="py-24 text-center">
      <Lock size={48} className="mx-auto text-[#ff355e] opacity-60" />
      <h2 className="mt-4 text-2xl font-black text-white">Admin Access Required</h2>
    </div>
  );

  return (
    <div>
      <PageTitle title="Admin Panel" subtitle="Manage users, shipments, inquiries and demo requests" />
      <div className="mb-6 flex gap-3">
        <button onClick={() => setTab("inquiries")} className={cx("nav-pill", tab === "inquiries" && "active")}>
          Inquiries & Demos ({inquiries.length})
        </button>
        <button onClick={() => setTab("users")} className={cx("nav-pill", tab === "users" && "active")}>
          Users ({users.length})
        </button>
        <button onClick={() => setTab("shipments")} className={cx("nav-pill", tab === "shipments" && "active")}>
          Assign Shipment
        </button>
      </div>

      {tab === "inquiries" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Panel className="overflow-hidden p-0">
            <div className="border-b border-[#113722] p-5">
              <h2 className="text-lg font-bold text-white">All Inquiries & Demo Requests</h2>
            </div>
            {inquiries.length === 0 ? (
              <div className="p-12 text-center text-[#8fa597]">No inquiries yet.</div>
            ) : (
              <div className="divide-y divide-[#0d2518]">
                {inquiries.map((inq) => (
                  <div key={inq.id} onClick={() => setSelectedInquiry(inq)}
                    className={cx("cursor-pointer p-5 transition-colors hover:bg-[rgba(34,255,153,0.04)]", selectedInquiry?.id === inq.id && "bg-[rgba(34,255,153,0.07)]")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cx("status-badge text-[9px]", inq.type === "demo" && "alert")}>{inq.type}</span>
                          <span className="font-bold text-white">{inq.name}</span>
                        </div>
                        <div className="mt-1 font-mono text-xs text-[#22ff99]">{inq.email}</div>
                        <div className="mt-1 text-xs text-[#8fa597]">{inq.company} · {inq.phone}</div>
                        <div className="mt-2 text-sm text-[#b7cec1] line-clamp-2">{inq.message}</div>
                      </div>
                      <div className="font-mono text-[10px] text-[#8fa597] whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {selectedInquiry && (
            <Panel className="p-6 self-start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">Full Details</h3>
                <button onClick={() => setSelectedInquiry(null)} className="text-[#8fa597] hover:text-white text-xs">✕ Close</button>
              </div>
              <div className="space-y-3">
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Type</div><span className={cx("status-badge mt-1 inline-block", selectedInquiry.type === "demo" && "alert")}>{selectedInquiry.type}</span></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Name</div><div className="text-white font-bold">{selectedInquiry.name}</div></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Email</div><div className="text-[#22ff99] font-mono text-sm">{selectedInquiry.email}</div></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Company</div><div className="text-[#b7cec1]">{selectedInquiry.company}</div></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Phone</div><div className="text-[#b7cec1]">{selectedInquiry.phone}</div></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090]">Date</div><div className="text-[#b7cec1] font-mono text-xs">{new Date(selectedInquiry.createdAt).toLocaleString()}</div></div>
                <div><div className="font-mono text-[10px] uppercase text-[#8aa090] mb-1">Message</div><div className="text-[#b7cec1] text-sm leading-relaxed bg-[rgba(34,255,153,0.03)] border border-[rgba(34,255,153,0.1)] p-3">{selectedInquiry.message}</div></div>
              </div>
              <div className="mt-5 flex gap-3">
                <a href={`mailto:${selectedInquiry.email}`} className="primary-btn compact flex-1 text-center">Reply via Email</a>
                <button onClick={() => deleteInquiry(selectedInquiry.id)} className="secondary-btn compact text-[#ff6682]">Delete</button>
              </div>
            </Panel>
          )}
        </div>
      )}

      {tab === "users" && (
        <Panel className="overflow-hidden p-0">
          <div className="border-b border-[#113722] p-5">
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
          </div>
          {users.length === 0 ? (
            <div className="p-12 text-center text-[#8fa597]">No users yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="k-table">
                <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="text-white font-bold">{u.name}</td>
                      <td className="font-mono text-[#22ff99] text-xs">{u.email}</td>
                      <td>{u.company}</td>
                      <td>{u.phone}</td>
                      <td><span className={cx("status-badge", u.role === "admin" && "alert")}>{u.role}</span></td>
                      <td className="font-mono text-xs text-[#8fa597]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(u.id)} className="text-link danger text-xs">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === "shipments" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Assign Shipment to User</h2>
            <form onSubmit={assignShipment} className="space-y-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Assign to User</span>
                <select className="k-input" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
                  <option value="">Select a user...</option>
                  {users.filter(u => u.role !== "admin").map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.company}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Unit ID", "unitId"], ["Cargo", "cargo"], ["Origin", "origin"],
                  ["Destination", "destination"], ["Route", "route"], ["Status", "status"],
                  ["Temp (°C)", "temp"], ["Humidity (%)", "humidity"],
                  ["Ethylene (PPM)", "ethylene"], ["CO2", "co2"],
                  ["ETA", "eta"], ["Health (%)", "health"],
                  ["Departure", "departure"], ["Arrival", "arrival"],
                  ["Duration", "duration"], ["Shelf Life Total (hrs)", "shelfLifeTotal"],
                  ["Shelf Life Remaining (hrs)", "shelfLifeRemaining"],
                ].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">{label}</span>
                    <input className="k-input" value={(shipmentForm as any)[key]}
                      onChange={(e) => setShipmentForm({ ...shipmentForm, [key]: e.target.value })} />
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Compliance Notes</span>
                <textarea className="k-input min-h-[80px] resize-none" value={shipmentForm.compliance}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, compliance: e.target.value })} />
              </label>
              <button className="primary-btn w-full" type="submit" disabled={savingShipment}>
                {savingShipment ? "Assigning..." : "Assign Shipment to User"}
              </button>
            </form>
          </Panel>
          <Panel className="p-6">
            <h2 className="mb-4 text-lg font-bold text-white">How it works</h2>
            <div className="space-y-4 text-sm text-[#8fa597]">
              <div className="flex gap-3"><span className="text-[#22ff99] font-mono">01</span><span>A user signs up for a free trial on the website</span></div>
              <div className="flex gap-3"><span className="text-[#22ff99] font-mono">02</span><span>They appear in the Users tab above</span></div>
              <div className="flex gap-3"><span className="text-[#22ff99] font-mono">03</span><span>You fill in their shipment details here and assign it to them</span></div>
              <div className="flex gap-3"><span className="text-[#22ff99] font-mono">04</span><span>They log in and see their shipments in their dashboard</span></div>
              <div className="flex gap-3"><span className="text-[#22ff99] font-mono">05</span><span>They can monitor temperature, humidity, ethylene, shelf life and ETA in real time</span></div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
// ─── ROUTER ───────────────────────────────────────────────────────────────────
function AppContent() {
  const auth = useAuth();
  return (
    <AppShell user={auth.user} isAdmin={auth.isAdmin} logout={auth.logout}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/signup" component={() => <SignupPage auth={auth} />} />
        <Route path="/login" component={() => <LoginPage auth={auth} />} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/demo" component={DemoPage} />
        <Route path="/dashboard" component={() => <DashboardPage token={auth.token} />} />
        <Route path="/admin" component={() => <AdminPage token={auth.token} isAdmin={auth.isAdmin} />} />
        <Route component={() => (
          <div className="py-24 text-center">
            <h1 className="text-4xl font-black text-white">Page not found</h1>
            <Link href="/" className="text-link mt-4 inline-flex">Return Home</Link>
          </div>
        )} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
