'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Search,
  CreditCard,
  GraduationCap,
  Building,
  Briefcase,
  User as UserIcon,
  MapPin,
  Calendar,
  Wallet,
  Stethoscope,
  Baby,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export interface Scheme {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    maxIncome?: number;
    state?: string;
    occupation?: string[];
    gender?: string;
  };
}

export const mockSchemes: Scheme[] = [
  // ... (keep the same mockSchemes array defined here above)
  { id: 's1', title: 'Pre-Matric Scholarship', category: 'Scholarship', description: 'Financial assistance for students studying in classes 1 to 10.', icon: <GraduationCap className="w-6 h-6" />, color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', eligibility: { maxAge: 16, maxIncome: 250000, occupation: ['Student'] } },
  { id: 's2', title: 'Post-Matric Scholarship', category: 'Scholarship', description: 'Financial support for students pursuing higher education (class 11 and above).', icon: <GraduationCap className="w-6 h-6" />, color: 'from-indigo-500/20 to-violet-500/10', border: 'border-indigo-500/20', eligibility: { minAge: 15, maxAge: 30, maxIncome: 250000, occupation: ['Student'] } },
  { id: 's3', title: 'PM Awas Yojana (PMAY)', category: 'Housing', description: 'Affordable housing scheme providing interest subsidies on home loans.', icon: <Building className="w-6 h-6" />, color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/20', eligibility: { minAge: 18, maxIncome: 1800000 } },
  { id: 's4', title: 'PM Kisan Samman Nidhi', category: 'Subsidy', description: 'Income support of ₹6000 per year to all landholding farmer families.', icon: <CreditCard className="w-6 h-6" />, color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/20', eligibility: { minAge: 18, occupation: ['Farmer'] } },
  { id: 's5', title: 'Sukanya Samriddhi Yojana', category: 'Savings', description: 'Small deposit scheme for the girl child to meet education and marriage expenses.', icon: <Baby className="w-6 h-6" />, color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/20', eligibility: { maxAge: 10, gender: 'Female' } },
  { id: 's6', title: 'Ayushman Bharat (PMJAY)', category: 'Health', description: 'Health insurance cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.', icon: <Stethoscope className="w-6 h-6" />, color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', eligibility: { maxIncome: 500000 } },
  { id: 's7', title: 'Pradhan Mantri Jan Dhan Yojana', category: 'Banking', description: 'National Mission for Financial Inclusion to ensure access to financial services with zero balance.', icon: <Landmark className="w-6 h-6" />, color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/20', eligibility: { minAge: 10 } },
  { id: 's8', title: 'Atal Pension Yojana', category: 'Pension', description: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month for unorganized sector workers.', icon: <ShieldCheck className="w-6 h-6" />, color: 'from-purple-500/20 to-fuchsia-500/10', border: 'border-purple-500/20', eligibility: { minAge: 18, maxAge: 40 } },
  { id: 's9', title: 'PM MUDRA Yojana', category: 'Business Loan', description: 'Loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises.', icon: <TrendingUp className="w-6 h-6" />, color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', eligibility: { minAge: 18, occupation: ['Business'] } },
  { id: 's10', title: 'Stand Up India Scheme', category: 'Business Loan', description: 'Bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST and one woman borrower per bank branch.', icon: <Briefcase className="w-6 h-6" />, color: 'from-rose-500/20 to-red-500/10', border: 'border-rose-500/20', eligibility: { minAge: 18, gender: 'Female', occupation: ['Business'] } },
  { id: 's11', title: 'PM Svanidhi', category: 'Business Loan', description: 'Micro-credit facility for street vendors to resume their livelihoods.', icon: <CreditCard className="w-6 h-6" />, color: 'from-cyan-500/20 to-sky-500/10', border: 'border-cyan-500/20', eligibility: { minAge: 18, occupation: ['Business', 'Unemployed'] } },
  { id: 's12', title: 'Pradhan Mantri Matru Vandana Yojana', category: 'Health', description: 'Maternity benefit programme providing cash incentives to pregnant women and lactating mothers.', icon: <Stethoscope className="w-6 h-6" />, color: 'from-pink-500/20 to-fuchsia-500/10', border: 'border-pink-500/20', eligibility: { minAge: 19, gender: 'Female' } },
  { id: 's13', title: 'National Social Assistance Programme (Old Age)', category: 'Pension', description: 'Financial assistance to the elderly, widows, and persons with disabilities.', icon: <ShieldCheck className="w-6 h-6" />, color: 'from-slate-500/20 to-gray-500/10', border: 'border-slate-500/20', eligibility: { minAge: 60, maxIncome: 100000 } },
  { id: 's14', title: 'PM Vishwakarma Scheme', category: 'Skill Training', description: 'End-to-end support to artisans and craftspeople along with collateral-free credit.', icon: <Briefcase className="w-6 h-6" />, color: 'from-yellow-500/20 to-orange-500/10', border: 'border-yellow-500/20', eligibility: { minAge: 18, occupation: ['Business', 'Salaried'] } },
  { id: 's15', title: 'Chief Minister Fellowship (Maharashtra)', category: 'Employment', description: 'Opportunity for youth to work closely with the government administration in Maharashtra.', icon: <GraduationCap className="w-6 h-6" />, color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20', eligibility: { minAge: 21, maxAge: 26, state: 'maharashtra', occupation: ['Student'] } },
];

function SchemeFinderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [age, setAge] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[] | null>(null);

  // Sync state from URL parameters on mount and whenever searchParams changes
  useEffect(() => {
    const queryAge = searchParams.get('age') || '';
    const queryIncome = searchParams.get('income') || '';
    const queryState = searchParams.get('state') || '';
    const queryOccupation = searchParams.get('occupation') || '';
    const queryGender = searchParams.get('gender') || '';

    setAge(queryAge);
    setIncome(queryIncome);
    setState(queryState);
    setOccupation(queryOccupation);
    setGender(queryGender);

    if (queryAge || queryIncome || queryState || queryOccupation || queryGender) {
      runFilter(queryAge, queryIncome, queryState, queryOccupation, queryGender);
    }
  }, [searchParams]);

  const runFilter = (uAge: string, uIncome: string, uState: string, uOcc: string, uGender: string) => {
    const userAge = uAge ? parseInt(uAge, 10) : undefined;
    const userIncome = uIncome ? parseInt(uIncome, 10) : undefined;
    const userState = uState || undefined;
    const userOccupation = uOcc || undefined;
    const userGender = uGender || undefined;

    const results = mockSchemes.filter((scheme) => {
      const el = scheme.eligibility;

      if (el.minAge && userAge && userAge < el.minAge) return false;
      if (el.maxAge && userAge && userAge > el.maxAge) return false;
      if (el.maxIncome && userIncome && userIncome > el.maxIncome) return false;
      if (el.state && userState && el.state.toLowerCase() !== userState.toLowerCase()) return false;
      if (el.occupation && userOccupation) {
        const occMatch = el.occupation.some(o => o.toLowerCase() === userOccupation.toLowerCase());
        if (!occMatch) return false;
      }
      if (el.gender && userGender && el.gender.toLowerCase() !== userGender.toLowerCase()) return false;

      return true;
    });

    setFilteredSchemes(results);
  };

  const handleFindSchemes = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (age) params.set('age', age);
    if (income) params.set('income', income);
    if (state) params.set('state', state);
    if (occupation) params.set('occupation', occupation);
    if (gender) params.set('gender', gender);
    
    // Using router.push to maintain browser history so back button works perfectly
    router.push(`/schemes?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col h-screen app-shell overflow-hidden text-slate-100">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-white/8 app-nav backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Scheme Finder</p>
              <p className="text-slate-400 text-xs text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px] sm:max-w-none">Discover eligible government schemes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center md:text-left flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find Government <span className="gradient-text">Schemes</span></h1>
              <p className="text-slate-400 max-w-lg">Enter your details to find scholarships, subsidies, and schemes.</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 glow-indigo-hover transition-all"
          >
            <form onSubmit={handleFindSchemes} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                    min="0"
                    max="120"
                  />
                </div>

                {/* Income */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-400" /> Annual Income (₹)
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                    min="0"
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" /> State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="bg-[#04050a] text-slate-400">Select State / All</option>
                    <option value="maharashtra" className="bg-[#04050a]">Maharashtra</option>
                    <option value="karnataka" className="bg-[#04050a]">Karnataka</option>
                    <option value="delhi" className="bg-[#04050a]">Delhi</option>
                    <option value="gujarat" className="bg-[#04050a]">Gujarat</option>
                    <option value="tamilnadu" className="bg-[#04050a]">Tamil Nadu</option>
                  </select>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" /> Occupation
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="bg-[#04050a] text-slate-400">Select Occupation / All</option>
                    <option value="student" className="bg-[#04050a]">Student</option>
                    <option value="farmer" className="bg-[#04050a]">Farmer</option>
                    <option value="salaried" className="bg-[#04050a]">Salaried Employee</option>
                    <option value="business" className="bg-[#04050a]">Business/Self-Employed</option>
                    <option value="unemployed" className="bg-[#04050a]">Unemployed</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-400" /> Gender
                  </label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label key={g} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer transition-colors relative">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={gender === g}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 focus:ring-indigo-500/50 focus:ring-offset-[#04050a]"
                        />
                        <span className="text-sm text-slate-200">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
              
              <div className="pt-4 border-t border-white/5">
                <button
                  id="find-schemes-btn"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-base transition-all glow-indigo active:scale-[0.98]"
                >
                  <Search className="w-5 h-5" /> Find Eligible Schemes
                </button>
              </div>
            </form>
          </motion.div>

          {/* Results section */}
          {filteredSchemes && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 mb-20">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> 
                {filteredSchemes.length > 0 ? `We found ${filteredSchemes.length} schemes for you:` : "No specific schemes found. Try adjusting your details."}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredSchemes.map((scheme, i) => (
                    <motion.div 
                      key={scheme.id}
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/schemes/${scheme.id}`}>
                        <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${scheme.color} border ${scheme.border} glass-hover transition-all duration-300 card-shine h-full group cursor-pointer`}>
                          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                              <div className="text-slate-200 p-2 rounded-xl bg-white/10 border border-white/10">
                                {scheme.icon}
                              </div>
                              <span className={`px-2 py-1 text-[10px] rounded-full bg-white/10 text-white font-medium border border-white/10`}>
                                {scheme.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-base text-white mb-2 leading-tight">{scheme.title}</h3>
                            <p className="text-xs text-slate-300/90 leading-relaxed mb-4">{scheme.description}</p>
                            
                            <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                View Details <ArrowLeft className="w-3 h-3 rotate-180" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-shell text-white flex items-center justify-center">Loading...</div>}>
      <SchemeFinderForm />
    </Suspense>
  );
}
