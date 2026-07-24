import { Sparkles, BookOpen } from 'lucide-react';
import moment from 'moment';

export default function TestimonyCard({ testimony }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <span className="text-xs text-stone-400">
          {moment(testimony.created_date).format('MMM D, YYYY')}
        </span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-stone-800 mb-2 leading-snug">
        {testimony.title}
      </h3>
      <p className="text-sm text-stone-500 line-clamp-3 mb-3 leading-relaxed flex-1">
        {testimony.description}
      </p>
      {testimony.verse_reference && (
        <div className="flex items-center gap-1.5 text-xs text-[#C9A961] pt-2 border-t border-stone-50">
          <BookOpen className="w-3.5 h-3.5" />
          {testimony.verse_reference}
        </div>
      )}
    </div>
  );
}
