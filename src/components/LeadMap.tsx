'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Pin {
  id: number;
  label: string;
  lat: number;
  lng: number;
  pin_type: string;
  notes: string | null;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  city: string | null;
  area_code: string | null;
  project_type: string;
  budget: string;
}

interface LeadMapProps {
  leads: Lead[];
}

// Green pin for leads
const leadIcon = () => new L.DivIcon({
  html: `<div style="width:28px;height:28px;background:#00e68a;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(0,230,138,0.6);"></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Red pin for targets
const targetIcon = () => new L.DivIcon({
  html: `<div style="width:24px;height:24px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(239,68,68,0.5);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Blue pin for prospects
const prospectIcon = () => new L.DivIcon({
  html: `<div style="width:24px;height:24px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.5);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function getIcon(type: string) {
  if (type === 'lead') return leadIcon();
  if (type === 'prospect') return prospectIcon();
  return targetIcon();
}

export default function LeadMap({ leads }: LeadMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [addingPin, setAddingPin] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [newPinType, setNewPinType] = useState('target');
  const [newPinNotes, setNewPinNotes] = useState('');
  const [geocodedLeads, setGeocodedLeads] = useState<Array<{ lead: Lead; lat: number; lng: number }>>([]);

  const fetchPins = useCallback(async () => {
    const res = await fetch('/api/admin/target-pins');
    if (res.ok) setPins(await res.json());
  }, []);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.8, -98.5], // center of US
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    // Click to add pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      setAddingPin({ lat: e.latlng.lat, lng: e.latlng.lng, label: '' });
    });

    mapRef.current = map;
    fetchPins();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [fetchPins]);

  // Geocode leads with city
  useEffect(() => {
    const geocodeLeads = async () => {
      const results: Array<{ lead: Lead; lat: number; lng: number }> = [];
      for (const lead of leads) {
        if (!lead.city && !lead.area_code) continue;
        const q = lead.city || lead.area_code || '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=us`, {
            headers: { 'User-Agent': 'CircuitCoders-Admin/1.0' },
          });
          const data = await res.json();
          if (data[0]) {
            results.push({ lead, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          }
        } catch { /* skip */ }
        // Rate limit Nominatim
        await new Promise(r => setTimeout(r, 1100));
      }
      setGeocodedLeads(results);
    };
    geocodeLeads();
  }, [leads]);

  // Update markers when pins or geocoded leads change
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    // Lead pins (green)
    for (const { lead, lat, lng } of geocodedLeads) {
      const marker = L.marker([lat, lng], { icon: leadIcon() });
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px;">
          <strong style="color:#00e68a;font-size:14px;">${lead.name}</strong>
          ${lead.company ? `<br><span style="color:#aaa;">${lead.company}</span>` : ''}
          <br><a href="mailto:${lead.email}" style="color:#3b82f6;">${lead.email}</a>
          <br><span style="color:#888;">Type:</span> ${lead.project_type}
          ${lead.budget ? `<br><span style="color:#888;">Budget:</span> ${lead.budget}` : ''}
          ${lead.city ? `<br><span style="color:#888;">City:</span> ${lead.city}` : ''}
        </div>
      `);
      markersRef.current!.addLayer(marker);
    }

    // Target/prospect pins
    for (const pin of pins) {
      const marker = L.marker([pin.lat, pin.lng], { icon: getIcon(pin.pin_type) });
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:150px;">
          <strong style="color:${pin.pin_type === 'target' ? '#ef4444' : '#3b82f6'};font-size:14px;">${pin.label}</strong>
          <br><span style="color:#888;text-transform:capitalize;">${pin.pin_type}</span>
          ${pin.notes ? `<br><span style="color:#bbb;">${pin.notes}</span>` : ''}
          <br><button onclick="window.__deletePin(${pin.id})" style="color:#ef4444;cursor:pointer;border:none;background:none;padding:4px 0;font-size:12px;">Remove pin</button>
        </div>
      `);
      markersRef.current!.addLayer(marker);
    }
  }, [pins, geocodedLeads]);

  // Expose delete handler globally for popup buttons
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__deletePin = async (id: number) => {
      await fetch('/api/admin/target-pins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchPins();
    };
    return () => { delete (window as unknown as Record<string, unknown>).__deletePin; };
  }, [fetchPins]);

  async function searchLocation() {
    if (!searchQuery.trim()) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=us`, {
      headers: { 'User-Agent': 'CircuitCoders-Admin/1.0' },
    });
    const data = await res.json();
    setSearchResults(data);
  }

  function flyTo(lat: number, lng: number) {
    mapRef.current?.flyTo([lat, lng], 12, { duration: 1.5 });
    setSearchResults([]);
  }

  async function savePin() {
    if (!addingPin?.label) return;
    await fetch('/api/admin/target-pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: addingPin.label, lat: addingPin.lat, lng: addingPin.lng, pin_type: newPinType, notes: newPinNotes || null }),
    });
    setAddingPin(null);
    setNewPinNotes('');
    fetchPins();
  }

  return (
    <div className="space-y-3">
      {/* Search + Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchLocation()}
            placeholder="Search city, zip, or address..."
            className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none transition pl-10 caret-circuit-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button onClick={searchLocation} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-circuit-500 text-carbon-900 font-semibold px-2 py-1 rounded transition hover:bg-circuit-400">
            Go
          </button>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-carbon-400 border border-white/15 rounded-lg overflow-hidden z-50 shadow-xl">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => flyTo(parseFloat(r.lat), parseFloat(r.lon))}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition border-b border-white/5 last:border-0"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00e68a] border-2 border-white inline-block"></span>
            Leads
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-white inline-block"></span>
            Targets
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6] border-2 border-white inline-block"></span>
            Prospects
          </span>
          <span className="text-gray-500">Click map to pin</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 glow-border" style={{ height: 500 }}>
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Add Pin Modal */}
      {addingPin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setAddingPin(null)}>
          <div className="bg-carbon-400 border border-white/15 rounded-2xl glow-border p-6 w-full max-w-sm admin-page" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Add Pin</h2>
              <button onClick={() => setAddingPin(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Label</label>
                <input
                  type="text"
                  value={addingPin.label}
                  onChange={e => setAddingPin({ ...addingPin, label: e.target.value })}
                  placeholder="Business name or area..."
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Type</label>
                <select
                  value={newPinType}
                  onChange={e => setNewPinType(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none"
                >
                  <option value="target">Target (red)</option>
                  <option value="prospect">Prospect (blue)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Notes</label>
                <input
                  type="text"
                  value={newPinNotes}
                  onChange={e => setNewPinNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Lat: {addingPin.lat.toFixed(4)}, Lng: {addingPin.lng.toFixed(4)}
              </p>
              <button
                onClick={savePin}
                disabled={!addingPin.label}
                className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Pins List */}
      {pins.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Saved Pins ({pins.length})</h3>
          <div className="flex flex-wrap gap-2">
            {pins.map(pin => (
              <button
                key={pin.id}
                onClick={() => flyTo(pin.lat, pin.lng)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm transition group"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${pin.pin_type === 'target' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                <span className="text-gray-200">{pin.label}</span>
                {pin.notes && <span className="text-gray-500 text-xs">({pin.notes})</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
