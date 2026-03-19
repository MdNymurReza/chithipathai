import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Clock, FolderPlus, Folder, X, Plus, ChevronRight, Archive } from 'lucide-react';
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

export default function Inbox() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [senders, setSenders] = useState<Record<string, any>>({});
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch Albums
    const qAlbums = query(
      collection(db, 'albums'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubAlbums = onSnapshot(qAlbums, (snap) => {
      setAlbums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Letters
    const q = query(
      collection(db, 'letters'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const letterData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Filter out future scheduled letters
      const now = new Date();
      const visibleLetters = letterData.filter(l => {
        if (!l.scheduledAt) return true;
        return l.scheduledAt.toDate() <= now;
      });

      setLetters(visibleLetters);
      setLoading(false);

      // Fetch sender profiles
      const senderIds = [...new Set(visibleLetters.map(l => l.senderId))];
      for (const id of senderIds) {
        if (!senders[id]) {
          try {
            const sDoc = await getDoc(doc(db, 'profiles', id));
            if (sDoc.exists()) {
              setSenders(prev => ({ ...prev, [id]: sDoc.data() }));
            }
          } catch (error) {
            console.warn("Sender profile fetch failed:", error);
          }
        }
      }
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'letters');
    });

    return () => {
      unsubscribe();
      unsubAlbums();
    };
  }, [user]);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAlbumName.trim()) return;

    setCreatingAlbum(true);
    try {
      await addDoc(collection(db, 'albums'), {
        userId: user.uid,
        name: newAlbumName.trim(),
        createdAt: serverTimestamp(),
      });
      setNewAlbumName('');
      setShowNewAlbumModal(false);
    } catch (error) {
      console.error("Error creating album:", error);
    } finally {
      setCreatingAlbum(false);
    }
  };

  const filteredLetters = selectedAlbumId 
    ? letters.filter(l => l.albumId === selectedAlbumId)
    : letters;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="animate-pulse text-accent font-serif text-xl">চিঠিগুলো আসছে...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      <h1 className="text-4xl font-serif text-accent mb-12 flex items-center gap-4">
        <Mail size={36} /> আপনার ইনবক্স (Inbox)
      </h1>

      {/* Album Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <button
          onClick={() => setSelectedAlbumId(null)}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${selectedAlbumId === null ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-white text-ink/60 border border-black/5 hover:bg-black/5'}`}
        >
          <Archive size={16} /> সব চিঠি ({letters.length})
        </button>
        
        {albums.map(album => (
          <button
            key={album.id}
            onClick={() => setSelectedAlbumId(album.id)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${selectedAlbumId === album.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-white text-ink/60 border border-black/5 hover:bg-black/5'}`}
          >
            <Folder size={16} /> {album.name} ({letters.filter(l => l.albumId === album.id).length})
          </button>
        ))}

        <button
          onClick={() => setShowNewAlbumModal(true)}
          className="w-10 h-10 rounded-full bg-accent/5 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-accent/10"
          title="নতুন অ্যালবাম তৈরি করুন"
        >
          <Plus size={20} />
        </button>
      </div>

      {filteredLetters.length === 0 ? (
        <div className="text-center py-20 paper-card shadow-lg">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} className="text-accent/40" />
          </div>
          <p className="text-ink/60 text-lg">
            {selectedAlbumId ? 'এই অ্যালবামে কোনো চিঠি নেই।' : 'আপনার ইনবক্স এখন খালি।'}
          </p>
          {!selectedAlbumId && <Link to="/search" className="btn-primary mt-6 inline-block">কাউকে চিঠি পাঠান</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredLetters.map((letter) => {
              const theme = THEMES.find(t => t.id === letter.theme) || THEMES[0];
              const sender = senders[letter.senderId];

              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <Link to={`/view/${letter.id}`} className="block h-full">
                    <div className={`paper-card h-full overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-all border-2 ${theme.border} ${theme.bg} relative`}>
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
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col relative z-10 bg-white/40 backdrop-blur-[1px]">
                        <div className="mb-4">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className={`text-3xl font-bold ${theme.font} leading-tight text-ink drop-shadow-sm`}>
                              {letter.title}
                            </h3>
                            {letter.password && (
                              <div className="p-2 bg-accent/10 rounded-full text-accent shadow-sm">
                                <Lock size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-ink/60 bg-black/5 self-start px-3 py-1 rounded-full mb-4">
                            {!letter.read && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                            <span className="text-xs font-bold uppercase tracking-widest">
                              {letter.isAnonymous ? 'Anonymous' : (sender?.fullName || 'Loading...')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <p className="text-sm text-ink/70 line-clamp-3 mb-4 italic font-serif leading-relaxed bg-white/30 p-3 rounded-lg border border-black/5">
                            "{letter.content}"
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-black/5">
                          <div className="flex items-center gap-1.5 text-[10px] text-ink/40 font-medium">
                            <Clock size={12} />
                            {letter.createdAt ? formatDistanceToNow(letter.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                          </div>
                          <div className="text-[10px] font-bold text-accent uppercase tracking-tighter bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                            Open Letter
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

      {/* New Album Modal */}
      <AnimatePresence>
        {showNewAlbumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="paper-card p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-accent">নতুন অ্যালবাম (New Album)</h2>
                <button onClick={() => setShowNewAlbumModal(false)} className="text-ink/40 hover:text-ink">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateAlbum} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">অ্যালবামের নাম (Album Name)</label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={e => setNewAlbumName(e.target.value)}
                    placeholder="যেমন: প্রিয় স্মৃতি, বন্ধুদের চিঠি..."
                    className="input-field"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingAlbum || !newAlbumName.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {creatingAlbum ? 'তৈরি হচ্ছে...' : <><FolderPlus size={20} /> অ্যালবাম তৈরি করুন</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
