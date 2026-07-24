import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Gift,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Maximize,
  Menu,
  Building2,
  CheckCircle,
  Info,
} from 'lucide-react';

import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

import PrayerPage from './pages/PrayerPage';
import DevotionPage from './pages/DevotionPage';
import StoriesPage from './pages/StoriesPage';
import CompanionPage from './pages/CompanionPage';
import DonatePage from './pages/DonatePage';

// Gemini TTS audio utility: Converts PCM data directly to dynamic WAV audio
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

function pcmToWav(pcm16, sampleRate) {
  const buffer = new ArrayBuffer(44 + pcm16.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcm16.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcm16.length * 2, true);

  for (let i = 0; i < pcm16.length; i++) view.setInt16(44 + i * 2, pcm16[i], true);
  return new Blob([buffer], { type: 'audio/wav' });
}

const MOCK_DEVOTION = {
  id: 'dev-1',
  title: 'Resting in the Shelter of the Most High',
  scripture: 'Psalm 91:1-2',
  scripture_text:
    'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
  content:
    'In our fast-paced modern world, finding true rest can feel difficult. God invites us to dwell in His shelter, where fear is replaced with peace and worry with trust. His presence is not temporary comfort—it is enduring refuge.',
  reflection:
    'What areas of stress or anxiety are you holding onto today? Take two minutes to surrender them explicitly to your Fortress.',
  author: 'Pastor David Vance',
  read_time: '3 min read',
};

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    name: 'Sarah Mercer',
    category: 'Healing',
    content:
      "Please pray for my mother's upcoming biopsy results this Wednesday. We are asking for complete healing and peace that passes all understanding for our family.",
    is_public: true,
    prayer_count: 34,
    created_date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    name: 'Brother Thomas',
    category: 'Guidance',
    content:
      "Seeking clarity regarding a major job change. I want to align my path with God's calling for my life. Praying for open doors and clear signposts.",
    is_public: true,
    prayer_count: 19,
    created_date: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const INITIAL_TESTIMONIES = [
  {
    id: 'test-1',
    author: 'Hannah Sterling',
    title: 'An Open Door in the Storm',
    description:
      'After months of prayer from this community, God opened the right job door for our family. We are deeply grateful.',
    verse_reference: 'Philippians 4:19',
    created_date: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'test-2',
    author: 'Marcus Vance',
    title: 'Complete Biopsy Healing',
    description:
      'Praise report! The scans came back clear this morning. Thank you all for standing with me in prayer.',
    verse_reference: 'Jeremiah 30:17',
    created_date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [devotion, setDevotion] = useState(MOCK_DEVOTION);
  const [loading, setLoading] = useState(true);

  const [globalPrayers, setGlobalPrayers] = useState(14281);
  const [onlineMembers, setOnlineMembers] = useState(24);
  const [toasts, setToasts] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showRequestForm, setShowRequestForm] = useState(false);

  const [companionChat, setCompanionChat] = useState([
    {
      id: 'init',
      role: 'companion',
      text: "Hello, friend. I'm Pat from the Sanctuary prayer support group. Please tell me what's on your mind or how your heart is feeling today so we can stand together in prayer.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCompanionReplying, setIsCompanionReplying] = useState(false);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedVoice] = useState('Sulafat');

  const audioRef = useRef(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), 4000);
  };

  useEffect(() => {
    if (activeTab === 'donate') {
      const scriptId = 'paypal-js-sdk';
      const containerId = 'paypal-container-96DDM8URMSCEJ';

      const renderPaypalButton = () => {
        if (window.paypal) {
          const container = document.getElementById(containerId);
          if (container && container.childElementCount === 0) {
            window.paypal.HostedButtons({
              hostedButtonId: '96DDM8URMSCEJ',
            }).render(`#${containerId}`);
          }
        }
      };

      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src =
          'https://www.paypal.com/sdk/js?client-id=BAAT-dKjhafLIh_UK3LkezEdQNfO6oMxUHGVPD11EgMlr5RmulE6l0VLXovlUlr7we_XBf7W7uB9nio-3I&components=hosted-buttons&disable-funding=venmo&currency=USD';
        script.async = true;
        script.onload = renderPaypalButton;
        document.body.appendChild(script);
      } else {
        renderPaypalButton();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setIsAudioPlaying(false));
    }

    const fetchData = async () => {
      try {
        const prayerQuery = query(collection(db, 'prayerRequests'), orderBy('created_date', 'desc'), limit(20));
        const prayerSnapshot = await getDocs(prayerQuery);
        const reqs = prayerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const testimonyQuery = query(collection(db, 'testimonies'), orderBy('created_date', 'desc'), limit(20));
        const testimonySnapshot = await getDocs(testimonyQuery);
        const tests = testimonySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const mappedTests = (tests.length ? tests : INITIAL_TESTIMONIES).map((t) => ({
          ...t,
          description: t.description || t.content || '',
        }));

        setRequests(reqs.length ? reqs : INITIAL_REQUESTS);
        setTestimonies(mappedTests);
        setDevotion(MOCK_DEVOTION);
      } catch (error) {
        console.error(error);
        setRequests(INITIAL_REQUESTS);
        setTestimonies(INITIAL_TESTIMONIES);
        setDevotion(MOCK_DEVOTION);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setGlobalPrayers((p) => p + Math.floor(Math.random() * 2) + 1);
    }, 12000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const speakText = async (text) => {
    if (!text) return;
    setIsAudioLoading(true);
    setIsAudioPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    try {
      const apiKey = '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say in a calm, spiritual tempo: ${text}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          },
        }),
      });

      if (!response.ok) throw new Error();
      const result = await response.json();
      const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

      if (audioData) {
        const rateMatch = mimeType?.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const wavBlob = pcmToWav(new Int16Array(base64ToArrayBuffer(audioData)), sampleRate);
        const url = URL.createObjectURL(wavBlob);

        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
          setIsAudioPlaying(true);
          addToast('Playing devotion recording...', 'success');
        }
      }
    } catch (e) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => setIsAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsAudioPlaying(true);
        addToast('Playing default browser vocalizer...', 'info');
      } else {
        addToast('Voice audio not supported on this device.', 'warning');
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handlePauseSpeech = () => {
    if (audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsAudioPlaying(false);
    addToast('Audio reader paused.', 'info');
  };

  const handleSendCompanionMessage = async (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `msg-${Date.now()}-user`, role: 'user', text: textToSend, time: timestamp };

    const updatedChat = [...companionChat, userMsg];
    setCompanionChat(updatedChat);
    setChatInput('');
    setIsCompanionReplying(true);

    try {
      const apiKey = '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const systemPrompt =
        'You are Pat, a compassionate Christian prayer companion. Respond with empathy, encouragement, and biblical hope. Keep responses concise and supportive.';
      const contents = updatedChat.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
      });

      if (!response.ok) throw new Error();
      const result = await response.json();
      const replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) {
        const replyMsg = {
          id: `msg-${Date.now()}-comp`,
          role: 'companion',
          text: replyText.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCompanionChat((prev) => [...prev, replyMsg]);
      }
    } catch (e) {
      const replyMsg = {
        id: `msg-${Date.now()}-comp`,
        role: 'companion',
        text: 'I hear you, and I’m here with you in prayer. God is near to the brokenhearted and faithful to sustain you one step at a time.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCompanionChat((prev) => [...prev, replyMsg]);
    } finally {
      setIsCompanionReplying(false);
    }
  };

  const tabs = ['home', 'prayer', 'devotion', 'stories', 'companion', 'donate'];

  return (
    <div className="min-h-screen bg-[#111020] text-stone-100 flex flex-col font-sans selection:bg-[#C9A961]/30">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start gap-3 bg-[#1F1D36] ${
              toast.type === 'success' ? 'border-[#C9A961]' : 'border-amber-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#C9A961] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-semibold text-stone-100 leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-[#1A1830] border-b border-stone-800 sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FAF8F3]/10 to-transparent border border-[#C9A961]/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#C9A961]" />
            </div>
            <span className="font-serif text-lg font-bold tracking-wide text-[#FAF8F3]">PrayerHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Home
            </button>
            <button onClick={() => setActiveTab('prayer')} className={activeTab === 'prayer' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Requests
            </button>
            <button onClick={() => setActiveTab('devotion')} className={activeTab === 'devotion' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Daily Devotion
            </button>
            <button onClick={() => setActiveTab('stories')} className={activeTab === 'stories' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Testimonies
            </button>
            <button onClick={() => setActiveTab('companion')} className={activeTab === 'companion' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Comfort Companion
            </button>
            <button onClick={() => setActiveTab('donate')} className={activeTab === 'donate' ? 'text-[#C9A961]' : 'text-stone-300'}>
              Support Us
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                addToast('Syncing sanctuary database records...', 'success');
                setOnlineMembers(Math.floor(Math.random() * 15) + 15);
              }}
              className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 transition-colors hidden sm:block"
              title="Refresh database"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={() => setShowScanModal(true)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 transition-colors" title="Verify mobile code link">
              <Maximize className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1830] border-t border-stone-800 px-4 py-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-semibold capitalize ${
                  activeTab === tab ? 'bg-[#C9A961] text-[#1A1830]' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {tab === 'companion' ? 'Comfort Companion' : tab === 'stories' ? 'Testimonies' : tab === 'donate' ? 'Support Us' : tab}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="bg-[#1A1830] rounded-3xl border border-stone-800 p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A961]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#C9A961]">PrayerHub Sanctuary</span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl leading-relaxed">A place to pray, be encouraged, and share hope.</h1>
              <p className="text-stone-400 mt-3 text-sm">Live members online: {onlineMembers} · Global prayers: {globalPrayers.toLocaleString()}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center">
                <button
                  onClick={() => setActiveTab('prayer')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C9A961] hover:bg-[#B89850] text-[#1A1830] font-bold text-sm"
                >
                  <Heart className="w-4 h-4 fill-[#1A1830]" />
                  <span>Share a Prayer Request</span>
                </button>
                <button
                  onClick={() => setActiveTab('companion')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-stone-600 text-white hover:bg-stone-800 font-bold text-sm"
                >
                  <ArrowRight className="w-4 h-4 text-[#C9A961]" />
                  <span>Get Comfort Companion</span>
                </button>
              </div>
            </div>

            {loading && <p className="text-stone-400 text-sm">Loading sanctuary content...</p>}
          </div>
        )}

        {activeTab === 'prayer' && <PrayerPage requests={requests} setShowRequestForm={setShowRequestForm} />}

        {activeTab === 'devotion' && (
          <DevotionPage
            devotion={devotion}
            speakText={speakText}
            handlePauseSpeech={handlePauseSpeech}
            isAudioLoading={isAudioLoading}
            isAudioPlaying={isAudioPlaying}
          />
        )}

        {activeTab === 'stories' && <StoriesPage testimonies={testimonies} />}

        {activeTab === 'companion' && (
          <CompanionPage
            companionChat={companionChat}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendCompanionMessage={handleSendCompanionMessage}
            isCompanionReplying={isCompanionReplying}
          />
        )}

        {activeTab === 'donate' && <DonatePage />}
      </main>

      {/* Mobile footer quick nav */}
      <footer className="md:hidden sticky bottom-0 inset-x-0 bg-[#1A1830] border-t border-stone-800 py-3.5 px-3 flex justify-between items-center z-30">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[11px] px-2 py-1 rounded ${activeTab === tab ? 'text-[#C9A961]' : 'text-stone-400'}`}
          >
            {tab === 'stories' ? 'Stories' : tab === 'companion' ? 'Companion' : tab}
          </button>
        ))}
      </footer>

      {showScanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1F1D36] border border-[#C9A961]/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-white">Sacred QR Scanner</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Scan this dynamic workspace code to open the PrayerHub Daily Sanctuary directly on your phone.
            </p>
            <button
              onClick={() => setShowScanModal(false)}
              className="bg-[#C9A961] text-[#1A1830] font-bold text-xs py-2.5 px-6 rounded-full w-full"
            >
              Close Scanner Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
