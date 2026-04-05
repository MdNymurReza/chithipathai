import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, User, MessageSquare, Trash2, Share2, Lock } from 'lucide-react';
import { useAuth } from '../App';

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
  midnight: { 
    bg: 'bg-slate-900', 
    pattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
    border: 'border-slate-800', 
    accent: 'bg-slate-800',
    text: 'text-slate-100', 
    font: 'font-serif', 
    icon: '🌙'
  },
  vintage: { 
    bg: 'bg-[#f4ecd8]', 
    pattern: 'url("https://www.transparenttextures.com/patterns/old-paper.png")',
    border: 'border-[#d4c5a9]', 
    accent: 'bg-[#e8dec5]',
    text: 'text-[#5d4037]', 
    font: 'font-serif', 
    icon: '📜'
  },
};

export default function ViewWallPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (postId) {
      const unsubPost = onSnapshot(doc(db, 'wall_posts', postId), (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as any;
          setPost(data);
          // If no password, it's automatically unlocked
          if (!data.password) {
            setIsUnlocked(true);
          }
        } else {
          setPost(null);
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `wall_posts/${postId}`);
        setLoading(false);
      });

      return () => unsubPost();
    }
  }, [postId]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (post && passwordInput === post.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!post) return;
    const isLiked = post.likedBy?.includes(user.uid);
    const postRef = doc(db, 'wall_posts', post.id);
    
    try {
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      // Update local state
      setPost((prev: any) => ({
        ...prev,
        likes: prev.likes + (isLiked ? -1 : 1),
        likedBy: isLiked ? prev.likedBy.filter((id: string) => id !== user.uid) : [...(prev.likedBy || []), user.uid]
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wall_posts/${post.id}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !post || post.authorId !== user.uid) return;
    
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই পোস্টটি ডিলিট করতে চান? (Are you sure you want to delete this post?)')) {
      try {
        await deleteDoc(doc(db, 'wall_posts', post.id));
        navigate('/wall');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `wall_posts/${post.id}`);
      }
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: `Check out this post on ChithiPathao: ${post.title}`,
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="animate-pulse text-accent font-serif text-xl">ওয়াল পোস্ট লোড হচ্ছে...</div>
    </div>
  );

  if (!post) return <div className="text-center py-20">পোস্টটি খুঁজে পাওয়া যায়নি।</div>;

  const theme = THEMES[post.theme] || THEMES.romantic;
  const isLiked = post.likedBy?.includes(user?.uid);

  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <button 
        onClick={() => navigate(-1)}
        className="self-start mb-8 flex items-center gap-2 text-ink/60 hover:text-accent transition-colors max-w-4xl mx-auto w-full"
      >
        <ArrowLeft size={20} /> ফিরে যান
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`w-full max-w-2xl min-h-[500px] paper-card p-12 relative shadow-2xl ${theme.bg} ${theme.border} ${post.font || theme.font} overflow-hidden`}
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture z-30" />

        {/* Theme Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: post.theme === 'romantic' ? '20px 20px' : 'auto' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                <User size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-bold">{post.authorName}</p>
                <p className="text-xs opacity-60">
                  {post.createdAt?.toDate().toLocaleDateString('bn-BD')}
                </p>
              </div>
            </div>
            <div className="text-4xl">{theme.icon}</div>
          </div>

          <h1 className="text-4xl mb-8 font-bold">{post.title}</h1>
          
          {!isUnlocked ? (
            <div className="flex flex-col items-center justify-center py-20 bg-black/5 rounded-3xl border-2 border-dashed border-black/10">
              <Lock size={48} className="text-accent mb-6" />
              <h2 className="text-2xl font-bold mb-2">পাসওয়ার্ড প্রয়োজন</h2>
              <p className="text-ink/60 mb-8">এই পোস্টটি দেখার জন্য পাসওয়ার্ড দিন।</p>
              
              <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  className={`input-field text-center ${passwordError ? 'border-red-500 ring-red-500/20' : ''}`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-sm text-center">ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।</p>
                )}
                <button type="submit" className="btn-primary w-full">আনলক করুন</button>
              </form>
            </div>
          ) : (
            <div className="text-xl leading-relaxed whitespace-pre-wrap mb-16 text-ink/80">
              {post.content}
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-black/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all border ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white text-ink/40 border-black/10 hover:border-red-400 hover:text-red-400'}`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="font-bold">{post.likes || 0}</span>
              </button>

              {user?.uid === post.authorId && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-ink/20 hover:text-red-500 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 size={20} />
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2 text-ink/20 hover:text-accent transition-colors"
                title="Share Post"
              >
                <Share2 size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-ink/40">
              <MessageSquare size={20} />
              <span className="text-sm font-medium uppercase tracking-wider">Public Post</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
