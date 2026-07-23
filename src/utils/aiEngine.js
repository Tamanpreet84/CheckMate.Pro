import { Chess } from 'chess.js';

// Piece material values
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece Square Tables for Positional Evaluation
const pawnEvalWhite = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const knightEval = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopEvalWhite = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookEvalWhite = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const queenEval = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingEvalWhite = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

// Helper to reverse tables for black pieces
const reverseArray = (array) => [...array].reverse();
const pawnEvalBlack = reverseArray(pawnEvalWhite);
const bishopEvalBlack = reverseArray(bishopEvalWhite);
const rookEvalBlack = reverseArray(rookEvalWhite);
const kingEvalBlack = reverseArray(kingEvalWhite);

// Evaluates the current board state (positive score = White advantage, negative = Black advantage)
export const evaluateBoard = (chess) => {
  let totalEvaluation = 0;
  const board = chess.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        let val = PIECE_VALUES[piece.type];
        let posVal = 0;

        if (piece.type === 'p') {
          posVal = piece.color === 'w' ? pawnEvalWhite[row][col] : pawnEvalBlack[row][col];
        } else if (piece.type === 'n') {
          posVal = knightEval[row][col];
        } else if (piece.type === 'b') {
          posVal = piece.color === 'w' ? bishopEvalWhite[row][col] : bishopEvalBlack[row][col];
        } else if (piece.type === 'r') {
          posVal = piece.color === 'w' ? rookEvalWhite[row][col] : rookEvalBlack[row][col];
        } else if (piece.type === 'q') {
          posVal = queenEval[row][col];
        } else if (piece.type === 'k') {
          posVal = piece.color === 'w' ? kingEvalWhite[row][col] : kingEvalBlack[row][col];
        }

        const pieceTotal = val + posVal;
        if (piece.color === 'w') {
          totalEvaluation += pieceTotal;
        } else {
          totalEvaluation -= pieceTotal;
        }
      }
    }
  }

  return totalEvaluation;
};

// Minimax with Alpha-Beta Pruning
const minimax = (game, depth, alpha, beta, isMaximizing) => {
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluateBoard(game) };
  }

  const moves = game.moves({ verbose: true });
  let bestMove = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false).score;
      game.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Cutoff
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true).score;
      game.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Cutoff
    }
    return { score: minEval, move: bestMove };
  }
};

// Get optimal move for given difficulty
export const getBestMove = (fen, difficulty = 'medium') => {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isMaximizing = game.turn() === 'w';

  // Easy / Novice: 70% random, 30% shallow search
  if (difficulty === 'easy') {
    if (Math.random() < 0.6) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    return minimax(game, 1, -Infinity, Infinity, isMaximizing).move || moves[0];
  }

  // Medium / Club Player: Depth 2
  if (difficulty === 'medium') {
    return minimax(game, 2, -Infinity, Infinity, isMaximizing).move || moves[0];
  }

  // Hard / Tactical Master: Depth 3
  if (difficulty === 'hard') {
    return minimax(game, 3, -Infinity, Infinity, isMaximizing).move || moves[0];
  }

  // Master / Grandmaster: Depth 3-4
  if (difficulty === 'master') {
    return minimax(game, 3, -Infinity, Infinity, isMaximizing).move || moves[0];
  }

  return moves[Math.floor(Math.random() * moves.length)];
};

// Converts centipawns score to evaluation bar metric (-10 to +10 range)
export const getEvalScoreInPawns = (chess) => {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99 : 99;
  }
  const scoreInCentiPawns = evaluateBoard(chess);
  return Number((scoreInCentiPawns / 100).toFixed(1));
};
