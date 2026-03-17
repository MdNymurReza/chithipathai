import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const THEMES = [
  { 
    id: 'romantic', 
    name: 'Romantic', 
    bg: 'bg-pink-50', 
    pattern: 'radial-gradient(circle at 10px 10px, #fce7f3 2px, transparent 0)',
    border: 'border-pink-200', 
    accent: 'bg-pink-100',
    text: 'text-pink-900', 
    font: 'font-serif', 
    icon: '💝' 
  },
  { 
    id: 'sad', 
    name: 'Sad', 
    bg: 'bg-blue-50', 
    pattern: 'linear-gradient(135deg, #dbeafe 25%, transparent 25%)',
    border: 'border-blue-200', 
    accent: 'bg-blue-100',
    text: 'text-blue-900', 
    font: 'font-serif', 
    icon: '💧' 
  },
  { 
    id: 'funny', 
    name: 'Funny', 
    bg: 'bg-yellow-50', 
    pattern: 'radial-gradient(#fef08a 1px, transparent 0)',
    border: 'border-yellow-200', 
    accent: 'bg-yellow-100',
    text: 'text-yellow-900', 
    font: 'font-sans', 
    icon: '😂' 
  },
  { 
    id: 'birthday', 
    name: 'Birthday', 
    bg: 'bg-purple-50', 
    pattern: 'repeating-linear-gradient(45deg, #f3e8ff, #f3e8ff 10px, #ffffff 10px, #ffffff 20px)',
    border: 'border-purple-200', 
    accent: 'bg-purple-100',
    text: 'text-purple-900', 
    font: 'font-sans', 
    icon: '🎂' 
  },
  { 
    id: 'islamic', 
    name: 'Islamic', 
    bg: 'bg-emerald-50', 
    pattern: 'radial-gradient(circle at 0% 0%, #d1fae5 15%, transparent 15%)',
    border: 'border-emerald-200', 
    accent: 'bg-emerald-100',
    text: 'text-emerald-900', 
    font: 'font-serif', 
    icon: '🌙' 
  },
];

export default function Sent() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivers, setReceivers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'letters'),
      where('senderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const letterData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLetters(letterData);
      setLoading(false);

      // Fetch receiver profiles
      const receiverIds = [...new Set(letterData.map(l => l.receiverId))];
      for (const id of receiverIds) {
        if (!receivers[id]) {
          try {
            const rDoc = await getDoc(doc(db, 'profiles', id));
            if (rDoc.exists()) {
              setReceivers(prev => ({ ...prev, [id]: rDoc.data() }));
            }
          } catch (error) {
            console.warn("Receiver profile fetch failed:", error);
          }
        }
      }
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'letters');
    });

    return unsubscribe;
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="animate-pulse text-accent font-serif text-xl">চিঠিগুলো লোড হচ্ছে...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      <h1 className="text-4xl font-serif text-accent mb-12 flex items-center gap-4">
        <Send size={36} /> পাঠানো চিঠি (Sent)
      </h1>

      {letters.length === 0 ? (
        <div className="text-center py-20 paper-card shadow-lg">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={40} className="text-accent/40" />
          </div>
          <p className="text-ink/60 text-lg">আপনি এখনো কোনো চিঠি পাঠাননি।</p>
          <Link to="/search" className="btn-primary mt-6 inline-block">কাউকে চিঠি পাঠান</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {letters.map((letter) => {
              const theme = THEMES.find(t => t.id === letter.theme) || THEMES[0];
              const receiver = receivers[letter.receiverId];
              const isScheduled = letter.scheduledAt && letter.scheduledAt.toDate() > new Date();

              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <Link to={`/view/${letter.id}`} className="block h-full">
                    <div className={`paper-card h-full overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-all border-2 ${theme.border} ${theme.bg} relative ${isScheduled ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                      {/* Pattern Background Overlay */}
                      <div 
                        className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{ 
                          backgroundImage: theme.pattern,
                          backgroundSize: theme.id === 'romantic' ? '20px 20px' : theme.id === 'funny' ? '10px 10px' : 'auto'
                        }} 
                      />
                      
                      {/* Cute Cover */}
                      <div className={`h-36 flex items-center justify-center text-6xl border-b ${theme.border} ${theme.accent} relative z-10`}>
                        <motion.span
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {theme.icon}
                        </motion.span>
                        {isScheduled && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Calendar size={10} /> Scheduled
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col relative z-10 bg-white/40 backdrop-blur-[1px]">
                        <div className="mb-4">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className={`text-2xl font-bold ${theme.font} leading-tight text-ink`}>
                              {letter.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-ink/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                              To: {receiver?.fullName || 'Loading...'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <p className="text-sm text-ink/60 line-clamp-2 mb-4 italic font-serif leading-relaxed">
                            "{letter.content}"
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-black/5">
                          <div className="flex items-center gap-1.5 text-[10px] text-ink/40 font-medium">
                            <Clock size={12} />
                            {letter.createdAt ? formatDistanceToNow(letter.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                          </div>
                          <div className="text-[10px] font-bold text-accent uppercase tracking-tighter bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                            View Sent
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
