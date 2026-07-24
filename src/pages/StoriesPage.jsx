import React from 'react';
import { Plus } from 'lucide-react';

export default function StoriesPage({ testimonies, setShowStoryForm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-white">Testimonies</h2>
        <button
          onClick={() => setShowStoryForm?.(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A961] text-[#1A1830] rounded-xl font-bold text-xs"
        >
          <Plus className="w-4 h-4" /> Share Testimony
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(testimonies || []).map((testimony) => (
          <div key={testimony.id} className="bg-gradient-to-br from-[#1F1D36] to-[#1A1830] p-5 rounded-2xl border border-stone-800 shadow-lg">
            <span className="text-[9px] tracking-widest font-bold uppercase text-[#C9A961] bg-[#C9A961]/10 px-2.5 py-0.5 rounded">Breakthrough</span>
            <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100 mt-3 mb-1">{testimony.title}</h4>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 italic">"{testimony.content}"</p>
            <div className="flex items-center justify-between pt-3 border-t border-stone-800/60">
              <span className="text-xs font-bold text-stone-400">— {testimony.author}</span>
              <span className="text-xs text-[#C9A961]">Amen ({testimony.praises || 0})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
