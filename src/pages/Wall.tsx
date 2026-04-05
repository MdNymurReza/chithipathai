import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, User, MessageSquare, Share2, Search, Filter, Shield, Lock } from 'lucide-react';

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
    icon: '🌹' 
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
    icon: '🌧️' 
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
    icon: '✨' 
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
    icon: '🎁' 
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
    icon: '🕌' 
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
    icon: '🖋️' 
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    bg: 'bg-slate-900', 
    pattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
    border: 'border-slate-800', 
    accent: 'bg-slate-800',
    text: 'text-slate-100', 
    font: 'font-serif', 
    icon: '🌙',
    premium: true
  },
  { 
    id: 'vintage', 
    name: 'Vintage', 
    bg: 'bg-[#f4ecd8]', 
    pattern: 'url("https://www.transparenttextures.com/patterns/old-paper.png")',
    border: 'border-[#d4c5a9]', 
    accent: 'bg-[#e8dec5]',
    text: 'text-[#5d4037]', 
    font: 'font-serif', 
    icon: '📜',
    premium: true
  },
];

const FONTS = [
  { id: 'font-sans', name: 'Standard', class: 'font-sans' },
  { id: 'font-serif', name: 'Classic', class: 'font-serif' },
  { id: 'font-hand-bn', name: 'Childhood', class: 'font-hand-bn' },
  { id: 'font-bn-neat', name: 'Neat', class: 'font-bn-neat' },
  { id: 'font-bn-traditional', name: 'Traditional', class: 'font-bn-traditional' },
  { id: 'font-bn-friendly', name: 'Friendly', class: 'font-bn-friendly' },
  { id: 'font-fancy', name: 'English Script', class: 'font-fancy', premium: true },
  { id: 'font-bn-poetry', name: 'Poetry', class: 'font-bn-poetry', premium: true },
];

export default function Wall() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', theme: THEMES[0].id, font: FONTS[0].id, password: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'wall_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wall_posts');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newPost.title || !newPost.content) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'wall_posts'), {
        authorId: user.uid,
        authorName: profile.fullName,
        title: newPost.title,
        content: newPost.content,
        theme: newPost.theme,
        font: newPost.font,
        password: newPost.password || null,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [] // We'll use this for tracking likes locally
      });
      setNewPost({ title: '', content: '', theme: THEMES[0].id, font: FONTS[0].id, password: '' });
      
      // Award points to author
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(10)
        });
      } catch (pointsError) {
        console.warn("Failed to award points for wall post:", pointsError);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wall_posts');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, likedBy: string[] = []) => {
    if (!user) return;
    const isLiked = likedBy.includes(user.uid);
    const postRef = doc(db, 'wall_posts', postId);
    
    try {
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });

      if (!isLiked) {
        // Award points to author
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const authorId = postSnap.data().authorId;
          await updateDoc(doc(db, 'users', authorId), {
            points: increment(5)
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wall_posts/${postId}`);
    }
  };

  const handleShare = (postId: string, title: string) => {
    const url = `${window.location.origin}/view-post/${postId}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this post on ChithiPathao: ${title}`,
        url: url,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('লিঙ্কটি কপি করা হয়েছে! (Link copied to clipboard!)');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (post.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = selectedTheme === 'all' || post.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-accent font-serif text-xl">ওয়াল লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-serif text-accent mb-4">চিঠিপত্র ওয়াল (Letter Wall)</h1>
        <p className="text-ink/60">সবার সাথে আপনার মনের কথা শেয়ার করুন</p>
      </header>

      {/* New Post Form */}
      {user && profile ? (
        <div className="paper-card p-6 mb-12 shadow-lg">
          <form onSubmit={handlePost} className="space-y-4">
            <input
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="শিরোনাম (Title)"
              className="input-field"
              required
            />
            <textarea
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="আপনার কথা লিখুন... (Write your message...)"
              className="input-field min-h-[120px] resize-none"
              required
            />
            <div className="flex flex-wrap gap-2">
              {THEMES.filter(t => !t.premium || profile?.inventory?.includes(t.id)).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNewPost({ ...newPost, theme: t.id })}
                  className={`px-3 py-1 rounded-full text-xs transition-all border ${newPost.theme === t.id ? 'bg-accent text-white border-accent' : 'bg-white text-ink/60 border-black/10'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {FONTS.filter(f => !f.premium || profile?.inventory?.includes(f.id)).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setNewPost({ ...newPost, font: f.id })}
                  className={`px-3 py-1 rounded-full text-xs transition-all border ${newPost.font === f.id ? 'bg-accent text-white border-accent' : 'bg-white text-ink/60 border-black/10'}`}
                >
                  <span className={f.class}>{f.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  type="password"
                  value={newPost.password}
                  onChange={e => setNewPost({ ...newPost, password: e.target.value })}
                  placeholder="পাসওয়ার্ড (ঐচ্ছিক) - Password (Optional)"
                  className="input-field pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
                  <Shield size={18} />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPosting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isPosting ? 'পোস্ট হচ্ছে...' : <><Send size={18} /> ওয়াল এ পোস্ট করুন</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="paper-card p-8 mb-12 text-center bg-accent/5 border-accent/10">
          <p className="text-ink/60 mb-4">আপনার মনের কথা সবার সাথে শেয়ার করতে চান?</p>
          <Link to="/auth" className="btn-primary inline-block">লগইন করুন</Link>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            type="text"
            placeholder="ওয়াল পোস্ট খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <select
            value={selectedTheme}
            onChange={e => setSelectedTheme(e.target.value)}
            className="input-field pl-10 appearance-none bg-white pr-10"
          >
            <option value="all">সব থিম</option>
            {THEMES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-20 paper-card">কোনো পোস্ট পাওয়া যায়নি।</div>
          ) : (
            filteredPosts.map((post) => {
              const theme = THEMES.find(t => t.id === post.theme) || THEMES[0];
            const isLiked = post.likedBy?.includes(user?.uid);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`paper-card p-6 flex flex-col h-full shadow-md hover:shadow-xl transition-shadow border-2 ${theme.border} ${theme.bg} relative overflow-hidden`}
              >
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture z-30" />

                {/* Theme Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: post.theme === 'romantic' ? '20px 20px' : 'auto' }} />

                  <Link to={`/view-post/${post.id}`} className="flex-grow relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                          <User size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{post.authorName}</p>
                          <p className="text-[10px] opacity-60">
                            {post.createdAt?.toDate().toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.password && <Lock size={14} className="text-accent" />}
                        <div className="text-2xl">{theme.icon}</div>
                      </div>
                    </div>

                    <h3 className={`text-xl mb-2 ${post.font || theme.font} font-bold line-clamp-2`}>{post.title}</h3>
                    {post.password ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-black/5 rounded-xl border border-dashed border-black/10">
                        <Lock size={24} className="text-ink/20 mb-2" />
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Password Protected</p>
                      </div>
                    ) : (
                      <p className={`text-sm leading-relaxed mb-6 ${post.font || theme.font} line-clamp-4 italic opacity-80`}>
                        "{post.content}"
                      </p>
                    )}
                  </Link>

                <div className="flex items-center justify-between pt-4 border-t border-black/5 relative z-10">
                  <div className="flex items-center gap-3 relative z-10">
                    <button
                      onClick={() => handleLike(post.id, post.likedBy)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-ink/40 hover:text-red-400'}`}
                    >
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleShare(post.id, post.title)}
                      className="text-ink/20 hover:text-accent transition-colors"
                      title="Share Post"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-ink/40">
                    <MessageSquare size={18} />
                    <span>Public</span>
                  </div>
                </div>
              </motion.div>
            );
          }) )}
        </AnimatePresence>
      </div>
    </div>
  );
}
