'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

import { mockSchemes } from '../page';

interface SchemeDetailsProps {
  params: Promise<{ id: string }>;
}

export default function SchemeDetailsPage({ params }: SchemeDetailsProps) {
  const router = useRouter();
  const { id } = use(params);
  const scheme = mockSchemes.find(s => s.id === id);

  if (!scheme) {
    return (
      <div className="flex flex-col h-screen app-shell overflow-hidden text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold">Scheme Not Found</h1>
          <p className="text-slate-400">The scheme you are looking for does not exist.</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen app-shell overflow-hidden text-slate-100">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-white/8 app-nav backdrop-blur-xl z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div>
              <p className="font-semibold text-white text-sm">Scheme Details</p>
              <p className="text-slate-400 text-xs">Information and Eligibility</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-32">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-5 items-start">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${scheme.color} border ${scheme.border} flex-shrink-0`}>
              {scheme.icon}
            </div>
            <div>
              <div className="inline-flex mb-2 px-2.5 py-1 text-[10px] rounded-full bg-white/10 text-white font-medium border border-white/10">
                {scheme.category}
              </div>
              <h1 className="text-3xl font-bold mb-3 text-white leading-tight">{scheme.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">{scheme.description}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {/* Eligibility Section */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
               <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 opacity-50" />
               <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-white">
                 <CheckCircle className="w-5 h-5 text-emerald-400" /> Eligibility Criteria
               </h3>
               <ul className="space-y-3 text-sm text-slate-300">
                 {scheme.eligibility.minAge && <li><strong className="text-white font-medium">Min Age:</strong> {scheme.eligibility.minAge} years</li>}
                 {scheme.eligibility.maxAge && <li><strong className="text-white font-medium">Max Age:</strong> {scheme.eligibility.maxAge} years</li>}
                 {scheme.eligibility.maxIncome && <li><strong className="text-white font-medium">Max Income:</strong> ₹{scheme.eligibility.maxIncome.toLocaleString('en-IN')} / year</li>}
                 {scheme.eligibility.state && <li><strong className="text-white font-medium">State:</strong> <span className="capitalize">{scheme.eligibility.state}</span></li>}
                 {scheme.eligibility.gender && <li><strong className="text-white font-medium">Gender:</strong> {scheme.eligibility.gender}</li>}
                 {scheme.eligibility.occupation && <li><strong className="text-white font-medium">Occupation:</strong> {scheme.eligibility.occupation.join(', ')}</li>}
                 {Object.keys(scheme.eligibility).length === 0 && <li>Open to all citizens based on broader guidelines.</li>}
               </ul>
            </div>

            {/* Documents Section */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-50" />
               <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-white">
                 <FileText className="w-5 h-5 text-indigo-400" /> General Documents Needed
               </h3>
               <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside">
                 <li>Aadhaar Card</li>
                 <li>Income Certificate (if applicable)</li>
                 <li>Bank Account Details</li>
                 <li>Passport Size Photographs</li>
                 {scheme.category === 'Scholarship' && <li>Previous Year Marksheets</li>}
               </ul>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Bottom Apply Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#04050a]/90 backdrop-blur-xl p-4 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
           <div className="hidden sm:block">
              <p className="font-semibold text-white">Ready to proceed?</p>
              <p className="text-xs text-slate-400">Clicking apply will simulate starting the application.</p>
           </div>
           
           <button 
             onClick={() => alert(`This is a dummy application flow for ${scheme.title}! In a real app, this would open a form or redirect to the government portal.`)}
             className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all glow-indigo active:scale-95"
           >
             Apply Now <ExternalLink className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
