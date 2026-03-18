import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-paper p-4 py-10 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full paper-card p-8 md:p-12 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-black/5">
          <ShieldCheck className="text-accent" size={32} />
          <h1 className="text-3xl font-serif font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-slate max-w-none text-ink/80 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-2">১. শর্তাবলী গ্রহণ</h2>
            <p>ChithiPathao ব্যবহার করার মাধ্যমে আপনি আমাদের এই শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে। আপনি যদি এই শর্তাবলীতে সম্মত না হন, তবে দয়া করে এই প্ল্যাটফর্মটি ব্যবহার করবেন না।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">২. ব্যবহারকারীর আচরণ</h2>
            <p>আপনি ChithiPathao ব্যবহার করে কোনো প্রকার আপত্তিকর, মানহানিকর, বা বেআইনি কন্টেন্ট শেয়ার করতে পারবেন না। আমরা যেকোনো সময় কোনো নোটিশ ছাড়াই আপনার পোস্ট ডিলিট করার অধিকার রাখি।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৩. গোপনীয়তা</h2>
            <p>আপনার ব্যক্তিগত তথ্য আমাদের গোপনীয়তা নীতি অনুযায়ী সুরক্ষিত রাখা হবে। তবে পাবলিক ওয়ালে শেয়ার করা তথ্য সবার জন্য উন্মুক্ত থাকবে।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৪. দায়বদ্ধতা</h2>
            <p>ChithiPathao কোনো ব্যবহারকারীর ব্যক্তিগত বার্তার জন্য দায়ী থাকবে না। ব্যবহারকারী তার নিজের কন্টেন্টের জন্য সম্পূর্ণ দায়ী থাকবেন।</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">৫. পরিবর্তন</h2>
            <p>আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তনের পর প্ল্যাটফর্মটি ব্যবহার চালিয়ে যাওয়া মানে আপনি নতুন শর্তাবলী মেনে নিয়েছেন।</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-black/5 text-sm text-ink/40 italic">
          Last Updated: March 18, 2026
        </div>
      </motion.div>
    </div>
  );
}
