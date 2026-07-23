import Peer from 'peerjs';

class PeerManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.peerId = null;
    this.isHost = false;
    this.onMoveCallback = null;
    this.onConnectedCallback = null;
    this.onDisconnectedCallback = null;
    this.onErrorCallback = null;
    this.onRestartCallback = null;
    this.onChatCallback = null;
  }

  // Generates a clean 6-character room code
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ROOM-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Initialize Host Room
  createRoom(customCode, callbacks = {}) {
    this.disconnect();
    this.isHost = true;
    const roomCode = customCode || this.generateRoomCode();
    this.setCallbacks(callbacks);

    this.peer = new Peer(roomCode, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('open', (id) => {
      this.peerId = id;
      if (this.onConnectedCallback) {
        this.onConnectedCallback({ status: 'WAITING_FOR_OPPONENT', roomCode: id, isHost: true, playerColor: 'w' });
      }
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupConnectionListeners();
      if (this.onConnectedCallback) {
        this.onConnectedCallback({ status: 'CONNECTED', roomCode: this.peerId, isHost: true, playerColor: 'w' });
      }
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Host Error:', err);
      if (this.onErrorCallback) this.onErrorCallback(err);
    });

    return roomCode;
  }

  // Join Existing Room
  joinRoom(roomCode, callbacks = {}) {
    this.disconnect();
    this.isHost = false;
    this.setCallbacks(callbacks);

    this.peer = new Peer({
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('open', () => {
      const conn = this.peer.connect(roomCode, { reliable: true });
      this.conn = conn;
      this.setupConnectionListeners();
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Join Error:', err);
      if (this.onErrorCallback) this.onErrorCallback(err);
    });
  }

  setCallbacks(callbacks) {
    this.onMoveCallback = callbacks.onMove;
    this.onConnectedCallback = callbacks.onConnected;
    this.onDisconnectedCallback = callbacks.onDisconnected;
    this.onErrorCallback = callbacks.onError;
    this.onRestartCallback = callbacks.onRestart;
    this.onChatCallback = callbacks.onChat;
  }

  setupConnectionListeners() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      if (this.onConnectedCallback) {
        this.onConnectedCallback({
          status: 'CONNECTED',
          roomCode: this.conn.peer,
          isHost: this.isHost,
          playerColor: this.isHost ? 'w' : 'b'
        });
      }
    });

    this.conn.on('data', (data) => {
      if (!data) return;
      if (data.type === 'MOVE' && this.onMoveCallback) {
        this.onMoveCallback(data.move, data.fen);
      } else if (data.type === 'RESTART' && this.onRestartCallback) {
        this.onRestartCallback(data.fen);
      } else if (data.type === 'CHAT' && this.onChatCallback) {
        this.onChatCallback(data.sender, data.message);
      }
    });

    this.conn.on('close', () => {
      if (this.onDisconnectedCallback) this.onDisconnectedCallback();
    });

    this.conn.on('error', (err) => {
      if (this.onErrorCallback) this.onErrorCallback(err);
    });
  }

  sendMove(move, fen) {
    if (this.conn && this.conn.open) {
      this.conn.send({ type: 'MOVE', move, fen });
    }
  }

  sendRestart(fen) {
    if (this.conn && this.conn.open) {
      this.conn.send({ type: 'RESTART', fen });
    }
  }

  sendChat(sender, message) {
    if (this.conn && this.conn.open) {
      this.conn.send({ type: 'CHAT', sender, message });
    }
  }

  disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.peerId = null;
  }
}

export const peerManager = new PeerManager();
