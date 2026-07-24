import React from 'react';
import { Sparkles, ArrowRight, Heart, Smile, Volume2 } from 'lucide-react';

export default function HomePage({ devotion, requests, testimonies, setActiveTab, speakText }) {
  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden bg-[#1A1830] rounded-3xl border border-stone-800 p-8 md:p-16 text-center shadow-2xl flex flex-col items-center justify-center gap-12 min-h-[60vh]">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-[#C9A961] blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#C9A961] blur-3xl"></div>
        </div>

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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C9A961] hover:bg-[#B89850] text-[#1A1830] font-bold text-sm transition-all active:scale-95 shadow"
            >
              <Heart className="w-4 h-4 fill-[#1A1830]" />
              <span>Share a Prayer Request</span>
            </button>
            <button
              onClick={() => setActiveTab('companion')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-stone-600 text-white hover:bg-stone-800 font-bold text-sm transition-all active:scale-95"
            >
              <Smile className="w-4 h-4 text-[#C9A961]" />
              <span>Get Comfort Companion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <span className="text-xs font-bold text-[#C9A961] tracking-wider uppercase">Today's Devotion</span>
              <button onClick={() => setActiveTab('devotion')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                Read <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <h3 className="font-serif font-bold text-lg text-white leading-snug">{devotion?.title}</h3>
            <p className="text-stone-300 text-xs italic line-clamp-3 leading-relaxed">"{devotion?.scripture_text}"</p>
          </div>
          <button
            onClick={() => speakText?.(devotion?.scripture_text || '')}
            className="mt-6 flex items-center gap-2 text-xs font-bold text-[#C9A961] border border-[#C9A961]/20 bg-[#C9A961]/5 justify-center py-2 rounded-xl hover:bg-[#C9A961]/10 transition"
          >
            <Volume2 className="w-4 h-4" /> Listen Audio
          </button>
        </div>

        <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <span className="text-xs font-bold text-stone-400 tracking-wider uppercase">Burdens Board</span>
              <button onClick={() => setActiveTab('prayer')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                View Board <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {(requests || []).slice(0, 2).map(req => (
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

        <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Praise reports</span>
              <button onClick={() => setActiveTab('stories')} className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {(testimonies || []).slice(0, 1).map(test => (
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
  );
}
