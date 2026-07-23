import React from 'react';
import { RotateCcw, RotateCw, Flag, Volume2, VolumeX, Cpu, Palette, Clock, Play, Pause, Timer } from 'lucide-react';

export const GameControls = ({
  gameMode, // 'vsAI' | 'online' | 'local'
  aiDifficulty,
  onChangeAiDifficulty,
  boardTheme,
  onChangeBoardTheme,
  whiteTime,
  blackTime,
  activeTurn,
  clockMinutes,
  onChangeClockMinutes,
  isTimerRunning,
  onToggleTimer,
  themeMode,
  onUndo,
  onFlipBoard,
  onNewGame,
  onResign,
  isMuted,
  onToggleMute
}) => {

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = themeMode === 'dark';
  const panelClasses = isDark
    ? 'w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl'
    : 'w-full bg-white/90 border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-xl';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';
  const mutedPanel = isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200';
  const accentText = isDark ? 'text-slate-300' : 'text-slate-700';
  const controlInput = isDark
    ? 'bg-slate-900 border border-slate-700 text-xs font-bold text-indigo-300 rounded-md px-2.5 py-1 focus:outline-none'
    : 'bg-white border border-slate-300 text-xs font-bold text-indigo-600 rounded-md px-2.5 py-1 focus:outline-none';

  return (
    <div className={panelClasses}>
      
      {/* Chess Clocks */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Black Player Clock */}
        <div className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
          activeTurn === 'b'
            ? (isDark
                ? 'bg-slate-950 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-100 border-cyan-500 shadow-[0_0_10px_rgba(56,189,248,0.18)]')
            : `${mutedPanel} opacity-70`
        }`}>
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${mutedText}`}>
            <Clock className="w-3.5 h-3.5" /> Black Clock
          </div>
          <span className={`font-mono text-2xl font-extrabold tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {formatTime(blackTime)}
          </span>
        </div>

        {/* White Player Clock */}
        <div className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
          activeTurn === 'w'
            ? (isDark
                ? 'bg-slate-950 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.18)]')
            : `${mutedPanel} opacity-70`
        }`}>
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${mutedText}`}>
            <Clock className="w-3.5 h-3.5" /> White Clock
          </div>
          <span className={`font-mono text-2xl font-extrabold tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {formatTime(whiteTime)}
          </span>
        </div>

      </div>

      {/* Mode-Specific Settings */}
      {gameMode === 'vsAI' && (
        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${mutedPanel}`}>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${accentText}`}>
            <Cpu className="w-4 h-4 text-indigo-400" /> AI Level:
          </span>
          <select
            value={aiDifficulty}
            onChange={(e) => onChangeAiDifficulty(e.target.value)}
            className={controlInput}
          >
            <option value="easy">Novice (Easy)</option>
            <option value="medium">Club Player (Medium)</option>
            <option value="hard">Tactical Master (Hard)</option>
            <option value="master">Grandmaster (Expert)</option>
          </select>
        </div>
      )}

      {/* Board Theme Picker */}
      <div className={`flex items-center justify-between p-2.5 rounded-lg border ${mutedPanel}`}>
        <span className={`text-xs font-semibold flex items-center gap-1.5 ${accentText}`}>
          <Palette className="w-4 h-4 text-cyan-400" /> Board Theme:
        </span>
        <select
          value={boardTheme}
          onChange={(e) => onChangeBoardTheme(e.target.value)}
          className={controlInput}
        >
          <option value="cyber">Cyberpunk Neon</option>
          <option value="gold">Luxury Gold</option>
          <option value="emerald">Emerald Wood</option>
          <option value="midnight">Midnight Dark</option>
          <option value="light">Classic Light</option>
          <option value="dark">Classic Dark</option>
        </select>
      </div>

      <div className={`flex items-center justify-between p-2.5 rounded-lg border ${mutedPanel}`}>
        <span className={`text-xs font-semibold flex items-center gap-1.5 ${accentText}`}>
          <Timer className="w-4 h-4 text-amber-400" /> Clock:
        </span>
        <div className="flex items-center gap-2">
          <select
            value={clockMinutes}
            onChange={(e) => onChangeClockMinutes(Number(e.target.value))}
            className={controlInput}
          >
            <option value={3}>3 min</option>
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
          </select>
          <button
            onClick={onToggleTimer}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isTimerRunning ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className={`grid grid-cols-4 gap-2 pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        
        <button
          onClick={onUndo}
          title="Undo Move"
          className={`py-2.5 rounded-lg flex items-center justify-center text-xs font-semibold gap-1 transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <RotateCcw className="w-4 h-4" /> Undo
        </button>

        <button
          onClick={onFlipBoard}
          title="Flip Board"
          className={`py-2.5 rounded-lg flex items-center justify-center text-xs font-semibold gap-1 transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <RotateCw className="w-4 h-4" /> Flip
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          className={`py-2.5 rounded-lg flex items-center justify-center text-xs font-semibold gap-1 transition-all ${
            isMuted ? 'bg-amber-950/60 text-amber-400 border border-amber-800' : isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isMuted ? 'Muted' : 'Sound'}
        </button>

        <button
          onClick={onResign}
          title="Resign / Reset Game"
          className="py-2.5 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/50 rounded-lg flex items-center justify-center text-xs font-semibold gap-1 transition-all"
        >
          <Flag className="w-4 h-4" /> Resign
        </button>

      </div>

    </div>
  );
};
