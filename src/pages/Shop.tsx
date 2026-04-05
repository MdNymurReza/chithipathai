import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, increment, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Palette, Type, Sticker, Check, Lock, Sparkles, Coins, Heart } from 'lucide-react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const SHOP_ITEMS = [
  {
    id: 'midnight',
    name: 'Midnight Theme',
    category: 'theme',
    price: 50,
    icon: '🌙',
    desc: 'A beautiful dark theme with subtle stars.',
    color: 'bg-slate-900 text-white'
  },
  {
    id: 'vintage',
    name: 'Vintage Theme',
    category: 'theme',
    price: 50,
    icon: '📜',
    desc: 'Classic old paper texture with sepia tones.',
    color: 'bg-[#f4ecd8] text-[#5d4037]'
  },
  {
    id: 'font-fancy',
    name: 'English Script Font',
    category: 'font',
    price: 30,
    icon: '🖋️',
    desc: 'Elegant cursive font for English letters.',
    className: 'font-fancy'
  },
  {
    id: 'font-bn-poetry',
    name: 'Poetry Font',
    category: 'font',
    price: 30,
    icon: '✍️',
    desc: 'Beautiful artistic font for Bengali poetry.',
    className: 'font-bn-poetry'
  },
  {
    id: 'sticker-crown',
    name: 'Crown Sticker',
    category: 'sticker',
    price: 20,
    icon: '👑',
    desc: 'A royal crown sticker for your letters.'
  },
  {
    id: 'sticker-diamond',
    name: 'Diamond Sticker',
    category: 'sticker',
    price: 20,
    icon: '💎',
    desc: 'A sparkling diamond sticker.'
  }
];

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user, navigate]);

  const handlePurchase = async (item: any) => {
    if (!user || !userData) return;
    if (userData.points < item.price) {
      setMessage({ text: 'আপনার পর্যাপ্ত পয়েন্ট নেই! (Not enough points!)', type: 'error' });
      return;
    }
    if (userData.inventory?.includes(item.id)) {
      setMessage({ text: 'আপনি এটি আগেই কিনেছেন! (Already purchased!)', type: 'error' });
      return;
    }

    setPurchasing(item.id);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-item.price),
        inventory: arrayUnion(item.id)
      });
      setMessage({ text: `${item.name} কেনা সফল হয়েছে! (Purchase successful!)`, type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setMessage({ text: 'কেনা সম্ভব হয়নি। (Purchase failed.)', type: 'error' });
    } finally {
      setPurchasing(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paper">লোডিং...</div>;

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
              <ShoppingBag className="text-accent" /> Chithi Shop
            </h1>
            <p className="text-ink/60">আপনার অর্জিত পয়েন্ট দিয়ে নতুন থিম ও স্টিকার কিনুন।</p>
          </div>
          
          <div className="bg-white px-8 py-4 rounded-3xl shadow-xl border border-accent/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Coins className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">আপনার পয়েন্ট</p>
              <p className="text-3xl font-bold text-accent">{userData?.points || 0}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-4 rounded-xl text-center font-bold shadow-lg ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SHOP_ITEMS.map((item) => {
            const isOwned = userData?.inventory?.includes(item.id);
            const canAfford = userData?.points >= item.price;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="paper-card p-6 flex flex-col h-full relative overflow-hidden"
              >
                {isOwned && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full z-10">
                    <Check size={16} />
                  </div>
                )}

                <div className={`w-full aspect-video rounded-2xl mb-6 flex items-center justify-center text-6xl shadow-inner ${item.color || 'bg-black/5'}`}>
                  <span className={item.className}>{item.icon}</span>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-sm text-ink/60 mb-6">{item.desc}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Coins size={16} />
                    <span>{item.price}</span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={isOwned || !canAfford || purchasing === item.id}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${
                      isOwned 
                        ? 'bg-black/5 text-ink/20 cursor-default' 
                        : canAfford 
                          ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20' 
                          : 'bg-black/5 text-ink/20 cursor-not-allowed'
                    }`}
                  >
                    {purchasing === item.id ? 'অপেক্ষা করুন...' : isOwned ? 'কেনা হয়েছে' : 'কিনুন'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 paper-card p-10 bg-accent/5 border-2 border-dashed border-accent/20 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">পয়েন্ট কীভাবে অর্জন করবেন?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <Star className="text-accent" size={20} />
              </div>
              <div>
                <p className="font-bold">চিঠি পাঠান (+১০ পয়েন্ট)</p>
                <p className="text-sm text-ink/60">প্রতিটি চিঠি পাঠানোর জন্য আপনি ১০ পয়েন্ট পাবেন।</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <Heart className="text-accent" size={20} />
              </div>
              <div>
                <p className="font-bold">লাইক পান (+৫ পয়েন্ট)</p>
                <p className="text-sm text-ink/60">আপনার পাবলিক ওয়াল পোস্টে প্রতিটি লাইকের জন্য ৫ পয়েন্ট পাবেন।</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
