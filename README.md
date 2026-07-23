# 👑 Chess Studio & Arena (Chess Maker)

An ultra-modern, feature-packed web application for creating custom chess positions, playing online with friends via WebRTC Room Codes, testing your skills against an advanced AI bot, or enjoying local pass-and-play!

![Chess Studio & Arena](https://raw.githubusercontent.com/lucide-react/lucide/main/icons/crown.svg)

---

## 🌟 Key Features

1. 🛠️ **Chess Maker (Position Studio)**
   - Drag & drop custom piece placement (King, Queen, Rook, Bishop, Knight, Pawn for White & Black).
   - Eraser tool to clear specific squares.
   - FEN string builder (Live FEN string generator, Copy FEN, Paste FEN).
   - Custom turn selector & castling rights setup.
   - **One-click Play Test**: Transfer any custom board setup directly into Play mode!

2. 👥 **Online Arena & Multiplayer**
   - **Create Private Room**: Generate a 6-character room code (e.g., `ROOM-X92KA`) to invite friends.
   - **Join Room**: Enter a room code to instantly connect via WebRTC (PeerJS). No server configuration needed!
   - **Quick Match**: Match with online players in the lobby.

3. 🤖 **vs Computer (AI Opponent)**
   - 4 Difficulty levels: **Novice (Easy)**, **Club Player (Medium)**, **Tactical Master (Hard)**, and **Grandmaster (Expert)**.
   - Powered by Minimax with Alpha-Beta Pruning & Positional Evaluation Tables.

4. ⚔️ **Pass & Play (Local 2-Player)**
   - Play on a single device with optional board flipping and active move clocks.

5. 🎨 **Visuals, Sound & Analytics**
   - **4 Stunning Themes**: Cyberpunk Neon, Luxury Gold, Emerald Wood, Midnight Dark.
   - **Real-Time Engine Evaluation Bar**: Displays material/positional score gauge (+1.5, -2.0).
   - **Web Audio API Sound Effects**: Synthesized audio for moves, captures, checks, and game-over fanfare (no external file dependencies).
   - **Move History Log**: Full move log with SAN algebraic notation and one-click PGN copy.
   - **Chess Clocks**: Customizable timer countdowns for both players.

---

## 💻 Running in VS Code

### Step 1: Open Directory in VS Code
Open the project directory:
`C:\Users\taman\.gemini\antigravity\scratch\chess-maker`

In VS Code: `File -> Open Folder -> Select chess-maker`

### Step 2: Install Dependencies
Open terminal in VS Code (`Ctrl + ~`) and run:
```bash
npm install
```

### Step 3: Run Development Server
Run the following command in terminal:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser!

> 💡 **Tip**: You can also press `Ctrl + Shift + B` in VS Code to run the default build task `npm: dev (Chess Studio)` configured in `.vscode/tasks.json`!

---

## 🚀 Deployment Guide

### Option 1: Deploy to Vercel (Recommended)
1. Install Vercel CLI or connect your GitHub repository to [Vercel](https://vercel.com).
2. Push your project to GitHub or run:
   ```bash
   npx vercel
   ```
3. Vercel automatically uses `vercel.json` and builds `dist/` instantly!

### Option 2: Deploy to Netlify
1. Connect your repository to [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Netlify will automatically detect `netlify.toml` for Single Page App routing!

### Option 3: Static Preview Build
To build and preview locally before deploying:
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
chess-maker/
├── .vscode/
│   ├── launch.json       # VS Code Chrome Debugger configuration
│   └── tasks.json        # VS Code task runner (npm run dev)
├── src/
│   ├── components/
│   │   ├── ChessBoard.jsx        # Interactive 8x8 Board & Promotion overlay
│   │   ├── ChessMakerEditor.jsx  # Scenario editor, FEN builder, piece palette
│   │   ├── GameControls.jsx      # Timers, theme picker, AI difficulty, game actions
│   │   ├── MoveLog.jsx           # Algebraic notation log & PGN copy
│   │   ├── EvaluationBar.jsx     # Engine position score gauge
│   │   └── OnlineRoomModal.jsx   # WebRTC room code creation & join modal
│   ├── utils/
│   │   ├── aiEngine.js           # Minimax algorithm & evaluation tables
│   │   ├── peerManager.js        # PeerJS WebRTC P2P multiplayer manager
│   │   └── soundEffects.js       # Web Audio API sound synthesizer
│   ├── App.jsx                   # Main layout & game state manager
│   ├── index.css                 # Themes, glassmorphism & Tailwind CSS
│   └── main.jsx                  # React DOM entry
├── index.html                    # Fonts & meta headers
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite setup
├── vercel.json                   # Vercel deployment config
└── netlify.toml                  # Netlify deployment config
```
