import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';

export default function FacultyLiveStudioPage() {
  const { activeStream, endLiveStream, sendChatMessage } = useLiveStream();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const handleEndStream = () => {
    if (window.confirm('Are you sure you want to end this live broadcast?')) {
      endLiveStream();
      navigate('/faculty/dashboard');
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage('Dr. Rajesh Sharma (Faculty)', 'Faculty', chatInput.trim());
    setChatInput('');
  };

  return (
    <ProtectedLayout title="Faculty Live Broadcast Studio" allowedRoles={['faculty', 'admin']}>
      {/* Live Banner Header */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div className="flex items-center gap-md">
            <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              🔴 LIVE BROADCASTING
            </span>
            <div>
              <h2 className="text-xl font-bold">{activeStream?.title || 'Data Structures Live Masterclass'}</h2>
              <p className="text-secondary text-sm">Host: {activeStream?.hostName || 'Dr. Rajesh Sharma'} • Started: {activeStream?.startTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="stat-card p-xs" style={{ minWidth: 140, margin: 0, textAlign: 'center' }}>
              <span className="text-xs text-secondary">Live Viewers</span>
              <div className="font-bold text-lg text-primary">👥 {activeStream?.viewersCount || 42} Watching</div>
            </div>
            <button onClick={handleEndStream} className="btn btn-danger btn-lg font-bold">
              🛑 End Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport & Live Chat */}
      <div className="grid grid-3" style={{ gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        {/* Left: Video Broadcast Viewport */}
        <div className="flex flex-col gap-md">
          <div className="card p-0 overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isCameraOff ? (
              <div className="text-center text-white">
                <div style={{ fontSize: '3rem' }}>📷🚫</div>
                <p className="font-semibold text-muted">Camera Turned Off</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                  🔴 Live HD Webcam Stream
                </div>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="card flex justify-between items-center flex-wrap gap-sm">
            <div className="flex gap-sm">
              <button
                className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? '🎙️ Unmute Mic' : '🎙️ Mute Mic'}
              </button>
              <button
                className={`btn ${isCameraOff ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setIsCameraOff(!isCameraOff)}
              >
                {isCameraOff ? '📹 Turn On Camera' : '📹 Turn Off Camera'}
              </button>
              <button className="btn btn-secondary">
                🖥️ Share Screen
              </button>
            </div>
            <div className="text-xs text-secondary font-semibold">
              Broadcast Status: <span className="text-success">● Signal Excellent (1080p 60fps)</span>
            </div>
          </div>
        </div>

        {/* Right: Live Chat & Q&A Stream */}
        <div className="card flex flex-col justify-between" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-xs">💬 Live Student Q&A Chat</h3>
            <span className="badge badge-accent text-xs">Real-time</span>
          </div>

          {/* Chat Messages Body */}
          <div className="p-md flex flex-col gap-sm overflow-y-auto flex-1" style={{ background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
            {activeStream?.chatMessages?.map((msg) => (
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
            ))}
          </div>

          {/* Send Chat Form */}
          <form onSubmit={handleSendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder="Reply to live stream chat..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Send</button>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
