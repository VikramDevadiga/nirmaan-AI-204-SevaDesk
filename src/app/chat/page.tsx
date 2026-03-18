'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, User, ArrowLeft, RefreshCw, Copy, CheckCircle,
  ExternalLink, MessageSquare,
  Mic, MicOff,
  Volume2, VolumeX,
  ScanText,
} from 'lucide-react';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  applicationId?: string;
}

interface OcrCandidate {
  id: string;
  label: string;
  value: string;
}

const SESSION_KEY = 'sevadesk_session';
const MESSAGES_KEY = 'sevadesk_messages';
const LEGACY_SESSION_KEY = 'govai_session';
const LEGACY_MESSAGES_KEY = 'govai_messages';
const SPEECH_OUTPUT_KEY = 'sevadesk_speech_output';

// Simple markdown-like renderer (bold, code, newlines)
function renderContent(content: string) {
  const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-indigo-200 font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.includes('##'))
      return <code key={i} className="font-mono text-base bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">{part.replace(/^##\s+`?|`?$/g, '')}</code>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-indigo-200 text-[0.85em]">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

function getSpeechText(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeOcrText(raw: string) {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLatestAssistantPrompt(messages: Message[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'assistant') return message.content;
  }
  return '';
}

function extractPhoneCandidates(text: string) {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const matches = text.match(/(?:\+?91[\s-]?)?[0-9][0-9\s-]{8,14}/g) || [];
  for (const raw of matches) {
    const digits = raw.replace(/\D/g, '');

    let mobile = '';
    if (digits.length === 10) {
      mobile = digits;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      mobile = digits.slice(2);
    }

    if (!mobile || mobile.length !== 10) continue;
    if (seen.has(mobile)) continue;
    seen.add(mobile);
    candidates.push(mobile);
  }

  return candidates;
}

function extractLikelyFullName(ocrText: string) {
  const lines = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blockedWords = /government|india|republic|address|dob|sex|male|female|card|authority|uidai|department|issue|valid/i;
  const labelPattern = /^(name|full name|given name|surname)\s*[:\-]\s*/i;

  for (const line of lines) {
    if (blockedWords.test(line)) continue;
    const cleaned = line.replace(labelPattern, '').replace(/\s+/g, ' ').trim();
    if (!cleaned) continue;

    const words = cleaned.split(' ').filter((w) => /^[A-Za-z.]+$/.test(w));
    if (words.length < 2 || words.length > 5) continue;

    const fullName = words.join(' ');
    if (fullName.length >= 5) return fullName;
  }

  return '';
}

function extractAutofillValue(ocrText: string, prompt: string) {
  const text = normalizeOcrText(ocrText);
  const ask = prompt.toLowerCase();

  const find = (regex: RegExp) => text.match(regex)?.[0] || '';

  if (/aadhaar|aadhar/.test(ask)) {
    const digits = find(/(?:\d[\s-]?){12}/g).replace(/\D/g, '');
    return digits.length === 12 ? digits : '';
  }

  if (/pan/.test(ask)) {
    return find(/\b[A-Z]{5}\d{4}[A-Z]\b/i).toUpperCase();
  }

  if (/passport/.test(ask)) {
    return find(/\b[A-PR-WYa-pr-wy][1-9]\d{6}\b/);
  }

  if (/mobile|phone|contact/.test(ask)) {
    return extractPhoneCandidates(text)[0] || '';
  }

  if (/email/.test(ask)) {
    return find(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/);
  }

  if (/pin\s?code|pincode/.test(ask)) {
    return find(/\b\d{6}\b/);
  }

  if (/date of birth|dob|birth/.test(ask)) {
    return find(/\b\d{2}[\/.-]\d{2}[\/.-]\d{4}\b/);
  }

  if (/name/.test(ask)) {
    const fullName = extractLikelyFullName(ocrText);
    if (fullName) return fullName;
  }

  const firstLine = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length >= 3);

  return firstLine || text.slice(0, 60);
}

function extractOcrCandidates(ocrText: string): OcrCandidate[] {
  const text = normalizeOcrText(ocrText);
  const lines = ocrText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const seen = new Set<string>();
  const output: OcrCandidate[] = [];

  const add = (label: string, value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    const key = `${label}:${normalized.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    output.push({ id: key, label, value: normalized });
  };

  const aadhaarMatches = text.match(/(?:\d[\s-]?){12}/g) || [];
  for (const match of aadhaarMatches) {
    const digits = match.replace(/\D/g, '');
    if (digits.length === 12) add('Aadhaar Number', digits);
  }

  const panMatches = text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/gi) || [];
  for (const match of panMatches) add('PAN', match.toUpperCase());

  const passportMatches = text.match(/\b[A-PR-WYa-pr-wy][1-9]\d{6}\b/g) || [];
  for (const match of passportMatches) add('Passport Number', match.toUpperCase());

  for (const mobile of extractPhoneCandidates(text)) add('Mobile Number', mobile);

  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  for (const match of emailMatches) add('Email', match);

  const dobMatches = text.match(/\b\d{2}[\/.-]\d{2}[\/.-]\d{4}\b/g) || [];
  for (const match of dobMatches) add('Date of Birth', match.replace(/[.-]/g, '/'));

  const pincodeMatches = text.match(/\b\d{6}\b/g) || [];
  for (const match of pincodeMatches) add('PIN Code', match);

  const fullName = extractLikelyFullName(ocrText);
  if (fullName) add('Full Name', fullName);

  return output.slice(0, 16);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechOutputSupported, setSpeechOutputSupported] = useState(false);
  const [speechOutputEnabled, setSpeechOutputEnabled] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrCandidates, setOcrCandidates] = useState<OcrCandidate[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const transcriptRef = useRef('');
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const speechReadyRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setSpeechOutputSupported(typeof window.speechSynthesis !== 'undefined');

    const savedSpeechOutput = localStorage.getItem(SPEECH_OUTPUT_KEY);
    if (savedSpeechOutput !== null) {
      setSpeechOutputEnabled(savedSpeechOutput === 'true');
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      transcriptRef.current = '';
      setSpeechError(null);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const combinedTranscript = `${finalTranscript}${interimTranscript}`.trim();
      transcriptRef.current = combinedTranscript;
      setInput(combinedTranscript);
    };

    recognition.onerror = () => {
      setSpeechError('Voice input could not start. Check microphone permission and try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      const spokenText = transcriptRef.current.trim();
      transcriptRef.current = '';

      if (spokenText && !loadingRef.current) {
        setInput('');
        sendToAPI(spokenText, sessionIdRef.current);
      }
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !speechOutputSupported) return;
    localStorage.setItem(SPEECH_OUTPUT_KEY, String(speechOutputEnabled));
  }, [speechOutputEnabled, speechOutputSupported]);

  useEffect(() => {
    const assistantMessages = messages.filter((message) => message.role === 'assistant');
    const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];

    if (!latestAssistantMessage) return;

    if (!speechReadyRef.current) {
      speechReadyRef.current = true;
      lastSpokenMessageIdRef.current = latestAssistantMessage.id;
      return;
    }

    if (!speechOutputSupported || !speechOutputEnabled) return;
    if (lastSpokenMessageIdRef.current === latestAssistantMessage.id) return;

    const text = getSpeechText(latestAssistantMessage.content);
    if (!text) return;

    lastSpokenMessageIdRef.current = latestAssistantMessage.id;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [messages, speechOutputEnabled, speechOutputSupported]);

  // Initialize on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedSid = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
    const storedMsgs = localStorage.getItem(MESSAGES_KEY) || localStorage.getItem(LEGACY_MESSAGES_KEY);

    if (storedSid && storedMsgs) {
      try {
        const parsed: Message[] = JSON.parse(storedMsgs);
        if (parsed.length > 0) {
          setSessionId(storedSid);
          setMessages(parsed);
          return;
        }
      } catch { /* ignore */ }
    }

    sendToAPI('__init__', null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  async function sendToAPI(text: string, sid: string | null) {
    setLoading(true);

    if (text !== '__init__') {
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, message: text }),
      });
      const data = await res.json();

      const newSid = data.sessionId || sid;
      if (newSid && newSid !== sid) {
        setSessionId(newSid);
        localStorage.setItem(SESSION_KEY, newSid);
      }

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        quickReplies: data.quickReplies,
        applicationId: data.applicationId,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendToAPI(text, sessionId);
  }

  function handleQuickReply(reply: string) {
    if (loading) return;
    sendToAPI(reply, sessionId);
  }

  function handleVoiceToggle() {
    if (!recognitionRef.current || loading) return;

    setSpeechError(null);

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    transcriptRef.current = '';
    recognitionRef.current.start();
  }

  function handleSpeechOutputToggle() {
    if (!speechOutputSupported) return;

    const nextValue = !speechOutputEnabled;
    setSpeechOutputEnabled(nextValue);

    if (!nextValue) {
      window.speechSynthesis.cancel();
    }
  }

  async function handleOcrFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setOcrError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    setOcrError(null);
    setOcrLoading(true);

    try {
      const { recognize } = await import('tesseract.js');
      const result = await recognize(file, 'eng');
      const extracted = result.data.text || '';

      if (!extracted.trim()) {
        setOcrCandidates([]);
        setOcrError('No readable text found in this image. Try a clearer photo.');
        return;
      }

      const candidates = extractOcrCandidates(extracted);
      setOcrCandidates(candidates);

      const prompt = getLatestAssistantPrompt(messages);
      const value = extractAutofillValue(extracted, prompt).trim();

      if (!value) {
        if (candidates.length === 0) {
          setOcrError('Could not detect useful values. Please type manually or upload a clearer image.');
        }
        return;
      }

      setInput(value);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setOcrError('OCR failed. Please try another image or type manually.');
    } finally {
      setOcrLoading(false);
    }
  }

  function triggerOcrUpload() {
    if (loading || ocrLoading) return;
    setOcrError(null);
    ocrInputRef.current?.click();
  }

  function handleCandidateDragStart(event: React.DragEvent<HTMLButtonElement>, value: string) {
    event.dataTransfer.setData('text/plain', value);
    event.dataTransfer.effectAllowed = 'copy';
  }

  function handleInputDrop(event: React.DragEvent<HTMLInputElement>) {
    event.preventDefault();
    const droppedValue = event.dataTransfer.getData('text/plain').trim();
    if (!droppedValue) return;
    setInput(droppedValue);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleInputDragOver(event: React.DragEvent<HTMLInputElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleReset() {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem(LEGACY_MESSAGES_KEY);
    setMessages([]);
    setSessionId(null);
    initialized.current = false;
    sendToAPI('__init__', null);
  }

  function copyApplicationId(id: string) {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function formatTime(ts: string) {
    try {
      return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col app-shell overflow-hidden overscroll-none">
      {/* ── Header ── */}
      <div className="sticky top-0 flex-shrink-0 border-b border-white/8 app-nav backdrop-blur-xl z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#04050a]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">SevaDesk Assistant</p>
              <p className="text-emerald-400 text-xs">Online • Ready to help</p>
            </div>
          </div>

          <button
            onClick={handleSpeechOutputToggle}
            title={speechOutputSupported ? (speechOutputEnabled ? 'Mute assistant voice' : 'Enable assistant voice') : 'Text-to-speech is not supported in this browser'}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!speechOutputSupported}
          >
            {speechOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            title="Start new conversation"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Welcome message if no messages */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">SevaDesk</h2>
              <p className="text-slate-500 text-sm max-w-sm">
                Your AI assistant for Indian government document services. Ask about PAN, Passport, Aadhaar, Driving Licence, and more.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white/[0.06] border border-white/[0.08] text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant'
                      ? renderContent(msg.content)
                      : msg.content}

                    {/* Application ID card */}
                    {msg.applicationId && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-400 mb-2">Your Application ID:</p>
                        <div className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/30 rounded-lg px-3 py-2">
                          <code className="font-mono text-sm font-bold text-indigo-200 flex-1">{msg.applicationId}</code>
                          <button
                            onClick={() => copyApplicationId(msg.applicationId!)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy Application ID"
                          >
                            {copied === msg.applicationId
                              ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                              : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <Link href={`/status?id=${msg.applicationId}`} className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                          <ExternalLink className="w-3 h-3" /> Track Application Status
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Quick replies */}
                  {msg.role === 'assistant' && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          disabled={loading}
                          className="px-3 py-1.5 text-xs rounded-full border border-indigo-500/40 text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-400/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-[10px] text-slate-600 px-1">{formatTime(msg.timestamp)}</p>
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot w-2 h-2 bg-indigo-400 rounded-full inline-block"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* ── Input Bar ── */}
      <div className="sticky bottom-0 flex-shrink-0 border-t border-white/8 app-nav backdrop-blur-xl z-30">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 input-ring bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onDragOver={handleInputDragOver}
                onDrop={handleInputDrop}
                placeholder="Type your answer or click a quick reply above..."
                className="w-full bg-transparent text-white placeholder-slate-600 px-4 py-3.5 text-sm outline-none"
                disabled={loading}
              />
            </div>
            <motion.button
              type="button"
              onClick={triggerOcrUpload}
              disabled={loading || ocrLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg flex-shrink-0"
              title="Scan a document image to autofill current answer"
            >
              <ScanText className={`w-4 h-4 ${ocrLoading ? 'animate-pulse text-indigo-300' : ''}`} />
            </motion.button>
            <motion.button
              type="button"
              onClick={handleVoiceToggle}
              disabled={!speechSupported || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shadow-lg flex-shrink-0 ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/20'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={speechSupported ? (isListening ? 'Stop voice input' : 'Start voice input') : 'Voice input is not supported in this browser'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
            <motion.button
              type="submit"
              disabled={!input.trim() || loading || ocrLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20 flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
            <input
              ref={ocrInputRef}
              type="file"
              accept="image/*"
              onChange={handleOcrFileChange}
              className="hidden"
            />
          </form>

          {ocrCandidates.length > 0 && (
            <div className="mt-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-[11px] text-indigo-300 mb-2">OCR extracted values: drag to input field or click to use</p>
              <div className="flex flex-wrap gap-2">
                {ocrCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    draggable
                    onDragStart={(event) => handleCandidateDragStart(event, candidate.value)}
                    onClick={() => setInput(candidate.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-white/[0.04] hover:bg-indigo-500/15 text-xs text-slate-200 transition-colors text-left"
                    title={candidate.value}
                  >
                    <span className="text-indigo-300">{candidate.label}:</span> {candidate.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-slate-700">
              {ocrError
                ? ocrError
                : ocrLoading
                  ? 'Scanning document... extracting text for autofill.'
                  : speechError
                ? speechError
                : isListening
                  ? 'Listening... pause when you finish and SevaDesk will send your message.'
                  : speechSupported
                    ? `${speechOutputEnabled && speechOutputSupported ? 'Replies will be spoken aloud • ' : ''}Use Scan to OCR autofill • tap mic to speak • say "help" for commands`
                    : `${speechOutputEnabled && speechOutputSupported ? 'Replies will be spoken aloud • ' : ''}Use Scan to OCR autofill • type "help" for commands`}
            </p>
            <Link href="/status" className="text-[11px] text-slate-600 hover:text-indigo-400 transition-colors flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Track Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
