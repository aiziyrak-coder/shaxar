import React, { useState, useEffect } from 'react';
import { Facility } from '../types';
import { ApiService } from '../services/api';
import { Bell, MessageSquare, Mail, Smartphone, AlertCircle, Thermometer, Droplets, Plus, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClimateAlertsProps {
  facilities: Facility[];
}

interface AlertRule {
  id: string;
  name: string;
  facilityId: string;
  condition: 'TEMP_LOW' | 'TEMP_HIGH' | 'HUMIDITY_LOW' | 'HUMIDITY_HIGH';
  threshold: number;
  channel: 'SMS' | 'EMAIL' | 'TELEGRAM';
  recipient: string;
  enabled: boolean;
}

const ClimateAlerts: React.FC<ClimateAlertsProps> = ({ facilities }) => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sentAlerts, setSentAlerts] = useState<any[]>([]);
  
  const [newRule, setNewRule] = useState({
    name: '',
    facilityId: '',
    condition: 'TEMP_LOW' as 'TEMP_LOW' | 'TEMP_HIGH' | 'HUMIDITY_LOW' | 'HUMIDITY_HIGH',
    threshold: 18,
    channel: 'TELEGRAM' as 'SMS' | 'EMAIL' | 'TELEGRAM',
    recipient: '',
    enabled: true
  });

  // Load rules from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('climate_alert_rules');
    if (stored) {
      try {
        setAlertRules(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading alert rules:', error);
      }
    }
  }, []);

  // Save rules to localStorage
  useEffect(() => {
    localStorage.setItem('climate_alert_rules', JSON.stringify(alertRules));
  }, [alertRules]);

  // Load sent alerts
  useEffect(() => {
    loadSentAlerts();
  }, []);

  const loadSentAlerts = async () => {
    try {
      const alerts = await ApiService.getAlerts();
      // Filter only climate-related alerts
      const climateAlerts = alerts.filter(a => 
        a.alert_type === 'TEMPERATURE_CRITICAL' || 
        a.alert_type === 'HUMIDITY_CRITICAL'
      );
      setSentAlerts(climateAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Monitor facilities and trigger alerts
  useEffect(() => {
    if (alertRules.length === 0) return;

    const checkAlerts = () => {
      facilities.forEach(facility => {
        const facilityRules = alertRules.filter(r => r.facilityId === facility.id && r.enabled);
        
        facilityRules.forEach(rule => {
          facility.boilers.forEach(boiler => {
            let shouldAlert = false;
            let message = '';

            if (rule.condition === 'TEMP_LOW' && boiler.temperature !== undefined && boiler.temperature < rule.threshold) {
              shouldAlert = true;
              message = `${facility.name} - ${boiler.name}: Harorat juda past! (${boiler.temperature.toFixed(1)}°C < ${rule.threshold}°C)`;
            } else if (rule.condition === 'TEMP_HIGH' && boiler.temperature !== undefined && boiler.temperature > rule.threshold) {
              shouldAlert = true;
              message = `${facility.name} - ${boiler.name}: Harorat juda yuqori! (${boiler.temperature.toFixed(1)}°C > ${rule.threshold}°C)`;
            } else if (rule.condition === 'HUMIDITY_LOW' && boiler.humidity < rule.threshold) {
              shouldAlert = true;
              message = `${facility.name} - ${boiler.name}: Namlik juda past! (${boiler.humidity.toFixed(1)}% < ${rule.threshold}%)`;
            } else if (rule.condition === 'HUMIDITY_HIGH' && boiler.humidity > rule.threshold) {
              shouldAlert = true;
              message = `${facility.name} - ${boiler.name}: Namlik juda yuqori! (${boiler.humidity.toFixed(1)}% > ${rule.threshold}%)`;
            }

            if (shouldAlert) {
              sendAlert(rule, message, facility.id);
            }
          });
        });
      });
    };

    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [alertRules, facilities]);

  const sendAlert = async (rule: AlertRule, message: string, facilityId: string) => {
    try {
      await ApiService.createAlert({
        alert_type: rule.condition.includes('TEMP') ? 'TEMPERATURE_CRITICAL' : 'HUMIDITY_CRITICAL',
        title: rule.name,
        message: message,
        severity: 'CRITICAL',
        channel: rule.channel,
        recipient: rule.recipient,
        related_facility_id: facilityId
      });
      
      await loadSentAlerts();
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.facilityId || !newRule.recipient) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const rule: AlertRule = {
      id: `RULE-${Date.now()}`,
      ...newRule
    };

    setAlertRules(prev => [...prev, rule]);
    setShowCreateForm(false);
    
    // Reset form
    setNewRule({
      name: '',
      facilityId: '',
      condition: 'TEMP_LOW',
      threshold: 18,
      channel: 'TELEGRAM',
      recipient: '',
      enabled: true
    });
    
    alert('✅ Ogohlantirish qoidasi yaratildi!');
  };

  const toggleRule = (id: string) => {
    setAlertRules(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteRule = (id: string) => {
    if (confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
      setAlertRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const getConditionLabel = (condition: string) => {
    const labels = {
      'TEMP_LOW': 'Harorat Past',
      'TEMP_HIGH': 'Harorat Yuqori',
      'HUMIDITY_LOW': 'Namlik Past',
      'HUMIDITY_HIGH': 'Namlik Yuqori'
    };
    return labels[condition as keyof typeof labels] || condition;
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
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg">
                <Bell size={24} />
              </div>
              Avtomatik Ogohlantirish
            </h2>
            <p className="text-sm text-slate-500 mt-1">SMS, Email, Telegram integratsiyasi</p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Yangi Qoida
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 custom-scrollbar">
        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold text-slate-800 mb-4">Yangi Ogohlantirish Qoidasi</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Qoida Nomi</label>
                  <input
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="Masalan: Maktab Harorat Kritik"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ob'ekt</label>
                  <select
                    value={newRule.facilityId}
                    onChange={(e) => setNewRule({ ...newRule, facilityId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="">Tanlang</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Shart</label>
                  <select
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="TEMP_LOW">Harorat juda past</option>
                    <option value="TEMP_HIGH">Harorat juda yuqori</option>
                    <option value="HUMIDITY_LOW">Namlik juda past</option>
                    <option value="HUMIDITY_HIGH">Namlik juda yuqori</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Chegara Qiymati</label>
                  <input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Kanal</label>
                  <select
                    value={newRule.channel}
                    onChange={(e) => setNewRule({ ...newRule, channel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <option value="TELEGRAM">Telegram</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Qabul Qiluvchi</label>
                  <input
                    value={newRule.recipient}
                    onChange={(e) => setNewRule({ ...newRule, recipient: e.target.value })}
                    placeholder="+998901234567 / email@example.com / @telegram_username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
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
                  onClick={handleCreateRule}
                  className="flex-1 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Qoidani Saqlash
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert Rules List */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Faol Qoidalar ({alertRules.filter(r => r.enabled).length})</h3>
          <div className="space-y-3">
            {alertRules.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">Hozircha qoida yo'q</p>
                <p className="text-xs text-slate-400 mt-1">Yuqoridagi tugmani bosib qoida yarating</p>
              </div>
            ) : (
              alertRules.map((rule, index) => {
                const facility = facilities.find(f => f.id === rule.facilityId);
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white p-6 rounded-2xl border shadow-sm ${
                      rule.enabled ? 'border-red-200' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-slate-800">{rule.name}</h4>
                          {rule.enabled && (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Check size={12} />
                              Faol
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{facility?.name || 'N/A'}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${
                            rule.enabled
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          }`}
                        >
                          {rule.enabled ? 'O\'chirish' : 'Yoqish'}
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold"
                        >
                          O'chirish
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Shart</p>
                        <p className="text-sm font-bold text-slate-800">{getConditionLabel(rule.condition)}</p>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Chegara</p>
                        <p className="text-xl font-black text-red-600">
                          {rule.threshold}{rule.condition.includes('TEMP') ? '°C' : '%'}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                          {getChannelIcon(rule.channel)}
                          Kanal
                        </p>
                        <p className="text-sm font-bold text-blue-600">{rule.channel}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Qabul qiluvchi:</span> {rule.recipient}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Sent Alerts History */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4">Yuborilgan Ogohlantirishlar</h3>
          <div className="space-y-2">
            {sentAlerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 rounded-xl border border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-800">{alert.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                  </div>
                  {alert.is_sent && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                      ✓ Yuborildi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    {getChannelIcon(alert.channel)}
                    {alert.channel}
                  </span>
                  <span>•</span>
                  <span>{new Date(alert.created_at).toLocaleString('uz-UZ')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateAlerts;
