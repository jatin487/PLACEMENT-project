/**
 * WebRTC Signaling Service — Firebase Realtime DB removed.
 *
 * The live-stream WebRTC signaling previously used Firebase Realtime Database.
 * Firebase has been removed from this project, so all Firebase-based signaling
 * functions are replaced with no-op stubs. The LiveStreamContext (in-memory
 * state) continues to power the live stream UI without real P2P connections.
 *
 * To restore real P2P streaming, replace these stubs with a WebSocket-based
 * signaling server (e.g., Socket.IO).
 */

// ICE servers config (kept for future use when a signaling server is added)
export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ─── CHAT (no-op stubs) ───────────────────────────────────────────────────────

export const sendFirebaseMessage = async (_roomId, _sender, _role, _text) => {
  // No-op: Firebase removed. Chat is handled by LiveStreamContext in-memory state.
};

export const subscribeToChat = (_roomId, _callback) => {
  // No-op: returns unsubscribe function
  return () => {};
};

// ─── STREAM PRESENCE (no-op stubs) ───────────────────────────────────────────

export const setStreamLive = async (_roomId, _streamInfo) => {
  // No-op: stream state managed by LiveStreamContext
};

export const setStreamOffline = async (_roomId) => {
  // No-op
};

export const subscribeToStream = (_roomId, _callback) => {
  // No-op: returns unsubscribe function
  return () => {};
};

export const addViewer = async (_roomId) => {
  return `viewer_${Date.now()}`;
};

export const removeViewer = async (_roomId, _viewerKey) => {
  // No-op
};

export const subscribeToViewerCount = (_roomId, callback) => {
  // Return a static count of 0
  callback(0);
  return () => {};
};

// ─── WebRTC BROADCASTER (no-op stub) ─────────────────────────────────────────

export class WebRTCBroadcaster {
  constructor(roomId) {
    this.roomId = roomId;
    this.localStream = null;
  }

  async startCamera(constraints = { video: { width: 1280, height: 720 }, audio: true }) {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  async startScreenShare() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const newVideoTrack = screenStream.getVideoTracks()[0];
    const oldTrack = this.localStream?.getVideoTracks()[0];
    if (oldTrack) { this.localStream.removeTrack(oldTrack); oldTrack.stop(); }
    this.localStream?.addTrack(newVideoTrack);
    newVideoTrack.onended = () => this.stopScreenShare();
    return this.localStream;
  }

  async stopScreenShare() {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      const newVideoTrack = camStream.getVideoTracks()[0];
      const oldTrack = this.localStream?.getVideoTracks()[0];
      if (oldTrack) { this.localStream.removeTrack(oldTrack); oldTrack.stop(); }
      this.localStream?.addTrack(newVideoTrack);
    } catch (err) {
      console.error('Error switching back to camera:', err);
    }
  }

  listenForViewers() {
    // No-op: signaling server required for real P2P
  }

  toggleMute(muted) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !muted; });
  }

  toggleCamera(isOff) {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = !isOff; });
  }

  destroy() {
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }
}

// ─── WebRTC VIEWER (no-op stub) ──────────────────────────────────────────────

export class WebRTCViewer {
  constructor(roomId, viewerId) {
    this.roomId = roomId;
    this.viewerId = viewerId;
    this.pc = null;
    this.onRemoteStream = null;
  }

  async connect() {
    // No-op: signaling server required for real P2P
    console.info('[WebRTCViewer] Firebase signaling removed. Real P2P requires a WebSocket signaling server.');
  }

  destroy() {
    this.pc?.close();
    this.pc = null;
  }
}
