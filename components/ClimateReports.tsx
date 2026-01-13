import React, { useState, useEffect } from 'react';
import { Facility, EnergyReport, ClimateStatistics } from '../types';
import { ApiService } from '../services/api';
import { FileText, Download, TrendingDown, Zap, DollarSign, BarChart3, Calendar, Thermometer, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClimateReportsProps {
  facilities: Facility[];
}

const ClimateReports: React.FC<ClimateReportsProps> = ({ facilities }) => {
  const [statistics, setStatistics] = useState<ClimateStatistics | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await ApiService.getClimateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedFacility) {
      alert('Iltimos, ob\'ektni tanlang');
      return;
    }

    try {
      setGenerating(true);
      const report = await ApiService.generateEnergyReport(selectedFacility, reportType);
      setGeneratedReport(report);
      alert('✅ Hisobot muvaffaqiyatli yaratildi!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Hisobot yaratishda xatolik yuz berdi');
    } finally {
      setGenerating(false);
    }
  };

  const exportToPDF = () => {
    if (!generatedReport) return;

    const content = `
ENERGIYA SARFI HISOBOTI
${generatedReport.facility?.name || 'N/A'}
Davr: ${new Date(generatedReport.start_date).toLocaleDateString('uz-UZ')} - ${new Date(generatedReport.end_date).toLocaleDateString('uz-UZ')}

═══════════════════════════════════════

📊 ASOSIY KO'RSATKICHLAR

Umumiy energiya: ${generatedReport.total_energy_kwh.toFixed(2)} kWh
Umumiy xarajat: ${generatedReport.total_cost.toLocaleString('uz-UZ')} so'm
O'rtacha harorat: ${generatedReport.average_temperature.toFixed(1)}°C
O'rtacha namlik: ${generatedReport.average_humidity.toFixed(1)}%
Samaradorlik: ${generatedReport.efficiency_score.toFixed(0)}%
Tejaldi: ${generatedReport.cost_savings.toLocaleString('uz-UZ')} so'm

═══════════════════════════════════════

💡 TAVSIYALAR

${generatedReport.recommendations || 'Tavsiyalar yo\'q'}

═══════════════════════════════════════

Yaratildi: ${new Date(generatedReport.generated_at).toLocaleString('uz-UZ')}
Yaratuvchi: ${generatedReport.generated_by}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `energiya-hisobot-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-[24px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-sm font-bold text-slate-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <FileText size={24} />
              </div>
              Energiya Hisobotlari
            </h2>
            <p className="text-sm text-slate-500 mt-1">Kunlik, haftalik, oylik tahlil</p>
          </div>

          <button
            onClick={exportToPDF}
            disabled={!generatedReport}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            Yuklab Olish
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* Report Generator */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Hisobot Yaratish</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ob'ekt</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                <option value="">Tanlang</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Davr</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                <option value="DAILY">Kunlik</option>
                <option value="WEEKLY">Haftalik</option>
                <option value="MONTHLY">Oylik</option>
                <option value="YEARLY">Yillik</option>
              </select>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={!selectedFacility || generating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Hisobot Yaratish
                </>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          {statistics && (
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Umumiy Statistika</h4>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Ob'ektlar</span>
                  <span className="text-2xl font-black text-slate-800">{statistics.totalFacilities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Xonalar</span>
                  <span className="text-xl font-bold text-slate-600">{statistics.totalRooms}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={16} />
                  <span className="text-xs font-bold uppercase">O'rtacha Harorat</span>
                </div>
                <p className="text-3xl font-black">{statistics.averageTemperature.toFixed(1)}°C</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={16} />
                  <span className="text-xs font-bold uppercase">O'rtacha Namlik</span>
                </div>
                <p className="text-3xl font-black">{statistics.averageHumidity.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Report Display */}
        <div className="col-span-2 flex flex-col bg-white">
          {!generatedReport ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-bold">Hisobot yaratish uchun</p>
                <p className="text-xs text-slate-400 mt-2">Chap tomondan ob'ekt va davrni tanlang</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Report Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-2xl text-white mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-black mb-2">{generatedReport.facility?.name}</h2>
                    <p className="text-emerald-100 font-bold">
                      {new Date(generatedReport.start_date).toLocaleDateString('uz-UZ')} - 
                      {new Date(generatedReport.end_date).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold mb-1">Samaradorlik</p>
                    <p className="text-5xl font-black">{generatedReport.efficiency_score.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Umumiy Energiya</p>
                      <p className="text-3xl font-black text-blue-600">{generatedReport.total_energy_kwh.toFixed(0)}</p>
                      <p className="text-xs text-slate-500">kWh</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Umumiy Xarajat</p>
                      <p className="text-3xl font-black text-emerald-600">{generatedReport.total_cost.toLocaleString('uz-UZ')}</p>
                      <p className="text-xs text-slate-500">so'm</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <Thermometer size={20} className="text-red-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">O'rtacha Harorat</p>
                      <p className="text-2xl font-black text-red-600">{generatedReport.average_temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
                  <div className="flex items-center gap-3">
                    <Droplets size={20} className="text-cyan-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">O'rtacha Namlik</p>
                      <p className="text-2xl font-black text-cyan-600">{generatedReport.average_humidity.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Savings */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl border-2 border-green-200 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg">
                    <TrendingDown size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800 uppercase">Energiya Tejaldi</p>
                    <p className="text-4xl font-black text-green-600">{generatedReport.cost_savings.toLocaleString('uz-UZ')} so'm</p>
                    <p className="text-xs text-green-700 mt-1">O'tgan davr bilan solishtirganda</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  💡 AI Tavsiyalari
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                  {generatedReport.recommendations}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimateReports;
