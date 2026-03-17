import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, or, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Search as SearchIcon, UserPlus, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';

export default function Search() {
  const { user: currentUser, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBlock = async (userId: string) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to block this user?")) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          blockedUsers: arrayUnion(userId)
        });
        alert("User blocked.");
        setResults(results.filter(r => r.id !== userId));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const term = searchTerm.toLowerCase();
      const q = query(
        collection(db, 'profiles'),
        or(
          where('username', '==', term),
          where('phone', '==', term)
        ),
        limit(10)
      );
      
      const snap = await getDocs(q);
      const users = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUser?.uid && !profile?.blockedUsers?.includes(u.id));
      setResults(users);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      <h1 className="text-3xl mb-8 text-center">কাউকে খুঁজুন</h1>
      
      <form onSubmit={handleSearch} className="relative mb-10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ইউজারনেম বা ফোন নম্বর দিয়ে খুঁজুন..."
          className="w-full pl-12 pr-4 py-4 bg-white shadow-sm rounded-2xl border border-black/5 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20} />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-opacity-90"
        >
          খুঁজুন
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-ink/40">খোঁজা হচ্ছে...</div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={user.id}
              className="paper-card p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-lg">{user.fullName}</h3>
                <p className="text-ink/60 text-sm">@{user.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBlock(user.id)}
                  className="p-2 text-ink/40 hover:text-red-500 transition-colors"
                  title="Block User"
                >
                  <ShieldAlert size={18} />
                </button>
                <button
                  onClick={() => navigate(`/write/${user.id}`)}
                  className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full hover:bg-accent/20 transition-colors"
                >
                  <UserPlus size={18} />
                  <span>চিঠি পাঠান</span>
                </button>
              </div>
            </motion.div>
          ))
        ) : searchTerm && !loading ? (
          <div className="text-center py-10 text-ink/40">কাউকে পাওয়া যায়নি।</div>
        ) : null}
      </div>
    </div>
  );
}
