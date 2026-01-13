import React, { useState, useEffect } from 'react';
import { WasteStatistics, WasteBin, Truck } from '../types';
import { ApiService } from '../services/api';
import { BarChart3, TrendingUp, Package, TruckIcon, CheckCircle, Clock, AlertCircle, Download, Calendar, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface WasteReportsProps {
  bins: WasteBin[];
  trucks: Truck[];
}

const WasteReports: React.FC<WasteReportsProps> = ({ bins, trucks }) => {
  const [statistics, setStatistics] = useState<WasteStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('WEEK');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await ApiService.getWasteStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!statistics) return;
    
    // Simple CSV export
    const csvContent = `
Chiqindi Boshqaruv Hisoboti
Sana: ${new Date().toLocaleDateString('uz-UZ')}

UMUMIY KO'RSATKICHLAR
Jami konteynerlar: ${statistics.totalBins}
To'lgan konteynerlar: ${statistics.fullBins}
O'rtacha to'ldirilganlik: ${statistics.averageFillLevel.toFixed(2)}%
Jami texnika: ${statistics.totalTrucks}
Faol texnika: ${statistics.activeTrucks}

VAZIFALAR
Bajarilgan: ${statistics.tasksCompleted}
Kutilmoqda: ${statistics.tasksPending}
Jarayonda: ${statistics.tasksInProgress}
Samaradorlik: ${statistics.collectionEfficiency}%

HUDUD BO'YICHA
${Object.entries(statistics.byHudud).map(([hudud, data]) => `
${hudud}:
  - Jami: ${data.total}
  - To'lgan: ${data.full}
  - O'rtacha: ${data.avgFill.toFixed(2)}%`).join('\n')}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chiqindi-hisobot-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-[24px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-sm font-bold text-slate-600">Hisobotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-[24px]">
        <p className="text-slate-500">Ma'lumotlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <BarChart3 size={24} />
              </div>
              Hisobotlar va Statistika
            </h2>
            <p className="text-sm text-slate-500 mt-1">Chiqindi boshqaruv samaradorligi tahlili</p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              {(['TODAY', 'WEEK', 'MONTH'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedPeriod === period 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {period === 'TODAY' ? 'Bugun' : period === 'WEEK' ? 'Hafta' : 'Oy'}
                </button>
              ))}
            </div>
            
            <button
              onClick={exportToExcel}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Download size={16} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Key Metrics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Package size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                {((statistics.totalBins - statistics.fullBins) / statistics.totalBins * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{statistics.totalBins}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase">Jami Konteyner</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                <span className="font-bold text-red-600">{statistics.fullBins}</span> ta to'lgan
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{statistics.averageFillLevel.toFixed(1)}%</h3>
            <p className="text-xs font-bold text-slate-500 uppercase">O'rtacha To'lganlik</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" style={{ width: `${statistics.averageFillLevel}%` }}></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <TruckIcon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{statistics.activeTrucks}/{statistics.totalTrucks}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase">Faol Texnika</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                <span className="font-bold text-green-600">{statistics.totalTrucks - statistics.activeTrucks}</span> ta bo'sh
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{statistics.collectionEfficiency.toFixed(0)}%</h3>
            <p className="text-xs font-bold text-slate-500 uppercase">Samaradorlik</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                <span className="font-bold text-purple-600">{statistics.tasksCompleted}</span> ta bajarildi
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tasks Summary */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Vazifalar Holati
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Bajarilgan</span>
                </div>
                <span className="text-2xl font-black text-emerald-600">{statistics.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Jarayonda</span>
                </div>
                <span className="text-2xl font-black text-amber-600">{statistics.tasksInProgress}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Kutilmoqda</span>
                </div>
                <span className="text-2xl font-black text-blue-600">{statistics.tasksPending}</span>
              </div>
            </div>
          </div>

          {/* By Hudud */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-purple-600" />
              Hudud Bo'yicha
            </h3>
            <div className="space-y-4">
              {Object.entries(statistics.byHudud).map(([hudud, data]) => (
                <div key={hudud} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-700">{hudud}</span>
                    <span className="text-xs text-slate-500">{data.total} konteyner</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                      <p className="text-lg font-black text-blue-600">{data.total}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Jami</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                      <p className="text-lg font-black text-red-600">{data.full}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">To'lgan</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                      <p className="text-lg font-black text-emerald-600">{data.avgFill.toFixed(0)}%</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">O'rtacha</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Chart Visualization */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Haftalik Aktivlik
          </h3>
          
          <div className="flex items-end justify-between h-64 gap-2">
            {['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'].map((day, i) => {
              const height = Math.random() * 100 + 50; // Mock data
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end items-center" style={{ height: '220px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl relative group cursor-pointer hover:from-blue-700 hover:to-blue-500"
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.floor(height / 10)}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-3">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteReports;
