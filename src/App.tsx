import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Inbox from './pages/Inbox';
import Sent from './pages/Sent';
import Write from './pages/Write';
import ViewLetter from './pages/ViewLetter';
import ViewWallPost from './pages/ViewWallPost';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Wall from './pages/Wall';
import Navbar from './components/Navbar';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  signOut: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        setProfile(doc.data() || null);
        setLoading(false);
      }, (error) => {
        console.error("Profile fetch error:", error);
        // If permission denied, it's likely a stale session from a previous project
        if (error.code === 'permission-denied') {
          signOut();
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-accent font-serif text-xl">চিঠিপত্র লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={user ? <Navigate to="/inbox" /> : <Auth />} />
                <Route path="/inbox" element={user ? <Inbox /> : <Navigate to="/auth" />} />
                <Route path="/sent" element={user ? <Sent /> : <Navigate to="/auth" />} />
                <Route path="/write/:receiverId?" element={user ? <Write /> : <Navigate to="/auth" />} />
                <Route path="/view/:letterId" element={user ? <ViewLetter /> : <Navigate to="/auth" />} />
                <Route path="/view-post/:postId" element={user ? <ViewWallPost /> : <Navigate to="/auth" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
                <Route path="/search" element={user ? <Search /> : <Navigate to="/auth" />} />
                <Route path="/wall" element={user ? <Wall /> : <Navigate to="/auth" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}
