import React, { useState, useEffect } from 'react';
import { Facility, ClimateSchedule, ScheduleAction } from '../types';
import { ApiService } from '../services/api';
import { Calendar, Clock, Power, Settings, Plus, Trash2, Check, Zap, Sun, Moon, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClimateSchedulerProps {
  facilities: Facility[];
}

const ClimateScheduler: React.FC<ClimateSchedulerProps> = ({ facilities }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
    facilityId: '',
    boilerId: '',
    name: '',
    daysOfWeek: [] as string[],
    startTime: '08:00',
    endTime: '18:00',
    action: 'INCREASE_TEMP' as ScheduleAction,
    targetTemperature: 22,
    targetHumidity: 50,
    isActive: true
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await ApiService.getClimateSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await ApiService.createClimateSchedule({
        facility_id: newSchedule.facilityId,
        boiler_id: newSchedule.boilerId || null,
        name: newSchedule.name,
        days_of_week: newSchedule.daysOfWeek,
        start_time: newSchedule.startTime,
        end_time: newSchedule.endTime,
        action: newSchedule.action,
        target_temperature: newSchedule.targetTemperature,
        target_humidity: newSchedule.targetHumidity,
        is_active: newSchedule.isActive
      });
      
      alert('✅ Jadval muvaffaqiyatli yaratildi!');
      setShowCreateForm(false);
      await loadSchedules();
      
      // Reset form
      setNewSchedule({
        facilityId: '',
        boilerId: '',
        name: '',
        daysOfWeek: [],
        startTime: '08:00',
        endTime: '18:00',
        action: 'INCREASE_TEMP',
        targetTemperature: 22,
        targetHumidity: 50,
        isActive: true
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('❌ Xatolik yuz berdi');
    }
  };

  const toggleDay = (day: string) => {
    setNewSchedule(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    
    try {
      await ApiService.deleteClimateSchedule(id);
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const toggleScheduleActive = async (id: string, isActive: boolean) => {
    try {
      await ApiService.updateClimateSchedule(id, { is_active: !isActive });
      await loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const days = [
    { key: 'MON', label: 'Du' },
    { key: 'TUE', label: 'Se' },
    { key: 'WED', label: 'Chor' },
    { key: 'THU', label: 'Pay' },
    { key: 'FRI', label: 'Ju' },
    { key: 'SAT', label: 'Sha' },
    { key: 'SUN', label: 'Ya' },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INCREASE_TEMP': return <Thermometer className="text-red-500" size={16} />;
      case 'DECREASE_TEMP': return <Thermometer className="text-blue-500" size={16} />;
      case 'SHUTDOWN': return <Power className="text-slate-500" size={16} />;
      default: return <Settings className="text-slate-500" size={16} />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'INCREASE_TEMP': 'Haroratni Oshirish',
      'DECREASE_TEMP': 'Haroratni Pasaytirish',
      'MAINTAIN_TEMP': 'Haroratni Ushlab Turish',
      'INCREASE_HUMIDITY': 'Namlikni Oshirish',
      'DECREASE_HUMIDITY': 'Namlikni Pasaytirish',
      'SHUTDOWN': 'O\'chirish'
    };
    return labels[action] || action;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Calendar size={24} />
              </div>
              Ish Vaqti Jadval
            </h2>
            <p className="text-sm text-slate-500 mt-1">Avtomatik yoqish/o'chirish rejimlari</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Yangi Jadval
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50">
        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold text-slate-800 mb-4">Yangi Jadval Yaratish</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ob'ekt</label>
                  <select
                    value={newSchedule.facilityId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, facilityId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="">Tanlang</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Jadval Nomi</label>
                  <input
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                    placeholder="Masalan: Ertalabki Isitish"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Boshlanish Vaqti</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tugash Vaqti</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Amal</label>
                  <select
                    value={newSchedule.action}
                    onChange={(e) => setNewSchedule({ ...newSchedule, action: e.target.value as ScheduleAction })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="INCREASE_TEMP">Haroratni Oshirish</option>
                    <option value="DECREASE_TEMP">Haroratni Pasaytirish</option>
                    <option value="MAINTAIN_TEMP">Haroratni Ushlab Turish</option>
                    <option value="INCREASE_HUMIDITY">Namlikni Oshirish</option>
                    <option value="DECREASE_HUMIDITY">Namlikni Pasaytirish</option>
                    <option value="SHUTDOWN">O'chirish</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Maqsad Harorat (°C)</label>
                  <input
                    type="number"
                    value={newSchedule.targetTemperature}
                    onChange={(e) => setNewSchedule({ ...newSchedule, targetTemperature: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Maqsad Namlik (%)</label>
                  <input
                    type="number"
                    value={newSchedule.targetHumidity}
                    onChange={(e) => setNewSchedule({ ...newSchedule, targetHumidity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Kunlar</label>
                <div className="flex gap-2">
                  {days.map(day => (
                    <button
                      key={day.key}
                      onClick={() => toggleDay(day.key)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        newSchedule.daysOfWeek.includes(day.key)
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleCreateSchedule}
                  disabled={!newSchedule.facilityId || !newSchedule.name || newSchedule.daysOfWeek.length === 0}
                  className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Saqlash
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedules List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold">Hozircha jadval yo'q</p>
              <p className="text-xs mt-1">Yuqoridagi tugmani bosib jadval yarating</p>
            </div>
          ) : (
            schedules.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white p-6 rounded-2xl border shadow-sm ${
                  schedule.is_active ? 'border-indigo-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-slate-800">{schedule.name}</h3>
                      {schedule.is_active ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Zap size={12} />
                          Faol
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                          O'chirilgan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {schedule.facility?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleScheduleActive(schedule.id, schedule.is_active)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        schedule.is_active
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                    >
                      {schedule.is_active ? 'O\'chirish' : 'Yoqish'}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Vaqt</span>
                    </div>
                    <p className="text-lg font-black text-slate-800">
                      {schedule.start_time} - {schedule.end_time}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(schedule.action)}
                      <span className="text-xs font-bold text-slate-500 uppercase">Amal</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {getActionLabel(schedule.action)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer size={16} className="text-purple-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Maqsad</span>
                    </div>
                    <p className="text-lg font-black text-slate-800">
                      {schedule.target_temperature}°C / {schedule.target_humidity}%
                    </p>
                  </div>
                </div>

                {/* Days */}
                <div className="flex gap-2">
                  {days.map(day => (
                    <div
                      key={day.key}
                      className={`flex-1 py-2 rounded-lg text-center text-xs font-bold ${
                        schedule.days_of_week?.includes(day.key)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimateScheduler;
