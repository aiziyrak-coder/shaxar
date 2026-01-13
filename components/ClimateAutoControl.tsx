import React, { useState, useEffect } from 'react';
import { Facility, Room, Boiler } from '../types';
import { Power, Thermometer, Droplets, Zap, Settings, CheckCircle, AlertTriangle, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClimateAutoControlProps {
  facilities: Facility[];
  onUpdateFacility?: (facility: Facility) => void;
}

interface AutoControlConfig {
  enabled: boolean;
  targetTemp: number;
  targetHumidity: number;
  maxTempDeviation: number;
  maxHumidityDeviation: number;
  adjustmentInterval: number; // minutes
}

const ClimateAutoControl: React.FC<ClimateAutoControlProps> = ({ facilities, onUpdateFacility }) => {
  const [autoControlEnabled, setAutoControlEnabled] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [config, setConfig] = useState<AutoControlConfig>({
    enabled: false,
    targetTemp: 22,
    targetHumidity: 50,
    maxTempDeviation: 2,
    maxHumidityDeviation: 5,
    adjustmentInterval: 10
  });
  
  const [lastAdjustment, setLastAdjustment] = useState<string>('Hech qachon');
  const [adjustmentLog, setAdjustmentLog] = useState<Array<{
    timestamp: string;
    action: string;
    reason: string;
  }>>([]);

  // Load config from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('climate_auto_control_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
        setAutoControlEnabled(parsed.enabled);
      } catch (error) {
        console.error('Error loading auto control config:', error);
      }
    }
  }, []);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('climate_auto_control_config', JSON.stringify(config));
  }, [config]);

  // Auto-adjustment logic
  useEffect(() => {
    if (!autoControlEnabled || !selectedFacility) return;

    const interval = setInterval(() => {
      const facility = facilities.find(f => f.id === selectedFacility);
      if (!facility) return;

      let adjusted = false;
      const adjustments: string[] = [];

      facility.boilers.forEach(boiler => {
        // Check temperature
        if (boiler.temperature !== undefined) {
          const tempDiff = config.targetTemp - boiler.temperature;
          if (Math.abs(tempDiff) > config.maxTempDeviation) {
            if (tempDiff > 0) {
              adjustments.push(`${boiler.name}: Harorat oshirildi (+${tempDiff.toFixed(1)}°C)`);
            } else {
              adjustments.push(`${boiler.name}: Harorat pasaytirildi (${tempDiff.toFixed(1)}°C)`);
            }
            adjusted = true;
          }
        }

        // Check humidity
        const humidityDiff = config.targetHumidity - boiler.humidity;
        if (Math.abs(humidityDiff) > config.maxHumidityDeviation) {
          if (humidityDiff > 0) {
            adjustments.push(`${boiler.name}: Namlik oshirildi (+${humidityDiff.toFixed(1)}%)`);
          } else {
            adjustments.push(`${boiler.name}: Namlik pasaytirildi (${humidityDiff.toFixed(1)}%)`);
          }
          adjusted = true;
        }
      });

      if (adjusted) {
        const timestamp = new Date().toLocaleString('uz-UZ');
        setLastAdjustment(timestamp);
        setAdjustmentLog(prev => [
          {
            timestamp,
            action: adjustments.join(', '),
            reason: 'Avtomatik tuzatish'
          },
          ...prev.slice(0, 9) // Keep last 10
        ]);
      }
    }, config.adjustmentInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoControlEnabled, selectedFacility, config, facilities]);

  const toggleAutoControl = () => {
    const newState = !autoControlEnabled;
    setAutoControlEnabled(newState);
    setConfig(prev => ({ ...prev, enabled: newState }));
    
    if (newState) {
      setAdjustmentLog(prev => [{
        timestamp: new Date().toLocaleString('uz-UZ'),
        action: 'Avtomatik boshqaruv yoqildi',
        reason: 'Foydalanuvchi tomonidan'
      }, ...prev]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all ${
                autoControlEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
              }`}>
                <Zap size={24} />
              </div>
              Avtomatik Boshqaruv
            </h2>
            <p className="text-sm text-slate-500 mt-1">Aqlli harorat va namlik nazorati</p>
          </div>

          <button
            onClick={toggleAutoControl}
            className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center gap-3 ${
              autoControlEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {autoControlEnabled ? (
              <>
                <Pause size={24} />
                TO'XTATISH
              </>
            ) : (
              <>
                <Play size={24} />
                YOQISH
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden bg-slate-50">
        {/* Configuration Panel */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Settings size={18} />
              Sozlamalar
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ob'ekt</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                <option value="">Tanlang</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <label className="text-xs font-bold text-red-800 uppercase block mb-3 flex items-center gap-2">
                <Thermometer size={14} />
                Maqsad Harorat
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={config.targetTemp}
                  onChange={(e) => setConfig({ ...config, targetTemp: Number(e.target.value) })}
                  className="flex-1 bg-white border border-red-200 rounded-xl px-4 py-3 text-center text-2xl font-black"
                />
                <span className="text-xl font-bold text-red-600">°C</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Og'ish: ±{config.maxTempDeviation}°C
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-800 uppercase block mb-3 flex items-center gap-2">
                <Droplets size={14} />
                Maqsad Namlik
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={config.targetHumidity}
                  onChange={(e) => setConfig({ ...config, targetHumidity: Number(e.target.value) })}
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 text-center text-2xl font-black"
                />
                <span className="text-xl font-bold text-blue-600">%</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Og'ish: ±{config.maxHumidityDeviation}%
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tekshirish Intervali</label>
              <select
                value={config.adjustmentInterval}
                onChange={(e) => setConfig({ ...config, adjustmentInterval: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                <option value={5}>5 daqiqa</option>
                <option value={10}>10 daqiqa</option>
                <option value={15}>15 daqiqa</option>
                <option value={30}>30 daqiqa</option>
                <option value={60}>1 soat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status and Activity Log */}
        <div className="col-span-2 flex flex-col space-y-6">
          {/* Current Status */}
          <div className={`p-6 rounded-2xl shadow-lg ${
            autoControlEnabled
              ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white'
              : 'bg-white border border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold opacity-80 uppercase mb-2">Status</p>
                <h3 className="text-3xl font-black">
                  {autoControlEnabled ? 'FAOL ISHLAYAPTI' : 'O\'CHIRILGAN'}
                </h3>
              </div>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                autoControlEnabled ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                <Power size={40} className={autoControlEnabled ? 'animate-pulse' : ''} />
              </div>
            </div>
            
            {autoControlEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} />
                <span>Oxirgi tekshiruv: {lastAdjustment}</span>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Faoliyat Jurnali</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {adjustmentLog.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">Hozircha faoliyat yo'q</p>
                </div>
              ) : (
                adjustmentLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Zap size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-1">{log.reason}</p>
                        <p className="text-xs text-slate-400 mt-2">{log.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateAutoControl;
