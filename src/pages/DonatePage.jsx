import React from 'react';
import { Gift, ExternalLink } from 'lucide-react';

export default function DonatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="font-serif text-3xl text-white">Support PrayerHub</h2>
      <div className="bg-[#1A1830] border border-stone-800 rounded-2xl p-6 space-y-4">
        <p className="text-stone-300 leading-relaxed">
          Your generous support helps us maintain PrayerHub, encourage believers, and keep this sanctuary available to people in need of prayer and hope.
        </p>

        <div className="rounded-xl bg-[#1F1D36] border border-stone-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[#C9A961]" />
            <p className="font-semibold text-stone-100 text-sm">Donate securely via PayPal</p>
          </div>
          <p className="text-xs text-stone-400">If the button does not load, refresh this page and try again.</p>
        </div>

        <div id="paypal-container-96DDM8URMSCEJ" className="min-h-[56px]" />

        <a
          href="https://www.paypal.com/donate"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C9A961] hover:underline"
        >
          Open PayPal in a new tab <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
