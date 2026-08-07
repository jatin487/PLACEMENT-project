/**
 * WebRTC + Firebase Realtime DB Signaling Service
 * Faculty (broadcaster) <-> Students (viewers) using WebRTC
 * Firebase RTDB used as signaling channel and live chat
 */
import { realtimeDb } from '../firebase/config';
import { ref, set, onValue, push, remove, off, get } from 'firebase/database';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// ─── CHAT ────────────────────────────────────────────────────────────────────

export const sendFirebaseMessage = async (roomId, sender, role, text) => {
  const msgRef = ref(realtimeDb, `rooms/${roomId}/chat`);
  await push(msgRef, {
    sender,
    role,
    text,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
  });
};

export const subscribeToChat = (roomId, callback) => {
  const msgRef = ref(realtimeDb, `rooms/${roomId}/chat`);
  onValue(msgRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    } else {
      callback([]);
    }
  });
  return () => off(msgRef);
};

// ─── STREAM PRESENCE ─────────────────────────────────────────────────────────

export const setStreamLive = async (roomId, streamInfo) => {
  await set(ref(realtimeDb, `rooms/${roomId}/stream`), {
    ...streamInfo,
    isLive: true,
    startedAt: Date.now(),
  });
};

export const setStreamOffline = async (roomId) => {
  await set(ref(realtimeDb, `rooms/${roomId}/stream`), { isLive: false });
  // Clean up WebRTC signaling data
  await remove(ref(realtimeDb, `rooms/${roomId}/signaling`));
};

export const subscribeToStream = (roomId, callback) => {
  const streamRef = ref(realtimeDb, `rooms/${roomId}/stream`);
  onValue(streamRef, (snap) => callback(snap.val()));
  return () => off(streamRef);
};

export const incrementViewers = async (roomId) => {
  const viewerRef = ref(realtimeDb, `rooms/${roomId}/viewers/${Date.now()}`);
  await set(viewerRef, true);
};

export const subscribeToViewerCount = (roomId, callback) => {
  const vRef = ref(realtimeDb, `rooms/${roomId}/viewers`);
  onValue(vRef, (snap) => {
    callback(snap.val() ? Object.keys(snap.val()).length : 0);
  });
  return () => off(vRef);
};

// ─── WebRTC BROADCASTER (Faculty) ────────────────────────────────────────────

export class WebRTCBroadcaster {
  constructor(roomId) {
    this.roomId = roomId;
    this.peers = {}; // viewerId -> RTCPeerConnection
    this.localStream = null;
    this.unsubscribeOffers = null;
  }

  async startCamera(constraints = { video: true, audio: true }) {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      // Replace video track in local stream
      if (this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = Object.values(this.peers)[0]?.getSenders()?.find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
        const oldVideoTrack = this.localStream.getVideoTracks()[0];
        if (oldVideoTrack) this.localStream.removeTrack(oldVideoTrack);
        this.localStream.addTrack(videoTrack);
        screenStream.getVideoTracks()[0].onended = () => this.stopScreenShare();
      }
      return screenStream;
    } catch (err) {
      console.error('Screen share error:', err);
      throw err;
    }
  }

  async stopScreenShare() {
    // Switch back to camera
    const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = camStream.getVideoTracks()[0];
    Object.values(this.peers).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    });
  }

  // Listen for viewer offer requests
  listenForViewers() {
    const offersRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/offers`);
    onValue(offersRef, async (snap) => {
      const offers = snap.val();
      if (!offers) return;
      for (const [viewerId, offer] of Object.entries(offers)) {
        if (!this.peers[viewerId]) {
          await this._handleViewerOffer(viewerId, offer);
        }
      }
    });
    this.unsubscribeOffers = () => off(offersRef);
  }

  async _handleViewerOffer(viewerId, offer) {
    const pc = new RTCPeerConnection(STUN_SERVERS);
    this.peers[viewerId] = pc;

    // Add local tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
    }

    // Send ICE candidates to viewer
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const candRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/broadcaster_ice/${viewerId}`);
        await push(candRef, event.candidate.toJSON());
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send answer to viewer
    await set(ref(realtimeDb, `rooms/${this.roomId}/signaling/answers/${viewerId}`), {
      type: answer.type,
      sdp: answer.sdp,
    });

    // Listen for viewer ICE candidates
    const viewerIceRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/viewer_ice/${viewerId}`);
    onValue(viewerIceRef, (snap) => {
      const candidates = snap.val();
      if (candidates) {
        Object.values(candidates).forEach(c => {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
        });
      }
    });
  }

  toggleMute(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => { track.enabled = !muted; });
    }
  }

  toggleCamera(off) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => { track.enabled = !off; });
    }
  }

  destroy() {
    if (this.unsubscribeOffers) this.unsubscribeOffers();
    Object.values(this.peers).forEach(pc => pc.close());
    if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
  }
}

// ─── WebRTC VIEWER (Student) ─────────────────────────────────────────────────

export class WebRTCViewer {
  constructor(roomId, viewerId) {
    this.roomId = roomId;
    this.viewerId = viewerId;
    this.pc = null;
    this.remoteStream = null;
  }

  async connect() {
    this.pc = new RTCPeerConnection(STUN_SERVERS);
    this.remoteStream = new MediaStream();

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => this.remoteStream.addTrack(track));
    };

    // Send ICE candidates to broadcaster
    this.pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const candRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/viewer_ice/${this.viewerId}`);
        await push(candRef, event.candidate.toJSON());
      }
    };

    // Create offer
    const offer = await this.pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
    await this.pc.setLocalDescription(offer);

    // Send offer to broadcaster
    await set(ref(realtimeDb, `rooms/${this.roomId}/signaling/offers/${this.viewerId}`), {
      type: offer.type,
      sdp: offer.sdp,
    });

    // Wait for broadcaster answer
    const answerRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/answers/${this.viewerId}`);
    onValue(answerRef, async (snap) => {
      const answer = snap.val();
      if (answer && this.pc.signalingState !== 'stable') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for broadcaster ICE candidates
    const bcastIceRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/broadcaster_ice/${this.viewerId}`);
    onValue(bcastIceRef, (snap) => {
      const candidates = snap.val();
      if (candidates) {
        Object.values(candidates).forEach(c => {
          this.pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
        });
      }
    });

    return this.remoteStream;
  }

  destroy() {
    if (this.pc) this.pc.close();
  }
}
