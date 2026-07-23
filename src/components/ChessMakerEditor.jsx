import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Sparkles, Play, Copy, RefreshCw, Trash2, Check, AlertCircle } from 'lucide-react';

const PIECES = [
  { type: 'k', color: 'w', label: '♔' },
  { type: 'q', color: 'w', label: '♕' },
  { type: 'r', color: 'w', label: '♖' },
  { type: 'b', color: 'w', label: '♗' },
  { type: 'n', color: 'w', label: '♘' },
  { type: 'p', color: 'w', label: '♙' },
  { type: 'k', color: 'b', label: '♚' },
  { type: 'q', color: 'b', label: '♛' },
  { type: 'r', color: 'b', label: '♜' },
  { type: 'b', color: 'b', label: '♝' },
  { type: 'n', color: 'b', label: '♞' },
  { type: 'p', color: 'b', label: '♟' },
];

export const ChessMakerEditor = ({ onLaunchPlayTest, currentFen }) => {
  const [boardGrid, setBoardGrid] = useState(
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [selectedToolPiece, setSelectedToolPiece] = useState({ type: 'p', color: 'w' });
  const [turn, setTurn] = useState('w');
  const [castling, setCastling] = useState({ K: true, Q: true, k: true, q: true });
  const [fenInput, setFenInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [fenError, setFenError] = useState(null);

  // Initialize from current FEN or standard start
  useEffect(() => {
    loadFenToGrid(currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }, [currentFen]);

  const loadFenToGrid = (fenStr) => {
    try {
      const chess = new Chess(fenStr);
      const b = chess.board();
      const grid = b.map((row) =>
        row.map((cell) => (cell ? { type: cell.type, color: cell.color } : null))
      );
      setBoardGrid(grid);
      setTurn(chess.turn());
      setFenInput(fenStr);
      setFenError(null);
    } catch (e) {
      setFenError('Invalid FEN format');
    }
  };

  const handleSquareClick = (r, c) => {
    const newGrid = boardGrid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === r && cIdx === c) {
          if (selectedToolPiece === 'TRASH') return null;
          return selectedToolPiece ? { ...selectedToolPiece } : null;
        }
        return cell;
      })
    );
    setBoardGrid(newGrid);
    generateFenFromGrid(newGrid, turn, castling);
  };

  const generateFenFromGrid = (grid, currentTurn, currentCastling) => {
    let fenRows = [];
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      let rowStr = '';
      for (let c = 0; c < 8; c++) {
        const cell = grid[r][c];
        if (!cell) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          const char = cell.type;
          rowStr += cell.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        }
      }
      if (emptyCount > 0) rowStr += emptyCount;
      fenRows.push(rowStr);
    }

    let castleStr = '';
    if (currentCastling.K) castleStr += 'K';
    if (currentCastling.Q) castleStr += 'Q';
    if (currentCastling.k) castleStr += 'k';
    if (currentCastling.q) castleStr += 'q';
    if (!castleStr) castleStr = '-';

    const fenStr = `${fenRows.join('/')} ${currentTurn} ${castleStr} - 0 1`;
    setFenInput(fenStr);

    try {
      new Chess(fenStr);
      setFenError(null);
    } catch (e) {
      setFenError('Position invalid for standard game rules (e.g. check setup or king counts)');
    }
  };

  const handleResetStandard = () => {
    loadFenToGrid('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  };

  const handleClearBoard = () => {
    const emptyGrid = Array(8).fill(null).map(() => Array(8).fill(null));
    setBoardGrid(emptyGrid);
    generateFenFromGrid(emptyGrid, turn, castling);
  };

  const copyFenToClipboard = () => {
    navigator.clipboard.writeText(fenInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFenInputChange = (e) => {
    const fenVal = e.target.value;
    setFenInput(fenVal);
    try {
      new Chess(fenVal);
      loadFenToGrid(fenVal);
      setFenError(null);
    } catch (err) {
      setFenError('Invalid FEN position string');
    }
  };

  const handleStartPlayTest = () => {
    if (fenError) return;
    onLaunchPlayTest(fenInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      
      {/* Left Column: Board Editor */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Chess Position Studio
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleResetStandard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleClearBoard}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-xs font-semibold text-red-300 rounded-lg flex items-center gap-1.5 border border-red-800/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        </div>

        {/* 8x8 Editor Grid */}
        <div className="w-full aspect-square max-w-[480px] grid grid-cols-8 grid-rows-8 border-4 border-indigo-900/60 rounded-xl overflow-hidden shadow-2xl bg-slate-900">
          {boardGrid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isLight = (rIdx + cIdx) % 2 === 0;
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleSquareClick(rIdx, cIdx)}
                  className={`flex items-center justify-center cursor-pointer text-4xl select-none hover:opacity-80 transition-opacity ${
                    isLight ? 'bg-slate-800 text-slate-100' : 'bg-slate-950 text-slate-300'
                  }`}
                >
                  {cell ? (
                    <span className={cell.color === 'w' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'}>
                      {PIECES.find((p) => p.type === cell.type && p.color === cell.color)?.label}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Piece Palette & Rules Setup */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Palette Section */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Select Piece Palette
          </h3>
          
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PIECES.map((p) => {
              const isSelected =
                selectedToolPiece !== 'TRASH' &&
                selectedToolPiece.type === p.type &&
                selectedToolPiece.color === p.color;
              return (
                <button
                  key={`${p.color}-${p.type}`}
                  onClick={() => setSelectedToolPiece({ type: p.type, color: p.color })}
                  className={`h-12 flex items-center justify-center text-3xl rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 shadow-lg scale-105'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className={p.color === 'w' ? 'text-white' : 'text-slate-950'}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedToolPiece('TRASH')}
            className={`w-full py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedToolPiece === 'TRASH'
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Eraser Tool (Click square to remove piece)
          </button>
        </div>

        {/* Turn & Castling Configuration */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Game Parameters
          </h3>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Turn to Move:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTurn('w');
                  generateFenFromGrid(boardGrid, 'w', castling);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  turn === 'w'
                    ? 'bg-white text-slate-950 border-white shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ♔ White
              </button>
              <button
                onClick={() => {
                  setTurn('b');
                  generateFenFromGrid(boardGrid, 'b', castling);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  turn === 'b'
                    ? 'bg-slate-950 text-white border-slate-700 shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ♚ Black
              </button>
            </div>
          </div>
        </div>

        {/* FEN Box & Play Test */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated FEN String
            </h3>
            <button
              onClick={copyFenToClipboard}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy FEN'}
            </button>
          </div>

          <textarea
            value={fenInput}
            onChange={handleFenInputChange}
            rows={2}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 resize-none"
          />

          {fenError && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-lg text-[11px] text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{fenError}</span>
            </div>
          )}

          <button
            onClick={handleStartPlayTest}
            disabled={!!fenError}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            Play This Position
          </button>
        </div>

      </div>

    </div>
  );
};
