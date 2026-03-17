import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { User, Mail, Send, Shield } from 'lucide-react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ sent: 0, received: 0 });

  useEffect(() => {
    if (user) {
      const sentQuery = query(collection(db, 'letters'), where('senderId', '==', user.uid));
      const receivedQuery = query(collection(db, 'letters'), where('receiverId', '==', user.uid));

      const unsubSent = onSnapshot(sentQuery, (snap) => {
        setStats(prev => ({ ...prev, sent: snap.size }));
      });

      const unsubReceived = onSnapshot(receivedQuery, (snap) => {
        const now = new Date();
        const visibleCount = snap.docs.filter(doc => {
          const data = doc.data();
          if (!data.scheduledAt) return true;
          return data.scheduledAt.toDate() <= now;
        }).length;
        setStats(prev => ({ ...prev, received: visibleCount }));
      });

      return () => {
        unsubSent();
        unsubReceived();
      };
    }
  }, [user]);

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      <div className="paper-card p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
        
        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={48} className="text-accent" />
        </div>

        <h1 className="text-3xl font-serif mb-2">{profile.fullName}</h1>
        <p className="text-ink/60 mb-8">@{profile.username}</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-paper rounded-2xl">
            <Send className="mx-auto mb-2 text-accent/60" size={24} />
            <div className="text-3xl font-serif text-accent">{stats.sent}</div>
            <div className="text-sm text-ink/60">পাঠানো চিঠি</div>
          </div>
          <div className="p-6 bg-paper rounded-2xl">
            <Mail className="mx-auto mb-2 text-accent/60" size={24} />
            <div className="text-3xl font-serif text-accent">{stats.received}</div>
            <div className="text-sm text-ink/60">প্রাপ্ত চিঠি</div>
          </div>
        </div>

        <div className="space-y-4 text-left border-t border-black/5 pt-8">
          <div className="flex items-center gap-4 text-ink/70">
            <Mail size={18} className="text-accent/40" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-4 text-ink/70">
            <Shield size={18} className="text-accent/40" />
            <span>Account created: {profile.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
