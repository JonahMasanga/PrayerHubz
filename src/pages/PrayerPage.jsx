import React from 'react';
import { Plus } from 'lucide-react';

export default function PrayerPage({ requests, setShowRequestForm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-white">Prayer Requests</h2>
        <button
          onClick={() => setShowRequestForm?.(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A961] text-[#1A1830] rounded-xl font-bold text-xs"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(requests || []).map((request) => (
          <div key={request.id} className="bg-[#1F1D36]/80 p-5 rounded-2xl border border-stone-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#FAF8F3] bg-[#1A1830] px-3 py-1 rounded-full border border-stone-800">👤 {request.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A961] bg-[#C9A961]/10 px-2.5 py-0.5 rounded">{request.category}</span>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed italic mb-4">"{request.content}"</p>
            <span className="text-[11px] font-mono text-stone-500">{request.prayer_count || 0} prayers</span>
          </div>
        ))}
      </div>
    </div>
  );
}
