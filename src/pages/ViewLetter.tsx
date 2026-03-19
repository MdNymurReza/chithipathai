import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowLeft, Send, Folder, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import ScratchCard from '../components/ScratchCard';

const THEMES: Record<string, any> = {
  romantic: { 
    bg: 'bg-rose-50', 
    pattern: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%), radial-gradient(circle at 10px 10px, #fecaca 1.5px, transparent 0)',
    border: 'border-rose-200', 
    accent: 'bg-rose-100',
    text: 'text-rose-900', 
    font: 'font-serif', 
    icon: '🌹' 
  },
  sad: { 
    bg: 'bg-slate-50', 
    pattern: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%), repeating-linear-gradient(45deg, rgba(148,163,184,0.05) 0px, rgba(148,163,184,0.05) 1px, transparent 1px, transparent 10px)',
    border: 'border-slate-200', 
    accent: 'bg-slate-100',
    text: 'text-slate-900', 
    font: 'font-serif', 
    icon: '🌧️' 
  },
  funny: { 
    bg: 'bg-amber-50', 
    pattern: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%), radial-gradient(circle at 15px 15px, #fcd34d 1.5px, transparent 0)',
    border: 'border-amber-200', 
    accent: 'bg-amber-100',
    text: 'text-amber-900', 
    font: 'font-sans', 
    icon: '✨' 
  },
  birthday: { 
    bg: 'bg-purple-50', 
    pattern: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%), radial-gradient(circle at 20px 20px, #e9d5ff 2px, transparent 0), radial-gradient(circle at 40px 40px, #d8b4fe 1.5px, transparent 0)',
    border: 'border-purple-200', 
    accent: 'bg-purple-100',
    text: 'text-purple-900', 
    font: 'font-sans', 
    icon: '🎁' 
  },
  islamic: { 
    bg: 'bg-emerald-50', 
    pattern: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%), radial-gradient(circle at center, #10b981 0.5px, transparent 0)',
    border: 'border-emerald-200', 
    accent: 'bg-emerald-100',
    text: 'text-emerald-900', 
    font: 'font-serif', 
    icon: '🕌' 
  },
  professional: { 
    bg: 'bg-slate-50', 
    pattern: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
    border: 'border-slate-300', 
    accent: 'bg-slate-200',
    text: 'text-slate-800', 
    font: 'font-sans', 
    icon: '🖋️' 
  },
};

export default function ViewLetter() {
  const { letterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<any>(null);
  const [sender, setSender] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');
  const [permissionError, setPermissionError] = useState(false);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);

  useEffect(() => {
    if (letterId && user) {
      // Fetch user albums
      const fetchAlbums = async () => {
        const q = query(collection(db, 'albums'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setAlbums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchAlbums();

      const unsubLetter = onSnapshot(doc(db, 'letters', letterId), async (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as any;
          setLetter(data);
          if (data?.password) setIsLocked(true);
          
          // Fetch sender
          if (data?.senderId) {
            try {
              const sSnap = await getDoc(doc(db, 'profiles', data.senderId));
              if (sSnap.exists()) setSender(sSnap.data());
            } catch (error) {
              handleFirestoreError(error, OperationType.GET, `profiles/${data.senderId}`);
            }
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

  const handleMoveToAlbum = async (albumId: string | null) => {
    if (!letterId) return;
    try {
      await updateDoc(doc(db, 'letters', letterId), { albumId });
      setShowAlbumMenu(false);
    } catch (error) {
      console.error("Error moving letter to album:", error);
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

  if (!letter) return <div className="text-center py-20">চিঠিটি খুঁজে পাওয়া যায়নি।</div>;

  const theme = THEMES[letter.theme] || THEMES.romantic;
  const fontClass = letter.font || 'font-serif';

  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ink/60 hover:text-accent transition-colors"
        >
          <ArrowLeft size={20} /> ফিরে যান
        </button>

        {user?.uid === letter.receiverId && (
          <div className="relative">
            <button 
              onClick={() => setShowAlbumMenu(!showAlbumMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-sm font-bold hover:bg-black/5 transition-all"
            >
              <Folder size={16} className="text-accent" />
              {letter.albumId ? albums.find(a => a.id === letter.albumId)?.name : 'অ্যালবামে রাখুন'}
              <ChevronDown size={14} />
            </button>
            
            <AnimatePresence>
              {showAlbumMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 z-50 overflow-hidden"
                >
                  <div className="p-2 border-b border-black/5 text-[10px] uppercase tracking-widest text-ink/40 font-bold px-4">
                    অ্যালবাম নির্বাচন করুন
                  </div>
                  <button
                    onClick={() => handleMoveToAlbum(null)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors ${!letter.albumId ? 'text-accent font-bold' : ''}`}
                  >
                    কোনোটিই নয় (None)
                  </button>
                  {albums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => handleMoveToAlbum(album.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors ${letter.albumId === album.id ? 'text-accent font-bold' : ''}`}
                    >
                      {album.name}
                    </button>
                  ))}
                  {albums.length === 0 && (
                    <div className="px-4 py-3 text-xs text-ink/40 italic">
                      প্রথমে ইনবক্স থেকে অ্যালবাম তৈরি করুন।
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

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
            className={`w-full max-w-2xl min-h-[600px] paper-card p-12 relative shadow-2xl ${theme.bg} ${theme.border} ${fontClass} overflow-hidden`}
          >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture z-30" />

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
              <div className="text-xl leading-relaxed whitespace-pre-wrap mb-10 text-ink/80">
                {letter.content}
              </div>

              {letter.scratchConfig?.enabled && (
                <div className="mb-20 flex justify-center">
                  <ScratchCard width={400} height={120}>
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles className="text-accent" size={20} />
                      <p className="text-lg font-bold text-accent">{letter.scratchConfig.secret}</p>
                    </div>
                  </ScratchCard>
                </div>
              )}

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
