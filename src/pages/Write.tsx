import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, Timestamp, query, where, getCountFromServer } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Send, Sticker, Type, Palette, Clock, Lock, User, Smile, StickyNote, Stamp as StampIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../App';

const THEMES = [
  { 
    id: 'romantic', 
    name: 'Romantic', 
    bg: 'bg-rose-50', 
    pattern: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%), radial-gradient(circle at 10px 10px, #fecaca 1.5px, transparent 0)',
    border: 'border-rose-200', 
    accent: 'bg-rose-100',
    text: 'text-rose-900', 
    font: 'font-serif', 
    icon: '🌹',
    effect: 'shadow-[0_0_30px_rgba(225,29,72,0.1)]'
  },
  { 
    id: 'sad', 
    name: 'Sad', 
    bg: 'bg-slate-50', 
    pattern: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%), repeating-linear-gradient(45deg, rgba(148,163,184,0.05) 0px, rgba(148,163,184,0.05) 1px, transparent 1px, transparent 10px)',
    border: 'border-slate-200', 
    accent: 'bg-slate-100',
    text: 'text-slate-900', 
    font: 'font-serif', 
    icon: '🌧️',
    effect: 'shadow-[0_0_30px_rgba(71,85,105,0.08)]'
  },
  { 
    id: 'funny', 
    name: 'Funny', 
    bg: 'bg-amber-50', 
    pattern: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%), radial-gradient(circle at 15px 15px, #fcd34d 1.5px, transparent 0)',
    border: 'border-amber-200', 
    accent: 'bg-amber-100',
    text: 'text-amber-900', 
    font: 'font-sans', 
    icon: '✨',
    effect: 'shadow-[0_0_30px_rgba(217,119,6,0.08)]'
  },
  { 
    id: 'birthday', 
    name: 'Birthday', 
    bg: 'bg-purple-50', 
    pattern: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%), radial-gradient(circle at 20px 20px, #e9d5ff 2px, transparent 0), radial-gradient(circle at 40px 40px, #d8b4fe 1.5px, transparent 0)',
    border: 'border-purple-200', 
    accent: 'bg-purple-100',
    text: 'text-purple-900', 
    font: 'font-sans', 
    icon: '🎁',
    effect: 'shadow-[0_0_30px_rgba(147,51,234,0.08)]'
  },
  { 
    id: 'islamic', 
    name: 'Islamic', 
    bg: 'bg-emerald-50', 
    pattern: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%), radial-gradient(circle at center, #10b981 0.5px, transparent 0)',
    border: 'border-emerald-200', 
    accent: 'bg-emerald-100',
    text: 'text-emerald-900', 
    font: 'font-serif', 
    icon: '🕌',
    effect: 'shadow-[0_0_30px_rgba(5,150,105,0.1)]'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    bg: 'bg-slate-50', 
    pattern: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
    border: 'border-slate-300', 
    accent: 'bg-slate-200',
    text: 'text-slate-800', 
    font: 'font-sans', 
    icon: '🖋️',
    effect: 'shadow-[0_0_20px_rgba(0,0,0,0.05)]'
  },
];

const STICKERS = {
  emoji: ['❤️', '✨', '🌸', '💌', '🌙', '🦋', '🧸', '🎈', '🍰', '☕'],
  stamp: ['STAMP_1', 'STAMP_2', 'STAMP_3'], // Placeholder for stamp styles
  memo: ['Note...']
};

export default function Write() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [receiver, setReceiver] = useState<any>(null);
  const [receiverLoading, setReceiverLoading] = useState(!!receiverId);
  const [loading, setLoading] = useState(false);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [noReply, setNoReply] = useState(false);
  const [password, setPassword] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [stickers, setStickers] = useState<any[]>([]);

  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (receiverId) {
      setReceiverLoading(true);
      getDoc(doc(db, 'profiles', receiverId)).then(snap => {
        if (snap.exists()) {
          setReceiver({ id: snap.id, ...snap.data() });
        } else {
          console.error("Receiver not found");
        }
      }).catch(error => {
        handleFirestoreError(error, OperationType.GET, `profiles/${receiverId}`);
      }).finally(() => {
        setReceiverLoading(false);
      });
    }
  }, [receiverId]);

  const addSticker = (type: string, value: string) => {
    if (stickers.length >= 5) return;
    const newSticker: any = {
      type,
      value,
      x: 50,
      y: 50,
    };
    if (type === 'memo') newSticker.text = '';
    
    setStickers([...stickers, newSticker]);
  };

  const updateStickerPos = (index: number, x: number, y: number) => {
    if (!letterRef.current) return;
    const rect = letterRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    let relativeX = ((x - rect.left) / rect.width) * 100;
    let relativeY = ((y - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    relativeX = Math.max(0, Math.min(100, relativeX));
    relativeY = Math.max(0, Math.min(100, relativeY));

    if (isNaN(relativeX) || isNaN(relativeY)) return;
    
    const newStickers = [...stickers];
    newStickers[index] = { ...newStickers[index], x: relativeX, y: relativeY };
    setStickers(newStickers);
  };

  const handleSend = async () => {
    if (!user || !receiver) {
      setSendError("প্রাপকের তথ্য পাওয়া যায়নি। (Receiver info missing)");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setSendError("শিরোনাম এবং চিঠির বিষয়বস্তু লিখুন। (Please enter title and content.)");
      return;
    }
    
    setLoading(true);
    setSendError(null);

    try {
      // Simple rate limit check (max 10 letters per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const q = query(
        collection(db, 'letters'),
        where('senderId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(today))
      );
      
      try {
        const snap = await getCountFromServer(q);
        if (snap.data().count >= 10) {
          setRateLimitReached(true);
          setLoading(false);
          return;
        }
      } catch (countError) {
        console.warn("Rate limit check failed (possibly missing index):", countError);
        // We proceed anyway if the count check fails, to ensure the button "works"
      }

      const letterData: any = {
        senderId: user.uid,
        receiverId: receiver.id,
        title: title || '',
        content: content || '',
        theme: theme.id,
        isAnonymous: !!isAnonymous,
        noReply: !!noReply,
        password: password || null,
        scheduledAt: scheduledAt ? Timestamp.fromDate(new Date(scheduledAt)) : null,
        createdAt: serverTimestamp(),
        stickers: stickers.map(s => {
          const clean: any = { type: s.type, value: s.value, x: s.x, y: s.y };
          if (s.text !== undefined) clean.text = s.text;
          return clean;
        }),
      };

      // Final check for undefined
      Object.keys(letterData).forEach(key => {
        if (letterData[key] === undefined) {
          console.warn(`Field ${key} is undefined, setting to null`);
          letterData[key] = null;
        }
      });

      console.log("Sending letter data:", letterData);
      await addDoc(collection(db, 'letters'), letterData);
      
      // Create notification
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: receiver.id,
          text: "You received a new letter 💌",
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifError) {
        console.warn("Notification failed to send:", notifError);
        // Don't block the user if notification fails
      }

      navigate('/sent');
    } catch (err: any) {
      console.error("Send letter error:", err);
      let msg = "চিঠি পাঠানো সম্ভব হয়নি। (Failed to send letter)";
      if (err.code === 'permission-denied') {
        msg = "আপনার এই চিঠি পাঠানোর অনুমতি নেই। সম্ভবত আপনি ব্লকড অথবা ডাটা ইনভ্যালিড। (Permission denied. You might be blocked or data is invalid.)";
      }
      setSendError(msg);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (receiverLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-accent font-serif text-xl">প্রাপকের তথ্য খোঁজা হচ্ছে...</div>
      </div>
    );
  }

  if (!receiverId || (!receiver && !receiverLoading)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="paper-card p-10 max-w-md">
          <h2 className="text-2xl font-serif text-accent mb-4">প্রাপক পাওয়া যায়নি</h2>
          <p className="text-ink/60 mb-8">অনুগ্রহ করে আবার সার্চ করে প্রাপক নির্বাচন করুন।</p>
          <button onClick={() => navigate('/search')} className="btn-primary">Search Users</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      {/* Progress Bar */}
      <div className="flex justify-between mb-8 px-4">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div 
            key={i} 
            className={`h-1 flex-grow mx-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-black/5'}`} 
          />
        ))}
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step1" className="text-center">
              <h2 className="text-3xl mb-6">প্রাপক নিশ্চিত করুন</h2>
              <div className="paper-card p-8 inline-block">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-accent" />
                </div>
                <h3 className="text-xl font-medium">{receiver?.fullName}</h3>
                <p className="text-ink/60">@{receiver?.username}</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
              <h2 className="text-3xl mb-8 text-center">থিম পছন্দ করুন</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`p-4 rounded-2xl border-2 transition-all relative group ${theme.id === t.id ? `border-accent bg-accent/5 scale-105 ${t.effect}` : 'border-transparent bg-white hover:border-black/5'}`}
                  >
                    <div className={`w-full aspect-square rounded-lg mb-2 ${t.bg} border ${t.border} relative overflow-hidden flex items-center justify-center text-3xl`}>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: t.pattern, backgroundSize: t.id === 'romantic' ? '10px 10px' : 'auto' }} />
                      <span className="relative z-10 group-hover:scale-125 transition-transform">{t.icon}</span>
                    </div>
                    <span className="text-sm font-medium">{t.name}</span>
                    {theme.id === t.id && (
                      <motion.div
                        layoutId="activeTheme"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Sparkles size={12} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step3">
              <h2 className="text-3xl mb-8 text-center">চিঠি লিখুন</h2>
              <div className={`paper-card p-8 min-h-[400px] ${theme.bg} border-2 ${theme.border} ${theme.font} relative overflow-hidden`}>
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture z-30" />
                
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: theme.id === 'romantic' ? '20px 20px' : 'auto' }} />
                <div className="relative z-10">
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="চিঠির শিরোনাম..."
                    className="w-full bg-transparent text-2xl mb-6 border-b border-black/10 outline-none pb-2"
                  />
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="আপনার মনের কথা লিখুন..."
                    className="w-full bg-transparent min-h-[300px] outline-none resize-none leading-relaxed text-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step4" className="max-w-md mx-auto space-y-6">
              <h2 className="text-3xl mb-8 text-center">গোপনীয়তা</h2>
              <div className="flex items-center justify-between p-4 paper-card">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-accent" />
                  <span>বেনামী চিঠি (Anonymous)</span>
                </div>
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="accent-accent w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 paper-card">
                <div className="flex items-center gap-3">
                  <Send size={20} className="text-accent" />
                  <span>রিপ্লাই প্রয়োজন নেই</span>
                </div>
                <input type="checkbox" checked={noReply} onChange={e => setNoReply(e.target.checked)} className="accent-accent w-5 h-5" />
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step5">
              <h2 className="text-3xl mb-8 text-center">স্টিকার যোগ করুন ({stickers.length}/5)</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div 
                  ref={letterRef}
                  className="flex-grow relative paper-card p-8 min-h-[400px] overflow-hidden bg-white border-2 border-dashed border-black/10"
                >
                  <h3 className="text-xl mb-4 opacity-50">{title || 'শিরোনাম'}</h3>
                  <p className="opacity-50 line-clamp-6">{content || 'চিঠির বিষয়বস্তু...'}</p>
                  
                  {stickers.map((s, i) => (
                    <motion.div
                      drag
                      dragConstraints={letterRef}
                      onDragEnd={(_, info) => updateStickerPos(i, info.point.x, info.point.y)}
                      key={i}
                      className="absolute cursor-move select-none"
                      style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {s.type === 'emoji' && <span className="text-4xl">{s.value}</span>}
                      {s.type === 'stamp' && <div className="w-12 h-16 bg-accent/20 border-2 border-accent/40 rounded flex items-center justify-center text-[10px] uppercase font-bold text-accent">Stamp</div>}
                      {s.type === 'memo' && <div className="p-2 bg-yellow-100 shadow-sm border border-yellow-200 text-xs w-24">Note</div>}
                    </motion.div>
                  ))}
                </div>

                <div className="w-full md:w-64 space-y-4">
                  <div className="paper-card p-4">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Smile size={16} /> Emojis</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {STICKERS.emoji.map(e => (
                        <button key={e} onClick={() => addSticker('emoji', e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                      ))}
                    </div>
                  </div>
                  <div className="paper-card p-4">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><StampIcon size={16} /> Stamps</h4>
                    <div className="flex gap-2">
                      {STICKERS.stamp.map(s => (
                        <button key={s} onClick={() => addSticker('stamp', s)} className="w-10 h-10 bg-black/5 rounded hover:bg-black/10" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step6" className="max-w-md mx-auto space-y-6">
              <h2 className="text-3xl mb-8 text-center">অ্যাডভান্সড অপশন</h2>
              <div className="paper-card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={20} className="text-accent" />
                  <span>ভবিষ্যতের জন্য শিডিউল করুন</span>
                </div>
                <input 
                  type="datetime-local" 
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="input-field" 
                />
              </div>
              <div className="paper-card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock size={20} className="text-accent" />
                  <span>পাসওয়ার্ড প্রোটেকশন</span>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="ঐচ্ছিক পাসওয়ার্ড..."
                  className="input-field" 
                />
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step7" className="text-center">
              <h2 className="text-3xl mb-8">সবকিছু ঠিক আছে?</h2>
              
              {rateLimitReached && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  আপনি আজকের জন্য ১০টি চিঠির লিমিট শেষ করেছেন। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।
                  (You have reached your daily limit of 10 letters. Please try again tomorrow.)
                </div>
              )}

              {sendError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {sendError}
                </div>
              )}

              <div className={`paper-card p-8 max-w-lg mx-auto text-left shadow-xl ${theme.bg} ${theme.border} ${theme.font} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: theme.id === 'romantic' ? '20px 20px' : 'auto' }} />
                <div className="relative z-10">
                  <h3 className="text-2xl mb-4">{title}</h3>
                  <p className="whitespace-pre-wrap">{content}</p>
                  <div className="mt-8 pt-4 border-t border-black/5 text-sm italic">
                    To: {receiver?.fullName}
                    <br />
                    From: {isAnonymous ? 'Anonymous' : user?.displayName}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSend}
                disabled={loading || rateLimitReached}
                className="btn-primary mt-10 text-lg px-12 py-4 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'পাঠানো হচ্ছে...' : <><Send size={20} /> চিঠি পাঠান</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2 text-ink/60 hover:text-accent disabled:opacity-0 transition-all"
        >
          <ChevronLeft size={20} /> আগের ধাপ
        </button>
        {step < 7 && (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 btn-primary"
          >
            পরের ধাপ <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
