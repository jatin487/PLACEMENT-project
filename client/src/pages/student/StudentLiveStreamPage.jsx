import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';

export default function StudentLiveStreamPage() {
  const { user } = useAuth();
  const { activeStream, sendChatMessage } = useLiveStream();

  const [isConnected, setIsConnected] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [reactions, setReactions] = useState({ likes: 18, helpful: 12 });
  const chatEndRef = useRef(null);

  const isLive = activeStream?.isLive || false;

  // Auto connect if stream is live or reconnect
  useEffect(() => {
    if (isLive) {
      setIsConnected(true);
    }
  }, [isLive]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeStream?.chatMessages]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(user?.name || 'Student', user?.role === 'faculty' ? 'Faculty' : 'Student', chatInput.trim());
    setChatInput('');
  };

  return (
    <ProtectedLayout title="Live Classroom Stream" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Stream Header */}
      <div className="card mb-lg" style={{
        background: isLive
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(99,102,241,0.1) 100%)'
          : 'var(--bg-secondary)',
        border: isLive ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-color)'
      }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-xs mb-xs">
              {isLive ? (
                <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                  🔴 LIVE NOW
                </span>
              ) : (
                <span className="badge badge-secondary">● No Active Stream</span>
              )}
              {activeStream?.subject && <span className="badge badge-accent">{activeStream.subject}</span>}
            </div>
            <h2 className="text-xl font-bold">{isLive ? activeStream.title : 'Waiting for faculty to go live...'}</h2>
            {isLive && activeStream.hostName && <p className="text-secondary text-sm">Instructor: {activeStream.hostName}</p>}
          </div>
          <div className="flex items-center gap-sm">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setReactions(p => ({ ...p, likes: p.likes + 1 }))}
            >
              👍 {reactions.likes}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setReactions(p => ({ ...p, helpful: p.helpful + 1 }))}
            >
              🎯 {reactions.helpful} Helpful
            </button>
            <div className="stat-card p-xs" style={{ margin: 0, minWidth: 130, textAlign: 'center' }}>
              <div className="font-bold text-md text-primary">👥 {activeStream?.viewersCount || 42} Watching</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="live-studio-grid">
        {/* Left: Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card p-0 overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isLive ? (
              <div style={{ textAlign: 'center', color: '#aaa', padding: 20 }}>
                <div style={{ fontSize: '4rem', marginBottom: 12 }}>📡</div>
                <h3 style={{ fontWeight: 600, color: '#fff', marginBottom: 6 }}>Waiting for faculty to start the stream...</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>You will see the active live video feed as soon as class goes live.</p>
              </div>
            ) : !isConnected ? (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔴</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{activeStream?.title} is LIVE</h3>
                <p style={{ color: '#aaa', marginBottom: 20, fontSize: '0.9rem' }}>by {activeStream?.hostName}</p>
                <button
                  onClick={() => setIsConnected(true)}
                  className="btn btn-primary btn-lg font-bold"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                >
                  ▶️ Join Live Stream
                </button>
              </div>
            ) : (
              <>
                {activeStream.streamType === 'youtube' ? (
                  <iframe
                    src={activeStream.youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    title="Live Stream"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{ background: 'rgba(239,68,68,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    🔴 LIVE STREAM
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Lecture Info */}
          <div className="card">
            <h3 className="font-bold mb-xs">📚 Lecture Description & Resources</h3>
            <p className="text-secondary text-sm mb-md">
              {activeStream?.title || 'Live interactive session'} — Ask questions in the live chat for real-time answers from your instructor.
            </p>
            <div className="flex gap-sm flex-wrap">
              <a href="/student/nptel-tests" className="btn btn-primary btn-sm">📝 Attempt Practice Test</a>
              <a href="/student/lectures" className="btn btn-secondary btn-sm">📹 View Recorded Lectures</a>
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Chat */}
        <div className="card flex flex-col" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">💬 Live Class Chat</h3>
            <span className="badge badge-accent text-xs" style={{ animation: isLive ? 'pulse 2s infinite' : 'none' }}>
              {isLive ? '● Real-Time' : '○ Offline'}
            </span>
          </div>

          <div className="p-md flex flex-col gap-sm overflow-y-auto flex-1" style={{ background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
            {(activeStream?.chatMessages || []).length === 0 ? (
              <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: 20 }}>
                {isLive ? 'Be the first to say hello! 👋' : 'Chat is available when the stream is live.'}
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

          <form onSubmit={handleSendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder={isLive ? 'Ask a question in live class...' : 'Stream is offline'}
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
