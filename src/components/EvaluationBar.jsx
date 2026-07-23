import React from 'react';

export const EvaluationBar = ({ score = 0, isFlipped = false }) => {
  // Score is in Pawns (e.g. +1.5 for White advantage, -2.0 for Black advantage)
  // Clamp percentage between 5% and 95%
  const clampedScore = Math.max(-10, Math.min(10, score));
  const whitePercentage = Math.round(((clampedScore + 10) / 20) * 100);

  const displayScore = score > 0 ? `+${score}` : `${score}`;

  return (
    <div className="flex flex-col items-center gap-1.5 h-full max-h-[560px]">
      <div className="w-5 h-full bg-slate-900 border-2 border-slate-800 rounded-lg overflow-hidden relative shadow-lg flex flex-col justify-between">
        
        {/* Fill Gauge */}
        <div
          className="w-full bg-slate-100 transition-all duration-300 ease-out"
          style={{ height: `${isFlipped ? 100 - whitePercentage : whitePercentage}%` }}
        />
        
        <div
          className="w-full bg-slate-950 transition-all duration-300 ease-out"
          style={{ height: `${isFlipped ? whitePercentage : 100 - whitePercentage}%` }}
        />

        {/* Score Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-[10px] font-extrabold text-indigo-400 bg-slate-950/90 px-1 py-0.5 rounded border border-indigo-500/40 shadow">
            {displayScore}
          </span>
        </div>

      </div>
    </div>
  );
};
