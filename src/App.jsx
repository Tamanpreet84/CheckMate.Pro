import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { Crown, Cpu, Users, Swords, RefreshCw, Trophy, Volume2, VolumeX, Moon, Sun } from 'lucide-react';

import { ChessBoard } from './components/ChessBoard';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { GameControls } from './components/GameControls';
import { MoveLog } from './components/MoveLog';
import { EvaluationBar } from './components/EvaluationBar';

import { soundManager } from './utils/soundEffects';
import { getBestMove, getEvalScoreInPawns } from './utils/aiEngine';
import { peerManager } from './utils/peerManager';

export default function App() {
  // Main Navigation Modes: 'vsAI' | 'online' | 'local'
  const [activeMode, setActiveMode] = useState('vsAI');

  // Game Engine State
  const [chess, setChess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [evalScore, setEvalScore] = useState(0);

  // Board Aesthetics & Settings
  const [boardTheme, setBoardTheme] = useState('emerald');
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('checkmate-theme') || 'light';
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [userColor, setUserColor] = useState('w'); // For vsAI or online

  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Login / Access State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('checkmate-auth'));
  });
  const [userId, setUserId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('checkmate-auth-user') || '';
  });
  const [loginInput, setLoginInput] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('checkmate-auth-password') || '';
  });
  const [loginError, setLoginError] = useState('');

  // Online Multiplayer State
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [roomStatus, setRoomStatus] = useState({ status: 'IDLE', roomCode: '', isHost: false, playerColor: 'w' });
  const [onlineErrorMessage, setOnlineErrorMessage] = useState(null);

  // Chess Clocks State (in seconds)
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes default
  const [blackTime, setBlackTime] = useState(600);
  const [clockMinutes, setClockMinutes] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);

  // Captured Pieces
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

  // Game Over Dialog State
  const [gameOverInfo, setGameOverInfo] = useState(null);

  // Timer Ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAuthenticated && userId) {
      localStorage.setItem('checkmate-auth', 'true');
      localStorage.setItem('checkmate-auth-user', userId);
      localStorage.setItem('checkmate-auth-password', loginInput);
    } else {
      localStorage.removeItem('checkmate-auth');
      localStorage.removeItem('checkmate-auth-user');
      localStorage.removeItem('checkmate-auth-password');
    }
  }, [isAuthenticated, userId, loginInput]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('checkmate-theme', themeMode);
  }, [themeMode]);

  // Reset/Initialize Game from FEN
  const startNewGame = (startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') => {
    const newChess = new Chess(startFen);
    const selectedClockSeconds = clockMinutes * 60;
    setChess(newChess);
    setFen(newChess.fen());
    setHistory([]);
    setLastMove(null);
    setEvalScore(0);
    setWhiteTime(selectedClockSeconds);
    setBlackTime(selectedClockSeconds);
    setGameActive(true);
    setTimerRunning(false);
    setCapturedPieces({ white: [], black: [] });
    setGameOverInfo(null);
  };

  // Clock Countdown Interval
  useEffect(() => {
    if (!gameActive || !timerRunning || chess.isGameOver()) return;

    timerRef.current = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleGameOver('Black wins on time!');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleGameOver('White wins on time!');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [chess.turn(), gameActive, timerRunning]);

  // Check Game Over & Triggers
  const checkAndHandleEndgame = (g) => {
    if (g.isCheckmate()) {
      const winner = g.turn() === 'w' ? 'Black' : 'White';
      handleGameOver(`Checkmate! ${winner} Wins! 🎉`);
      soundManager.playGameEnd();
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } else if (g.isDraw()) {
      if (g.isStalemate()) handleGameOver('Game Drawn by Stalemate');
      else if (g.isThreefoldRepetition()) handleGameOver('Game Drawn by Threefold Repetition');
      else if (g.isInsufficientMaterial()) handleGameOver('Game Drawn by Insufficient Material');
      else handleGameOver('Game Drawn');
      soundManager.playGameEnd();
    }
  };

  const handleGameOver = (message) => {
    setGameActive(false);
    setGameOverInfo(message);
  };

  // Execute Move Logic
  const handleMakeMove = (moveObj) => {
    try {
      const isCapture = chess.get(moveObj.to) !== null;
      const moveResult = chess.move(moveObj);

      if (!moveResult) return false;

      // Sound Cues
      if (chess.isCheck()) soundManager.playCheck();
      else if (isCapture) soundManager.playCapture();
      else soundManager.playMove();

      // Update State
      setFen(chess.fen());
      setHistory(chess.history());
      setLastMove({ from: moveObj.from, to: moveObj.to });
      setEvalScore(getEvalScoreInPawns(chess));

      // Track Captured Pieces
      if (moveResult.captured) {
        const captorColor = moveResult.color;
        setCapturedPieces((prev) => ({
          ...prev,
          [captorColor === 'w' ? 'black' : 'white']: [
            ...prev[captorColor === 'w' ? 'black' : 'white'],
            moveResult.captured
          ]
        }));
      }

      // Sync Online P2P Move
      if (activeMode === 'online') {
        peerManager.sendMove(moveObj, chess.fen());
      }

      checkAndHandleEndgame(chess);
      return true;
    } catch (e) {
      console.warn('Invalid move attempted:', e);
      return false;
    }
  };

  // AI Opponent Move Trigger
  useEffect(() => {
    if (activeMode !== 'vsAI' || !gameActive || chess.isGameOver()) return;

    if (chess.turn() !== userColor) {
      const aiTimeout = setTimeout(() => {
        const bestMove = getBestMove(chess.fen(), aiDifficulty);
        if (bestMove) {
          handleMakeMove({
            from: bestMove.from,
            to: bestMove.to,
            promotion: bestMove.promotion || 'q'
          });
        }
      }, 2000);

      return () => clearTimeout(aiTimeout);
    }
  }, [fen, activeMode, userColor, aiDifficulty, gameActive]);

  // Online Multiplayer Setup Callbacks
  const setupOnlineCallbacks = () => ({
    onMove: (remoteMove, remoteFen) => {
      handleMakeMove(remoteMove);
    },
    onConnected: (statusObj) => {
      setRoomStatus(statusObj);
      if (statusObj.status === 'CONNECTED') {
        setIsOnlineModalOpen(false);
        setUserColor(statusObj.playerColor);
        if (statusObj.playerColor === 'b') setIsFlipped(true);
        soundManager.playNotify();
      }
    },
    onDisconnected: () => {
      setOnlineErrorMessage('Opponent disconnected');
    },
    onError: (err) => {
      setOnlineErrorMessage('Connection error occurred');
    }
  });

  const handleCreateOnlineRoom = () => {
    setOnlineErrorMessage(null);
    peerManager.createRoom(null, setupOnlineCallbacks());
  };

  const handleJoinOnlineRoom = (code) => {
    setOnlineErrorMessage(null);
    peerManager.joinRoom(code, setupOnlineCallbacks());
  };

  const handleQuickMatch = () => {
    handleCreateOnlineRoom();
  };

  const toggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!userId.trim() || !loginInput.trim()) {
      setLoginError('Please enter your ID and password.');
      return;
    }

    setLoginError('');
    setIsAuthenticated(true);
  };

  const handleClockMinutesChange = (minutes) => {
    setClockMinutes(minutes);
    const selectedClockSeconds = minutes * 60;
    setWhiteTime(selectedClockSeconds);
    setBlackTime(selectedClockSeconds);
    setGameActive(true);
    setTimerRunning(false);
  };

  const handleToggleTimer = () => {
    setTimerRunning((prev) => !prev);
  };

  const isDark = themeMode === 'dark';
  const shellClasses = isDark
    ? 'min-h-screen flex flex-col items-center justify-between text-slate-100 selection:bg-indigo-500 bg-slate-950 transition-colors duration-300'
    : 'min-h-screen flex flex-col items-center justify-between text-slate-900 selection:bg-amber-500 bg-slate-100 transition-colors duration-300';
  const headerClasses = isDark
    ? 'w-full max-w-7xl mx-auto px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40'
    : 'w-full max-w-7xl mx-auto px-4 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40';
  const navClasses = isDark
    ? 'flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl'
    : 'flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl';
  const navButtonInactive = isDark
    ? 'text-slate-400 hover:text-slate-200'
    : 'text-slate-600 hover:text-slate-900';
  const controlCardClasses = isDark
    ? 'bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl'
    : 'bg-white/90 border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-xl';

  if (!isAuthenticated) {
    return (
      <div className={shellClasses}>
        <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-2xl shadow-lg shadow-indigo-500/20">
              👑
            </div>
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>CheckMate.Pro</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enter your ID and login to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`mb-1 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your ID"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-slate-50 text-slate-900'}`}
              />
            </div>

            <div>
              <label className={`mb-1 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Enter your password"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-slate-50 text-slate-900'}`}
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-500">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-cyan-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClasses}>
      
      {/* Header Bar */}
      <header className={headerClasses}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
            👑
          </div>
          <div>
            <h1 className={`text-lg font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              CheckMate.Pro <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">PRO</span>
            </h1>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Smart Chess Arena</p>
          </div>
        </div>

        {/* Navigation Mode Selector */}
        <nav className={navClasses}>
          <button
            onClick={() => setActiveMode('vsAI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === 'vsAI'
                ? 'bg-indigo-600 text-white shadow-md'
                : navButtonInactive
            }`}
          >
            <Cpu className="w-4 h-4" /> vs Bot (AI)
          </button>
          
          <button
            onClick={() => {
              setActiveMode('online');
              setIsOnlineModalOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === 'online'
                ? 'bg-indigo-600 text-white shadow-md'
                : navButtonInactive
            }`}
          >
            <Users className="w-4 h-4" /> Online Play
          </button>

          <button
            onClick={() => setActiveMode('local')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === 'local'
                ? 'bg-indigo-600 text-white shadow-md'
                : navButtonInactive
            }`}
          >
            <Swords className="w-4 h-4" /> Pass & Play
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main Body View */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-center">
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Sidebar: Controls */}
            <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-4">
              <GameControls
                gameMode={activeMode}
                aiDifficulty={aiDifficulty}
                onChangeAiDifficulty={setAiDifficulty}
                boardTheme={boardTheme}
                onChangeBoardTheme={setBoardTheme}
                whiteTime={whiteTime}
                blackTime={blackTime}
                activeTurn={chess.turn()}
                clockMinutes={clockMinutes}
                onChangeClockMinutes={handleClockMinutesChange}
                isTimerRunning={timerRunning}
                onToggleTimer={handleToggleTimer}
                themeMode={themeMode}
                onUndo={() => {
                  chess.undo();
                  if (activeMode === 'vsAI') chess.undo(); // Undo AI move as well
                  setFen(chess.fen());
                  setHistory(chess.history());
                  setEvalScore(getEvalScoreInPawns(chess));
                }}
                onFlipBoard={() => setIsFlipped(!isFlipped)}
                onNewGame={() => startNewGame()}
                onResign={() => handleGameOver(`${chess.turn() === 'w' ? 'White' : 'Black'} Resigned`)}
                isMuted={isMuted}
                onToggleMute={toggleAudio}
              />

              <MoveLog history={history} pgn={chess.pgn()} themeMode={themeMode} />
            </div>

            {/* Middle: Chessboard & Eval Bar */}
            <div className="lg:col-span-8 order-1 lg:order-2 flex items-center justify-center gap-3 sm:gap-4">
              <EvaluationBar score={evalScore} isFlipped={isFlipped} />
              
              <ChessBoard
                chess={chess}
                boardTheme={boardTheme}
                isFlipped={isFlipped}
                onMakeMove={handleMakeMove}
                disabled={!gameActive || (activeMode === 'vsAI' && chess.turn() !== userColor)}
                lastMove={lastMove}
                capturedPieces={capturedPieces}
              />
            </div>

          </div>

      </main>

      {/* Online Room Connection Modal */}
      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onCreateRoom={handleCreateOnlineRoom}
        onJoinRoom={handleJoinOnlineRoom}
        onQuickMatch={handleQuickMatch}
        roomStatus={roomStatus}
        errorMessage={onlineErrorMessage}
        themeMode={themeMode}
      />

      {/* Game Over Modal */}
      {gameOverInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Trophy className="w-12 h-12 text-yellow-400 mb-3 animate-bounce" />
            <h2 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{gameOverInfo}</h2>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Great game! Would you like to rematch or start a new board position?</p>

            <div className="w-full flex gap-3">
              <button
                onClick={() => startNewGame()}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Rematch
              </button>
              <button
                onClick={() => setGameOverInfo(null)}
                className={`px-4 py-3 text-xs font-bold rounded-xl transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-3 border-t border-slate-800/80 bg-slate-950/60 text-center text-xs text-slate-500">
        Chess Studio & Arena &bull; Play Online, Create Custom Positions & Challenge AI
      </footer>

    </div>
  );
}
