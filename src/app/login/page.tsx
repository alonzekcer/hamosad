'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateClientId, getProfile, registerProfile, clearClientId } from '@/lib/auth';

function WaveSVG() {
  return (
    <svg viewBox="0 0 390 80" className="w-full" style={{ display: 'block', marginBottom: -2 }}>
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d="M0,40 C60,10 120,70 180,40 C240,10 300,70 390,35 L390,80 L0,80 Z" fill="url(#waveGrad)" opacity="0.9"/>
      <path d="M0,55 C80,25 160,75 240,50 C300,30 350,65 390,50 L390,80 L0,80 Z" fill="#0ea5e9" opacity="0.5"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [guideCode, setGuideCode] = useState('');
  const [showGuideCode, setShowGuideCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkExisting() {
      try {
        const clientId = getOrCreateClientId();
        const profile = await getProfile(clientId);
        if (profile) {
          if (!profile.approved) setPending(true);
          else router.replace('/calendar');
        }
      } finally {
        setChecking(false);
      }
    }
    checkExisting();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setError('יש להזין שם מלא'); return; }
    setLoading(true);
    setError('');
    try {
      const clientId = getOrCreateClientId();
      const profile = await registerProfile(clientId, fullName.trim(), guideCode.trim() || undefined);
      if (!profile.approved) setPending(true);
      else router.replace('/calendar');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(180deg,#0284c7 0%,#0ea5e9 40%,#e0f2fe 100%)' }}>
        <div className="text-6xl" style={{ animation: 'bounce 1s infinite' }}>🌊</div>
        <div className="text-white font-black text-lg">טוען...</div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="flex-1 flex flex-col" style={{ background: 'linear-gradient(180deg,#0284c7 0%,#0ea5e9 50%,#bae6fd 100%)' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
          <div className="text-8xl bounce-in">⏳</div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-2">ממתין לאישור!</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              הרישום שלך נשמר 🎉<br />המדריך יאשר את הגישה שלך בקרוב
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-3.5 rounded-2xl font-black text-base bg-white shadow-lg active:scale-95 transition-all"
            style={{ color: '#0284c7' }}
          >
            🔄 בדוק שוב
          </button>
          <button
            onClick={() => { clearClientId(); setPending(false); setFullName(''); }}
            className="text-blue-100 text-sm font-bold underline underline-offset-2 active:opacity-60"
          >
            ← חזור להתחברות
          </button>
        </div>
        {/* Wave at bottom */}
        <div>
          <svg viewBox="0 0 390 60" className="w-full" style={{ display: 'block' }}>
            <path d="M0,30 C80,0 160,55 240,25 C300,5 350,45 390,20 L390,60 L0,60 Z" fill="white" opacity="0.3"/>
            <path d="M0,45 C60,15 140,60 220,35 C290,15 340,50 390,30 L390,60 L0,60 Z" fill="white" opacity="0.15"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Ocean hero */}
      <div className="relative" style={{ background: 'linear-gradient(180deg,#0284c7 0%,#0ea5e9 70%,#38bdf8 100%)' }}>
        {/* Floating emojis */}
        <div className="absolute top-4 right-6 text-3xl opacity-60" style={{ animation: 'bounce 2s infinite' }}>☀️</div>
        <div className="absolute top-8 left-8 text-2xl opacity-50" style={{ animation: 'bounce 2.5s infinite 0.5s' }}>🐠</div>
        <div className="absolute top-16 right-16 text-xl opacity-40">⛵</div>

        <div className="relative text-center pt-14 pb-4 px-6">
          <div className="text-7xl mb-3 drop-shadow-lg">🌊</div>
          <h1 className="text-4xl font-black text-white drop-shadow-md">המוסד</h1>
          <p className="text-blue-100 text-sm mt-1 font-medium">לוח פעילויות קיץ 🏄</p>
          {/* Decorative dots */}
          <div className="flex justify-center gap-2 mt-3">
            {['🐚','🦀','🐬'].map((e,i)=><span key={i} className="text-lg opacity-70">{e}</span>)}
          </div>
        </div>
        <WaveSVG />
      </div>

      {/* Form area */}
      <div className="flex-1 px-6 pt-6" style={{ background: 'linear-gradient(180deg,#f0f9ff,#e0f2fe)' }}>
        <h2 className="text-2xl font-black mb-1" style={{ color: '#0369a1' }}>כניסה 👋</h2>
        <p className="text-sm mb-6 font-medium" style={{ color: '#38bdf8' }}>הזן את שמך כדי להיכנס ללוח</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#0369a1' }}>שם מלא</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם מלא"
              autoFocus
              className="w-full rounded-2xl px-4 py-4 text-base focus:outline-none font-medium"
              style={{ border: '2.5px solid #7dd3fc', background: 'white', color: '#0c4a6e' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowGuideCode(!showGuideCode)}
            className="flex items-center gap-2 text-sm font-bold self-start"
            style={{ color: '#0284c7' }}
          >
            <span className="text-lg">{showGuideCode ? '➖' : '🔑'}</span>
            {showGuideCode ? 'הסתר קוד מדריך' : 'אני מדריך'}
          </button>

          {showGuideCode && (
            <input
              type="password"
              value={guideCode}
              onChange={(e) => setGuideCode(e.target.value)}
              placeholder="קוד מדריך"
              className="w-full rounded-2xl px-4 py-4 text-base focus:outline-none font-medium"
              style={{ border: '2.5px solid #38bdf8', background: 'white', color: '#0c4a6e' }}
            />
          )}

          {error && (
            <div className="bg-red-50 text-red-500 text-sm rounded-2xl px-4 py-3 font-medium border border-red-200">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}
          >
            {loading ? '🌊 נכנס...' : 'כניסה ללוח 🏖️'}
          </button>
        </form>

        {/* Bottom emojis */}
        <div className="text-center mt-8 text-2xl space-x-2 opacity-50">
          🌴 🏊 🎡 🍦 🌺
        </div>
      </div>
    </div>
  );
}
