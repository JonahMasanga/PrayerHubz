import React from 'react';
import { Play, Pause } from 'lucide-react';

export default function DevotionPage({ devotion, speakText, handlePauseSpeech, isAudioLoading, isAudioPlaying }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="font-serif text-3xl text-white">Daily Devotion</h2>
      <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-2xl text-[#FAF8F3]">{devotion?.title}</h3>
        <p className="text-[#C9A961] font-semibold">{devotion?.scripture}</p>
        <p className="text-stone-300 italic">"{devotion?.scripture_text}"</p>
        <p className="text-stone-200 leading-relaxed">{devotion?.content}</p>
        <p className="text-stone-400 text-sm">{devotion?.reflection}</p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => speakText?.(devotion?.content || devotion?.scripture_text || '')}
            disabled={isAudioLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A961] text-[#1A1830] font-bold text-xs disabled:opacity-60"
          >
            <Play className="w-4 h-4" /> {isAudioLoading ? 'Loading...' : 'Play Audio'}
          </button>
          <button
            onClick={handlePauseSpeech}
            disabled={!isAudioPlaying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-600 text-stone-200 font-bold text-xs disabled:opacity-50"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        </div>
      </div>
    </div>
  );
}
