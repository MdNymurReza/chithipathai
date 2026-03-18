import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Mail, Send, Shield, Clock, Heart, Sparkles, ArrowRight, UserPlus, Globe, MessageSquare, User, Share2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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
};

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const q = query(collection(db, 'wall_posts'), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        setRecentPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.warn("Failed to fetch recent wall posts for landing:", error);
      }
    };
    fetchRecentPosts();
  }, []);

  const features = [
    {
      icon: Heart,
      title: 'আবেগপ্রবণ থিম',
      desc: 'আপনার মনের ভাব অনুযায়ী রোমান্টিক, স্যাড বা ফানি থিম বেছে নিন।',
      color: 'bg-pink-50 text-pink-500'
    },
    {
      icon: Shield,
      title: 'গোপনীয়তা',
      desc: 'বেনামী চিঠি পাঠান বা পাসওয়ার্ড দিয়ে আপনার কথা সুরক্ষিত রাখুন।',
      color: 'bg-blue-50 text-blue-500'
    },
    {
      icon: Clock,
      title: 'শিডিউল মেসেজ',
      desc: 'ভবিষ্যতের কোনো বিশেষ মুহূর্তের জন্য চিঠি আগে থেকেই লিখে রাখুন।',
      color: 'bg-emerald-50 text-emerald-500'
    },
    {
      icon: Globe,
      title: 'পাবলিক ওয়াল',
      desc: 'সবার সাথে আপনার মনের কথা শেয়ার করুন এবং অন্যদের পোস্ট দেখুন।',
      color: 'bg-amber-50 text-amber-500'
    }
  ];

  const steps = [
    {
      number: '০১',
      title: 'চিঠি লিখুন',
      desc: 'আপনার মনের কথাগুলো সুন্দর করে গুছিয়ে লিখুন।'
    },
    {
      number: '০২',
      title: 'থিম বেছে নিন',
      desc: 'মুড অনুযায়ী রোমান্টিক বা ফানি থিম এবং স্টিকার যোগ করুন।'
    },
    {
      number: '০৩',
      title: 'পাঠিয়ে দিন',
      desc: 'সরাসরি ইনবক্সে পাঠান অথবা পাবলিক ওয়ালে শেয়ার করুন।'
    }
  ];

  return (
    <div className="min-h-screen bg-paper overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-5%] w-[30%] aspect-square bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-[60%] right-[-10%] w-[40%] aspect-square bg-pink-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] w-[25%] aspect-square bg-emerald-200/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 text-accent text-sm font-semibold mb-8 border border-accent/10">
              <Sparkles size={16} />
              <span>ডিজিটাল চিঠির নতুন জগত</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] tracking-tight mb-8">
              মনের কথা <br />
              <span className="text-accent italic">চিঠিতে</span> লিখুন।
            </h1>
            <p className="text-xl text-ink/60 leading-relaxed max-w-lg mb-12">
              ChithiPathao একটি ডিজিটাল প্ল্যাটফর্ম যেখানে আপনি আপনার প্রিয়জনকে সুন্দর থিম এবং স্টিকার দিয়ে চিঠি পাঠাতে পারেন। 
            </p>
            
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/inbox" className="btn-primary flex items-center gap-2 group">
                  ইনবক্স দেখুন
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="btn-primary flex items-center gap-2 group">
                    এখনই শুরু করুন
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/auth" className="btn-secondary">লগইন করুন</Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 paper-card p-12 aspect-[4/5] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 bg-white border-2 border-black/5">
              <div className="w-full h-full border border-black/5 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-16 h-20 bg-accent/10 border-2 border-accent/20 rounded-md flex items-center justify-center text-accent font-bold text-xs uppercase rotate-12">
                    Stamp
                  </div>
                  <div className="text-right italic text-ink/40">March 18, 2026</div>
                </div>
                <h3 className="text-3xl font-serif mb-6">প্রিয় বন্ধু,</h3>
                <p className="text-xl leading-relaxed text-ink/70 font-serif">
                  কেমন আছো? অনেকদিন তোমার কোনো খবর নেই। এই ডিজিটাল চিঠির মাধ্যমে তোমাকে আমার মনের কথাগুলো পাঠালাম। আশা করি তুমি ভালো আছো...
                </p>
                <div className="mt-auto pt-8 border-t border-black/5 text-right italic text-ink/40">
                  ইতি, <br />
                  তোমার শুভাকাঙ্ক্ষী
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-black/5">
        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative"
            >
              <div className="text-6xl font-serif font-bold text-accent/10 absolute -top-8 -left-4 select-none">
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-ink/60 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-black/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6">কেন ChithiPathao?</h2>
          <p className="text-ink/60 text-lg max-w-2xl mx-auto">
            আমরা ডিজিটাল যোগাযোগকে আরও ব্যক্তিগত এবং আবেগপ্রবণ করার চেষ্টা করছি।
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="paper-card p-8 hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${f.color}`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-ink/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wall Preview Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-black/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6">পাবলিক ওয়াল (Public Wall)</h2>
            <p className="text-ink/60 text-lg">
              দেখুন অন্যরা কী ভাবছে। আপনিও আপনার মনের কথা সবার সাথে শেয়ার করতে পারেন।
            </p>
          </div>
          <Link to="/wall" className="btn-secondary flex items-center gap-2">
            ওয়াল দেখুন <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {recentPosts.length > 0 ? (
            recentPosts.map((post, i) => {
              const theme = THEMES[post.theme] || THEMES.romantic;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`paper-card p-6 shadow-md border-2 ${theme.border} ${theme.bg} hover:shadow-xl transition-shadow relative overflow-hidden`}
                >
                  {/* Paper Texture Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture z-30" />

                  {/* Theme Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.pattern, backgroundSize: post.theme === 'romantic' ? '20px 20px' : 'auto' }} />

                  <Link to={`/view-post/${post.id}`} className="relative z-10 block">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-accent">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold">{post.authorName}</span>
                      </div>
                      <div className="text-xl">{theme.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-ink/60 line-clamp-3 mb-4 italic">
                      "{post.content}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-ink/30 uppercase tracking-widest">
                        {post.createdAt?.toDate().toLocaleDateString('bn-BD')}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const url = `${window.location.origin}/view-post/${post.id}`;
                          if (navigator.share) {
                            navigator.share({
                              title: post.title,
                              text: `Check out this post on ChithiPathao: ${post.title}`,
                              url: url,
                            }).catch(err => console.error('Error sharing:', err));
                          } else {
                            navigator.clipboard.writeText(url).then(() => {
                              alert('লিঙ্কটি কপি করা হয়েছে! (Link copied to clipboard!)');
                            });
                          }
                        }}
                        className="text-ink/20 hover:text-accent transition-colors"
                        title="Share Post"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-ink/30 italic">
              ওয়াল এ এখনো কোনো পোস্ট নেই...
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="paper-card p-16 bg-accent text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-8">আজই আপনার প্রথম চিঠিটি লিখুন।</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
              প্রিয়জনকে চমকে দিন একটি সুন্দর ডিজিটাল চিঠির মাধ্যমে। কোনো খরচ নেই, শুধু ভালোবাসা।
            </p>
            <Link to="/auth" className="bg-white text-accent px-10 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2 group">
              শুরু করুন
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-black/5 text-center text-ink/40 text-sm">
        <p>© 2026 ChithiPathao. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
