import React, { useState, useEffect } from 'react';

// Crisp SVG Piece Vector Renderers
const PIECE_ICONS = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙'
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟'
  }
};

// Vector SVG paths for ultra-crisp modern pieces
const PieceSVG = ({ type, color }) => {
  const isWhite = color === 'w';
  const strokeColor = isWhite ? '#0f172a' : '#f8fafc';
  const fillColor = isWhite ? '#ffffff' : '#1e293b';
  
  // Custom styled piece icons with clean typography & shadows
  return (
    <div className={`select-none flex items-center justify-center font-bold text-4xl sm:text-5xl transition-transform transform hover:scale-105 active:scale-95 ${
      isWhite 
        ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter' 
        : 'text-slate-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)] filter'
    }`}>
      <span className={isWhite ? 'text-slate-100' : 'text-slate-950'}>
        {PIECE_ICONS[color][type]}
      </span>
    </div>
  );
};

export const ChessBoard = ({
  chess,
  boardTheme = 'cyber',
  isFlipped = false,
  onMakeMove,
  disabled = false,
  lastMove = null,
  capturedPieces = { white: [], black: [] }
}) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null); // { from, to }

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedRanks = isFlipped ? [...ranks].reverse() : ranks;
  const displayedFiles = isFlipped ? [...files].reverse() : files;

  // Clear selections on board change or disabled state
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [chess.fen(), disabled]);

  const handleSquareClick = (square) => {
    if (disabled) return;

    // If click on selected square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If square is a legal move target for currently selected square
    const matchingMove = legalMoves.find((m) => m.to === square);
    if (selectedSquare && matchingMove) {
      // Check if pawn promotion
      const piece = chess.get(selectedSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))
      ) {
        setPromotionPending({ from: selectedSquare, to: square });
        return;
      }

      onMakeMove({ from: selectedSquare, to: square });
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Otherwise, select new piece if it belongs to active player
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionChoice = (promotionPiece) => {
    if (promotionPending) {
      onMakeMove({
        from: promotionPending.from,
        to: promotionPending.to,
        promotion: promotionPiece
      });
      setPromotionPending(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[560px] mx-auto select-none">
      
      {/* Captured Black Pieces Bar */}
      <div className="w-full h-8 mb-2 px-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span> Captured (Black):
        </span>
        <div className="flex items-center gap-1 text-lg">
          {capturedPieces.black.map((p, idx) => (
            <span key={idx} className="text-slate-200">{PIECE_ICONS.b[p]}</span>
          ))}
        </div>
      </div>

      {/* Main Board Container */}
      <div className={`relative w-full aspect-square border-4 border-slate-800/80 rounded-xl overflow-hidden shadow-2xl theme-${boardTheme}`}>
        
        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {displayedRanks.map((rank, rankIdx) =>
            displayedFiles.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const piece = chess.get(square);

              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
              
              const isHint = legalMoves.some((m) => m.to === square);
              const isHintCapture = isHint && piece !== null;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isLight ? 'sq-light' : 'sq-dark'
                  } ${isSelected ? 'sq-selected' : ''} ${isLastMove ? 'sq-last-move' : ''}`}
                >
                  {/* Rank/File Notation Labels */}
                  {fileIdx === 0 && (
                    <span className={`absolute top-0.5 left-1 text-[10px] font-bold opacity-60 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {rank}
                    </span>
                  )}
                  {rankIdx === 7 && (
                    <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold opacity-60 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {file}
                    </span>
                  )}

                  {/* Render Piece */}
                  {piece && <PieceSVG type={piece.type} color={piece.color} />}

                  {/* Move Hints */}
                  {isHint && !isHintCapture && (
                    <div className="absolute inset-0 sq-hint rounded-full scale-50 opacity-80 pointer-events-none animate-pulse-slow"></div>
                  )}
                  {isHintCapture && (
                    <div className="absolute inset-0 sq-hint-capture rounded-full opacity-90 pointer-events-none border-2 border-pink-500/80"></div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pawn Promotion Modal Overlay */}
        {promotionPending && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-100 mb-4 tracking-wide">Promote Pawn</h3>
            <div className="flex gap-4 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
              {['q', 'r', 'b', 'n'].map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionChoice(pType)}
                  className="w-14 h-14 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-4xl transition-all transform hover:scale-110"
                >
                  {PIECE_ICONS[chess.turn()][pType]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Captured White Pieces Bar */}
      <div className="w-full h-8 mt-2 px-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white"></span> Captured (White):
        </span>
        <div className="flex items-center gap-1 text-lg">
          {capturedPieces.white.map((p, idx) => (
            <span key={idx} className="text-white">{PIECE_ICONS.w[p]}</span>
          ))}
        </div>
      </div>

    </div>
  );
};
