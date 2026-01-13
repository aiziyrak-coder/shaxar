import React, { useState, useEffect } from 'react';
import { Room, Boiler } from '../types';
import { TrendingUp, Thermometer, Droplets, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClimateRealTimeGraphProps {
  rooms: Room[];
  boilers: Boiler[];
}

interface DataPoint {
  time: string;
  temperature: number;
  humidity: number;
}

const ClimateRealTimeGraph: React.FC<ClimateRealTimeGraphProps> = ({ rooms, boilers }) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedBoiler, setSelectedBoiler] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'ROOM' | 'BOILER'>('ROOM');
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '12H' | '24H'>('6H');
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);

  // Generate mock historical data for last 24 hours
  useEffect(() => {
    const generateHistoricalData = () => {
      const data: DataPoint[] = [];
      const now = new Date();
      const points = timeRange === '1H' ? 12 : timeRange === '6H' ? 36 : timeRange === '12H' ? 72 : 144;
      
      for (let i = points; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 10 * 60 * 1000)); // 10 min intervals
        data.push({
          time: time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          temperature: 20 + Math.random() * 4, // 20-24°C
          humidity: 45 + Math.random() * 10 // 45-55%
        });
      }
      return data;
    };

    setHistoricalData(generateHistoricalData());
    
    // Update every minute
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newData = [...prev];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          temperature: 20 + Math.random() * 4,
          humidity: 45 + Math.random() * 10
        });
        
        // Keep only last N points
        const maxPoints = timeRange === '1H' ? 12 : timeRange === '6H' ? 36 : timeRange === '12H' ? 72 : 144;
        if (newData.length > maxPoints) {
          newData.shift();
        }
        
        return newData;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeRange]);

  const drawGraph = (data: DataPoint[], key: 'temperature' | 'humidity', color: string) => {
    if (!data || data.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = 20;
    
    const values = data.map(d => d[key]);
    const min = Math.min(...values) - 2;
    const max = Math.max(...values) + 2;
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d[key] - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(percent => {
          const y = height - padding - (percent / 100) * (height - 2 * padding);
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={color}
          opacity="0.1"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((d[key] - min) / range) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{d.time}: {d[key].toFixed(1)}</title>
            </circle>
          );
        })}
      </svg>
    );
  };

  const currentTemp = historicalData.length > 0 ? historicalData[historicalData.length - 1].temperature : 0;
  const currentHumidity = historicalData.length > 0 ? historicalData[historicalData.length - 1].humidity : 0;

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg">
                <Activity size={24} />
              </div>
              Real-Time Monitoring
            </h2>
            <p className="text-sm text-slate-500 mt-1">24 soatlik jonli grafik va tahlil</p>
          </div>

          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              {(['ROOM', 'BOILER'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode === 'ROOM' ? 'Xonalar' : 'Qozonxona'}
                </button>
              ))}
            </div>

            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              {(['1H', '6H', '12H', '24H'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    timeRange === range
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Values */}
      <div className="grid grid-cols-2 gap-6 p-6 border-b border-slate-100 bg-slate-50">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Thermometer size={32} />
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">HOZIR</span>
          </div>
          <p className="text-5xl font-black mb-1">{currentTemp.toFixed(1)}°C</p>
          <p className="text-sm font-bold opacity-80">Harorat</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="text-xs">+0.3°C so'nggi soatda</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Droplets size={32} />
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">HOZIR</span>
          </div>
          <p className="text-5xl font-black mb-1">{currentHumidity.toFixed(1)}%</p>
          <p className="text-sm font-bold opacity-80">Namlik</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="text-xs">+1.2% so'nggi soatda</span>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Temperature Graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Thermometer size={18} className="text-red-500" />
            Harorat Dinamikasi ({timeRange})
          </h3>
          <div className="overflow-x-auto">
            {drawGraph(historicalData, 'temperature', '#ef4444')}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold px-6">
            <span>{historicalData[0]?.time || '00:00'}</span>
            <span>{historicalData[Math.floor(historicalData.length / 2)]?.time || '12:00'}</span>
            <span>{historicalData[historicalData.length - 1]?.time || '23:59'}</span>
          </div>
        </div>

        {/* Humidity Graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-blue-500" />
            Namlik Dinamikasi ({timeRange})
          </h3>
          <div className="overflow-x-auto">
            {drawGraph(historicalData, 'humidity', '#3b82f6')}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold px-6">
            <span>{historicalData[0]?.time || '00:00'}</span>
            <span>{historicalData[Math.floor(historicalData.length / 2)]?.time || '12:00'}</span>
            <span>{historicalData[historicalData.length - 1]?.time || '23:59'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateRealTimeGraph;
