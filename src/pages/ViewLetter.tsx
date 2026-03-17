import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../App';

const THEMES: Record<string, any> = {
  romantic: { 
    bg: 'bg-pink-50', 
    pattern: 'radial-gradient(circle at 10px 10px, #fce7f3 2px, transparent 0)',
    border: 'border-pink-200', 
    accent: 'bg-pink-100',
    text: 'text-pink-900', 
    font: 'font-serif', 
    icon: '💝' 
  },
  sad: { 
    bg: 'bg-blue-50', 
    pattern: 'linear-gradient(135deg, #dbeafe 25%, transparent 25%)',
    border: 'border-blue-200', 
    accent: 'bg-blue-100',
    text: 'text-blue-900', 
    font: 'font-serif', 
    icon: '💧' 
  },
  funny: { 
    bg: 'bg-yellow-50', 
    pattern: 'radial-gradient(#fef08a 1px, transparent 0)',
    border: 'border-yellow-200', 
    accent: 'bg-yellow-100',
    text: 'text-yellow-900', 
    font: 'font-sans', 
    icon: '😂' 
  },
  birthday: { 
    bg: 'bg-purple-50', 
    pattern: 'repeating-linear-gradient(45deg, #f3e8ff, #f3e8ff 10px, #ffffff 10px, #ffffff 20px)',
    border: 'border-purple-200', 
    accent: 'bg-purple-100',
    text: 'text-purple-900', 
    font: 'font-sans', 
    icon: '🎂' 
  },
  islamic: { 
    bg: 'bg-emerald-50', 
    pattern: 'radial-gradient(circle at 0% 0%, #d1fae5 15%, transparent 15%)',
    border: 'border-emerald-200', 
    accent: 'bg-emerald-100',
    text: 'text-emerald-900', 
    font: 'font-serif', 
    icon: '🌙' 
  },
};

export default function ViewLetter() {
  const { letterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<any>(null);
  const [sender, setSender] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    if (letterId) {
      const unsubLetter = onSnapshot(doc(db, 'letters', letterId), async (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as any;
          setLetter(data);
          if (data?.password) setIsLocked(true);
          
          // Fetch sender (one-time is fine for profile info usually, but let's keep it simple)
          try {
            const sSnap = await getDoc(doc(db, 'profiles', data?.senderId));
            if (sSnap.exists()) setSender(sSnap.data());
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `profiles/${data?.senderId}`);
          }
        } else {
          setLetter(null);
        }
      }, (error) => {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        } else {
          handleFirestoreError(error, OperationType.GET, `letters/${letterId}`);
        }
      });

      return () => unsubLetter();
    }
  }, [letterId]);

  const handleUnlock = () => {
    if (passwordInput === letter.password) {
      setIsLocked(false);
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড (Incorrect password)');
    }
  };

  if (permissionError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="paper-card p-10 max-w-md">
          <Lock size={48} className="text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-accent mb-4">চিঠিটি এখনো পৌঁছায়নি</h2>
          <p className="text-ink/60 mb-8">এই চিঠিটি একটি নির্দিষ্ট সময়ের জন্য শিডিউল করা হয়েছে। সময় হওয়ার আগে এটি খোলা সম্ভব নয়।</p>
          <button onClick={() => navigate('/inbox')} className="btn-primary">ইনবক্সে ফিরে যান</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isOpen && letter && letter.receiverId === user?.uid && !letter.read) {
      const letterRef = doc(db, 'letters', letter.id);
      updateDoc(letterRef, { read: true }).catch(err => {
        console.error("Error marking letter as read:", err);
      });
    }
  }, [isOpen, letter, user]);

  const theme = THEMES[letter.theme] || THEMES.romantic;

  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <button 
        onClick={() => navigate(-1)}
        className="self-start mb-8 flex items-center gap-2 text-ink/60 hover:text-accent transition-colors"
      >
        <ArrowLeft size={20} /> ফিরে যান
      </button>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, y: -50 }}
            onClick={() => !isLocked && setIsOpen(true)}
            className={`w-full max-w-md aspect-[4/3] bg-white shadow-2xl rounded-lg border-2 border-black/5 relative cursor-pointer overflow-hidden flex items-center justify-center group`}
          >
            {/* Envelope Flap */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-black/5 origin-top transition-transform group-hover:scale-y-110" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            
            <div className="text-center z-10">
              <Mail size={64} className="text-accent/20 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-ink/60">চিঠিটি খুলুন</h3>
            </div>

            {isLocked && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20">
                <Lock size={40} className="text-accent mb-4" />
                <h3 className="text-lg mb-4">এই চিঠিটি পাসওয়ার্ড দ্বারা সুরক্ষিত</h3>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন..."
                  className="input-field mb-4 text-center"
                />
                {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                <button onClick={handleUnlock} className="btn-primary w-full">আনলক করুন</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`w-full max-w-2xl min-h-[600px] paper-card p-12 relative shadow-2xl ${theme.bg} ${theme.border} ${theme.font} overflow-hidden`}
          >
            {/* Theme Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: letter.theme === 'romantic' ? '20px 20px' : 'auto' }} />

            {/* Stickers */}
            {letter.stickers?.map((s: any, i: number) => (
              <div
                key={i}
                className="absolute pointer-events-none select-none z-20"
                style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {s.type === 'emoji' && <span className="text-5xl drop-shadow-sm">{s.value}</span>}
                {s.type === 'stamp' && (
                  <div className="w-16 h-20 bg-accent/10 border-2 border-accent/30 rounded flex items-center justify-center text-[10px] uppercase font-bold text-accent/60 rotate-12">
                    Official Stamp
                  </div>
                )}
                {s.type === 'memo' && (
                  <div className="p-3 bg-yellow-100/80 shadow-md border border-yellow-200 text-xs w-32 -rotate-3 font-sans">
                    {s.text || 'একটি বিশেষ নোট'}
                  </div>
                )}
              </div>
            ))}

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10 border-b border-black/5 pb-4">
                <h1 className="text-4xl">{letter.title}</h1>
                <div className="text-4xl">{theme.icon}</div>
              </div>
              <div className="text-xl leading-relaxed whitespace-pre-wrap mb-20 text-ink/80">
                {letter.content}
              </div>

              <div className="mt-auto pt-10 border-t border-black/5 flex justify-between items-end italic text-ink/60">
                <div>
                  <p className="text-sm">প্রাপক: {user?.uid === letter.receiverId ? 'আপনি' : 'অন্য কেউ'}</p>
                  <p className="text-lg font-serif">
                    প্রেরক: {letter.isAnonymous ? 'একজন শুভাকাঙ্ক্ষী (Anonymous)' : sender?.fullName}
                  </p>
                </div>
                {!letter.noReply && letter.receiverId === user?.uid && (
                  <button 
                    onClick={() => navigate(`/write/${letter.senderId}`)}
                    className="flex items-center gap-2 text-accent hover:underline"
                  >
                    <Send size={18} /> উত্তর দিন
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
