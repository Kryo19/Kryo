import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// City coordinates for Indian cities
const CITY_COORDS: Record<string, [number, number]> = {
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.6139, 77.2090],
  "Pune": [18.5204, 73.8567],
  "Hyderabad": [17.3850, 78.4867],
  "Nashik": [19.9975, 73.7898],
  "Nhava Sheva Port": [18.9500, 72.9500],
  "Chennai": [13.0827, 80.2707],
  "Bangalore": [12.9716, 77.5946],
  "Kolkata": [22.5726, 88.3639],
  "Ahmedabad": [23.0225, 72.5714],
  "Chandigarh": [30.7333, 76.7794],
  "Jaipur": [26.9124, 75.7873],
  "Lucknow": [26.8467, 80.9462],
  "Surat": [21.1702, 72.8311],
};

function getCityCoords(name: string): [number, number] | null {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (name.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

function createCustomIcon(status: string) {
  const color = status === "Alert" ? "#ff9f38" : status === "Monitoring" ? "#2ee8ff" : "#22ff99";
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

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
  eta: string;
  health: number;
};

export default function ShipmentMap({ shipments }: { shipments: Shipment[] }) {
  const routes = shipments.map(s => ({
    shipment: s,
    originCoords: getCityCoords(s.origin),
    destCoords: getCityCoords(s.destination),
  })).filter(r => r.originCoords && r.destCoords);

  const allPositions = routes.flatMap(r => [r.originCoords!, r.destCoords!]);

  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] border border-[rgba(34,255,153,0.13)] bg-[rgba(5,20,11,0.94)]">
        <div className="text-center text-[#8fa597]">
          <div className="text-4xl mb-3">🗺️</div>
          <div>No mappable routes found.</div>
          <div className="text-xs mt-1">Add shipments with Indian city names to see them on the map.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "420px", width: "100%" }} className="overflow-hidden border border-[rgba(34,255,153,0.2)]">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapBounds positions={allPositions} />
        {routes.map(({ shipment, originCoords, destCoords }) => {
          const lineColor = shipment.status === "Alert" ? "#ff9f38" : shipment.status === "Monitoring" ? "#2ee8ff" : "#22ff99";
          return (
            <div key={shipment.id}>
              <Polyline
                positions={[originCoords!, destCoords!]}
                pathOptions={{ color: lineColor, weight: 2.5, opacity: 0.8, dashArray: "6 4" }}
              />
              <Marker position={originCoords!} icon={createCustomIcon(shipment.status)}>
                <Popup>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", minWidth: "160px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>📦 {shipment.unitId}</div>
                    <div style={{ color: "#666" }}>{shipment.cargo}</div>
                    <hr style={{ margin: "6px 0" }} />
                    <div>🌡️ Temp: <b>{shipment.temp}°C</b></div>
                    <div>💧 Humidity: <b>{shipment.humidity}%</b></div>
                    <div>⏱️ ETA: <b>{shipment.eta}</b></div>
                    <div>❤️ Health: <b>{shipment.health}%</b></div>
                    <div style={{ marginTop: "6px" }}>
                      <span style={{ background: lineColor, color: "#000", padding: "2px 6px", borderRadius: "3px", fontSize: "10px", fontWeight: "bold" }}>
                        {shipment.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Marker position={destCoords!} icon={createCustomIcon(shipment.status)}>
                <Popup>
                  <div style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    <div style={{ fontWeight: "bold" }}>🏁 Destination</div>
                    <div>{shipment.destination}</div>
                    <div style={{ color: "#666", marginTop: "4px" }}>{shipment.unitId}</div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
