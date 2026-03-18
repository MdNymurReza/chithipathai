import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full paper-card p-8 md:p-12 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-black/5">
          <Lock className="text-accent" size={32} />
          <h1 className="text-3xl font-serif font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none text-ink/80 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-2">১. তথ্য সংগ্রহ</h2>
            <p>আমরা আপনার নাম, ইমেইল এবং প্রোফাইল তথ্য সংগ্রহ করি যখন আপনি আমাদের প্ল্যাটফর্মে সাইন-ইন করেন। এটি শুধুমাত্র আপনার অভিজ্ঞতা উন্নত করার জন্য ব্যবহার করা হয়।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">২. তথ্যের ব্যবহার</h2>
            <p>আপনার পাঠানো চিঠি এবং পোস্টগুলো আমাদের ডাটাবেসে সংরক্ষিত থাকে। ব্যক্তিগত চিঠিগুলো শুধুমাত্র প্রেরক এবং প্রাপক দেখতে পারেন।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৩. কুকিজ (Cookies)</h2>
            <p>আমরা আপনার সেশন বজায় রাখার জন্য ব্রাউজার কুকিজ ব্যবহার করি। এটি আপনাকে বারবার লগইন করা থেকে বিরত রাখে।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৪. তৃতীয় পক্ষ</h2>
            <p>আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না। তবে আইনি প্রয়োজনে তথ্য প্রদান করা হতে পারে।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৫. নিরাপত্তা</h2>
            <p>আমরা আপনার তথ্য সুরক্ষিত রাখতে সর্বোচ্চ চেষ্টা করি। তবে ইন্টারনেটে কোনো তথ্যই ১০০% নিরাপদ নয়, তাই ব্যবহারের সময় সচেতন থাকুন।</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-black/5 text-sm text-ink/40 italic">
          Last Updated: March 18, 2026
        </div>
      </motion.div>
    </div>
  );
}
