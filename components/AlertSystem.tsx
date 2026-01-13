import React, { useState, useEffect } from 'react';
import { AlertNotification, AlertType, AlertChannel, AlertSeverity } from '../types';
import { ApiService } from '../services/api';
import { Bell, AlertCircle, Info, AlertTriangle, MessageSquare, Mail, Smartphone, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertSystemProps {
  onAlertCreated?: () => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ onAlertCreated }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newAlert, setNewAlert] = useState({
    alertType: 'WASTE_BIN_FULL' as AlertType,
    title: '',
    message: '',
    severity: 'WARNING' as AlertSeverity,
    channel: 'APP' as AlertChannel,
    recipient: ''
  });

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsData = await ApiService.getAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      await ApiService.createAlert(newAlert);
      alert('✅ Ogohlantirish yuborildi!');
      setShowCreateForm(false);
      setNewAlert({
        alertType: 'WASTE_BIN_FULL',
        title: '',
        message: '',
        severity: 'WARNING',
        channel: 'APP',
        recipient: ''
      });
      await loadAlerts();
      
      if (onAlertCreated) {
        onAlertCreated();
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('❌ Xatolik yuz berdi');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertCircle className="text-red-500" size={20} />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone size={16} />;
      case 'EMAIL': return <Mail size={16} />;
      case 'TELEGRAM': return <MessageSquare size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
                <Bell size={24} />
              </div>
              Ogohlantirish Tizimi
            </h2>
            <p className="text-sm text-slate-500 mt-1">SMS, Email, Telegram integratsiyasi</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <Send size={18} />
            Yangi Ogohlantirish
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
              <h3 className="font-bold text-slate-800 mb-4">Yangi Ogohlantirish Yaratish</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Turi</label>
                  <select
                    value={newAlert.alertType}
                    onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value as AlertType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="WASTE_BIN_FULL">Konteyner To'lgan</option>
                    <option value="TEMPERATURE_CRITICAL">Harorat Kritik</option>
                    <option value="HUMIDITY_CRITICAL">Namlik Kritik</option>
                    <option value="DEVICE_OFFLINE">Qurilma Offline</option>
                    <option value="TASK_TIMEOUT">Vazifa Vaqti Tugadi</option>
                    <option value="FUEL_LOW">Yoqilg'i Kam</option>
                    <option value="MAINTENANCE_DUE">Texnik Ko'rik Kerak</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Kanal</label>
                  <select
                    value={newAlert.channel}
                    onChange={(e) => setNewAlert({ ...newAlert, channel: e.target.value as AlertChannel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="APP">Ilova (Push)</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                    <option value="TELEGRAM">Telegram</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Muhimlik</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as AlertSeverity })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="INFO">Ma'lumot</option>
                    <option value="WARNING">Ogohlantirish</option>
                    <option value="CRITICAL">Kritik</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Qabul qiluvchi</label>
                  <input
                    value={newAlert.recipient}
                    onChange={(e) => setNewAlert({ ...newAlert, recipient: e.target.value })}
                    placeholder="+998901234567 / email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Sarlavha</label>
                  <input
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="Ogohlantirish sarlavhasi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Xabar</label>
                  <textarea
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="Batafsil xabar matni..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!newAlert.title || !newAlert.message || !newAlert.recipient}
                  className="flex-1 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Yuborish
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold">Hozircha ogohlantirish yo'q</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl border shadow-sm ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'WARNING' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-bold text-slate-800">{alert.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  
                  {alert.is_sent ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check size={12} />
                      Yuborildi
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                      Kutilmoqda
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    {getChannelIcon(alert.channel)}
                    {alert.channel}
                  </span>
                  <span>→ {alert.recipient}</span>
                  <span className="ml-auto">
                    {new Date(alert.created_at).toLocaleString('uz-UZ', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;
