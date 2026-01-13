import React, { useState } from 'react';
import { Facility } from '../types';
import { Zap, TrendingUp, TrendingDown, DollarSign, Lightbulb, Target, Award, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnergyAnalysisProps {
  facilities: Facility[];
}

const EnergyAnalysis: React.FC<EnergyAnalysisProps> = ({ facilities }) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Calculate energy efficiency score
  const calculateEfficiency = (facility: Facility) => {
    return facility.efficiencyScore || 85;
  };

  // Generate recommendations based on facility data
  const generateRecommendations = (facility: Facility) => {
    const recommendations = [];
    
    if (facility.energyUsage > 80) {
      recommendations.push({
        icon: TrendingDown,
        title: 'Energiya Tejash',
        description: 'Kechki soatlarda (22:00-06:00) haroratni 2°C ga pasaytiring',
        savings: '15-20% energiya tejash',
        color: 'emerald'
      });
    }

    if (facility.efficiencyScore < 80) {
      recommendations.push({
        icon: Settings,
        title: 'Tizimni Optimallashtirish',
        description: 'Qozonxonalar sozlamalarini qayta ko\'rib chiqing',
        savings: '10-15% samaradorlik oshishi',
        color: 'blue'
      });
    }

    recommendations.push({
      icon: Lightbulb,
      title: 'Aqlli Termostatlar',
      description: 'IoT sensorlar yordamida avtomatik boshqaruvni yoqing',
      savings: '25-30% energiya tejash',
      color: 'amber'
    });

    return recommendations;
  };

  // Monthly cost projection
  const projectMonthlyCost = (facility: Facility) => {
    const dailyCost = facility.energyUsage * 500; // 500 sum per kWh
    return dailyCost * 30;
  };

  const selectedData = selectedFacility || facilities[0];
  const efficiency = calculateEfficiency(selectedData);
  const recommendations = generateRecommendations(selectedData);
  const monthlyCost = projectMonthlyCost(selectedData);
  const potentialSavings = monthlyCost * 0.2; // 20% potential savings

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-600 text-white flex items-center justify-center shadow-lg">
                <Zap size={24} />
              </div>
              Energiya Tahlili
            </h2>
            <p className="text-sm text-slate-500 mt-1">AI tavsiyalari va prognoz</p>
          </div>

          <select
            value={selectedData.id}
            onChange={(e) => setSelectedFacility(facilities.find(f => f.id === e.target.value) || null)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm"
          >
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
        {/* Current Efficiency Score */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-3xl text-white mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold mb-2 opacity-80">Samaradorlik Reytingi</p>
              <p className="text-7xl font-black mb-2">{efficiency}<span className="text-3xl">%</span></p>
              <div className="flex items-center gap-2 mt-4">
                {efficiency >= 90 ? (
                  <Award size={20} className="text-yellow-300" />
                ) : efficiency >= 75 ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
                <span className="text-sm font-bold">
                  {efficiency >= 90 ? 'A\'lo' : efficiency >= 75 ? 'Yaxshi' : 'Yaxshilash kerak'}
                </span>
              </div>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - efficiency / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Cost Projection */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Oylik Prognoz</h3>
            <div className="flex items-center gap-3">
              <DollarSign size={32} className="text-blue-600" />
              <div>
                <p className="text-3xl font-black text-slate-800">{monthlyCost.toLocaleString('uz-UZ')}</p>
                <p className="text-xs text-slate-500 mt-1">so'm / oy</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="text-xs font-bold mb-4 uppercase opacity-80">Tejash Imkoniyati</h3>
            <div className="flex items-center gap-3">
              <Target size={32} />
              <div>
                <p className="text-3xl font-black">{potentialSavings.toLocaleString('uz-UZ')}</p>
                <p className="text-xs mt-1 opacity-80">so'm / oy</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">💡 AI Tavsiyalari</h3>
          
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            const colorClasses = {
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
              blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
              amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
            };
            const colors = colorClasses[rec.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${colors.bg} p-6 rounded-2xl border ${colors.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${colors.icon} shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${colors.text} mb-2`}>{rec.title}</h4>
                    <p className="text-sm text-slate-700 mb-3">{rec.description}</p>
                    <div className={`inline-flex items-center gap-2 ${colors.text} bg-white px-4 py-2 rounded-lg font-bold text-xs`}>
                      <TrendingDown size={14} />
                      {rec.savings}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalysis;
