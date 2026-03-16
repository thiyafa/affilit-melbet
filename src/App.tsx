/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Apple, 
  Copy, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Zap,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  Lock,
  X,
  Smartphone
} from 'lucide-react';

// Types
type GameState = 'idle' | 'generating' | 'finished';
type AppState = 'validation' | 'activating' | 'emulator';

const ODDS = [
  'x1.23', 'x1.54', 'x1.93', 'x2.41', 'x4.02', 
  'x6.71', 'x11.18'
];

export default function App() {
  // Config State (Admin)
  const [config, setConfig] = useState({
    promoCode: localStorage.getItem('promoCode') || "WIN777",
    referralLink: localStorage.getItem('referralLink') || "https://melbet.com/registration",
    downloadLink: localStorage.getItem('downloadLink') || "https://melbet.com/mobile",
    // Obfuscated password: btoa("161120") -> "MTYxMTIw"
    adminHash: "MTYxMTIw"
  });

  const [appState, setAppState] = useState<AppState>('validation');
  const [userId, setUserId] = useState('');
  const [promoCopied, setPromoCopied] = useState(false);
  const [activationProgress, setActivationProgress] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [signals, setSignals] = useState<number[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio and browser check
  useEffect(() => {
    successAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    
    // In-app browser detection and silent exit
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFacebook = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isInstagram = ua.indexOf("Instagram") > -1;
    const isAndroid = /Android/i.test(ua);
    const isIos = /iPhone|iPad|iPod/i.test(ua);

    if (isFacebook || isInstagram) {
      const cleanUrl = window.location.href.replace(/^https?:\/\//, "");
      if (isAndroid) {
        // Android Intent to force external browser
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      } else if (isIos) {
        // iOS protocol trick to trigger "Open in Safari" prompt
        window.location.href = `x-safari-https://${cleanUrl}`;
      }
    }
  }, []);

  const handleCopyPromo = () => {
    navigator.clipboard.writeText(config.promoCode);
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2000);
  };

  const validateMelbetId = (id: string) => {
    // Melbet IDs are numeric and typically 8-10 digits
    return /^\d{8,10}$/.test(id);
  };

  const handleActivate = () => {
    if (!validateMelbetId(userId)) {
      alert('الرجاء إدخال ID صحيح (8-10 أرقام)');
      return;
    }
    setAppState('activating');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setAppState('emulator'), 500);
      }
      setActivationProgress(progress);
    }, 300);
  };

  const getSignal = () => {
    setGameState('generating');
    setSignals([]);
    
    let currentSignals: number[] = [];
    let step = 0;

    const interval = setInterval(() => {
      const randomCol = Math.floor(Math.random() * 5);
      currentSignals.push(randomCol);
      setSignals([...currentSignals]);
      
      // Play sound
      if (successAudioRef.current) {
        successAudioRef.current.currentTime = 0;
        successAudioRef.current.play().catch(() => {});
      }

      step++;
      if (step >= ODDS.length) {
        clearInterval(interval);
        setGameState('finished');
      }
    }, 600);
  };

  const handleDeepLink = () => {
    // Try to open app, fallback to referral link
    const appUrl = "melbet://";
    const webUrl = config.referralLink;
    
    const start = Date.now();
    window.location.href = appUrl;
    
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = webUrl;
      }
    }, 500);
  };

  // Admin Panel Logic
  const handleAdminTrigger = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAdmin(true);
    }, 2000);
  };

  const clearAdminTrigger = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleAdminLogin = () => {
    // Compare Base64 of input with the stored hash
    if (window.btoa(passwordInput) === config.adminHash) {
      setAdminAuth(true);
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  const saveConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem(key, value);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden" dir="rtl">
      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <div className="bg-[#16161a] w-full max-w-sm rounded-3xl p-6 border border-white/10 relative">
              <button onClick={() => { setShowAdmin(false); setAdminAuth(false); setPasswordInput(''); }} className="absolute top-4 left-4 text-gray-500">
                <X size={24} />
              </button>
              
              {!adminAuth ? (
                <div className="space-y-6 pt-4">
                  <div className="flex flex-col items-center gap-2">
                    <Lock className="text-emerald-500" size={32} />
                    <h3 className="text-xl font-bold">لوحة التحكم</h3>
                  </div>
                  <input 
                    type="password"
                    placeholder="كلمة المرور"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#1c1c21] border border-white/10 p-4 rounded-2xl text-white text-center"
                  />
                  <button onClick={handleAdminLogin} className="w-full bg-emerald-500 p-4 rounded-2xl font-bold">دخول</button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold mb-4">تعديل الإعدادات</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">كود البرومو</label>
                    <input value={config.promoCode} onChange={(e) => saveConfig('promoCode', e.target.value)} className="w-full bg-[#1c1c21] p-3 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">رابط الإحالة</label>
                    <input value={config.referralLink} onChange={(e) => saveConfig('referralLink', e.target.value)} className="w-full bg-[#1c1c21] p-3 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">رابط التنزيل</label>
                    <input value={config.downloadLink} onChange={(e) => saveConfig('downloadLink', e.target.value)} className="w-full bg-[#1c1c21] p-3 rounded-xl text-sm" />
                  </div>
                  <button onClick={() => setShowAdmin(false)} className="w-full bg-emerald-500 p-3 rounded-xl font-bold mt-4">حفظ وإغلاق</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onMouseDown={handleAdminTrigger}
          onMouseUp={clearAdminTrigger}
          onTouchStart={handleAdminTrigger}
          onTouchEnd={clearAdminTrigger}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Apple className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Apple Predictor <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">v2.0</span></h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium"><span className="text-yellow-400 font-bold">Melbet</span> Only</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {appState === 'validation' && (
            <motion.div
              key="validation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">تفعيل الأداة</h2>
                <p className="text-gray-400 text-sm">هذا السكربت مصمم خصيصاً للعمل على منصة <span className="text-yellow-400 font-bold">Melbet</span> فقط</p>
              </div>

              <div className="bg-[#16161a] p-6 rounded-3xl border border-white/5 space-y-6 shadow-xl">
                {/* Step 1: Promo Code */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px]">1</span>
                    انسخ كود التفعيل
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={handleCopyPromo}
                      className="relative w-full bg-[#1c1c21] border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:border-emerald-500/50 transition-all active:scale-[0.98]"
                    >
                      <span className="text-xl font-mono font-bold tracking-widest text-white">{config.promoCode}</span>
                      {promoCopied ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      ) : (
                        <Copy className="text-gray-500" size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">استخدم هذا الكود عند التسجيل لتفعيل ميزة الـ VIP</p>
                </div>

                {/* Step 2: User ID */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px]">2</span>
                    أدخل الـ ID الخاص بك (<span className="text-yellow-400">Melbet</span>)
                  </label>
                  <input 
                    type="number"
                    placeholder="مثال: 12345678"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-[#1c1c21] border border-white/10 p-4 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <button 
                  onClick={handleActivate}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Zap size={20} fill="currentColor" />
                  تفعيل الآن
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeepLink}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={18} className="text-emerald-500" />
                  <span className="text-sm font-bold">ليس لديك حساب؟ سجل الآن</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#16161a] p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <span className="text-[10px] text-gray-400">آمن 100%</span>
                </div>
                <div className="bg-[#16161a] p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-[10px] text-gray-400">دقة عالية</span>
                </div>
                <div className="bg-[#16161a] p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                  <Users className="text-emerald-500" size={20} />
                  <span className="text-[10px] text-gray-400">+10k مستخدم</span>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'activating' && (
            <motion.div
              key="activating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-emerald-500" size={32} fill="currentColor" />
                </div>
              </div>
              
              <div className="text-center space-y-4 w-full">
                <h2 className="text-2xl font-bold">جاري فحص بيانات Melbet...</h2>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${activationProgress}%` }}
                  />
                </div>
                <p className="text-gray-500 text-sm">يتم الآن ربط حسابك بالخادم السحابي</p>
              </div>
            </motion.div>
          )}

          {appState === 'emulator' && (
            <motion.div
              key="emulator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-[#16161a] p-4 rounded-3xl border border-white/5 shadow-2xl relative">
                {/* Game Grid */}
                <div className="flex flex-col gap-1.5 relative z-10">
                  {[...Array(ODDS.length)].map((_, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-3 py-1 border-b border-white/[0.03] last:border-0">
                      <div className="w-12 text-[10px] font-mono font-bold text-emerald-500/60 text-left shrink-0">
                        {ODDS[ODDS.length - 1 - rowIdx]}
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {[...Array(5)].map((_, colIdx) => {
                          const isSignal = signals[ODDS.length - 1 - rowIdx] === colIdx;
                          return (
                            <motion.div
                              key={colIdx}
                              initial={false}
                              animate={{
                                backgroundColor: isSignal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                borderColor: isSignal ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                                scale: isSignal ? 1.05 : 1
                              }}
                              className="aspect-square rounded-xl border flex items-center justify-center transition-colors duration-300"
                            >
                              {isSignal && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: 'spring', damping: 12 }}
                                >
                                  <Apple className="text-emerald-500 fill-emerald-500" size={18} />
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={getSignal}
                  disabled={gameState === 'generating'}
                  className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                    gameState === 'generating' 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
                  }`}
                >
                  {gameState === 'generating' ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Play size={24} fill="currentColor" />
                      إظهار التوقعات
                    </>
                  )}
                </button>
                
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                    ملاحظة: هذا السكربت مصمم خصيصاً لمنصة <span className="text-yellow-400 font-bold">Melbet</span>. التوقعات مبنية على خوارزمية احتمالية محلية.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation (Fake) */}
      <nav className="fixed bottom-0 w-full bg-[#0a0a0c]/80 backdrop-blur-md border-t border-white/5 px-6 py-4 flex justify-around items-center z-50">
        <div className="flex flex-col items-center gap-1 text-emerald-500">
          <Zap size={20} fill="currentColor" />
          <span className="text-[10px] font-bold">الأداة</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-600">
          <TrendingUp size={20} />
          <span className="text-[10px] font-bold">الإحصائيات</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-600">
          <Users size={20} />
          <span className="text-[10px] font-bold">المجتمع</span>
        </div>
      </nav>
    </div>
  );
}
