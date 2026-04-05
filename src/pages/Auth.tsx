import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore allowed'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        console.log("Checking for duplicate username/phone...");
        // Check if username exists
        const usernameQuery = query(collection(db, 'profiles'), where('username', '==', data.username.toLowerCase()));
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
          throw new Error('Username already taken');
        }

        // Check if phone exists
        const phoneQuery = query(collection(db, 'profiles'), where('phone', '==', data.phone));
        const phoneSnap = await getDocs(phoneQuery);
        if (!phoneSnap.empty) {
          throw new Error('Phone number already registered');
        }

        console.log("Creating auth user...");
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        console.log("Updating auth profile...");
        await updateProfile(user, { displayName: data.fullName });

        console.log("Creating user document...");
        await setDoc(doc(db, 'users', user.uid), {
          fullName: data.fullName,
          username: data.username.toLowerCase(),
          email: data.email,
          phone: data.phone,
          points: 0,
          inventory: [],
          createdAt: serverTimestamp(),
          blockedUsers: [],
        });

        console.log("Creating profile document...");
        await setDoc(doc(db, 'profiles', user.uid), {
          fullName: data.fullName,
          username: data.username.toLowerCase(),
          phone: data.phone,
          blockedUsers: [],
        });
        console.log("Signup complete!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper">
      <motion.div 
        layout
        className="paper-card w-full max-w-md p-8"
      >
        <h2 className="text-3xl font-serif text-accent text-center mb-8">
          {isLogin ? 'স্বাগতম' : 'নতুন অ্যাকাউন্ট'}
        </h2>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {!isLogin && (
              <>
                <div>
                  <input
                    {...register('fullName')}
                    placeholder="পুরো নাম (Full Name)"
                    className="input-field"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{(errors.fullName as any).message}</p>}
                </div>
                <div>
                  <input
                    {...register('username')}
                    placeholder="ইউজারনেম (Username)"
                    className="input-field"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{(errors.username as any).message}</p>}
                </div>
                <div>
                  <input
                    {...register('phone')}
                    placeholder="ফোন নম্বর (Phone)"
                    className="input-field"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{(errors.phone as any).message}</p>}
                </div>
              </>
            )}
            <div>
              <input
                {...register('email')}
                placeholder="ইমেইল (Email)"
                className="input-field"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{(errors.email as any).message}</p>}
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="পাসওয়ার্ড (Password)"
                className="input-field"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as any).message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4"
            >
              {loading ? 'অপেক্ষা করুন...' : (isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন')}
            </button>

            {isLogin && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-ink/40">অথবা (Or)</span>
                </div>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
                  } catch (err: any) {
                    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
                      setError('টেস্ট অ্যাকাউন্টটি আপনার নতুন প্রোজেক্টে নেই। অনুগ্রহ করে "test@example.com" এবং "password123" দিয়ে সাইন আপ করুন। (Test account not found in your new project. Please sign up with "test@example.com" and "password123" first.)');
                    } else {
                      setError(err.message);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                টেস্ট লগইন (Test Login)
              </button>
            )}
          </motion.form>
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-ink/60 hover:text-accent transition-colors text-sm"
          >
            {isLogin ? 'নতুন অ্যাকাউন্ট তৈরি করতে চান?' : 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
