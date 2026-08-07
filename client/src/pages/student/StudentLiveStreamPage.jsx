import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useAuth } from '../../context/AuthContext';

export default function StudentLiveStreamPage() {
  const { activeStream, sendChatMessage } = useLiveStream();
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [reactions, setReactions] = useState({ likes: 28, helpful: 19 });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(user?.name || 'Student', 'Student', chatInput.trim());
    setChatInput('');
  };

  return (
    <ProtectedLayout title="Live Classroom Stream" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Live Stream Header */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-xs mb-xs">
              <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                🔴 LIVE NOW
              </span>
              <span className="badge badge-accent">{activeStream?.subject || 'DSA & DAA Masterclass'}</span>
            </div>
            <h2 className="text-xl font-bold">{activeStream?.title || 'Data Structures Live Masterclass'}</h2>
            <p className="text-secondary text-sm">Instructor: {activeStream?.hostName || 'Dr. Rajesh Sharma (Faculty)'}</p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setReactions(p => ({ ...p, likes: p.likes + 1 }))}
            >
              👍 {reactions.likes} Likes
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

      {/* Main YouTube Scenario Grid */}
      <div className="grid grid-3" style={{ gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        {/* Left: Live Video Player */}
        <div className="flex flex-col gap-md">
          <div className="card p-0 overflow-hidden" style={{ background: '#000', borderRadius: '12px', aspectRatio: '16/9' }}>
            {activeStream?.streamType === 'youtube' && activeStream?.youtubeUrl ? (
              <iframe
                width="100%"
                height="100%"
                src={activeStream.youtubeUrl}
                title="Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                autoPlay
                loop
                controls
                playsInline
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          <div className="card">
            <h3 className="font-bold mb-xs">📚 Lecture Description & Resources</h3>
            <p className="text-secondary text-sm mb-md">
              In this live interactive session, we cover core algorithmic concepts, recurrence relation solving methods (Master Theorem, Substitution), and step-by-step tree/graph algorithm traces. Feel free to post questions in the live chat!
            </p>
            <div className="flex gap-sm">
              <a href="#notes" className="btn btn-secondary btn-sm">📄 Download Class Handout (PDF)</a>
              <a href="/student/nptel-tests" className="btn btn-primary btn-sm">📝 Attempt Practice NPTEL Test</a>
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Chat Panel */}
        <div className="card flex flex-col justify-between" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-xs">💬 Live Class Chat & Q&A</h3>
            <span className="badge badge-accent text-xs">● Live</span>
          </div>

          {/* Chat Messages */}
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

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder="Ask a question or comment..."
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
