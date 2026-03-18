'use client';

import { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, Search, Shield, Zap, Clock,
  ArrowRight, CheckCircle, Star, Award,
  CreditCard, Globe, Car, Vote, ShoppingBag, ScrollText,
  MessageSquare, Bot, BadgeCheck, IdCard, ChevronRight, GraduationCap, Menu, X,
} from 'lucide-react';
import panImage from '../../assets/pan.png';
import aadhaarImage from '../../assets/aadhar.png';
import passportImage from '../../assets/passport.png';
import drivingImage from '../../assets/driving.png';
import voterImage from '../../assets/voter.png';
import rationImage from '../../assets/ration.png';
import birthImage from '../../assets/birth.png';

type ServiceCard = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  border: string;
  badge?: string;
  badgeColor?: string;
  link: string;
  image?: StaticImageData;
};

const services: ServiceCard[] = [
  { icon: <CreditCard className="w-6 h-6" />, title: 'PAN Card', desc: 'Apply for new PAN or request corrections', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/20', badge: 'Most Popular', badgeColor: 'bg-orange-500/20 text-orange-300', link: '/chat', image: panImage },
  { icon: <IdCard className="w-6 h-6" />, title: 'Aadhaar Update', desc: 'Update name, address, DOB or mobile', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', link: '/chat', image: aadhaarImage },
  { icon: <Globe className="w-6 h-6" />, title: 'Passport', desc: 'Fresh application, renewal & Tatkal', color: 'from-indigo-500/20 to-violet-500/10', border: 'border-indigo-500/20', link: '/chat', image: passportImage },
  { icon: <Car className="w-6 h-6" />, title: 'Driving Licence', desc: "Learner's licence application & status", color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/20', link: '/chat', image: drivingImage },
  { icon: <Vote className="w-6 h-6" />, title: 'Voter ID', desc: 'New voter registration — EPIC card', color: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/20', link: '/chat', image: voterImage },
  { icon: <ShoppingBag className="w-6 h-6" />, title: 'Ration Card', desc: 'Apply under NFSA — AAY, PHH, NPHH', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/20', link: '/chat', image: rationImage },
  { icon: <ScrollText className="w-6 h-6" />, title: 'Birth Certificate', desc: 'Register a birth and get certificate', color: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/20', link: '/chat', image: birthImage },
  { icon: <GraduationCap className="w-6 h-6" />, title: 'Scholarships', desc: 'Apply for Maharashtra post-matric scholarships', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/20', link: '/chat' },
  { icon: <Search className="w-6 h-6" />, title: 'Track Application', desc: 'Real-time status of any application', color: 'from-slate-500/20 to-gray-500/10', border: 'border-slate-500/20', link: '/status' },
];

const steps = [
  { step: '01', icon: <MessageSquare className="w-6 h-6" />, title: 'Tell the AI what you need', desc: 'Simply type or click the service you need — PAN, Passport, Aadhaar update, and more.', color: 'text-indigo-400' },
  { step: '02', icon: <Bot className="w-6 h-6" />, title: 'AI collects your information', desc: 'Our AI guides you step-by-step, asking only information required for that specific document.', color: 'text-purple-400' },
  { step: '03', icon: <BadgeCheck className="w-6 h-6" />, title: 'Review, confirm & submit', desc: 'Review all your details in a clear summary, confirm and submit. Get an Application ID instantly.', color: 'text-emerald-400' },
];

const stats = [
  { value: '8+', label: 'Document Services', icon: <FileText className="w-5 h-5" /> },
  { value: '100%', label: 'Real Requirements', icon: <CheckCircle className="w-5 h-5" /> },
  { value: '< 5 min', label: 'To Fill Application', icon: <Clock className="w-5 h-5" /> },
  { value: 'Free', label: 'No Hidden Charges', icon: <Star className="w-5 h-5" /> },
];

const features = [
  { icon: <Sparkles className="w-5 h-5 text-indigo-400" />, title: 'AI-Guided Process', desc: 'Intelligent conversation adapts to your specific needs and asks only relevant questions.' },
  { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: 'Real Requirements', desc: 'All fields and documents are based on actual Indian government service requirements.' },
  { icon: <Zap className="w-5 h-5 text-amber-400" />, title: 'Instant Application ID', desc: 'Get a unique Application ID immediately after submission to track your status.' },
  { icon: <Search className="w-5 h-5 text-blue-400" />, title: 'Live Status Tracking', desc: 'Track every stage from submission to dispatch with detailed history.' },
  { icon: <FileText className="w-5 h-5 text-purple-400" />, title: 'All Services in One Place', desc: 'PAN, Aadhaar, Passport, Driving Licence, Voter ID, Ration Card, Scholarships — all from one platform.' },
  { icon: <Award className="w-5 h-5 text-rose-400" />, title: 'Smart Validation', desc: 'Ensures all entered data is correct before submission, reducing rejections.' },
];

const chatPreview = [
  { role: 'ai', msg: '🙏 Namaste! Welcome to SevaDesk — your AI assistant. What would you like to do today?' },
  { role: 'user', msg: 'Apply for a PAN card' },
  { role: 'ai', msg: '📋 PAN Card Application\n⏳ Processing: 15–20 working days\n\nLet\'s start! What is your title?' },
  { role: 'user', msg: 'Shri' },
];

export default function HomePage() {
  const [visible, setVisible] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (visible < chatPreview.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 900);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <div className="min-h-screen app-shell overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b app-nav backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">SevaDesk</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/schemes" className="hover:text-white transition-colors">Scheme Finder</Link>
            <Link href="/status" className="hover:text-white transition-colors">Track Status</Link>
          </div>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="ml-auto md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/chat" className="hidden md:block">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95">
              <MessageSquare className="w-4 h-4" /> Start Chat
            </button>
          </Link>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#070a14]/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Services</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">How It Works</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Features</a>
              <Link href="/schemes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Scheme Finder</Link>
              <Link href="/status" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Track Status</Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all">
                <MessageSquare className="w-4 h-4" /> Start Chat
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] orb-pulse opacity-10" />
          <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] orb-pulse-delayed opacity-10" />
          <div className="grid-bg absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered • Real Requirements • Free
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              Government<br />Services,{' '}
              <span className="gradient-text">Reimagined</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              Apply for PAN, Passport, Aadhaar, Driving Licence and more — guided step-by-step by an intelligent AI assistant. No confusion. No paperwork maze.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chat">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-base transition-all glow-indigo">
                  <MessageSquare className="w-5 h-5" /> Start Your Application <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/status">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-8 py-4 glass glass-hover text-white rounded-xl font-semibold text-base transition-all">
                  <Search className="w-5 h-5" /> Track Application
                </motion.button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Real requirements</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> Secure & Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Instant ID</span>
            </div>
          </motion.div>

          {/* Chat preview card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/10 rounded-2xl blur-xl scale-105" />
              <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" /><span className="w-3 h-3 rounded-full bg-amber-500/60" /><span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> SevaDesk Assistant — Online
                  </div>
                </div>
                <div className="p-5 space-y-4 min-h-[300px]">
                  {chatPreview.slice(0, visible).map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'ai' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5"><Sparkles className="w-3.5 h-3.5 text-white" /></div>}
                      <div className={`max-w-[75%] text-xs rounded-xl px-3 py-2 leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/5 text-slate-200 border border-white/8 rounded-tl-sm'}`}>{msg.msg}</div>
                    </motion.div>
                  ))}
                  {visible < chatPreview.length && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                      <div className="bg-white/5 border border-white/8 rounded-xl rounded-tl-sm px-3 py-2.5"><div className="flex gap-1">{[0,1,2].map((i) => <span key={i} className="typing-dot w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block" style={{ animationDelay: `${i * 0.2}s` }} />)}</div></div>
                    </div>
                  )}
                </div>
                <div className="px-5 pb-3 flex flex-wrap gap-2">
                  {['📋 Apply for Document', '🔍 Track Status'].map((r) => <span key={r} className="px-3 py-1 text-xs rounded-full border border-indigo-500/30 text-indigo-300 bg-indigo-500/5">{r}</span>)}
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 border border-white/8">
                    <span className="text-xs text-slate-500 flex-1">Type your message...</span>
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"><div className="w-1 h-2 bg-white/40 rounded-full" /></motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 flex items-center gap-1.5"><span className="text-indigo-400">{stat.icon}</span>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs mb-4"><FileText className="w-3.5 h-3.5" /> Available Services</div>
            <h2 className="text-4xl font-bold mb-4">All Your Documents, <span className="gradient-text">One Platform</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Apply, update, or track any government document with AI guidance.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc, i) => (
              <motion.div key={svc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={svc.link}>
                  <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${svc.color} border ${svc.border} glass-hover transition-all duration-300 cursor-pointer group card-shine h-full`}>
                    {svc.image && (
                      <>
                        <div className="absolute inset-y-0 right-0 w-[58%] overflow-hidden pointer-events-none">
                          <Image
                            src={svc.image}
                            alt={svc.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-contain object-right opacity-35 blur-[1.5px] scale-110 translate-x-6 group-hover:scale-[1.14] transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#04050a]/90 via-[#04050a]/55 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#04050a]/35 via-transparent to-transparent pointer-events-none" />
                      </>
                    )}
                    {svc.badge && <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs rounded-full ${svc.badgeColor} font-medium`}>{svc.badge}</span>}
                    <div className="relative z-10">
                      <div className="mb-3 text-slate-300 group-hover:scale-110 transition-transform duration-300 inline-block">{svc.icon}</div>
                      <h3 className="font-semibold text-white mb-1.5">{svc.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-[72%] sm:max-w-full lg:max-w-[72%]">{svc.desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Get Started <ArrowRight className="w-3 h-3" /></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs mb-4"><Zap className="w-3.5 h-3.5" /> Simple 3-Step Process</div>
            <h2 className="text-4xl font-bold mb-4">How <span className="gradient-text">SevaDesk</span> Works</h2>
            <p className="text-slate-400 text-lg">From selection to submission in under 5 minutes</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="glass rounded-2xl p-6 border border-white/8 text-center group hover:border-indigo-500/20 transition-all">
                  <div className="relative inline-flex mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-indigo-500/10 transition-all"><span className={step.color}>{step.icon}</span></div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <Link href="/chat"><button className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all glow-indigo">Try It Now — It&apos;s Free <ArrowRight className="w-4 h-4" /></button></Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose <span className="gradient-text">SevaDesk?</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built with real government service requirements — not just a generic form filler.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-6 border border-white/8 hover:border-indigo-500/15 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 transition-all">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20" />
            <div className="relative z-10 p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6"><Sparkles className="w-4 h-4" /> Start free — no registration required</div>
              <h2 className="text-4xl font-bold text-white mb-4">Ready to apply for your document?</h2>
              <p className="text-indigo-100/80 text-lg mb-8 max-w-xl mx-auto">Apply for government documents the smart way with AI guidance.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/chat"><button className="px-8 py-4 bg-white text-indigo-700 hover:bg-white/90 rounded-xl font-semibold text-base transition-all">Start Application →</button></Link>
                <Link href="/status"><button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-base transition-all">Track Existing Application</button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                <span className="font-bold text-lg">SevaDesk</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">AI-powered assistant for Indian government document services.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm text-slate-400">
              <div>
                <p className="text-white font-medium mb-3">Services</p>
                {['PAN Card', 'Aadhaar', 'Passport', 'Driving Licence'].map((s) => <Link key={s} href="/chat" className="block hover:text-white transition-colors mb-1.5">{s}</Link>)}
              </div>
              <div>
                <p className="text-white font-medium mb-3">Links</p>
                {[['Home', '/'], ['Chat', '/chat'], ['Track Status', '/status']].map(([label, href]) => <Link key={label} href={href} className="block hover:text-white transition-colors mb-1.5">{label}</Link>)}
              </div>
              <div>
                <p className="text-white font-medium mb-3">Official Portals</p>
                <p className="text-xs text-slate-500 leading-relaxed">NSDL PAN • UIDAI • Passport Seva • Parivahan • ECI Voter Portal</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>© 2026 SevaDesk. For informational and demo purposes only.</p>
            <p>⚠️ Always verify requirements at official government portals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

