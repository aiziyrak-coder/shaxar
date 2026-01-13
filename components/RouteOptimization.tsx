import React, { useState, useEffect, useRef } from 'react';
import { WasteBin, Truck, RouteOptimization as RouteOptimizationType } from '../types';
import { ApiService } from '../services/api';
import { Navigation, MapPin, Fuel, Clock, Route, Zap, AlertCircle, CheckCircle2, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RouteOptimizationProps {
  bins: WasteBin[];
  trucks: Truck[];
  districtCenter: { lat: number; lng: number };
}

const RouteOptimization: React.FC<RouteOptimizationProps> = ({ bins, trucks, districtCenter }) => {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedBins, setSelectedBins] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteOptimizationType | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return;
    
    const map = window.L.map(mapRef.current, {
      center: [districtCenter.lat, districtCenter.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });
    
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
    mapInstanceRef.current = map;
  }, [districtCenter]);

  // Draw route on map
  useEffect(() => {
    if (!mapInstanceRef.current || !optimizedRoute) return;
    
    // Clear previous layers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.Polyline || layer instanceof window.L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Get bins in route order
    const routeBins = optimizedRoute.waypoints.map(id => bins.find(b => b.id === id)).filter(Boolean) as WasteBin[];
    
    if (routeBins.length === 0) return;

    // Draw route line
    const routeCoords = routeBins.map(b => [b.location.lat, b.location.lng]);
    const polyline = window.L.polyline(routeCoords, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    // Add markers with numbers
    routeBins.forEach((bin, index) => {
      const marker = window.L.marker([bin.location.lat, bin.location.lng], {
        icon: window.L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-8 h-8 bg-blue-600 text-white rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-sm">${index + 1}</div>`
        })
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="text-xs">
          <p class="font-bold">${index + 1}. ${bin.address}</p>
          <p class="text-slate-500 mt-1">To'lganlik: ${bin.fillLevel}%</p>
        </div>
      `);
    });

    // Fit bounds to show all markers
    mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }, [optimizedRoute, bins]);

  const handleOptimize = async () => {
    if (!selectedTruck || selectedBins.length === 0) {
      alert('Iltimos, texnika va konteynerlarni tanlang');
      return;
    }

    try {
      setOptimizing(true);
      const route = await ApiService.optimizeRoute(selectedTruck, selectedBins);
      setOptimizedRoute(route);
      alert('✅ Marshrut muvaffaqiyatli yaratildi!');
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('❌ Marshrutni yaratishda xatolik yuz berdi');
    } finally {
      setOptimizing(false);
    }
  };

  const toggleBinSelection = (binId: string) => {
    setSelectedBins(prev => 
      prev.includes(binId) 
        ? prev.filter(id => id !== binId)
        : [...prev, binId]
    );
  };

  const fullBins = bins.filter(b => b.fillLevel >= 80);
  const selectedTruckData = trucks.find(t => t.id === selectedTruck);

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
            <Route size={24} />
          </div>
          Marshrut Optimizatsiyasi
        </h2>
        <p className="text-sm text-slate-500 mt-1">Eng qisqa yo'lni hisoblash va yoqilg'i tejash</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* Truck Selection */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">1️⃣ Texnika Tanlash</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {trucks.map(truck => (
              <div
                key={truck.id}
                onClick={() => setSelectedTruck(truck.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedTruck === truck.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white border border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedTruck === truck.id ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <Navigation size={18} className={selectedTruck === truck.id ? 'text-white' : 'text-slate-600'} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{truck.driverName}</h4>
                    <p className={`text-xs font-mono ${selectedTruck === truck.id ? 'text-white/80' : 'text-slate-500'}`}>
                      {truck.plateNumber}
                    </p>
                  </div>
                  {selectedTruck === truck.id && (
                    <CheckCircle2 size={20} className="text-white" />
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Fuel size={12} className={selectedTruck === truck.id ? 'text-white/80' : 'text-slate-400'} />
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={selectedTruck === truck.id ? 'bg-white' : 'bg-blue-500'}
                      style={{ width: `${truck.fuelLevel}%`, height: '100%' }}
                    ></div>
                  </div>
                  <span className={`text-xs font-bold ${selectedTruck === truck.id ? 'text-white' : 'text-slate-600'}`}>
                    {truck.fuelLevel}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin Selection */}
        <div className="border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">2️⃣ Konteynerlar Tanlash</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedBins.length} ta tanlandi</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {fullBins.map(bin => (
              <div
                key={bin.id}
                onClick={() => toggleBinSelection(bin.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedBins.includes(bin.id)
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedBins.includes(bin.id)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'bg-white border-slate-300'
                      }`}>
                        {selectedBins.includes(bin.id) && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 truncate">{bin.address}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-7">{bin.tozaHudud}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    bin.fillLevel >= 90 ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {bin.fillLevel}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {selectedBins.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleOptimize}
                disabled={!selectedTruck || optimizing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {optimizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Hisoblanyapti...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Marshrutni Optimallashtirish
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Map and Results */}
        <div className="flex flex-col bg-slate-100">
          <div ref={mapRef} className="flex-1"></div>
          
          {optimizedRoute && (
            <div className="p-6 bg-white border-t-4 border-purple-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Navigation2 size={18} className="text-purple-600" />
                Optimal Marshrut
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Masofa</span>
                  </div>
                  <p className="text-2xl font-black text-blue-600">{optimizedRoute.totalDistance.toFixed(1)} <span className="text-sm">km</span></p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Vaqt</span>
                  </div>
                  <p className="text-2xl font-black text-amber-600">{optimizedRoute.estimatedTime} <span className="text-sm">daq</span></p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Fuel size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Yoqilg'i</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{optimizedRoute.fuelEstimate.toFixed(1)} <span className="text-sm">L</span></p>
                </div>
              </div>

              <div className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-xs font-bold text-purple-800 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Marshrut haydovchiga yuborildi. GPS navigatsiya tayyor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;
