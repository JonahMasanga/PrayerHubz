import React from 'react';
import { Send } from 'lucide-react';

export default function CompanionPage({ companionChat, chatInput, setChatInput, handleSendCompanionMessage, isCompanionReplying }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="font-serif text-2xl text-white">Comfort Companion</h2>

      <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-4 h-[420px] overflow-y-auto space-y-3">
        {(companionChat || []).map(msg => (
          <div key={msg.id} className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#C9A961]/15 ml-8' : 'bg-[#1F1D36] mr-8'}`}>
            <p className="text-stone-200">{msg.text}</p>
            <span className="text-[10px] text-stone-500 mt-1 block">{msg.time}</span>
          </div>
        ))}
        {isCompanionReplying && <p className="text-xs text-stone-500">Companion is typing...</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendCompanionMessage?.();
        }}
        className="flex gap-2"
      >
        <input
          value={chatInput || ''}
          onChange={(e) => setChatInput?.(e.target.value)}
          placeholder="Share what is on your heart..."
          className="flex-1 bg-[#1A1830] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none"
        />
        <button type="submit" className="px-4 py-3 rounded-xl bg-[#C9A961] text-[#1A1830] font-bold text-xs inline-flex items-center gap-2">
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
