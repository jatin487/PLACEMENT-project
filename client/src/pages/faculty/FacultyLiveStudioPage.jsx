import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';

export default function FacultyLiveStudioPage() {
  const { user } = useAuth();
  const { activeStream, startLiveStream, endLiveStream, sendChatMessage } = useLiveStream();
  const navigate = useNavigate();

  // Stream state
  const isLive = activeStream?.isLive || false;
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [streamTitle, setStreamTitle] = useState(activeStream?.title || 'Data Structures Live Masterclass');
  const [subject, setSubject] = useState(activeStream?.subject || 'DSA');
  const [streamType, setStreamType] = useState(activeStream?.streamType || 'webcam');
  const [youtubeUrl, setYoutubeUrl] = useState(activeStream?.youtubeUrl || '');

  // Chat
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Local media stream
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeStream?.chatMessages]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStartLive = async () => {
    try {
      setCameraError('');
      if (streamType === 'webcam') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
          });
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (mediaErr) {
          console.warn('Could not acquire local camera (might be permissions/no hardware):', mediaErr);
          // Allow stream to start anyway so faculty can still broadcast / screen share
        }
      }

      startLiveStream({
        title: streamTitle,
        subject: subject,
        hostName: user?.name || 'Dr. Rajesh Sharma (Head of CSE)',
        streamType: streamType,
        youtubeUrl: youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      });
    } catch (err) {
      console.error('Error starting live:', err);
      setCameraError(err.message || 'Could not start live broadcast.');
    }
  };

  const handleEndLive = () => {
    if (!window.confirm('Are you sure you want to end this live broadcast?')) return;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    endLiveStream();
    navigate('/faculty/dashboard');
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    }
  };

  const toggleCamera = () => {
    const newOff = !isCameraOff;
    setIsCameraOff(newOff);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !newOff; });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (videoRef.current && localStreamRef.current) {
            videoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch (err) {
        if (err.name !== 'NotAllowedError') alert('Screen share error: ' + err.message);
      }
    } else {
      setIsScreenSharing(false);
      if (videoRef.current && localStreamRef.current) {
        videoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(user?.name || 'Dr. Rajesh Sharma', 'Faculty', chatInput.trim());
    setChatInput('');
  };

  return (
    <ProtectedLayout title="Faculty Live Broadcast Studio" allowedRoles={['faculty', 'admin']}>
      {/* Pre-Live Setup / Go Live Header */}
      {!isLive ? (
        <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.08) 100%)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold mb-md">🎙️ Set Up Your Live Broadcast</h2>
          <div className="grid grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Stream Title</label>
              <input className="form-input" value={streamTitle} onChange={e => setStreamTitle(e.target.value)} placeholder="e.g. Data Structures Live Masterclass" />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="DAA">Design & Analysis of Algorithms</option>
                <option value="OS">Operating Systems</option>
                <option value="DBMS">Database Management</option>
                <option value="CN">Computer Networks</option>
                <option value="Placement Special">Placement Special</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Broadcast Source</label>
              <select className="form-select" value={streamType} onChange={e => setStreamType(e.target.value)}>
                <option value="webcam">🎥 Live Webcam & Screen Share</option>
                <option value="youtube">🌐 YouTube Live Stream Embed</option>
              </select>
            </div>
            {streamType === 'youtube' && (
              <div className="form-group">
                <label className="form-label">YouTube URL / Embed</label>
                <input className="form-input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
              </div>
            )}
          </div>

          {cameraError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
              ⚠️ {cameraError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleStartLive} className="btn btn-primary btn-lg font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '12px 32px' }}>
              🔴 Go Live Now
            </button>
            <p className="text-secondary text-sm">Students will see the live banner on their dashboards</p>
          </div>
        </div>
      ) : (
        <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div className="flex items-center gap-md">
              <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                🔴 LIVE BROADCASTING
              </span>
              <div>
                <h2 className="text-xl font-bold">{activeStream.title}</h2>
                <p className="text-secondary text-sm">Host: {activeStream.hostName} • Subject: {activeStream.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="stat-card p-xs" style={{ minWidth: 140, margin: 0, textAlign: 'center' }}>
                <span className="text-xs text-secondary">Live Viewers</span>
                <div className="font-bold text-lg text-primary">👥 {activeStream.viewersCount || 42} Watching</div>
              </div>
              <button onClick={handleEndLive} className="btn btn-danger btn-lg font-bold">🛑 End Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        {/* Left: Video & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card p-0 overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isCameraOff && isLive ? (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '3rem' }}>📷🚫</div>
                <p style={{ fontWeight: 600, color: '#aaa', marginTop: 8 }}>Camera Paused</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: isLive && activeStream.streamType === 'webcam' ? 'block' : 'none' }}
                />
                {isLive && activeStream.streamType === 'youtube' && (
                  <iframe
                    src={activeStream.youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    title="Live Stream"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {!isLive && (
                  <div style={{ textAlign: 'center', color: '#aaa' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 12 }}>📹</div>
                    <p style={{ fontWeight: 600 }}>Camera preview will appear here</p>
                    <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Click "Go Live Now" to start</p>
                  </div>
                )}
              </>
            )}
            {isLive && (
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(239,68,68,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                  🔴 LIVE
                </span>
                {isScreenSharing && (
                  <span style={{ background: 'rgba(99,102,241,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    🖥️ SCREEN SHARING
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="card flex justify-between items-center flex-wrap gap-sm">
            <div className="flex gap-sm">
              <button
                className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleMute}
                disabled={!isLive}
              >
                {isMuted ? '🔇 Unmute Mic' : '🎙️ Mute Mic'}
              </button>
              <button
                className={`btn ${isCameraOff ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleCamera}
                disabled={!isLive}
              >
                {isCameraOff ? '📷 Turn On Camera' : '📹 Turn Off Camera'}
              </button>
              <button
                className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleScreenShare}
                disabled={!isLive}
              >
                {isScreenSharing ? '🛑 Stop Share' : '🖥️ Share Screen'}
              </button>
            </div>
            <div className="text-xs text-secondary font-semibold">
              {isLive
                ? <span className="text-success">● Broadcasting Live • Viewers: {activeStream.viewersCount || 42}</span>
                : <span className="text-muted">● Offline — Click Go Live to start</span>
              }
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Chat */}
        <div className="card flex flex-col" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">💬 Live Student Chat</h3>
            <span className="badge badge-accent text-xs" style={{ animation: isLive ? 'pulse 2s infinite' : 'none' }}>
              {isLive ? '● Real-Time' : '○ Offline'}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="p-md flex flex-col gap-sm overflow-y-auto flex-1" style={{ background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
            {(activeStream?.chatMessages || []).length === 0 ? (
              <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: 20 }}>
                {isLive ? 'Waiting for students to join...' : 'Chat will appear here when you go live.'}
              </p>
            ) : (
              (activeStream?.chatMessages || []).map((msg) => (
                <div key={msg.id} className="p-xs rounded" style={{
                  background: msg.role === 'Faculty' ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                  borderLeft: msg.role === 'Faculty' ? '3px solid var(--color-primary)' : '3px solid var(--color-accent)'
                }}>
                  <div className="flex justify-between text-xs text-secondary mb-xs">
                    <span className="font-bold" style={{ color: msg.role === 'Faculty' ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                      {msg.role === 'Faculty' ? '👨‍🏫 ' : '🎓 '}{msg.sender}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Message */}
          <form onSubmit={handleSendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder={isLive ? 'Say something to your students...' : 'Go live to chat...'}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!isLive}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!isLive}>Send</button>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
