import React, { useRef, useEffect } from 'react';
import { History, Copy, Check } from 'lucide-react';

export const MoveLog = ({ history = [], pgn = '', themeMode = 'dark' }) => {
  const scrollRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Format move pairs (1. e4 e5, 2. Nf3 Nc6)
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || ''
    });
  }

  const copyPgn = () => {
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = themeMode === 'dark';
  const panelClasses = isDark
    ? 'w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-52 shadow-xl'
    : 'w-full bg-white/90 border border-slate-200 rounded-xl p-4 flex flex-col h-52 shadow-xl';
  const borderClass = isDark ? 'border-slate-800' : 'border-slate-200';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';
  const primaryText = isDark ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = isDark ? 'text-slate-300' : 'text-slate-700';
  const rowHover = isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100';

  return (
    <div className={panelClasses}>
      <div className={`flex items-center justify-between pb-2 border-b ${borderClass} mb-2`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${mutedText}`}>
          <History className="w-4 h-4 text-indigo-400" /> Move History
        </h3>
        {pgn && (
          <button
            onClick={copyPgn}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied PGN' : 'Copy PGN'}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-1 font-mono text-xs">
        {movePairs.length === 0 ? (
          <div className={`text-center text-xs py-8 italic ${mutedText}`}>
            No moves played yet
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.moveNum} className={`grid grid-cols-12 py-1 px-2 rounded transition-colors ${rowHover}`}>
              <span className={`col-span-3 font-bold ${mutedText}`}>{pair.moveNum}.</span>
              <span className={`col-span-4 font-semibold ${primaryText}`}>{pair.white}</span>
              <span className={`col-span-5 font-semibold ${secondaryText}`}>{pair.black}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
