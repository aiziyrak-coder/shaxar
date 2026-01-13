import React, { useState, useEffect } from 'react';
import { WasteBin, WastePrediction as WastePredictionType } from '../types';
import { ApiService } from '../services/api';
import { TrendingUp, Calendar, AlertCircle, Sparkles, BarChart4, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface WastePredictionProps {
  bins: WasteBin[];
}

const WastePrediction: React.FC<WastePredictionProps> = ({ bins }) => {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<WastePredictionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysAhead, setDaysAhead] = useState(7);

  const handlePredict = async (binId: string) => {
    try {
      setLoading(true);
      setSelectedBin(binId);
      const result = await ApiService.generateWastePrediction(binId, daysAhead);
      setPredictions(result);
    } catch (error) {
      console.error('Error generating prediction:', error);
      alert('Prognoz yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const selectedBinData = bins.find(b => b.id === selectedBin);

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg">
                <Sparkles size={24} />
              </div>
              AI Prognoz
            </h2>
            <p className="text-sm text-slate-500 mt-1">Konteyner to'liish vaqtini bashorat qilish</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={18} className="text-purple-600" />
            <select
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 outline-none"
            >
              <option value={3}>3 kun</option>
              <option value={7}>7 kun</option>
              <option value={14}>14 kun</option>
              <option value={30}>30 kun</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* Bin List */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Konteynerlar ({bins.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {bins.map(bin => {
              const isSelected = selectedBin === bin.id;
              return (
                <div
                  key={bin.id}
                  onClick={() => handlePredict(bin.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white border border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <h4 className={`font-bold text-sm mb-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {bin.address}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      Hozirgi: {bin.fillLevel}%
                    </span>
                    <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={isSelected ? 'bg-white' : 'bg-purple-500'}
                        style={{ width: `${bin.fillLevel}%`, height: '100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction Results */}
        <div className="col-span-2 flex flex-col bg-white">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-sm font-bold text-slate-600">AI prognoz yaratilmoqda...</p>
              </div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-bold">Konteynerni tanlang</p>
                <p className="text-xs text-slate-400 mt-2">AI prognoz uchun chap tomondan konteyner tanlang</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Current Status */}
              {selectedBinData && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">{selectedBinData.address}</h3>
                      <p className="text-sm text-purple-700 mt-1">{selectedBinData.tozaHudud}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-purple-600">{selectedBinData.fillLevel}%</p>
                      <p className="text-xs text-purple-700 font-bold uppercase">Hozir</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-800">
                    <TrendingUp size={14} />
                    <span className="font-bold">Kunlik o'sish: +{selectedBinData.fillRate}%</span>
                  </div>
                </div>
              )}

              {/* Prediction Timeline */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <BarChart4 size={18} className="text-purple-600" />
                  {daysAhead} Kunlik Prognoz
                </h3>
                
                {predictions.map((pred, index) => {
                  const date = new Date(pred.predictionDate);
                  const isCritical = pred.willBeFull;
                  
                  return (
                    <motion.div
                      key={pred.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        isCritical
                          ? 'bg-red-50 border-red-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-600">
                              {date.toLocaleDateString('uz-UZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {isCritical && (
                              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                <AlertCircle size={10} />
                                TO'LADI
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pred.predictedFillLevel}%` }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                                className={`h-full rounded-full ${
                                  pred.predictedFillLevel >= 90 ? 'bg-red-500' :
                                  pred.predictedFillLevel >= 80 ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}
                              ></motion.div>
                            </div>
                            <span className="text-sm font-black text-slate-800 w-12 text-right">
                              {pred.predictedFillLevel}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <span className="text-[10px] text-slate-400 block">Ishonch</span>
                          <span className="text-sm font-bold text-purple-600">{pred.confidence.toFixed(0)}%</span>
                        </div>
                      </div>

                      {pred.recommendedCollectionDate && (
                        <div className="mt-3 pt-3 border-t border-red-200 flex items-center gap-2 text-xs">
                          <Clock size={12} className="text-red-600" />
                          <span className="font-bold text-red-600">
                            Tavsiya: {new Date(pred.recommendedCollectionDate).toLocaleDateString('uz-UZ')} gacha yig'ilsin
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* AI Confidence Info */}
              {predictions.length > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-800 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-600" />
                    <span className="font-bold">
                      AI tahlili {predictions[0]?.basedOnDataPoints || 30} ta tarixiy ma'lumotga asoslangan
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WastePrediction;
