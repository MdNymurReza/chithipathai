import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, User, MessageSquare, Trash2 } from 'lucide-react';
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

export default function ViewWallPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      const unsubPost = onSnapshot(doc(db, 'wall_posts', postId), (snap) => {
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() });
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

  const handleLike = async () => {
    if (!user || !post) return;
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
        className={`w-full max-w-2xl min-h-[500px] paper-card p-12 relative shadow-2xl ${theme.bg} ${theme.border} ${theme.font} overflow-hidden`}
      >
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
          <div className="text-xl leading-relaxed whitespace-pre-wrap mb-16 text-ink/80">
            {post.content}
          </div>

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
