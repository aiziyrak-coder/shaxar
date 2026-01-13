import React, { useState, useEffect } from 'react';
import { WasteBin, Truck, WasteTask } from '../types';
import { ApiService } from '../services/api';
import { Target, User, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Play, Send, Navigation2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskAssignmentProps {
  bins: WasteBin[];
  trucks: Truck[];
  onTaskCreated?: () => void;
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({ bins, trucks, onTaskCreated }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await ApiService.getWasteTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (binId: string) => {
    try {
      setAssigning(true);
      const result = await ApiService.autoAssignTask(binId);
      
      // Show success notification
      alert(`✅ Vazifa muvaffaqiyatli tayinlandi!\n\nHaydovchi: ${result.task.assigned_truck?.driverName || 'N/A'}\nMasofa: ${result.distance} km`);
      
      // Reload tasks
      await loadTasks();
      
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error: any) {
      console.error('Error auto-assigning task:', error);
      
      if (error.message?.includes('No available trucks')) {
        alert('❌ Hozirda bo\'sh texnika yo\'q. Iltimos, keyinroq urinib ko\'ring.');
      } else {
        alert('❌ Vazifa tayinlashda xatolik yuz berdi.');
      }
    } finally {
      setAssigning(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await ApiService.updateWasteTask(taskId, { 
        status,
        ...(status === 'IN_PROGRESS' && { started_at: new Date().toISOString() }),
        ...(status === 'COMPLETED' && { completed_at: new Date().toISOString() })
      });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'PENDING': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Kutilmoqda', icon: Clock },
      'ASSIGNED': { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Tayinlangan', icon: Target },
      'IN_PROGRESS': { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Jarayonda', icon: Play },
      'COMPLETED': { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Bajarildi', icon: CheckCircle },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-600', label: 'Rad etildi', icon: XCircle },
      'TIMEOUT': { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Vaqt tugadi', icon: AlertTriangle },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'LOW': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Past' },
      'MEDIUM': { bg: 'bg-blue-100', text: 'text-blue-600', label: 'O\'rtacha' },
      'HIGH': { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Yuqori' },
      'URGENT': { bg: 'bg-red-100', text: 'text-red-600', label: 'Shoshilinch' },
    };
    
    const badge = badges[priority as keyof typeof badges] || badges.MEDIUM;
    
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-[10px] font-bold`}>
        {badge.label}
      </span>
    );
  };

  const fullBins = bins.filter(b => b.fillLevel >= 80);

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Target size={24} />
              </div>
              Vazifa Tayinlash
            </h2>
            <p className="text-sm text-slate-500 mt-1">Avtomatik va qo'lda boshqarish</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold">To'lgan konteynerlar</p>
              <p className="text-3xl font-black text-red-600">{fullBins.length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold">Faol vazifalar</p>
              <p className="text-3xl font-black text-blue-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
        {/* Full Bins Requiring Collection */}
        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              To'lgan Konteynerlar ({fullBins.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {fullBins.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Hamma konteyner tozalangan! ✅</p>
              </div>
            ) : (
              fullBins.map(bin => (
                <motion.div
                  key={bin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-300 transition-all cursor-pointer"
                  onClick={() => setSelectedBin(bin.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{bin.address}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} />
                        {bin.location.lat.toFixed(4)}, {bin.location.lng.toFixed(4)}
                      </p>
                    </div>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                      {bin.fillLevel}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoAssign(bin.id);
                      }}
                      disabled={assigning}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {assigning ? (
                        <>Tayinlanmoqda...</>
                      ) : (
                        <>
                          <Zap size={14} />
                          Avtomatik Tayinlash
                        </>
                      )}
                    </button>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {bin.tozaHudud.split(' ')[0]}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              Faol Vazifalar ({tasks.filter(t => t.status !== 'COMPLETED').length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.filter(t => t.status !== 'COMPLETED').length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Hozircha vazifa yo'q</p>
              </div>
            ) : (
              tasks.filter(t => t.status !== 'COMPLETED').map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {task.waste_bin?.address || 'Konteyner'}
                      </h4>
                      {task.assigned_truck && (
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                          <User size={10} />
                          {task.assigned_truck.driver_name} ({task.assigned_truck.plate_number})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(task.created_at).toLocaleString('uz-UZ', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className="font-bold">
                      ~{task.estimated_duration} daqiqa
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {task.status === 'ASSIGNED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Play size={14} />
                        Boshlash
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'REJECTED')}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}

                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Bajarildi
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Bugun</p>
          <p className="text-2xl font-black text-slate-800">{tasks.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Bajarildi</p>
          <p className="text-2xl font-black text-emerald-600">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-600 uppercase font-bold mb-1">Jarayonda</p>
          <p className="text-2xl font-black text-blue-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Kutilmoqda</p>
          <p className="text-2xl font-black text-slate-600">{tasks.filter(t => t.status === 'PENDING').length}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignment;
