import { useState } from "react";
import { Sparkles, Search, ChevronDown } from "lucide-react";

type CargoData = {
  name: string;
  type: string;
  requiredTempMin: number;
  requiredTempMax: number;
  humidity: number;
  ethyleneThreshold: number;
  co2Threshold: number;
  vibrationSensitivity: string;
  shelfLifeHours: number;
  dangerousConditions: string;
  storageNotes: string;
};

type Props = {
  onDataReady: (data: CargoData) => void;
};

export default function CargoLookup({ onDataReady }: Props) {
  const [cargoType, setCargoType] = useState<"pharmaceutical" | "biological" | "">("");
  const [cargoName, setCargoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CargoData | null>(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    if (!cargoType || !cargoName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a cold chain logistics expert. I need detailed cold chain requirements for: "${cargoName}" (type: ${cargoType}).

Return ONLY a valid JSON object with no extra text, no markdown, no backticks:
{
  "name": "exact product name",
  "type": "${cargoType}",
  "requiredTempMin": minimum temperature in Celsius as number,
  "requiredTempMax": maximum temperature in Celsius as number,
  "humidity": ideal humidity percentage as number,
  "ethyleneThreshold": safe ethylene PPM limit as number,
  "co2Threshold": safe CO2 percentage as number,
  "vibrationSensitivity": "Low" or "Medium" or "High",
  "shelfLifeHours": typical shelf life in hours as number,
  "dangerousConditions": "brief description of what conditions destroy this cargo",
  "storageNotes": "key storage and handling requirements"
}`
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.content[0].text.trim();
      const parsed: CargoData = JSON.parse(text);
      setResult(parsed);
    } catch (err: any) {
      setError("Failed to fetch cargo data. Please check the cargo name and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-[#22ff99]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8aa090]">AI Cargo Intelligence</span>
      </div>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Cargo Type</span>
        <div className="relative">
          <select
            className="k-input appearance-none pr-8"
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value as any)}
          >
            <option value="">Select cargo type...</option>
            <option value="pharmaceutical">Pharmaceutical</option>
            <option value="biological">Biological / Lab Sample</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8aa090] pointer-events-none" />
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Medicine / Product Name</span>
        <div className="flex gap-2">
          <input
            className="k-input flex-1"
            value={cargoName}
            onChange={(e) => setCargoName(e.target.value)}
            placeholder="e.g. Moderna COVID-19 Vaccine, Insulin, Blood Sample..."
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button
            onClick={lookup}
            disabled={loading || !cargoType || !cargoName.trim()}
            className="primary-btn compact"
          >
            {loading ? "..." : <Search size={15} />}
            {loading ? "Looking up..." : "Lookup"}
          </button>
        </div>
      </label>

      {error && (
        <div className="border border-[rgba(255,53,94,0.3)] bg-[rgba(255,53,94,0.05)] p-3 text-sm text-[#ff6682]">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-[rgba(34,255,153,0.2)] bg-[rgba(34,255,153,0.03)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-white">{result.name}</div>
            <span className="status-badge">{result.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoTile label="Temp Range" value={`${result.requiredTempMin}°C — ${result.requiredTempMax}°C`} />
            <InfoTile label="Humidity" value={`${result.humidity}%`} />
            <InfoTile label="Ethylene Limit" value={`${result.ethyleneThreshold} PPM`} />
            <InfoTile label="CO2 Limit" value={`${result.co2Threshold}%`} />
            <InfoTile label="Vibration" value={result.vibrationSensitivity} />
            <InfoTile label="Shelf Life" value={`${result.shelfLifeHours}h`} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-1">Dangerous Conditions</div>
            <div className="text-sm text-[#ff6682]">{result.dangerousConditions}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#8aa090] mb-1">Storage Notes</div>
            <div className="text-sm text-[#b7cec1]">{result.storageNotes}</div>
          </div>
          <button
            onClick={() => onDataReady(result)}
            className="primary-btn compact w-full"
          >
            <Sparkles size={14} />
            Use This Data for Shipment
          </button>
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[rgba(34,255,153,0.1)] bg-[rgba(34,255,153,0.03)] p-2">
      <div className="font-mono text-[9px] uppercase text-[#8aa090]">{label}</div>
      <div className="mt-1 font-mono text-sm text-[#22ff99] font-bold">{value}</div>
    </div>
  );
}
