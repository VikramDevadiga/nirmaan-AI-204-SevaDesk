'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Sparkles, CheckCircle, Clock, Package,
  FileText, Loader2, AlertCircle, RefreshCw, Copy, MessageSquare,
  Menu, X,
} from 'lucide-react';

interface StatusEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface Application {
  id: string;
  type: string;
  service: string;
  document: string;
  status: string;
  statusHistory: StatusEntry[];
  submittedAt: string;
  data: Record<string, string>;
  applicantName?: string;
  applicantMobile?: string;
  applicantEmail?: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  'Submitted': { color: 'text-indigo-300', bg: 'bg-indigo-500/15 border-indigo-500/30', icon: <FileText className="w-4 h-4" /> },
  'Under Review': { color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30', icon: <Clock className="w-4 h-4" /> },
  'Documents Verified': { color: 'text-blue-300', bg: 'bg-blue-500/15 border-blue-500/30', icon: <CheckCircle className="w-4 h-4" /> },
  'Police Verification Pending': { color: 'text-orange-300', bg: 'bg-orange-500/15 border-orange-500/30', icon: <Clock className="w-4 h-4" /> },
  'Approved': { color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <CheckCircle className="w-4 h-4" /> },
  'Dispatched': { color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: <Package className="w-4 h-4" /> },
  'Test Scheduled': { color: 'text-purple-300', bg: 'bg-purple-500/15 border-purple-500/30', icon: <Clock className="w-4 h-4" /> },
  'Completed': { color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: <CheckCircle className="w-4 h-4" /> },
  'Rejected': { color: 'text-red-300', bg: 'bg-red-500/15 border-red-500/30', icon: <AlertCircle className="w-4 h-4" /> },
};

const DOC_ICONS: Record<string, string> = {
  pan: '🪪', aadhaar: '🆔', passport: '📔', 'driving-license': '🚗',
  'voter-id': '🗳️', 'ration-card': '🍚', 'birth-certificate': '📜',
};

const SAMPLE_IDS = ['PAN-2026-DEMO01', 'PSP-2026-DEMO02', 'DL-2026-DEMO03'];

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return ts; }
}

function StatusContent() {
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-search if ID in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSearchId(id);
      doSearch(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(id: string) {
    const trimmedId = id.trim().toUpperCase();
    if (!trimmedId) return;
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const res = await fetch(`/api/applications/${trimmedId}`);
      if (!res.ok) {
        setError(`No application found with ID "${trimmedId}". Please check and try again.`);
      } else {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(searchId);
  }

  function copyId() {
    if (!application) return;
    navigator.clipboard.writeText(application.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const statusConf = application ? STATUS_CONFIG[application.status] || { color: 'text-slate-300', bg: 'bg-slate-500/15 border-slate-500/30', icon: <Clock className="w-4 h-4" /> } : null;

  return (
    <div className="min-h-screen app-shell">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-[0.06]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[150px] opacity-[0.06]" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b app-nav backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:block">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Track Application</span>
          </div>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="ml-auto sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/chat" className="hidden sm:block">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-lg hover:bg-indigo-600/30 transition-all">
              <MessageSquare className="w-4 h-4" /> New Application
            </button>
          </Link>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-[#070a14]/95 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Home</Link>
              <Link href="/status" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Track Status</Link>
              <Link href="/schemes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Scheme Finder</Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg font-medium hover:bg-indigo-600/30 transition-all">
                <MessageSquare className="w-4 h-4" /> New Application
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs mb-4">
            <Search className="w-3.5 h-3.5" /> Real-time Status Tracking
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Track Your <span className="gradient-text">Application</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Enter your Application ID to get real-time status and detailed history
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 input-ring glass rounded-2xl overflow-hidden border border-white/10 transition-all">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter Application ID (e.g., PAN-2026-ABC123)"
                className="w-full bg-transparent text-white placeholder-slate-600 px-5 py-4 text-sm outline-none font-mono"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading || !searchId.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-semibold text-sm transition-all flex items-center gap-2 glow-indigo"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </motion.button>
          </form>

          {/* Sample IDs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-600">Try demo:</span>
            {SAMPLE_IDS.map((id) => (
              <button
                key={id}
                onClick={() => { setSearchId(id); doSearch(id); }}
                className="px-3 py-1 text-xs rounded-full glass border border-white/10 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all font-mono"
              >
                {id}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto mb-8 glass rounded-2xl border border-red-500/20 p-5 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Application Not Found</p>
                <p className="text-slate-400 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {application && statusConf && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Application Card */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-white/8 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{DOC_ICONS[application.document] || '📋'}</div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{application.type}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="font-mono text-sm text-indigo-300">{application.id}</code>
                          <button onClick={copyId} className="text-slate-500 hover:text-white transition-colors" title="Copy ID">
                            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${statusConf.bg} ${statusConf.color}`}>
                      {statusConf.icon}
                      {application.status}
                    </div>
                  </div>
                </div>

                {/* Application Info */}
                <div className="p-6 grid sm:grid-cols-3 gap-4 border-b border-white/5">
                  {application.applicantName && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Applicant</p>
                      <p className="text-sm font-medium text-white">{application.applicantName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Submitted On</p>
                    <p className="text-sm text-white">{formatDate(application.submittedAt)}</p>
                  </div>
                  {application.applicantMobile && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Mobile</p>
                      <p className="text-sm text-white">{application.applicantMobile}</p>
                    </div>
                  )}
                  {application.applicantEmail && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-white break-all">{application.applicantEmail}</p>
                    </div>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Application Timeline</h3>
                    <button
                      onClick={() => doSearch(application.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  <div className="space-y-0">
                    {application.statusHistory.map((entry, i) => {
                      const conf = STATUS_CONFIG[entry.status] || { color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20', icon: <Clock className="w-4 h-4" /> };
                      const isLast = i === application.statusHistory.length - 1;
                      const isCurrent = entry.status === application.status;

                      return (
                        <div key={i} className="flex gap-4">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${isCurrent ? conf.bg + ' ' + conf.color : 'bg-white/5 border-white/10 text-slate-500'}`}>
                              {conf.icon}
                            </div>
                            {!isLast && <div className="w-px bg-white/8 flex-1 my-1 min-h-[24px]" />}
                          </div>

                          {/* Content */}
                          <div className={`pb-6 flex-1 ${isLast ? 'pb-0' : ''}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <p className={`font-medium text-sm ${isCurrent ? conf.color : 'text-slate-400'}`}>
                                {entry.status}
                                {isCurrent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">Current</span>}
                              </p>
                              <p className="text-xs text-slate-600">{formatDate(entry.timestamp)}</p>
                            </div>
                            {entry.note && (
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{entry.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Application Data Summary */}
              {Object.keys(application.data).length > 0 && (
                <div className="glass rounded-2xl border border-white/8 p-6">
                  <h3 className="font-semibold text-white mb-4">Submitted Information</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(application.data)
                      .filter(([, val]) => val && val.length > 0)
                      .map(([key, val]) => {
                        return (
                        <div key={key} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                          <p className="text-[11px] text-slate-500 capitalize mb-0.5">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                          </p>
                          <p className="text-sm text-slate-200 break-words" title={val}>{val}</p>
                        </div>
                      );})}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/chat">
                  <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all">
                    <MessageSquare className="w-4 h-4" /> New Application
                  </button>
                </Link>
                <button
                  onClick={() => { setApplication(null); setSearchId(''); setError(''); }}
                  className="flex items-center gap-2 px-6 py-3 glass glass-hover border border-white/10 text-white rounded-xl font-medium transition-all"
                >
                  <Search className="w-4 h-4" /> Search Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!application && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-500 mb-2">Enter your Application ID to check status</p>
            <p className="text-xs text-slate-600 mb-8">
              You received this ID when you submitted your application via SevaDesk
            </p>

            {/* Info cards */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              {[
                { status: 'Submitted', desc: 'Application received and queued for review', color: 'from-indigo-500/10' },
                { status: 'Under Review', desc: 'Documents being verified by the department', color: 'from-amber-500/10' },
                { status: 'Dispatched', desc: 'Document processed and sent to your address', color: 'from-emerald-500/10' },
              ].map((s) => (
                <div key={s.status} className={`glass rounded-xl p-4 border border-white/8 bg-gradient-to-br ${s.color} to-transparent`}>
                  <p className="text-sm font-medium text-white mb-1">{s.status}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#04050a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
