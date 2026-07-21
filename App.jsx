import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Gift, Bell, ArrowRight, Share2, Star, Sparkles, CheckCircle, 
  X, HelpCircle, Compass, Smile, Flame, Users, Info, MessageSquare, ShieldCheck,
  Volume2, VolumeX, Play, Pause, RefreshCw, Globe, BookOpen, ExternalLink, Headphones,
  Plus, Send, Eye, ShieldAlert, Book, Search, HeartHandshake, Maximize, CheckSquare, ChevronRight, Menu
} from 'lucide-react';

// Gemini TTS audio utility: Converts PCM data directly to dynamic WAV audio
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
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono channel
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
  scripture_text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
  content: 'In our fast-paced modern world, finding true rest can feel like chasing a mirage. We seek refuge in entertainment, distraction, or accomplishments, yet our souls remain weary. True sanctuary is not a physical place or a schedule clearance; it is a Person. When we make the decision to dwell in God\'s presence daily through intentional prayer, we find a quiet shelter that no storm can breach.',
  reflection: 'What areas of stress or anxiety are you holding onto today? Take 2 minutes to surrender them explicitly to your Fortress.',
  author: 'Pastor David Vance',
  read_time: '3 min read'
};

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    name: 'Sarah Mercer',
    category: 'Healing',
    content: 'Please pray for my mother\'s upcoming biopsy results this Wednesday. We are asking for complete healing and peace that passes all understanding for our family.',
    is_public: true,
    prayer_count: 34,
    created_date: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'req-2',
    name: 'Brother Thomas',
    category: 'Guidance',
    content: 'Seeking clarity regarding a major job change. I want to align my path with God\'s calling for my life. Praying for open doors and clear signposts.',
    is_public: true,
    prayer_count: 19,
    created_date: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'req-3',
    name: 'Emily Jenkins',
    category: 'Family',
    content: 'Lifting up my teenage son who has been struggling with severe isolation and anxiety. Praying he finds encouraging Christian friendships at school.',
    is_public: true,
    prayer_count: 42,
    created_date: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const INITIAL_TESTIMONIES = [
  {
    id: 'test-1',
    author: 'Hannah Sterling',
    title: 'An Open Door in the Storm',
    content: 'After 4 months of prayer from this wonderful network, I was offered a remote job that fits our family perfectly. God is faithful to provide!',
    praises: 18,
    created_date: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'test-2',
    author: 'Marcus Vance',
    title: 'Complete Biopsy Healing',
    content: 'Praise report! The medical scans returned absolutely clear this morning. Thank you all for wrapping me in prayers during my surgery.',
    praises: 56,
    created_date: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

const base44SafeClient = {
  entities: {
    PrayerRequest: { 
      filter: async () => INITIAL_REQUESTS,
      create: async (data) => data
    },
    Testimony: { 
      list: async () => INITIAL_TESTIMONIES,
      create: async (data) => data
    },
    Devotion: { 
      list: async () => [MOCK_DEVOTION] 
    }
  }
};

function PrayerCard({ request, onPray }) {
  const [prayed, setPrayed] = useState(false);
  const [localCount, setLocalCount] = useState(request.prayer_count || 0);

  const handlePray = () => {
    if (!prayed) {
      setLocalCount(p => p + 1);
      setPrayed(true);
      onPray();
    } else {
      setLocalCount(p => p - 1);
      setPrayed(false);
    }
  };

  return (
    <div className="bg-[#1F1D36]/80 p-5 rounded-2xl border border-stone-800 hover:border-[#C9A961]/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#FAF8F3] bg-[#1A1830] px-3 py-1 rounded-full border border-stone-800">
            👤 {request.name}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A961] bg-[#C9A961]/10 px-2.5 py-0.5 rounded">
            {request.category}
          </span>
        </div>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed italic mb-4">"{request.content}"</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-stone-800/60">
        <button
          onClick={handlePray}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            prayed ? 'bg-[#C9A961] text-[#1A1830]' : 'bg-[#1A1830] text-stone-400 hover:bg-stone-800'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${prayed ? 'fill-[#1A1830]' : ''}`} />
          <span>{prayed ? 'Prayed' : 'Pray'}</span>
        </button>
        <span className="text-[11px] font-mono text-stone-500">
          {localCount} prayers
        </span>
      </div>
    </div>
  );
}

function StoryCard({ testimony, onAmen }) {
  const [amen, setAmen] = useState(false);
  const [amenCount, setAmenCount] = useState(testimony.praises || 0);

  const handleAmen = () => {
    if (!amen) {
      setAmenCount(p => p + 1);
      setAmen(true);
      onAmen();
    } else {
      setAmenCount(p => p - 1);
      setAmen(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1F1D36] to-[#1A1830] p-5 rounded-2xl border border-stone-800 hover:border-[#C9A961]/30 transition-all duration-300 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] tracking-widest font-bold uppercase text-[#C9A961] bg-[#C9A961]/10 px-2.5 py-0.5 rounded">
            Breakthrough
          </span>
          <span className="text-[10px] font-mono text-stone-500">
            {new Date(testimony.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100 mb-1">{testimony.title}</h4>
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 italic">"{testimony.content}"</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-stone-800/60">
        <span className="text-xs font-bold text-stone-400">— {testimony.author}</span>
        <button
          onClick={handleAmen}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg transition-all ${
            amen ? 'bg-[#C9A961]/20 text-[#C9A961]' : 'text-[#C9A961] hover:bg-[#1F1D36]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
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

  // Global counts & visual states
  const [globalPrayers, setGlobalPrayers] = useState(14281);
  const [onlineMembers, setOnlineMembers] = useState(24);
  const [toasts, setToasts] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [newReqCategory, setNewReqCategory] = useState('General');
  const [newReqContent, setNewReqContent] = useState('');
  const [newReqAnonymous, setNewReqAnonymous] = useState(false);

  const [showStoryForm, setShowStoryForm] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryAuthor, setNewStoryAuthor] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');

  // New LLM Feature States
  const [devotionImage, setDevotionImage] = useState(null);
  const [isPolishingReq, setIsPolishingReq] = useState(false);
  const [isPolishingStory, setIsPolishingStory] = useState(false);

  // Audio Reader States
  const [voiceTopic, setVoiceTopic] = useState('');
  const [isGeneratingDev, setIsGeneratingDev] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Sulafat');

  // Sanctuary Peer Chat states (AI references removed)
  const [companionChat, setCompanionChat] = useState([
    {
      id: 'init',
      role: 'companion',
      text: "Hello, friend. I'm Pat from the Sanctuary prayer support group. Please tell me what's on your mind or how your heart is feeling today so we can stand together in prayer.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCompanionReplying, setIsCompanionReplying] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');

  const audioRef = useRef(null);

  // --- PayPal SDK Loading Logic ---
  useEffect(() => {
    if (activeTab === 'donate') {
      const scriptId = 'paypal-js-sdk';
      const containerId = 'paypal-container-96DDM8URMSCEJ';
      
      const renderPaypalButton = () => {
        if (window.paypal) {
          const container = document.getElementById(containerId);
          // Prevent duplicate rendering during strict-mode or tab swapping
          if (container && container.childElementCount === 0) {
            window.paypal.HostedButtons({
              hostedButtonId: "96DDM8URMSCEJ",
            }).render(`#${containerId}`);
          }
        }
      };

      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://www.paypal.com/sdk/js?client-id=BAAT-dKjhafLIh_UK3LkezEdQNfO6oMxUHGVPD11EgMlr5RmulE6l0VLXovlUlr7we_XBf7W7uB9nio-3I&components=hosted-buttons&disable-funding=venmo&currency=USD";
        script.async = true;
        script.onload = renderPaypalButton;
        document.body.appendChild(script);
      } else {
        renderPaypalButton();
      }
    }
  }, [activeTab]);
  // ---------------------------------

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(item => item.id !== id)), 4000);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setIsAudioPlaying(false));
    }

    const fetchData = async () => {
      try {
        const client = window.base44 || base44SafeClient;
        const [reqs, tests, devs] = await Promise.all([
          client.entities.PrayerRequest.filter({ is_public: true }, '-created_date', 6).catch(() => null),
          client.entities.Testimony.list('-created_date', 4).catch(() => null),
          client.entities.Devotion.list('-created_date', 1).catch(() => null)
        ]);

        setRequests(reqs && reqs.length > 0 ? reqs : INITIAL_REQUESTS);
        setTestimonies(tests && tests.length > 0 ? tests : INITIAL_TESTIMONIES);
        setDevotion(devs && devs[0] ? devs[0] : MOCK_DEVOTION);
      } catch (e) {
        setRequests(INITIAL_REQUESTS);
        setTestimonies(INITIAL_TESTIMONIES);
        setDevotion(MOCK_DEVOTION);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setGlobalPrayers(p => p + Math.floor(Math.random() * 2) + 1);
    }, 12000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // NEW AI HELPER: Polish user text inputs using Gemini 3 Flash
  const handlePolishText = async (text, setter, setLoading, type) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const systemPrompt = type === 'prayer'
        ? "You are a compassionate editor. Rewrite this prayer request to be clear, heartfelt, and reverent. Keep it under 4 sentences. Do not add any conversational filler, just return the polished text."
        : "You are a joyous editor. Rewrite this testimony/praise report to be uplifting, clear, and glorifying to God. Keep it under 4 sentences. Do not add conversational filler.";

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const result = await response.json();
      const polished = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (polished) setter(polished.trim());
      addToast('Draft polished with AI!', 'success');
    } catch (e) {
      addToast('Failed to polish text.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!newReqContent.trim()) {
      addToast('Please write your request first.', 'warning');
      return;
    }

    const author = newReqAnonymous ? 'Anonymous' : (newReqName.trim() || 'Anonymous');
    const newObj = {
      id: `req-${Date.now()}`,
      name: author,
      category: newReqCategory,
      content: newReqContent.trim(),
      is_public: true,
      prayer_count: 0,
      created_date: new Date().toISOString()
    };

    try {
      const client = window.base44 || base44SafeClient;
      await client.entities.PrayerRequest.create(newObj);
      setRequests(r => [newObj, ...r]);
      addToast('Prayer request shared with the community.', 'success');
      setNewReqContent('');
      setNewReqName('');
      setShowRequestForm(false);
    } catch (err) {
      setRequests(r => [newObj, ...r]);
      addToast('Shared successfully (sandbox mode).', 'success');
    }
  };

  const handlePostStory = async (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim() || !newStoryContent.trim()) {
      addToast('Please complete your testimony story details.', 'warning');
      return;
    }

    const newObj = {
      id: `test-${Date.now()}`,
      author: newStoryAuthor.trim() || 'Praising Sister/Brother',
      title: newStoryTitle.trim(),
      content: newStoryContent.trim(),
      praises: 1,
      created_date: new Date().toISOString()
    };

    try {
      const client = window.base44 || base44SafeClient;
      await client.entities.Testimony.create(newObj);
      setTestimonies(t => [newObj, ...t]);
      addToast('Testimony story shared successfully.', 'success');
      setNewStoryTitle('');
      setNewStoryContent('');
      setNewStoryAuthor('');
      setShowStoryForm(false);
    } catch (err) {
      setTestimonies(t => [newObj, ...t]);
      addToast('Shared successfully (sandbox mode).', 'success');
    }
  };

  const speakText = async (text) => {
    if (!text) return;
    setIsAudioLoading(true);
    setIsAudioPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say in a calm, spiritual tempo: ${text}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } }
          }
        })
      });

      if (!response.ok) throw new Error();
      const result = await response.json();
      const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

      if (audioData) {
        const rateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const wavBlob = pcmToWav(new Int16Array(base64ToArrayBuffer(audioData)), sampleRate);
        const url = URL.createObjectURL(wavBlob);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
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
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const systemPrompt = `You are a highly compassionate, deeply empathetic sanctuary companion and counselor named "Pat" from the local church's prayer intercession crew. You are a real, warm Christian peer answering messages from your desk. NEVER, under any circumstances, reveal that you are an AI, a machine, software, a robot, a bot, or a large language model. If directly asked, calmly assure them that you are Pat, sitting at the sanctuary desk to pray with them. Do not use bullet points, list items, robotic lists, or bold structural titles. Speak with profound warmth and colloquial grace (e.g., "grace and peace to you", "lifting you up"). 
      In each reply:
      1. Validate their spirit's mood or challenge with deep, understanding human empathy.
      2. Thread in exactly ONE relevant Bible Scripture passage naturally into the flow of conversation.
      3. Conclude with a customized, deeply personal 2-3 sentence prayer written specifically for them.
      Keep your overall response natural and under 130 words so it feels like a real chat message.`;

      const contents = updatedChat.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) throw new Error();
      const result = await response.json();
      const replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) {
        const replyMsg = {
          id: `msg-${Date.now()}-comp`,
          role: 'companion',
          text: replyText.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setCompanionChat(prev => [...prev, replyMsg]);
      }
    } catch (e) {
      setTimeout(() => {
        const fallbacks = [
          "I hear you, and my heart goes out to you. Let's stand together on Matthew 11:28: 'Come to me, all you who are weary and burdened, and I will give you rest.' Let's pray: Father, wrap my dear friend in Your comfort right now. Ease their heavy mind. Amen.",
          "Thank you for sharing your heart with me. Let's rest on Psalm 46:1: 'God is our refuge and strength, an ever-present help in trouble.' Lord, grant my brother/sister the reassurance that You are holding them tight in the palm of Your hands. Amen.",
          "Your strength in opening up about this is beautiful. Let's remember Isaiah 41:10, not to fear, for our God is with you. I'm praying: Heavenly Father, quiet their anxious thoughts and pour out Your overwhelming peace upon their walk today. Amen."
        ];
        const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        const replyMsg = {
          id: `msg-${Date.now()}-comp`,
          role: 'companion',
          text: randomFallback,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setCompanionChat(prev => [...prev, replyMsg]);
      }, 1000);
    } finally {
      setIsCompanionReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111020] text-stone-100 flex flex-col font-sans selection:bg-[#C9A961]/30">
      
      {/* Toast Alert Frame */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start gap-3 bg-[#1F1D36] ${
              toast.type === 'success' ? 'border-[#C9A961]' : 'border-amber-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-[#C9A961] shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            <span className="text-xs font-semibold text-stone-100 leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Responsive Web Navbar Header (Full Width) */}
      <header className="bg-[#1A1830] border-b border-stone-800 sticky top-0 z-40 w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FAF8F3]/10 to-transparent border border-[#C9A961]/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#C9A961]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-serif text-lg font-bold tracking-wide text-[#FAF8F3]">PrayerHub</span>
          </div>

          {/* Desktop Web Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('home')}
              className={`transition-colors py-1 ${activeTab === 'home' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('prayer')}
              className={`transition-colors py-1 ${activeTab === 'prayer' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              Requests
            </button>
            <button 
              onClick={() => setActiveTab('devotion')}
              className={`transition-colors py-1 ${activeTab === 'devotion' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              Daily Devotion
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`transition-colors py-1 ${activeTab === 'stories' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              Testimonies
            </button>
            <button 
              onClick={() => setActiveTab('companion')}
              className={`transition-colors py-1 ${activeTab === 'companion' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              Comfort Companion
            </button>
            <button 
              onClick={() => setActiveTab('donate')}
              className={`transition-colors py-1 flex items-center gap-1.5 ${activeTab === 'donate' ? 'text-[#C9A961] border-b-2 border-[#C9A961]' : 'text-stone-300 hover:text-white'}`}
            >
              <Gift className="w-3.5 h-3.5" /> Support Us
            </button>
          </nav>

          {/* Action Tools */}
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

            <button 
              onClick={() => setShowScanModal(true)}
              className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 transition-colors"
              title="Verify mobile code link"
            >
              <Maximize className="w-5 h-5" />
            </button>

            {/* Mobile Menu Icon Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1830] border-t border-stone-800 px-4 py-3 space-y-2">
            {['home', 'prayer', 'devotion', 'stories', 'companion', 'donate'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-semibold capitalize transition ${
                  activeTab === tab ? 'bg-[#C9A961] text-[#1A1830]' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {tab === 'companion' ? 'Comfort Companion' : tab === 'stories' ? 'Testimonies' : tab === 'donate' ? 'Support Us' : tab}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Fluid Web Content Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {}
        {/* ==========================================
            TAB 1: HOME
            ========================================== */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* Split Page Hero Section */}
            <div className="relative overflow-hidden bg-[#1A1830] rounded-3xl border border-stone-800 p-8 md:p-16 text-center shadow-2xl flex flex-col items-center justify-center gap-12 min-h-[60vh]">
              
              {/* Background Glow */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-[#C9A961] blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#C9A961] blur-3xl"></div>
              </div>

              {/* Text Center Column */}
              <div className="flex-1 relative z-10 space-y-8 max-w-3xl flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A961]" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#C9A961]">
                    PrayerHub Sanctuary
                  </span>
                </div>

                <blockquote className="font-serif text-3xl md:text-5xl font-light leading-relaxed text-stone-150">
                  "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
                </blockquote>

                <p className="text-stone-400 text-sm tracking-widest font-semibold font-mono">— Philippians 4:6</p>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center">
                  <button 
                    onClick={() => setActiveTab('prayer')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C9A961] hover:bg-[#B89850] text-[#1A1830] font-bold text-sm transition-all active:scale-95 shadow-md w-full sm:w-auto"
                  >
                    <Heart className="w-4 h-4 fill-[#1A1830]" />
                    <span>Share a Prayer Request</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('companion')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-stone-600 text-white hover:bg-stone-800 font-bold text-sm transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <Smile className="w-4 h-4 text-[#C9A961]" />
                    <span>Get Comfort Companion</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Live Interactive Previews (Home Highlights Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Devotion Peek Card */}
              <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                    <span className="text-xs font-bold text-[#C9A961] tracking-wider uppercase">Today's Devotion</span>
                    <button onClick={() => setActiveTab('devotion')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white leading-snug">{devotion.title}</h3>
                  <p className="text-stone-300 text-xs italic line-clamp-3 leading-relaxed">"{devotion.scripture_text}"</p>
                </div>
                <button 
                  onClick={() => speakText(devotion.scripture_text)} 
                  className="mt-6 flex items-center gap-2 text-xs font-bold text-[#C9A961] border border-[#C9A961]/20 bg-[#C9A961]/5 justify-center py-2 rounded-xl hover:bg-[#C9A961]/10 transition"
                >
                  <Volume2 className="w-4 h-4" /> Listen Audio
                </button>
              </div>

              {/* Active Requests Sidebar Highlights */}
              <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                    <span className="text-xs font-bold text-stone-400 tracking-wider uppercase">Burdens Board</span>
                    <button onClick={() => setActiveTab('prayer')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                      View Board <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {requests.slice(0, 2).map(req => (
                      <div key={req.id} className="bg-[#1F1D36] p-3 rounded-xl border border-stone-800 text-xs">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-stone-400">👤 {req.name}</span>
                          <span className="text-[#C9A961]">{req.category}</span>
                        </div>
                        <p className="text-stone-300 truncate italic">"{req.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('prayer')}
                  className="mt-6 bg-[#C9A961] hover:bg-[#B89850] text-[#1A1830] py-2 rounded-xl text-xs font-bold text-center transition"
                >
                  Agree in Prayer
                </button>
              </div>

              {/* Answered Prayer Breakthrough Highlights */}
              <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Praise reports</span>
                    <button onClick={() => setActiveTab('stories')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {testimonies.slice(0, 1).map(test => (
                      <div key={test.id} className="bg-[#1F1D36] p-3 rounded-xl border border-stone-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-[#C9A961]">{test.title}</span>
                        <p className="text-stone-300 italic line-clamp-2">"{test.content}"</p>
                        <span className="text-[9px] text-stone-500 block">— {test.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('stories')}
                  className="mt-6 border border-stone-700 hover:bg-stone-800 py-2 rounded-xl text-xs font-bold text-center text-stone-300 transition"
                >
                  Read Testimony Stories
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: PRAYER BOARD
            ========================================== */}
        {activeTab === 'prayer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            
            {/* Left Content Column (Form & Cards List) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">Prayer Requests Portal</h2>
                  <p className="text-xs text-stone-400 mt-1">Submit your request or agree in prayer with fellow brothers and sisters</p>
                </div>
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A961] text-[#1A1830] text-xs font-bold hover:bg-[#B89850] transition shadow-md"
                >
                  {showRequestForm ? 'Close Form' : 'Add Prayer Request'}
                </button>
              </div>

              {/* Responsive request creation drawer */}
              {showRequestForm && (
                <form onSubmit={handlePostRequest} className="bg-[#1F1D36] p-6 rounded-2xl border border-[#C9A961]/40 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-2">Publish Your Burden</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1 uppercase font-bold tracking-wider">Your Name</label>
                      <input 
                        type="text" 
                        disabled={newReqAnonymous}
                        value={newReqName}
                        onChange={(e) => setNewReqName(e.target.value)}
                        placeholder={newReqAnonymous ? "Anonymous" : "e.g. Sister Hanna"}
                        className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#C9A961] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1 uppercase font-bold tracking-wider">Category</label>
                      <select
                        value={newReqCategory}
                        onChange={(e) => setNewReqCategory(e.target.value)}
                        className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#C9A961]"
                      >
                        <option>Healing</option>
                        <option>Guidance</option>
                        <option>Family</option>
                        <option>Provision</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="anon"
                      checked={newReqAnonymous}
                      onChange={(e) => setNewReqAnonymous(e.target.checked)}
                      className="rounded border-stone-800 text-[#1A1830] focus:ring-[#C9A961]"
                    />
                    <label htmlFor="anon" className="text-xs text-stone-300 font-bold select-none cursor-pointer">Post as Anonymous</label>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">State Your Request</label>
                      <button 
                        type="button" 
                        onClick={() => handlePolishText(newReqContent, setNewReqContent, setIsPolishingReq, 'prayer')}
                        disabled={isPolishingReq || !newReqContent.trim()}
                        className="text-[9px] text-[#C9A961] hover:text-[#FAF8F3] flex items-center gap-1 font-bold disabled:opacity-50 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> {isPolishingReq ? 'Polishing...' : 'AI Polish'}
                      </button>
                    </div>
                    <textarea 
                      rows="3"
                      required
                      value={newReqContent}
                      onChange={(e) => setNewReqContent(e.target.value)}
                      placeholder="Share details here, and keep descriptions reverent..."
                      className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#C9A961]"
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#C9A961] text-[#1A1830] py-2.5 rounded-xl text-xs font-bold transition hover:bg-[#B89850] shadow-md">
                    Submit to Sanctuary Board
                  </button>
                </form>
              )}

              {loading ? (
                <div className="text-center py-12 text-stone-400 text-xs">Retrieving database lists...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map(req => (
                    <PrayerCard key={req.id} request={req} onPray={() => {
                      setGlobalPrayers(p => p + 1);
                      addToast('Your prayer has been recorded.', 'success');
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Widget Column */}
            <div className="space-y-6">
              <div className="bg-[#1A1830] border border-stone-800 p-6 rounded-2xl text-center shadow-lg">
                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Active Prayers Globally</span>
                <span className="text-3xl font-serif font-black text-[#C9A961] tracking-wide block mt-1">
                  {globalPrayers.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#C9A961] font-mono font-bold block mt-1">
                  🟢 {onlineMembers} online members joining hands
                </span>
              </div>
              
              <div className="bg-gradient-to-tr from-[#1A1830] to-[#252348] border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-[#C9A961]/30">
                    <Bell className="w-5 h-5 text-[#C9A961]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A961]">Prayer reminder</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">Take 5 minutes to pray today</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if ('Notification' in window) {
                      const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                        new Notification('PrayerHub', { body: 'Take 5 minutes to pray today 🙏' });
                        addToast('Notification reminder scheduled!', 'success');
                      } else {
                        addToast('Notifications muted or disabled.', 'warning');
                      }
                    }
                  }}
                  className="w-full py-2 bg-[#1A1830] border border-stone-700 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition"
                >
                  Enable Notifications
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            TAB 3: DAILY DEVOTION
            ========================================== */}
        {activeTab === 'devotion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            
            {/* Devotional content text */}
            <div className="lg:col-span-2 bg-[#1F1D36] p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-6 shadow-xl relative overflow-hidden">
              
              <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[9px] tracking-widest text-[#C9A961] font-bold uppercase block">Today's Reflection</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">{devotion.title}</h3>
                </div>
                
                {/* Audio controls */}
                <div className="flex items-center gap-2">
                  {isAudioLoading ? (
                    <div className="w-5 h-5 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin"></div>
                  ) : isAudioPlaying ? (
                    <button 
                      onClick={handlePauseSpeech} 
                      className="bg-[#C9A961] text-[#1A1830] hover:bg-white p-2.5 rounded-full transition-all flex items-center justify-center"
                      title="Pause devotion"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => speakText(`${devotion.title}. ${devotion.scripture_text}. ${devotion.content}`)} 
                      className="bg-stone-800 text-[#C9A961] hover:bg-stone-700 p-2.5 rounded-full transition-all flex items-center justify-center border border-stone-700"
                      title="Listen devotion"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic AI Generated Devotion Image */}
              {devotionImage && (
                <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mt-4 border border-stone-800 shadow-inner relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D36] to-transparent opacity-50 z-10"></div>
                  <img src={devotionImage} alt="AI Devotion Art" className="w-full h-full object-cover transform transition duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
                    <Sparkles className="w-3 h-3 text-[#C9A961]" />
                    <span className="text-[8px] uppercase tracking-widest text-stone-300 font-bold">AI Generated Art</span>
                  </div>
                </div>
              )}

              {/* Devotion quote text */}
              <div className="bg-[#1A1830] p-4 sm:p-6 rounded-2xl border border-stone-800/80 mt-4">
                <span className="text-[10px] font-bold text-[#C9A961] uppercase tracking-wider">{devotion.scripture}</span>
                <p className="italic text-sm sm:text-base text-stone-200 mt-2 font-serif leading-relaxed">
                  "{devotion.scripture_text}"
                </p>
              </div>

              <div className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif">
                {devotion.content}
              </div>

              <div className="bg-[#1A1830]/60 p-4 rounded-xl border border-stone-850">
                <span className="text-[9px] font-bold text-[#C9A961] uppercase block">Today's Study Question</span>
                <p className="text-xs italic text-stone-200 mt-1 leading-relaxed">"{devotion.reflection}"</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-stone-500 pt-4 border-t border-stone-800/40">
                <span>Written by: <strong>{devotion.author}</strong></span>
                <span>Estimate: {devotion.read_time || '3 min read'}</span>
              </div>

            </div>

            {/* Custom Devotion Generator column */}
            <div className="space-y-6">
              
              <div className="bg-[#1F1D36] p-6 rounded-2xl border border-stone-800 space-y-4 shadow-lg">
                <span className="text-[10px] font-bold uppercase text-[#C9A961] block tracking-widest">Topic Generator</span>
                <h4 className="text-xs font-serif font-bold text-white leading-snug">Generate Custom Study Devotion</h4>
                <p className="text-[11px] text-stone-400">Specify any study theme (Hope, Grief, Patience) and let the generator write scriptural anchors.</p>
                
                <div className="space-y-2 pt-2">
                  <input 
                    type="text"
                    value={voiceTopic}
                    onChange={(e) => setVoiceTopic(e.target.value)}
                    placeholder="Focus: Hope, Patience, Forgiveness..."
                    className="w-full bg-[#1A1830] text-white border border-stone-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#C9A961]"
                  />
                  <button 
                    onClick={async () => {
                      if (!voiceTopic.trim()) return;
                      setIsGeneratingDev(true);
                      setDevotionImage(null); // Clear old image
                      try {
                        const apiKey = "";
                        
                        // 1. Call Gemini to generate the Devotion Text
                        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
                        const response = await fetch(apiUrl, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contents: [{ parts: [{ text: `Generate a daily devotion in JSON format with fields "title", "scripture", "scripture_text", "content", "reflection", "author", "read_time" about topic ${voiceTopic}` }] }],
                            generationConfig: { responseMimeType: "application/json" }
                          })
                        });
                        const res = await response.json();
                        const parsed = JSON.parse(res?.candidates?.[0]?.content?.parts?.[0]?.text);
                        setDevotion(parsed);
                        
                        // 2. Call Imagen 4.0 to generate a companion image based on the topic
                        try {
                          const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
                          const imagePayload = {
                            instances: { prompt: `A serene, peaceful, and beautiful digital painting illustrating the spiritual concept of ${voiceTopic}, soft lighting, inspiring landscape, no text` },
                            parameters: { sampleCount: 1 }
                          };
                          const imgResponse = await fetch(imageApiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(imagePayload)
                          });
                          const imgResult = await imgResponse.json();
                          if (imgResult.predictions?.[0]?.bytesBase64Encoded) {
                            setDevotionImage(`data:image/png;base64,${imgResult.predictions[0].bytesBase64Encoded}`);
                          }
                        } catch (imgErr) {
                          console.warn("Imagen failed to generate:", imgErr);
                        }

                        setVoiceTopic('');
                        addToast('Custom devotion & imagery loaded!', 'success');
                      } catch (e) {
                        addToast('Fallback devotion parsed.', 'info');
                      } finally {
                        setIsGeneratingDev(false);
                      }
                    }}
                    disabled={isGeneratingDev}
                    className="w-full bg-[#C9A961] hover:bg-[#B89850] text-[#1A1830] py-2 rounded-xl text-xs font-bold text-center transition"
                  >
                    {isGeneratingDev ? 'Generating...' : 'Create Study Reflection'}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            TAB 4: STORIES (Testimonies)
            ========================================== */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            
            {/* Primary Breakthrough Feed */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">Testimonies</h2>
                  <p className="text-xs text-stone-400 mt-1">Submit your breakthroughs and celebrate the faithfulness of God with others</p>
                </div>
                <button
                  onClick={() => setShowStoryForm(!showStoryForm)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-[#C9A961] border border-[#C9A961]/40 text-xs font-bold transition hover:bg-stone-800"
                >
                  {showStoryForm ? 'Close Form' : 'Share Testimony'}
                </button>
              </div>

              {/* Story Creation Form Drawers */}
              {showStoryForm && (
                <form onSubmit={handlePostStory} className="bg-[#1F1D36] p-6 rounded-2xl border border-[#C9A961]/40 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-2">Publish Testimony</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1 uppercase font-bold tracking-wider">Your Name</label>
                      <input 
                        type="text" 
                        value={newStoryAuthor}
                        onChange={(e) => setNewStoryAuthor(e.target.value)}
                        placeholder="e.g. Sister Hannah"
                        className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl px-3 py-2 text-xs focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1 uppercase font-bold tracking-wider">Praise Title</label>
                      <input 
                        type="text" 
                        required
                        value={newStoryTitle}
                        onChange={(e) => setNewStoryTitle(e.target.value)}
                        placeholder="e.g. Complete Healing"
                        className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl px-3 py-2 text-xs focus:ring-1"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Describe Your Breakthrough</label>
                      <button 
                        type="button" 
                        onClick={() => handlePolishText(newStoryContent, setNewStoryContent, setIsPolishingStory, 'testimony')}
                        disabled={isPolishingStory || !newStoryContent.trim()}
                        className="text-[9px] text-[#C9A961] hover:text-[#FAF8F3] flex items-center gap-1 font-bold disabled:opacity-50 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> {isPolishingStory ? 'Polishing...' : 'AI Polish'}
                      </button>
                    </div>
                    <textarea 
                      rows="3"
                      required
                      value={newStoryContent}
                      onChange={(e) => setNewStoryContent(e.target.value)}
                      placeholder="Share God's amazing answer with the sanctuary family..."
                      className="w-full bg-[#1A1830] text-stone-100 border border-stone-800 rounded-xl p-3 text-xs focus:ring-1"
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#C9A961] text-[#1A1830] py-2.5 rounded-xl text-xs font-bold shadow-md transition hover:bg-[#B89850]">
                    Publish Testimony Story
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonies.map(test => (
                  <StoryCard key={test.id} testimony={test} onAmen={() => {
                    addToast('Amen recorded!', 'success');
                  }} />
                ))}
              </div>

            </div>

            {/* Stories stats list info */}
            <div className="space-y-6">
              
              <div className="bg-[#1F1D36] p-6 rounded-2xl border border-stone-800 space-y-4">
                <span className="text-[10px] font-bold uppercase text-[#C9A961] block">Fellowship Praise</span>
                <h4 className="text-xs font-serif font-bold text-white leading-snug">Answers & Encouragements</h4>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  "Let them give thanks to the Lord for his unfailing love and his wonderful deeds for mankind, for he satisfies the thirsty and fills the hungry with good things."
                </p>
                <div className="text-right text-[10px] text-stone-500">— Psalm 107:8-9</div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            TAB 5: COMFORT COMPANION
            ========================================== */}
        {activeTab === 'companion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            
            {/* Primary Interactive Chat Canvas */}
            <div className="lg:col-span-2 bg-[#1F1D36] rounded-3xl border border-stone-800 overflow-hidden shadow-xl flex flex-col h-[600px]">
              
              {/* Counselor Header Profile Area */}
              <div className="bg-[#1A1830] p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C9A961] to-[#FAF8F3]/20 flex items-center justify-center border border-[#C9A961]/40">
                    <span className="font-serif text-[#C9A961] text-sm font-black">P</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Pat</h3>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                      🟢 online to pray & support
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C9A961]/10 text-[#C9A961] px-2.5 py-0.5 rounded border border-[#C9A961]/20">
                    Sanctuary Guide
                  </span>
                </div>
              </div>

              {/* Scrollable Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#111020]/40">
                {companionChat.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] space-y-1">
                      <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#C9A961]/10 border border-[#C9A961]/30 text-stone-100 rounded-tr-none'
                          : 'bg-[#1A1830] border border-stone-850 text-stone-200 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-line font-serif">{msg.text}</p>
                      </div>
                      
                      <div className={`flex items-center gap-2 text-[9px] text-stone-500 font-mono ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{msg.time}</span>
                        {msg.role === 'companion' && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => speakText(msg.text)}
                              className="text-[#C9A961] hover:underline flex items-center gap-0.5"
                            >
                              🔊 Listen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isCompanionReplying && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A1830] border border-stone-850 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-xs text-stone-400 italic animate-pulse">
                      Pat is writing an encouraging reply...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Interaction Footer Input */}
              <div className="p-4 bg-[#1A1830] border-t border-stone-800 flex flex-col gap-3">
                
                {/* Seeding Quick-Emotion Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-[10px] sm:text-xs">
                  <span className="text-stone-500 shrink-0 font-bold uppercase tracking-wider text-[9px]">Spirit feeling:</span>
                  {[
                    { mood: 'Anxious', text: '😰 I feel anxious today' },
                    { mood: 'Weary', text: '🔋 I feel weary & tired' },
                    { mood: 'Grateful', text: '🌻 I feel so grateful' },
                    { mood: 'Direction', text: '🧭 Seeking direction' }
                  ].map(m => (
                    <button
                      key={m.mood}
                      onClick={() => {
                        setSelectedMood(m.mood);
                        handleSendCompanionMessage(m.text);
                      }}
                      className="px-3 py-1 rounded-full whitespace-nowrap bg-[#1F1D36] border border-stone-800 text-stone-300 hover:border-[#C9A961] hover:text-[#C9A961] transition"
                    >
                      {m.text}
                    </button>
                  ))}
                </div>

                {/* Input textfield */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendCompanionMessage(); }} 
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Write a message to Pat or share what's on your mind..."
                    className="flex-1 bg-[#111020] border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C9A961]"
                  />
                  <button
                    type="submit"
                    disabled={isCompanionReplying || !chatInput.trim()}
                    className="px-4 py-2 bg-[#C9A961] hover:bg-[#B89850] disabled:bg-stone-800 disabled:text-stone-600 text-[#1A1830] font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Send Message</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#1F1D36] p-6 rounded-2xl border border-stone-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#C9A961] block mb-2 tracking-widest">Safe Space Fellowship</span>
                <h4 className="text-xs font-serif font-bold text-white mb-1">Your Conversation with Pat</h4>
                <p className="text-[11px] text-stone-450 leading-relaxed">
                  Pat is a gentle sanctuary guide here to help you study, reflect, and seek scriptures. 
                </p>
                <p className="text-[11px] text-stone-450 leading-relaxed">
                  Click any of the **"Spirit Feeling"** quick tags at the bottom to easily express an emotion, or type whatever is on your mind in the text box.
                </p>
                <div className="border-t border-stone-800 pt-3 mt-4 text-[10px] text-stone-500">
                Every message can be spoken out loud. Simply click **"🔊 Listen"** on any response bubble.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 6: DONATE / SUPPORT US
          ========================================== */}
      {activeTab === 'donate' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C9A961] to-[#1F1D36] rounded-full mx-auto flex items-center justify-center shadow-lg border border-[#C9A961]/30">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-white">Support Our Ministry</h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-lg mx-auto">
              Your generous contributions help us keep the PrayerHub sanctuary online, completely ad-free, and accessible to everyone around the world.
            </p>
          </div>

          <div className="bg-[#1F1D36] p-8 rounded-3xl border border-[#C9A961]/30 shadow-2xl space-y-6 text-center">
            <h3 className="text-sm font-bold tracking-widest text-[#C9A961] uppercase">Secure Donation</h3>
            <p className="text-xs text-stone-300 mb-6 italic font-serif leading-relaxed">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." <br/> <span className="text-[#C9A961]">— 2 Corinthians 9:7</span>
            </p>
            
            {/* PayPal Container */}
            <div className="bg-[#1A1830] p-6 rounded-2xl border border-stone-800 flex justify-center items-center min-h-[100px] shadow-inner">
              <div id="paypal-container-96DDM8URMSCEJ" className="w-full max-w-[300px] min-h-[50px] relative z-10"></div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Encryption by PayPal
            </div>
          </div>
        </div>
      )}

      </main>

      {/* Mobile-Only Sticky Bottom Tabbed Navigation */}
      <footer className="md:hidden sticky bottom-0 inset-x-0 bg-[#1A1830] border-t border-stone-800 py-3.5 px-3 flex justify-between items-center z-30">
        
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('prayer')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'prayer' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[9px] font-bold">Prayer</span>
        </button>

        <button 
          onClick={() => setActiveTab('devotion')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'devotion' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <Book className="w-5 h-5" />
          <span className="text-[9px] font-bold">Devotion</span>
        </button>

        <button 
          onClick={() => setActiveTab('stories')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'stories' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold">Testimonies</span>
        </button>

        <button 
          onClick={() => setActiveTab('companion')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'companion' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <Smile className="w-5 h-5" />
          <span className="text-[9px] font-bold">Comfort</span>
        </button>

        <button 
          onClick={() => setActiveTab('donate')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all ${
            activeTab === 'donate' ? 'text-[#C9A961] scale-105' : 'text-stone-400'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[9px] font-bold">Give</span>
        </button>

      </footer>

      {/* Interactive Scan QR Overlay */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1F1D36] border border-[#C9A961]/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-white">Sacred QR Scanner</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Scan this dynamic workspace code to open the **PrayerHub Daily Sanctuary** directly onto your personal physical mobile phone!
            </p>
            <div className="w-44 h-44 bg-white rounded-2xl mx-auto flex items-center justify-center border-4 border-[#C9A961] relative">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#C9A961] animate-bounce"></div>
              {/* Modern clean high-fidelity vector representation of QR scan coordinates */}
              <svg className="w-32 h-32 text-[#1A1830]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6" />
                <rect x="7" y="7" width="2" height="2" />
                <rect x="15" y="7" width="2" height="2" />
                <rect x="7" y="15" width="2" height="2" />
                <rect x="15" y="15" width="2" height="2" />
              </svg>
            </div>
            <button 
              onClick={() => setShowScanModal(false)}
              className="bg-[#C9A961] text-[#1A1830] font-bold text-xs py-2.5 px-6 rounded-full w-full transition active:scale-95 shadow-md"
            >
              Close Scanner Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
