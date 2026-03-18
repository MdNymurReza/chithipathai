import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, User, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full paper-card p-8 md:p-12 shadow-xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-accent mb-4">যোগাযোগ করুন</h1>
          <p className="text-ink/60">আমাদের সাথে যোগাযোগ করার জন্য নিচের তথ্যগুলো ব্যবহার করুন।</p>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-black/5 hover:border-accent/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-ink/40 uppercase tracking-widest font-bold">নাম (Name)</p>
              <p className="text-xl font-bold">MD NYMUR REZA</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-black/5 hover:border-accent/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-sm text-ink/40 uppercase tracking-widest font-bold">ফোন (Phone)</p>
              <p className="text-xl font-bold">01618910756</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-black/5 hover:border-accent/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-ink/40 uppercase tracking-widest font-bold">ইমেইল (Email)</p>
              <p className="text-xl font-bold">dev.nymurreza@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-black/5 hover:border-accent/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm text-ink/40 uppercase tracking-widest font-bold">ঠিকানা (Address)</p>
              <p className="text-xl font-bold">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-accent/5 rounded-2xl text-center">
          <p className="text-ink/80 italic">"আপনার যেকোনো মতামত বা সমস্যার কথা আমাদের জানাতে দ্বিধা করবেন না।"</p>
        </div>
      </motion.div>
    </div>
  );
}
