import { useEffect, useMemo, useState } from "react";
import { Link, Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  ClipboardCheck,
  Cpu,
  Database,
  Download,
  Gauge,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  PackageCheck,
  Plus,
  Radar,
  RadioTower,
  Save,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Trash2,
  User,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

type Shipment = {
  unitId: string;
  cargo: string;
  origin: string;
  destination: string;
  route: string;
  status: string;
  temp: number;
  humidity: number;
  ethylene: number;
  co2: number;
  eta: string;
  health: number;
  departure: string;
  arrival: string;
  duration: string;
  compliance: string;
};

type SensorLog = {
  id: string;
  shipmentId: string;
  timestamp: string;
  parameter: string;
  value: string;
  sensorId: string;
  status: string;
};

type EventItem = {
  id: string;
  time: string;
  severity: "safe" | "warn" | "danger";
  message: string;
};

type Certificate = {
  id: string;
  shipmentId: string;
  certificateId: string;
  issuedAt: string;
  notes: string;
};

type TelemetryPoint = {
  time: string;
  temperature: number;
  humidity: number;
  ethylene: number;
};

type AppData = {
  shipments: Shipment[];
  sensorLogs: SensorLog[];
  events: EventItem[];
  certificates: Certificate[];
  telemetry: TelemetryPoint[];
};

const queryClient = new QueryClient();

const seedData: AppData = {
  shipments: [
    {
      unitId: "KRY-2847-PHR",
      cargo: "Moderna COVID-19 Vaccines",
      origin: "Mumbai Central Facility",
      destination: "Delhi Medical District",
      route: "Mumbai → Delhi",
      status: "Compliant",
      temp: 2.4,
      humidity: 65,
      ethylene: 8,
      co2: 0.42,
      eta: "6h 15m",
      health: 98.7,
      departure: "2026-04-13 08:30:00 UTC",
      arrival: "2026-04-13 14:45:00 UTC",
      duration: "6h 15m",
      compliance: "All environmental parameters remained within acceptable ranges throughout transport. No temperature excursions detected. WHO PQS standards maintained.",
    },
    {
      unitId: "KRY-3145-BIO",
      cargo: "Biologic Reagents",
      origin: "Pune Lab Cluster",
      destination: "Hyderabad Research Park",
      route: "Pune → Hyderabad",
      status: "Alert",
      temp: 4.8,
      humidity: 71,
      ethylene: 5,
      co2: 0.38,
      eta: "2h 40m",
      health: 91.2,
      departure: "2026-04-20 06:10:00 UTC",
      arrival: "2026-04-20 18:20:00 UTC",
      duration: "12h 10m",
      compliance: "Temperature excursion under review. Sensor recalibration recommended.",
    },
    {
      unitId: "KRY-2901-AGR",
      cargo: "Perishable Mango Export",
      origin: "Nashik Cold Hub",
      destination: "Nhava Sheva Port",
      route: "Nashik → Port",
      status: "Monitoring",
      temp: 3.1,
      humidity: 68,
      ethylene: 11,
      co2: 0.48,
      eta: "1h 25m",
      health: 96.4,
      departure: "2026-04-20 11:00:00 UTC",
      arrival: "2026-04-20 20:45:00 UTC",
      duration: "9h 45m",
      compliance: "Ethylene nearing threshold; predictive shelf-life model remains stable.",
    },
  ],
  sensorLogs: [
    { id: "log-1", shipmentId: "KRY-2847-PHR", timestamp: "2026-04-13 14:23:45 UTC", parameter: "Temperature", value: "2.4°C", sensorId: "T1-A847", status: "Compliant" },
    { id: "log-2", shipmentId: "KRY-2847-PHR", timestamp: "2026-04-13 14:23:45 UTC", parameter: "Humidity", value: "65% RH", sensorId: "H1-B223", status: "Compliant" },
    { id: "log-3", shipmentId: "KRY-2847-PHR", timestamp: "2026-04-13 14:23:45 UTC", parameter: "Ethylene", value: "8 PPM", sensorId: "E1-C591", status: "Compliant" },
    { id: "log-4", shipmentId: "KRY-2847-PHR", timestamp: "2026-04-13 14:23:45 UTC", parameter: "CO2", value: "0.42% VOL", sensorId: "C1-D782", status: "Compliant" },
    { id: "log-5", shipmentId: "KRY-2847-PHR", timestamp: "2026-04-13 13:58:10 UTC", parameter: "FT-NIR", value: "A+ Quality Index", sensorId: "A1-Q110", status: "Compliant" },
  ],
  events: [
    { id: "evt-1", time: "14:23", severity: "danger", message: "Temperature excursion detected on KRY-3145" },
    { id: "evt-2", time: "14:18", severity: "warn", message: "Ethylene levels approaching threshold on KRY-2956" },
    { id: "evt-3", time: "14:12", severity: "safe", message: "Shipment KRY-2847 departed Mumbai facility" },
    { id: "evt-4", time: "14:05", severity: "safe", message: "KRY-3012 entered controlled zone" },
    { id: "evt-5", time: "13:58", severity: "warn", message: "Humidity spike detected on KRY-2901" },
    { id: "evt-6", time: "13:42", severity: "safe", message: "All sensors calibrated successfully" },
  ],
  certificates: [
    { id: "cert-1", shipmentId: "KRY-2847-PHR", certificateId: "CERT-2026-04-13-8472", issuedAt: "2026-04-13 14:47:02 UTC", notes: "Blockchain verification hash KRYO-8847-AE1C" },
  ],
  telemetry: [
    { time: "00:00", temperature: 2.1, humidity: 63, ethylene: 5 },
    { time: "04:00", temperature: 2.3, humidity: 64, ethylene: 6 },
    { time: "08:00", temperature: 2.2, humidity: 66, ethylene: 7 },
    { time: "12:00", temperature: 2.4, humidity: 65, ethylene: 8 },
    { time: "16:00", temperature: 2.5, humidity: 67, ethylene: 8.4 },
    { time: "20:00", temperature: 2.4, humidity: 65, ethylene: 8 },
  ],
};

const eventMessages = [
  "FT-NIR scan completed on KRY-2847",
  "CO2 drift normalized on KRY-2901",
  "Shelf-life model refreshed for KRY-2847",
  "Predictive alert cleared on KRY-3012",
  "New custody checkpoint verified",
  "Humidity threshold watch enabled",
];

function usePersistentData() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem("kryo:data");
    if (!saved) return seedData;
    try {
      return JSON.parse(saved) as AppData;
    } catch {
      return seedData;
    }
  });

  useEffect(() => {
    localStorage.setItem("kryo:data", JSON.stringify(data));
  }, [data]);

  return [data, setData] as const;
}

function useAuth() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("kryo:admin") === "true");
  const login = (username: string, password: string) => {
    if (username === "admin" && password === "kryo2026") {
      localStorage.setItem("kryo:admin", "true");
      setIsAdmin(true);
      toast({ title: "Admin access granted", description: "Full read/write controls are now unlocked." });
      return true;
    }
    toast({ title: "Login failed", description: "Use username admin and password kryo2026." });
    return false;
  };
  const logout = () => {
    localStorage.removeItem("kryo:admin");
    setIsAdmin(false);
  };
  return { isAdmin, login, logout };
}

function useLiveSimulation(data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>) {
  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => {
        const drift = () => Number((Math.random() * 0.4 - 0.2).toFixed(1));
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);
        const lead = current.shipments[0];
        const nextTemp = Math.max(1.8, Math.min(4.6, Number((lead.temp + drift()).toFixed(1))));
        const nextHumidity = Math.max(58, Math.min(74, Math.round(lead.humidity + Math.random() * 4 - 2)));
        const nextEthylene = Math.max(4, Math.min(12, Number((lead.ethylene + Math.random() * 1.2 - 0.5).toFixed(1))));
        const nextShipments = current.shipments.map((shipment, index) => index === 0 ? { ...shipment, temp: nextTemp, humidity: nextHumidity, ethylene: nextEthylene, co2: Number((0.38 + Math.random() * 0.1).toFixed(2)) } : shipment);
        const nextTelemetry = [...current.telemetry.slice(-5), { time, temperature: nextTemp, humidity: nextHumidity, ethylene: nextEthylene }];
        const severity = Math.random() > 0.82 ? "warn" : "safe";
        const nextEvent: EventItem = {
          id: `evt-${Date.now()}`,
          time,
          severity,
          message: eventMessages[Math.floor(Math.random() * eventMessages.length)],
        };
        return { ...current, shipments: nextShipments, telemetry: nextTelemetry, events: [nextEvent, ...current.events].slice(0, 8) };
      });
    }, 9000);
    return () => window.clearInterval(timer);
  }, [data, setData]);
}

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("k-panel", className)}>{children}</div>;
}

function StatusDot({ severity = "safe" }: { severity?: "safe" | "warn" | "danger" }) {
  return <span className={cx("status-dot", severity === "warn" && "warn", severity === "danger" && "danger")} />;
}

function AppShell({ children, isAdmin, logout }: { children: React.ReactNode; isAdmin: boolean; logout: () => void }) {
  const [location] = useLocation();
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/inspect/KRY-2847-PHR", label: "Inspect", icon: Activity },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/certificate/KRY-2847-PHR", label: "Certificate", icon: ClipboardCheck },
    { href: "/admin", label: "Admin", icon: Lock },
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
          <nav className="hidden items-center gap-1 md:flex">
            {links.slice(0, 4).map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? location === "/" : location.startsWith(href.split("/")[1] ? `/${href.split("/")[1]}` : href);
              return (
                <Link key={href} href={href} className={cx("nav-pill", active && "active")}>
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
            <Link href="/admin" className={cx("nav-pill", location.startsWith("/admin") && "active")}> 
              <Lock size={14} />
              Admin
            </Link>
            {isAdmin && <button onClick={logout} className="nav-pill"><LogOut size={14} />Logout</button>}
          </nav>
          {isAdmin && <div className="admin-badge"><User size={13} />Admin</div>}
        </div>
      </header>
      <main className="mx-auto max-w-[1220px] px-5 py-9 md:px-7">{children}</main>
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

function LandingPage({ data }: { data: AppData }) {
  const lead = data.shipments[0];
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
            <Link href="/dashboard" className="primary-btn">Start Free Trial <ChevronRight size={17} /></Link>
            <Link href="/inspect/KRY-2847-PHR" className="secondary-btn">View Demo</Link>
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
            <div className="active-pill"><StatusDot />Active</div>
            <div className="sensor-field">
              <div className="pulse-core" />
              <MetricTile className="left-[12%] top-[34%]" label="TEMP" value={`${lead.temp.toFixed(1)}°C`} />
              <MetricTile className="right-[6%] top-[43%]" label="ETHYLENE" value={`${Math.round(lead.ethylene)} PPM`} />
              <MetricTile className="left-[9%] bottom-[23%]" label="SHELF LIFE" value="14d 6h" />
              <MetricTile className="right-[9%] bottom-[16%]" label="HUMIDITY" value={`${lead.humidity}%`} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-6 border-t border-[#0f2d1d] pt-8 md:grid-cols-4">
        <StatBig value="12K+" label="Sensors Deployed" />
        <StatBig value="98.7%" label="Compliance Rate" />
        <StatBig value="$45M" label="Cargo Protected" />
        <StatBig value="24/7" label="Live Monitoring" />
      </div>
    </section>
  );
}

function MetricTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className={cx("metric-tile absolute", className)}><div>{label}</div><strong>{value}</strong></div>;
}

function StatBig({ value, label }: { value: string; label: string }) {
  return <div className="text-center"><div className="text-4xl font-light tracking-tight text-[#22ff99]">{value}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#789184]">{label}</div></div>;
}

function DashboardPage({ data }: { data: AppData }) {
  const avgTemp = data.shipments.reduce((sum, item) => sum + item.temp, 0) / data.shipments.length;
  const alerts = data.shipments.filter((item) => item.status === "Alert").length + data.events.filter((item) => item.severity !== "safe").length;
  const avgHealth = data.shipments.reduce((sum, item) => sum + item.health, 0) / data.shipments.length;

  return (
    <div>
      <PageTitle title="Fleet Command Center" subtitle="Real-time monitoring across all active shipments" action={<div className="live-monitor"><StatusDot />Live Monitoring</div>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Box} value="847" unit="UNITS" label="Active Shipments" delta="+12" />
        <StatCard icon={Thermometer} value={avgTemp.toFixed(1)} unit="°C" label="Fleet Temperature" delta="+0.2" />
        <StatCard icon={AlertTriangle} value={alerts.toString()} unit="EVENTS" label="Active Alerts" delta="+1" />
        <StatCard icon={Activity} value={avgHealth.toFixed(1)} unit="%" label="System Health" delta="0.0" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Panel className="min-h-[360px] p-6">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold text-white">Fleet Telemetry - Last 24 Hours</h2>
            <div className="flex gap-4 font-mono text-[11px] text-[#88a293]"><span className="text-[#22ff99]">Temperature</span><span className="text-cyan-300">Humidity</span><span className="text-orange-400">Ethylene</span></div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={data.telemetry} margin={{ left: -20, right: 15, top: 10, bottom: 0 }}>
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
        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-white"><Radar size={16} className="text-[#22ff99]" />Event Feed</h2>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#91a798]">Real-time system events</div>
          <div className="mt-5 space-y-4">
            {data.events.slice(0, 6).map((event) => <EventRow key={event.id} event={event} />)}
          </div>
        </Panel>
      </div>
      <Panel className="mt-6 overflow-hidden p-0">
        <div className="border-b border-[#113722] p-6"><h2 className="text-xl font-bold text-white">Active Shipments</h2></div>
        <div className="overflow-x-auto">
          <table className="k-table">
            <thead><tr><th>Unit ID</th><th>Cargo</th><th>Route</th><th>Status</th><th>Temp</th><th>ETA</th><th>Actions</th></tr></thead>
            <tbody>
              {data.shipments.map((shipment) => (
                <tr key={shipment.unitId}>
                  <td className="font-mono text-[#dffff0]">{shipment.unitId}</td>
                  <td>{shipment.cargo}</td>
                  <td>{shipment.route}</td>
                  <td><span className={cx("status-badge", shipment.status === "Alert" && "alert")}>{shipment.status}</span></td>
                  <td className="text-[#22ff99]">{shipment.temp.toFixed(1)}°C</td>
                  <td>{shipment.eta}</td>
                  <td className="space-x-2"><Link className="text-link" href={`/inspect/${shipment.unitId}`}>Inspect</Link><Link className="text-link" href={`/certificate/${shipment.unitId}`}>Certificate</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ icon: Icon, value, unit, label, delta }: { icon: React.ComponentType<{ size?: number; className?: string }>; value: string; unit: string; label: string; delta: string }) {
  return <Panel className="stat-card"><div className="flex justify-between"><Icon size={22} className="text-[#22ff99]" /><span className="delta">{delta}</span></div><div className="mt-6"><span className="text-4xl font-light text-white">{value}</span><span className="ml-3 font-mono text-xs text-[#a2b5a9]">{unit}</span></div><div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6e8978]">{label}</div></Panel>;
}

function EventRow({ event }: { event: EventItem }) {
  return <div className="grid grid-cols-[14px_42px_1fr] gap-2 text-xs"><StatusDot severity={event.severity} /><span className="font-mono text-[#718879]">{event.time}</span><span className={cx("leading-5 text-[#d5efe0]", event.severity === "warn" && "text-orange-300", event.severity === "danger" && "text-red-300")}>{event.message}</span></div>;
}

function InspectPage({ data }: { data: AppData }) {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/").pop() || "KRY-2847-PHR");
  const shipment = data.shipments.find((item) => item.unitId === id) || data.shipments[0];
  const nirData = [28, 42, 58, 73, 56, 66, 84, 68, 55, 49, 62, 76, 81, 63, 52, 44, 35, 29].map((value, index) => ({ name: index.toString(), value }));
  const co2Data = [{ name: "CO2", value: shipment.co2 * 100, fill: "#22ff99" }];

  return (
    <div>
      <PageTitle title="Sensor Inspect Mode" subtitle="Real-time molecular analysis and environmental monitoring" action={<div className="live-monitor"><Activity size={14} />6 Sensors Active</div>} />
      <div className="grid gap-7 lg:grid-cols-[1fr_1fr]">
        <Panel className="min-h-[620px] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#91aa9c]">Container Unit Cross-Section</div>
          <h2 className="mt-1 font-mono text-xl font-bold tracking-wider text-white">{shipment.unitId}</h2>
          <ContainerDiagram />
        </Panel>
        <div className="space-y-5">
          <Panel className="p-5">
            <PanelHeader icon={Activity} title="FT-NIR Spectroscopy" />
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={nirData} margin={{ left: 0, right: 0, bottom: 0, top: 20 }}>
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>{nirData.map((_, index) => <Cell key={index} fill={`rgba(34,255,153,${0.28 + index / 38})`} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 font-mono text-xs"><Metric label="Ripeness" value="84%" /><Metric label="Sugar Brix" value="12.4°" /><Metric label="Quality Index" value="A+" /></div>
          </Panel>
          <Panel className="p-5">
            <PanelHeader icon={Waves} title="Ethylene Gas Detection" />
            <div className="mt-5 h-7 overflow-hidden rounded-full bg-[#082814]"><div className="h-full rounded-full bg-gradient-to-r from-[#22ff99] to-[#d6a632]" style={{ width: `${Math.min(100, shipment.ethylene / 25 * 100)}%` }} /></div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[#7b9686]"><span>0 PPM</span><span className="text-orange-300">Threshold: 12 PPM</span><span>25 PPM</span></div>
            <div className="-mt-8 text-center text-lg font-bold text-white">{Math.round(shipment.ethylene)} PPM</div>
          </Panel>
          <Panel className="p-5">
            <PanelHeader icon={Gauge} title="CO2 Concentration" />
            <div className="relative mx-auto h-[210px] max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="92%" data={co2Data} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background={{ fill: "#0d2718" }} cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="font-mono text-4xl text-[#22ff99]">{shipment.co2.toFixed(2)}</div><div className="font-mono text-xs uppercase text-[#9bb1a3]">% VOL</div></div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string }) {
  return <div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-3 font-bold text-white"><Icon size={18} className="text-[#22ff99]" />{title}</h3><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a6b9ad]"><StatusDot />Live</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><div className="uppercase tracking-[0.18em] text-[#769181]">{label}</div><div className="mt-1 text-lg text-[#22ff99]">{value}</div></div>;
}

function ContainerDiagram() {
  const sensors = [
    { id: "T1", x: "20%", y: "22%" }, { id: "T2", x: "80%", y: "22%" }, { id: "E1", x: "54%", y: "39%" },
    { id: "C1", x: "26%", y: "58%" }, { id: "H1", x: "75%", y: "58%" }, { id: "A1", x: "54%", y: "82%" },
  ];
  return <div className="container-diagram"><div className="container-box"><div className="container-shape" />{sensors.map((sensor) => <div key={sensor.id} className="sensor-dot-wrap" style={{ left: sensor.x, top: sensor.y }}><span className="sensor-dot" /><span className="sensor-label">{sensor.id}</span></div>)}</div></div>;
}

function CertificatePage({ data }: { data: AppData }) {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/").pop() || "KRY-2847-PHR");
  const shipment = data.shipments.find((item) => item.unitId === id) || data.shipments[0];
  const certificate = data.certificates.find((item) => item.shipmentId === shipment.unitId) || data.certificates[0];
  const logs = data.sensorLogs.filter((log) => log.shipmentId === shipment.unitId);
  const download = () => {
    const content = `KRYO Chain-of-Custody Certificate\n${certificate.certificateId}\nShipment: ${shipment.unitId}\nCargo: ${shipment.cargo}\nRoute: ${shipment.route}\nStatus: ${shipment.status}\nIssued: ${certificate.issuedAt}`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${certificate.certificateId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "PDF certificate generated", description: "The certificate download has started." });
  };
  const verify = () => toast({ title: "Blockchain verification successful", description: `${certificate.notes} confirmed on the mock custody ledger.` });

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div><div className="flex items-center gap-8"><h1 className="text-3xl font-black text-white">KRYO</h1><span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8ba797]">Molecular Surveillance Platform</span></div><div className="mt-3 text-lg font-bold text-[#22ff99]">Chain-of-Custody Certificate</div></div>
        <div className="flex gap-3"><button onClick={download} className="secondary-btn compact"><Download size={15} />Download PDF</button><button onClick={verify} className="primary-btn compact"><ShieldCheck size={15} />Verify on Blockchain</button></div>
      </div>
      <div className="certificate-paper">
        <div className="grid gap-8 p-9 md:grid-cols-3">
          <Detail label="Shipment ID" value={shipment.unitId} large />
          <div />
          <Detail label="Certificate ID" value={certificate.certificateId} align="right" />
          <Detail label="Cargo Description" value={shipment.cargo} />
          <Detail label="Origin" value={shipment.origin} />
          <Detail label="Destination" value={shipment.destination} />
          <Detail label="Departure Date/Time" value={shipment.departure} />
          <Detail label="Arrival Date/Time" value={shipment.arrival} />
          <Detail label="Transport Duration" value={shipment.duration} />
        </div>
        <div className="compliant-band"><CheckCircle2 size={34} /><div><h2>COMPLIANT</h2><p>{shipment.compliance}</p></div></div>
        <div className="p-9"><h2 className="mb-5 text-2xl font-bold text-[#1a241e]">Timestamped Sensor Log</h2><table className="cert-table"><thead><tr><th>Timestamp (UTC)</th><th>Parameter</th><th>Value</th><th>Sensor ID</th><th>Status</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.timestamp}</td><td>{log.parameter}</td><td>{log.value}</td><td>{log.sensorId}</td><td><span>{log.status}</span></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

function Detail({ label, value, large, align }: { label: string; value: string; large?: boolean; align?: "right" }) {
  return <div className={align === "right" ? "text-right" : ""}><div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6f7772]">{label}</div><div className={cx("mt-2 font-mono font-bold text-[#121815]", large && "text-2xl")}>{value}</div></div>;
}

function AdminPage({ data, setData, auth }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; auth: ReturnType<typeof useAuth> }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<Shipment>({ unitId: "", cargo: "", origin: "", destination: "", route: "", status: "Monitoring", temp: 2.4, humidity: 65, ethylene: 8, co2: 0.42, eta: "4h", health: 98, departure: "2026-04-20 09:00:00 UTC", arrival: "2026-04-20 13:00:00 UTC", duration: "4h", compliance: "All readings compliant." });
  const [logDraft, setLogDraft] = useState({ shipmentId: "KRY-2847-PHR", parameter: "Temperature", value: "2.4°C", sensorId: "T1-A847", status: "Compliant" });

  if (!auth.isAdmin) {
    return <div className="mx-auto max-w-md pt-12"><Panel className="p-8"><div className="mb-6 flex items-center gap-3"><Lock className="text-[#22ff99]" /><div><h1 className="text-2xl font-black text-white">Admin Login</h1><p className="text-sm text-[#8fa597]">Unlock complete read/write access to KRYO data.</p></div></div><form onSubmit={(e) => { e.preventDefault(); auth.login(username, password); }} className="space-y-4"><input className="k-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" /><input className="k-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" /><button className="primary-btn w-full" type="submit"><Lock size={16} />Login</button></form><div className="mt-5 rounded-lg border border-[#174a2e] bg-[#07160d] p-3 font-mono text-xs text-[#9bb2a4]">Username: admin<br />Password: kryo2026</div></Panel></div>;
  }

  const saveShipment = () => {
    if (!draft.unitId || !draft.cargo) return toast({ title: "Missing data", description: "Unit ID and cargo are required." });
    setData((current) => ({ ...current, shipments: [...current.shipments.filter((item) => item.unitId !== draft.unitId), draft] }));
    toast({ title: "Shipment saved", description: `${draft.unitId} is now available across KRYO.` });
  };
  const deleteShipment = (unitId: string) => setData((current) => ({ ...current, shipments: current.shipments.filter((item) => item.unitId !== unitId) }));
  const addLog = () => {
    const entry: SensorLog = { id: `log-${Date.now()}`, timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC", ...logDraft };
    setData((current) => ({ ...current, sensorLogs: [entry, ...current.sensorLogs] }));
    toast({ title: "Sensor reading added", description: `${entry.parameter} was recorded for ${entry.shipmentId}.` });
  };
  const generateCertificate = () => {
    const shipmentId = draft.unitId || data.shipments[0].unitId;
    const cert: Certificate = { id: `cert-${Date.now()}`, shipmentId, certificateId: `CERT-${new Date().toISOString().slice(0, 10)}-${Math.floor(1000 + Math.random() * 8999)}`, issuedAt: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC", notes: "Mock blockchain verification hash generated" };
    setData((current) => ({ ...current, certificates: [cert, ...current.certificates.filter((item) => item.shipmentId !== shipmentId)] }));
    toast({ title: "Certificate generated", description: cert.certificateId });
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kryo-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const simulate = () => setData((current) => ({ ...current, events: [{ id: `evt-${Date.now()}`, time: new Date().toTimeString().slice(0, 5), severity: "safe", message: "Manual live data simulation completed by admin" }, ...current.events] }));

  return (
    <div>
      <PageTitle title="Admin Control Panel" subtitle="CRUD shipments, sensor logs, certificates, and live simulation data" action={<div className="admin-badge"><Database size={14} />Writable Data</div>} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel className="p-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white"><PackageCheck className="text-[#22ff99]" />Shipments</h2><div className="grid gap-3 sm:grid-cols-2"><AdminInput label="Unit ID" value={draft.unitId} onChange={(value) => setDraft({ ...draft, unitId: value })} /><AdminInput label="Cargo" value={draft.cargo} onChange={(value) => setDraft({ ...draft, cargo: value })} /><AdminInput label="Origin" value={draft.origin} onChange={(value) => setDraft({ ...draft, origin: value })} /><AdminInput label="Destination" value={draft.destination} onChange={(value) => setDraft({ ...draft, destination: value })} /><AdminInput label="Route" value={draft.route} onChange={(value) => setDraft({ ...draft, route: value })} /><AdminInput label="Status" value={draft.status} onChange={(value) => setDraft({ ...draft, status: value })} /><AdminInput label="Temp" value={String(draft.temp)} onChange={(value) => setDraft({ ...draft, temp: Number(value) })} /><AdminInput label="Humidity" value={String(draft.humidity)} onChange={(value) => setDraft({ ...draft, humidity: Number(value) })} /><AdminInput label="Ethylene" value={String(draft.ethylene)} onChange={(value) => setDraft({ ...draft, ethylene: Number(value) })} /><AdminInput label="CO2" value={String(draft.co2)} onChange={(value) => setDraft({ ...draft, co2: Number(value) })} /></div><div className="mt-5 flex flex-wrap gap-3"><button onClick={saveShipment} className="primary-btn compact"><Save size={15} />Save Shipment</button><button onClick={generateCertificate} className="secondary-btn compact"><ClipboardCheck size={15} />Generate Certificate</button></div></Panel>
        <Panel className="p-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white"><Cpu className="text-[#22ff99]" />Manual Sensor Reading</h2><div className="grid gap-3 sm:grid-cols-2"><AdminInput label="Shipment ID" value={logDraft.shipmentId} onChange={(value) => setLogDraft({ ...logDraft, shipmentId: value })} /><AdminInput label="Parameter" value={logDraft.parameter} onChange={(value) => setLogDraft({ ...logDraft, parameter: value })} /><AdminInput label="Value" value={logDraft.value} onChange={(value) => setLogDraft({ ...logDraft, value })} /><AdminInput label="Sensor ID" value={logDraft.sensorId} onChange={(value) => setLogDraft({ ...logDraft, sensorId: value })} /></div><div className="mt-5 flex flex-wrap gap-3"><button onClick={addLog} className="primary-btn compact"><Plus size={15} />Add Reading</button><button onClick={exportJson} className="secondary-btn compact"><Download size={15} />Export JSON</button><button onClick={simulate} className="secondary-btn compact"><Sparkles size={15} />Simulate Live Data</button></div></Panel>
      </div>
      <Panel className="mt-6 overflow-hidden p-0"><table className="k-table"><thead><tr><th>Unit ID</th><th>Cargo</th><th>Route</th><th>Status</th><th>Edit</th></tr></thead><tbody>{data.shipments.map((shipment) => <tr key={shipment.unitId}><td className="font-mono text-white">{shipment.unitId}</td><td>{shipment.cargo}</td><td>{shipment.route}</td><td>{shipment.status}</td><td className="space-x-3"><button onClick={() => setDraft(shipment)} className="text-link">Edit</button><button onClick={() => deleteShipment(shipment.unitId)} className="text-link danger"><Trash2 size={13} />Delete</button></td></tr>)}</tbody></table></Panel>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">{label}</span><input className="k-input" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function NotFound() {
  return <div className="py-24 text-center"><h1 className="text-4xl font-black text-white">Route not found</h1><Link href="/" className="text-link mt-4 inline-flex">Return Home</Link></div>;
}

function Router({ data, setData, auth }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; auth: ReturnType<typeof useAuth> }) {
  return <Switch><Route path="/" component={() => <LandingPage data={data} />} /><Route path="/dashboard" component={() => <DashboardPage data={data} />} /><Route path="/inspect/:id" component={() => <InspectPage data={data} />} /><Route path="/certificate/:id" component={() => <CertificatePage data={data} />} /><Route path="/admin" component={() => <AdminPage data={data} setData={setData} auth={auth} />} /><Route component={NotFound} /></Switch>;
}

function AppContent() {
  const [data, setData] = usePersistentData();
  const auth = useAuth();
  const memoData = useMemo(() => data, [data]);
  useLiveSimulation(memoData, setData);
  return <AppShell isAdmin={auth.isAdmin} logout={auth.logout}><Router data={memoData} setData={setData} auth={auth} /></AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><AppContent /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
