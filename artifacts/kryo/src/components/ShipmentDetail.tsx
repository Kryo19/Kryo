import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ShipmentMap from "./ShipmentMap";

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
  departure: string;
  arrival: string;
  duration: string;
  compliance: string;
  shelfLifeTotal: number;
  shelfLifeRemaining: number;
  userId: number;
};

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export default function ShipmentDetail({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const shelfLifePct = Math.round((shipment.shelfLifeRemaining / shipment.shelfLifeTotal) * 100);
  const telemetry = [
    { time: "00:00", temperature: shipment.temp - 0.3, humidity: shipment.humidity - 2, ethylene: shipment.ethylene - 1 },
    { time: "04:00", temperature: shipment.temp - 0.1, humidity: shipment.humidity - 1, ethylene: shipment.ethylene - 0.5 },
    { time: "08:00", temperature: shipment.temp + 0.1, humidity: shipment.humidity, ethylene: shipment.ethylene },
    { time: "12:00", temperature: shipment.temp, humidity: shipment.humidity + 1, ethylene: shipment.ethylene + 0.3 },
    { time: "16:00", temperature: shipment.temp + 0.2, humidity: shipment.humidity + 2, ethylene: shipment.ethylene + 0.5 },
    { time: "20:00", temperature: shipment.temp, humidity: shipment.humidity, ethylene: shipment.ethylene },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#030a06]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black text-white">{shipment.unitId}</span>
              <span className={cx("status-badge", shipment.status === "Alert" && "alert")}>{shipment.status}</span>
            </div>
            <div className="mt-1 text-[#8fa597]">{shipment.cargo}</div>
          </div>
          <button onClick={onClose} className="secondary-btn compact">✕ Close</button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Shelf Life */}
          <div className="k-panel p-5">
            <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-3">Shelf Life Remaining</div>
            <div className="text-4xl font-light text-white mb-2">{shipment.shelfLifeRemaining}<span className="text-lg text-[#8fa597]">h</span></div>
            <div className="h-2 bg-[#0d2718] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${shelfLifePct}%`, background: shelfLifePct > 60 ? "#22ff99" : shelfLifePct > 30 ? "#ffad38" : "#ff355e" }} />
            </div>
            <div className="mt-1 font-mono text-[10px] text-[#8fa597]">{shelfLifePct}% of {shipment.shelfLifeTotal}h total</div>
          </div>

          {/* Route */}
          <div className="k-panel p-5">
            <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-3">Route</div>
            <div className="text-sm text-white font-bold">{shipment.origin}</div>
            <div className="my-2 text-[#22ff99] text-xl">↓</div>
            <div className="text-sm text-white font-bold">{shipment.destination}</div>
            <div className="mt-3 font-mono text-xs text-[#8fa597]">ETA: <span className="text-[#22ff99]">{shipment.eta}</span></div>
          </div>

          {/* Health Score */}
          <div className="k-panel p-5">
            <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-3">Cargo Health Score</div>
            <div className="text-4xl font-light text-[#22ff99] mb-2">{shipment.health}<span className="text-lg text-[#8fa597]">%</span></div>
            <div className="font-mono text-[10px] text-[#8fa597]">Departure: {shipment.departure}</div>
            <div className="font-mono text-[10px] text-[#8fa597] mt-1">Arrival: {shipment.arrival}</div>
            <div className="font-mono text-[10px] text-[#8fa597] mt-1">Duration: {shipment.duration}</div>
          </div>
        </div>

        {/* Live Sensor Readings */}
        <div className="k-panel p-5 mb-6">
          <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-4">Live Sensor Readings</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SensorCard label="Temperature" value={`${shipment.temp.toFixed(1)}°C`} color="#22ff99" />
            <SensorCard label="Humidity" value={`${shipment.humidity}%`} color="#2ee8ff" />
            <SensorCard label="Ethylene" value={`${shipment.ethylene} PPM`} color="#ff9f38" />
            <SensorCard label="CO2" value={`${shipment.co2}%`} color="#b39ddb" />
          </div>
        </div>

        {/* Telemetry Chart */}
        <div className="k-panel p-5 mb-6">
          <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-4">24-Hour Telemetry</div>
          <ResponsiveContainer width="100%" height={200}>
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
        </div>

        {/* Map */}
        <div className="k-panel p-5 mb-6">
          <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-4">Route Map</div>
          <ShipmentMap shipments={[shipment]} />
        </div>

        {/* Compliance */}
        <div className="k-panel p-5">
          <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-3">Compliance Notes</div>
          <div className="text-sm text-[#b7cec1] leading-relaxed">{shipment.compliance}</div>
        </div>
      </div>
    </div>
  );
}

function SensorCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-[rgba(34,255,153,0.1)] p-3 text-center">
      <div className="font-mono text-[9px] uppercase text-[#8aa090] mb-2">{label}</div>
      <div className="font-mono text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
