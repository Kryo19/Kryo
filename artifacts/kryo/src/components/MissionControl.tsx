import { useEffect, useState } from "react";

type Shipment = {
  id: number;
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
  shelfLifeRemaining: number;
  shelfLifeTotal: number;
};

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-right">
      <div className="font-mono text-3xl font-light text-[#22ff99]">
        {time.toLocaleTimeString()}
      </div>
      <div className="font-mono text-xs text-[#8fa597]">
        {time.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const isAlert = shipment.status === "Alert";
  const isMonitoring = shipment.status === "Monitoring";
  const shelfPct = Math.round((shipment.shelfLifeRemaining / shipment.shelfLifeTotal) * 100);

  return (
    <div className={cx(
      "relative border p-4 transition-all",
      isAlert
        ? "border-[rgba(255,173,56,0.5)] bg-[rgba(255,173,56,0.05)]"
        : "border-[rgba(34,255,153,0.15)] bg-[rgba(5,20,11,0.8)]"
    )}>
      {isAlert && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="status-dot warn" />
          <span className="font-mono text-[9px] uppercase text-orange-300">Alert</span>
        </div>
      )}

      <div className="mb-3">
        <div className="font-mono text-sm font-bold text-white">{shipment.unitId}</div>
        <div className="text-xs text-[#8fa597] truncate">{shipment.cargo}</div>
        <div className="font-mono text-[10px] text-[#22ff99] mt-1">{shipment.route}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Metric label="TEMP" value={`${shipment.temp.toFixed(1)}°C`} alert={shipment.temp > 4} />
        <Metric label="HUMIDITY" value={`${shipment.humidity}%`} alert={shipment.humidity > 70} />
        <Metric label="ETHYLENE" value={`${shipment.ethylene} PPM`} alert={shipment.ethylene > 10} />
        <Metric label="CO2" value={`${shipment.co2}%`} alert={shipment.co2 > 0.5} />
      </div>

      <div className="mb-2">
        <div className="flex justify-between font-mono text-[9px] text-[#8fa597] mb-1">
          <span>SHELF LIFE</span>
          <span>{shelfPct}%</span>
        </div>
        <div className="h-1 bg-[#0d2718] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${shelfPct}%`,
              background: shelfPct > 60 ? "#22ff99" : shelfPct > 30 ? "#ffad38" : "#ff355e"
            }}
          />
        </div>
      </div>

      <div className="flex justify-between font-mono text-[10px]">
        <span className="text-[#8fa597]">ETA: <span className="text-white">{shipment.eta}</span></span>
        <span className="text-[#8fa597]">Health: <span className={shipment.health > 95 ? "text-[#22ff99]" : "text-orange-300"}>{shipment.health}%</span></span>
      </div>
    </div>
  );
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="border border-[rgba(34,255,153,0.08)] p-2">
      <div className="font-mono text-[8px] uppercase text-[#8fa597]">{label}</div>
      <div className={cx("font-mono text-sm font-bold", alert ? "text-orange-300" : "text-[#22ff99]")}>{value}</div>
    </div>
  );
}

export default function MissionControl({
  shipments,
  onClose,
  token,
}: {
  shipments: Shipment[];
  onClose: () => void;
  token: string | null;
}) {
  const [liveShipments, setLiveShipments] = useState<Shipment[]>(shipments);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const refresh = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/shipments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLiveShipments(data);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch {}
  };

  useEffect(() => {
    const refreshTimer = setInterval(refresh, 30000);
    const countdownTimer = setInterval(() => {
      setCountdown(c => c > 0 ? c - 1 : 30);
    }, 1000);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [token]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const alertCount = liveShipments.filter(s => s.status === "Alert").length;
  const avgHealth = liveShipments.length > 0
    ? (liveShipments.reduce((sum, s) => sum + s.health, 0) / liveShipments.length).toFixed(1)
    : "0";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: "radial-gradient(circle at 18% 10%, rgba(34,255,153,0.08), transparent 26rem), radial-gradient(circle at 75% 22%, rgba(0,255,159,0.06), transparent 30rem), #030a06" }}>

      <div className="noise fixed inset-0 z-0" />
      <div className="scanline fixed inset-0 z-0" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="font-black text-3xl text-white tracking-tight">KRYO</div>
              <div className="h-6 w-px bg-[#1b3f2d]" />
              <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#84b899]">Mission Control</div>
              <div className="flex items-center gap-2 border border-[rgba(34,255,153,0.2)] px-3 py-1">
                <span className="status-dot" />
                <span className="font-mono text-[9px] uppercase text-[#22ff99]">Live</span>
              </div>
            </div>
            <div className="mt-2 flex gap-6">
              <Stat label="Active Shipments" value={liveShipments.length.toString()} />
              <Stat label="Alerts" value={alertCount.toString()} alert={alertCount > 0} />
              <Stat label="Fleet Health" value={`${avgHealth}%`} />
              <Stat label="Refresh in" value={`${countdown}s`} />
              <div className="font-mono text-[10px] text-[#8fa597]">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <LiveClock />
            <div className="flex flex-col gap-2">
              <button onClick={refresh} className="secondary-btn compact text-xs">↻ Refresh</button>
              <button onClick={onClose} className="secondary-btn compact text-xs">✕ Exit</button>
            </div>
          </div>
        </div>

        {/* Shipment Grid */}
        {liveShipments.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-[#8fa597]">
              <div className="text-5xl mb-4">📡</div>
              <div className="font-mono text-lg">No active shipments</div>
              <div className="text-sm mt-2">Shipments will appear here once assigned</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {liveShipments.map(shipment => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 border-t border-[#0d2718] pt-4 flex justify-between font-mono text-[10px] text-[#8fa597]">
          <span>KRYO Molecular Surveillance Platform — Cold Chain Intelligence</span>
          <span>Press ESC to exit mission control</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase text-[#8fa597]">{label}</div>
      <div className={cx("font-mono text-lg font-bold", alert ? "text-orange-300" : "text-[#22ff99]")}>{value}</div>
    </div>
  );
}
