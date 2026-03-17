import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, User, MessageSquare } from 'lucide-react';

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

export default function Wall() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', theme: THEMES[0].id });
  const [isPosting, setIsPosting] = useState(false);

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
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [] // We'll use this for tracking likes locally
      });
      setNewPost({ title: '', content: '', theme: THEMES[0].id });
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
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wall_posts/${postId}`);
    }
  };

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
            {THEMES.map(t => (
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
          <button
            type="submit"
            disabled={isPosting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isPosting ? 'পোস্ট হচ্ছে...' : <><Send size={18} /> ওয়াল এ পোস্ট করুন</>}
          </button>
        </form>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {posts.map((post) => {
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
                    <div className="text-2xl">{theme.icon}</div>
                  </div>

                  <h3 className={`text-xl mb-2 ${theme.font} font-bold line-clamp-2`}>{post.title}</h3>
                  <p className={`text-sm leading-relaxed mb-6 ${theme.font} line-clamp-4 italic opacity-80`}>
                    "{post.content}"
                  </p>
                </Link>

                <div className="flex items-center justify-between pt-4 border-t border-black/5 relative z-10">
                  <button
                    onClick={() => handleLike(post.id, post.likedBy)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-ink/40 hover:text-red-400'}`}
                  >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-sm text-ink/40">
                    <MessageSquare size={18} />
                    <span>Public</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
