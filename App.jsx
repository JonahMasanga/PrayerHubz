import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Gift,
  Bell,
  ArrowRight,
  Share2,
  Sparkles,
  CheckCircle,
  Smile,
  Info,
  RefreshCw,
  Maximize,
  Volume2,
  Pause,
  BookOpen,
  Book,
  Menu,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function pcmToWav(pcm16, sampleRate) {
  const buffer = new ArrayBuffer(44 + pcm16.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcm16.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcm16.length * 2, true);

  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(44 + i * 2, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

const MOCK_DEVOTION = {
  id: 'dev-1',
  title: 'Resting in the Shelter of the Most High',
  scripture: 'Psalm 91:1-2',
  scripture_text:
    'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
  content:
    'In our fast-paced modern world, finding true rest can feel like chasing a mirage. We seek refuge in entertainment, distraction, or accomplishments, yet our souls remain weary. True sanctuary is not a physical place or a schedule clearance; it is a Person. When we make the decision to dwell in God\'s presence daily through intentional prayer, we find a quiet shelter that no storm can breach.',
  reflection:
    'What areas of stress or anxiety are you holding onto today? Take 2 minutes to surrender them explicitly to your Fortress.',
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
      'Seeking clarity regarding a major job change. I want to align my path with God\'s calling for my life. Praying for open doors and clear signposts.',
    is_public: true,
    prayer_count: 19,
    created_date: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'req-3',
    name: 'Emily Jenkins',
    category: 'Family',
    content:
      'Lifting up my teenage son who has been struggling with severe isolation and anxiety. Praying he finds encouraging Christian friendships at school.',
    is_public: true,
    prayer_count: 42,
    created_date: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const INITIAL_TESTIMONIES = [
  {
    id: 'test-1',
    author: 'Hannah Sterling',
    title: 'An Open Door in the Storm',
    content:
      'After 4 months of prayer from this wonderful network, I was offered a remote job that fits our family perfectly. God is faithful to provide!',
    praises: 18,
    created_date: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'test-2',
    author: 'Marcus Vance',
    title: 'Complete Biopsy Healing',
    content:
      'Praise report! The medical scans returned absolutely clear this morning. Thank you all for wrapping me in prayers during my surgery.',
    praises: 56,
    created_date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const base44SafeClient = {
  entities: {
    PrayerRequest: {
      filter: async () => INITIAL_REQUESTS,
      create: async (data) => data,
    },
    Testimony: {
      list: async () => INITIAL_TESTIMONIES,
      create: async (data) => data,
    },
    Devotion: {
      list: async () => [MOCK_DEVOTION],
    },
  },
};

function PrayerCard({ request, onPray }) {
  const [prayed, setPrayed] = useState(false);
  const [localCount, setLocalCount] = useState(request.prayer_count || 0);

  const handlePray = () => {
    if (!prayed) {
      setLocalCount((p) => p + 1);
      setPrayed(true);
      onPray();
    } else {
      setLocalCount((p) => p - 1);
      setPrayed(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#1F1D36]/80 p-5 shadow-lg transition-all duration-300 hover:border-[#C9A961]/40">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-stone-800 bg-[#1A1830] px-3 py-1 text-[10px] font-bold text-[#FAF8F3]">
            👤 {request.name}
          </span>
          <span className="rounded bg-[#C9A961]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A961]">
            {request.category}
          </span>
        </div>
        <p className="mb-4 text-xs leading-relaxed italic text-stone-300 sm:text-sm">"{request.content}"</p>
      </div>
      <div className="flex items-center justify-between border-t border-stone-800/60 pt-3">
        <button
          onClick={handlePray}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            prayed ? 'bg-[#C9A961] text-[#1A1830]' : 'bg-[#1A1830] text-stone-400 hover:bg-stone-800'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${prayed ? 'fill-[#1A1830]' : ''}`} />
          <span>{prayed ? 'Prayed' : 'Pray'}</span>
        </button>
        <span className="font-mono text-[11px] text-stone-500">{localCount} prayers</span>
      </div>
    </div>
  );
}

function StoryCard({ testimony, onAmen }) {
  const [amen, setAmen] = useState(false);
  const [amenCount, setAmenCount] = useState(testimony.praises || 0);

  const handleAmen = () => {
    if (!amen) {
      setAmenCount((p) => p + 1);
      setAmen(true);
      onAmen();
    } else {
      setAmenCount((p) => p - 1);
      setAmen(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-gradient-to-br from-[#1F1D36] to-[#1A1830] p-5 shadow-lg transition-all duration-300 hover:border-[#C9A961]/30">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-[#C9A961]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#C9A961]">
            Breakthrough
          </span>
          <span className="font-mono text-[10px] text-stone-500">
            {new Date(testimony.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h4 className="mb-1 font-serif text-sm font-bold text-stone-100 sm:text-base">{testimony.title}</h4>
        <p className="mb-4 text-xs leading-relaxed italic text-stone-300 sm:text-sm">"{testimony.content}"</p>
      </div>
      <div className="flex items-center justify-between border-t border-stone-800/60 pt-3">
        <span className="text-xs font-bold text-stone-400">— {testimony.author}</span>
        <button
          onClick={handleAmen}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
            amen ? 'bg-[#C9A961]/20 text-[#C9A961]' : 'text-[#C9A961] hover:bg-[#1F1D36]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Amen ({amenCount})</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [devotion, setDevotion] = useState(MOCK_DEVOTION);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [reqs, tests, devs] = await Promise.all([
          base44SafeClient.entities.PrayerRequest.filter(),
          base44SafeClient.entities.Testimony.list(),
          base44SafeClient.entities.Devotion.list(),
        ]);
        setRequests(reqs);
        setTestimonies(tests);
        setDevotion(devs[0] || MOCK_DEVOTION);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(() => setToasts((prev) => prev.slice(1)), 2200);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const addToast = (message) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message }]);
  };

  const handlePray = () => addToast('Prayer registered and lifted up.');
  const handleAmen = () => addToast('Amen received with gratitude.');

  const tabs = useMemo(
    () => [
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'prayer', label: 'Prayer Wall', icon: Heart },
      { id: 'devotion', label: 'Devotion', icon: BookOpen },
      { id: 'stories', label: 'Stories', icon: Sparkles },
      { id: 'donate', label: 'Donate', icon: Gift },
    ],
    []
  );

  const handlePlayAudio = async () => {
    try {
      const response = await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = window.URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      addToast('Audio preview unavailable right now.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111020] text-stone-100 flex flex-col font-sans">
      <header className="border-b border-stone-800/80 bg-[#111020]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A961] to-[#1F1D36] shadow-lg">
              <HeartHandshake className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-white">PrayerHubz</div>
              <div className="text-xs uppercase tracking-[0.25em] text-stone-400">A sanctuary for prayer</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-[#C9A961] text-[#1A1830]' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="rounded-full border border-stone-800 p-2 text-stone-300 md:hidden" onClick={() => setMobileMenuOpen((v) => !v)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-stone-800 bg-[#111020] px-4 py-3 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  activeTab === tab.id ? 'bg-[#C9A961]/15 text-[#C9A961]' : 'text-stone-300'
                }`}
              >
                <span>{tab.label}</span>
                <tab.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'home' && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-[2rem] border border-[#C9A961]/20 bg-gradient-to-br from-[#1F1D36] to-[#17162B] p-6 shadow-2xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Today’s Prayer Sanctuary</p>
                  <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">A peaceful place to seek God together</h1>
                </div>
                <button className="flex items-center gap-2 rounded-full border border-stone-800 bg-[#111020] px-4 py-2 text-sm text-stone-300 hover:border-[#C9A961]/40">
                  <Bell className="h-4 w-4" />
                  Stay updated
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[#C9A961]">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm font-semibold">Prayer Requests</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-400">Share your concern, and let the community surround you with prayer.</p>
                  <button className="mt-4 flex items-center gap-2 rounded-full bg-[#C9A961] px-4 py-2 text-sm font-semibold text-[#1A1830]" onClick={() => setActiveTab('prayer')}>
                    Visit prayer wall <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[#C9A961]">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-semibold">Daily Devotion</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-400">Take a moment to breathe, reflect, and rest in God’s word.</p>
                  <button className="mt-4 flex items-center gap-2 rounded-full border border-[#C9A961]/30 px-4 py-2 text-sm font-semibold text-[#C9A961]" onClick={() => setActiveTab('devotion')}>
                    Read devotion <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-stone-800 bg-[#1A1830]/90 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Community Care</p>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-white">Prayer is stronger together</h2>
                </div>
                <div className="rounded-full border border-[#C9A961]/20 bg-[#C9A961]/10 p-2">
                  <Smile className="h-5 w-5 text-[#C9A961]" />
                </div>
              </div>
              <div className="space-y-3 text-sm text-stone-300">
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    Trusted and encouraging
                  </div>
                  <p className="text-stone-400">Every request is met with care, compassion, and community support.</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <Info className="h-4 w-4 text-sky-400" />
                    Gentle reminders
                  </div>
                  <p className="text-stone-400">Get helpful prompts and daily encouragement while you pray.</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'prayer' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-[2rem] border border-stone-800 bg-[#1F1D36]/80 p-6 shadow-2xl sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Prayer Wall</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-white">Lift each other up in prayer</h2>
              </div>
              <button className="rounded-full bg-[#C9A961] px-5 py-2.5 text-sm font-semibold text-[#1A1830]" onClick={() => addToast('Prayer request submitted.')}>Share a request</button>
            </div>
            {loading ? (
              <div className="rounded-2xl border border-stone-800 bg-[#1A1830]/70 p-8 text-center text-stone-400">Loading prayers…</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {requests.map((request) => (
                  <PrayerCard key={request.id} request={request} onPray={handlePray} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'devotion' && (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_0.8fr]">
            <section className="rounded-[2rem] border border-[#C9A961]/20 bg-gradient-to-br from-[#1F1D36] to-[#17162B] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Today’s devotion</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-white">{devotion.title}</h2>
                </div>
                <button className="rounded-full border border-stone-800 p-2 text-stone-300 hover:border-[#C9A961]/40" onClick={handlePlayAudio}>
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 text-stone-300">
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Scripture</p>
                  <p className="mt-2 font-serif text-lg text-white">{devotion.scripture}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">{devotion.scripture_text}</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                  <p className="text-sm leading-relaxed text-stone-300">{devotion.content}</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                  <p className="text-sm font-semibold text-[#C9A961]">Reflection</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-300">{devotion.reflection}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-500">
                  <span>{devotion.author}</span>
                  <span>{devotion.read_time}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-800 bg-[#1A1830]/90 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Audio</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-white">Listen and reflect</h3>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-stone-800 p-2 text-stone-300 hover:border-[#C9A961]/40">
                    <Pause className="h-4 w-4" />
                  </button>
                  <button className="rounded-full border border-stone-800 p-2 text-stone-300 hover:border-[#C9A961]/40">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-[#111020]/70 p-4">
                <audio ref={audioRef} className="w-full" controls />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
                <Book className="h-4 w-4 text-[#C9A961]" />
                <span>Prayerful listening for stillness and peace.</span>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-stone-800 bg-[#1F1D36]/80 p-6 shadow-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A961]">Testimonies</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-white">God is still moving</h2>
                </div>
                <button className="rounded-full bg-[#C9A961] px-5 py-2.5 text-sm font-semibold text-[#1A1830]" onClick={() => addToast('Testimony shared.')}>Share a story</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonies.map((testimony) => (
                <StoryCard key={testimony.id} testimony={testimony} onAmen={handleAmen} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'donate' && (
          <div className="mx-auto max-w-2xl space-y-8 py-8 animate-fade-in">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A961]/30 bg-gradient-to-br from-[#C9A961] to-[#1F1D36] shadow-lg">
                <HeartHandshake className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">Support Our Ministry</h2>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-stone-400">
                Your generous contributions help us keep the PrayerHub sanctuary online and ad-free.
              </p>
            </div>

            <div className="space-y-6 rounded-3xl border border-[#C9A961]/30 bg-[#1F1D36] p-8 text-center shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C9A961]">Secure Donation</h3>
              <a
                href="https://www.paypal.com/donate/?hosted_button_id=96DDM8URMSCEJ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-[#FFC439] px-12 py-4 text-sm font-bold text-[#2C2E2F] shadow-lg transition-all hover:bg-[#E0AC32] hover:shadow-xl active:scale-95"
              >
                Donate with PayPal
              </a>
              <div className="flex items-center justify-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure Redirect to PayPal
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-800 bg-[#111020]/90 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>PrayerHubz © 2026 • Built for prayer, peace, and community.</div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:text-[#C9A961]" onClick={() => addToast('Sharing upcoming.')}> <Share2 className="h-4 w-4" /> Share </button>
            <button className="flex items-center gap-2 hover:text-[#C9A961]" onClick={() => addToast('Thanks for staying connected.')}> <Gift className="h-4 w-4" /> Support </button>
          </div>
        </div>
      </footer>

      <div className="fixed right-4 top-20 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-full border border-[#C9A961]/20 bg-[#1F1D36] px-4 py-2 text-sm text-stone-200 shadow-lg">
            {toast.message}
          </div>
        ))}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

function HomeIcon(props) {
  return <BookOpen {...props} />;
}
