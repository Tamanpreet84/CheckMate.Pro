import React, { useState } from 'react';
import { Users, Copy, Check, Play, Wifi, ArrowRight, X, Shuffle } from 'lucide-react';

export const OnlineRoomModal = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  onQuickMatch,
  roomStatus, // { status, roomCode, playerColor }
  errorMessage,
  themeMode = 'dark'
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join' | 'quick'

  if (!isOpen) return null;

  const copyCode = () => {
    if (roomStatus?.roomCode) {
      navigator.clipboard.writeText(roomStatus.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCodeInput.trim()) {
      onJoinRoom(joinCodeInput.trim().toUpperCase());
    }
  };

  const isDark = themeMode === 'dark';
  const modalClasses = isDark
    ? 'w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden relative'
    : 'w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden relative';
  const headerClasses = isDark
    ? 'p-6 bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-slate-800'
    : 'p-6 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-200';
  const tabClasses = isDark
    ? 'flex border-b border-slate-800 bg-slate-950/60'
    : 'flex border-b border-slate-200 bg-slate-50';
  const bodyClasses = isDark ? 'p-6' : 'p-6 bg-white';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={modalClasses}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all ${isDark ? 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className={headerClasses}>
          <h2 className={`text-xl font-bold flex items-center gap-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-indigo-400" />
            Online Arena & Multiplayer
          </h2>
          <p className={`text-xs mt-1 ${mutedText}`}>
            Play in real-time with friends using Room Codes or match with online players!
          </p>
        </div>

        {/* Tab Selection */}
        <div className={tabClasses}>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                : `border-transparent ${mutedText} hover:${isDark ? 'text-slate-200' : 'text-slate-900'}`
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'join'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                : `border-transparent ${mutedText} hover:${isDark ? 'text-slate-200' : 'text-slate-900'}`
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'quick'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                : `border-transparent ${mutedText} hover:${isDark ? 'text-slate-200' : 'text-slate-900'}`
            }`}
          >
            Quick Match
          </button>
        </div>

        {/* Body Content */}
        <div className={bodyClasses}>
          
          {/* TAB 1: Create Room */}
          {activeTab === 'create' && (
            <div className="flex flex-col items-center gap-4 text-center">
              {!roomStatus || roomStatus.status === 'IDLE' ? (
                <>
                  <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs text-slate-300">
                    Host a private online game. Share the generated code with your friend to connect instantly!
                  </div>
                  <button
                    onClick={onCreateRoom}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Generate Room Code
                  </button>
                </>
              ) : roomStatus.status === 'WAITING_FOR_OPPONENT' ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 animate-pulse">
                    <Wifi className="w-4 h-4" /> Waiting for opponent to join...
                  </div>

                  <div className="w-full p-4 bg-slate-950 border border-indigo-500/40 rounded-xl flex items-center justify-between">
                    <span className="font-mono text-xl font-extrabold tracking-widest text-indigo-400">
                      {roomStatus.roomCode}
                    </span>
                    <button
                      onClick={copyCode}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Send this room code to your friend. The game will start automatically when they connect.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: Join Room */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enter 6-Character Room Code
              </label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. ROOM-A892K"
                className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center font-mono text-lg tracking-widest text-indigo-300 rounded-xl uppercase focus:outline-none"
              />

              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                Join Room <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* TAB 3: Quick Match */}
          {activeTab === 'quick' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                Instantly connect with a random player in the global online queue!
              </div>
              <button
                onClick={onQuickMatch}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Shuffle className="w-5 h-5" />
                Find Quick Match
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
