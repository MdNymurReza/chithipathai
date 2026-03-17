import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Send, Search, User, LogOut, Bell, Menu, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadLettersCount, setUnreadLettersCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Listen for unread letters
    const lettersQuery = query(
      collection(db, 'letters'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubLetters = onSnapshot(lettersQuery, (snap) => {
      const now = new Date();
      const visibleUnread = snap.docs.filter(doc => {
        const data = doc.data();
        if (!data.scheduledAt) return true;
        return data.scheduledAt.toDate() <= now;
      }).length;
      setUnreadLettersCount(visibleUnread);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'letters');
    });

    return () => unsubLetters();
  }, [user]);

  const navLinks = [
    { to: '/inbox', label: 'ইনবক্স', icon: Mail },
    { to: '/sent', label: 'পাঠানো', icon: Send },
    { to: '/wall', label: 'ওয়াল', icon: MessageSquare },
    { to: '/search', label: 'খুঁজুন', icon: Search },
    { to: '/profile', label: 'প্রোফাইল', icon: User },
  ];

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
              C
            </div>
            <span className="font-serif font-bold text-xl tracking-tight hidden sm:block">
              ChithiPathao
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-accent text-white shadow-md shadow-accent/20' 
                      : 'text-ink/60 hover:bg-black/5 hover:text-ink'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                  {link.to === '/inbox' && unreadLettersCount > 0 && (
                    <span className="bg-white text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadLettersCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-black/10 mx-2" />
            <button
              onClick={() => signOut()}
              className="p-2 text-ink/40 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {unreadLettersCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-accent" />
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold px-1 rounded-full">
                  {unreadLettersCount}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-ink/60"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-ink/60 hover:bg-black/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span>লগআউট</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
