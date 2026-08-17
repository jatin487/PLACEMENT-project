import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useLiveStream } from '../../context/LiveStreamContext';
import UploadLectureModal from '../../components/faculty/UploadLectureModal';

export default function LecturesPage() {
  const { lectures, deleteLecture } = useLiveStream();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Get current user role
  const userRole = localStorage.getItem('pp_user')
    ? JSON.parse(localStorage.getItem('pp_user'))?.role
    : 'student';

  const isTeacherOrAdmin = userRole === 'faculty' || userRole === 'admin';

  const filteredLectures = lectures.filter(lec => {
    const matchesSubject = selectedSubject === 'All' || lec.subject === selectedSubject;
    const matchesSearch = (lec.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lec.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lec.faculty || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Helper to extract YouTube embed URL if applicable
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    return null;
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteLecture(id);
    }
  };

  return (
    <ProtectedLayout title="Video Lectures Library" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Header & Search Bar */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.12) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-xs">
              <h2 className="text-xl font-bold">📹 Video Lectures & Masterclasses</h2>
              <span className="badge badge-primary">{filteredLectures.length} Videos</span>
            </div>
            <p className="text-secondary text-sm mt-xs">
              Watch uploaded video lectures, course masterclasses, and algorithmic tutorials.
            </p>
          </div>
          
          <div className="flex gap-sm items-center flex-wrap">
            <input
              className="form-input"
              style={{ width: 200 }}
              placeholder="Search lectures, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: 160 }}
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="DSA">DSA</option>
              <option value="DAA">DAA</option>
              <option value="DBMS">DBMS</option>
              <option value="System Design">System Design</option>
              <option value="Placement Prep">Placement Prep</option>
            </select>

            {/* Upload Video Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary flex items-center gap-xs"
              style={{ fontWeight: 700 }}
            >
              📤 Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
        }}>
          <div className="card animate-fadeInUp" style={{
            width: '100%', maxWidth: 880, background: 'var(--bg-card)', padding: 0,
            overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border-color)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div className="p-md flex justify-between items-center border-b" style={{ background: 'var(--bg-card)' }}>
              <div>
                <span className="badge badge-primary">{activeVideo.subject}</span>
                <h3 className="font-bold text-lg mt-xs">{activeVideo.title}</h3>
                <p className="text-xs text-secondary mt-xs">
                  👨‍🏫 {activeVideo.faculty} • 📅 {activeVideo.date} • ⏱️ {activeVideo.duration}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveVideo(null)}
                style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
            
            {/* Player Container */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              {getEmbedUrl(activeVideo.videoUrl) ? (
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  autoPlay
                  controls
                  controlsList="nodownload"
                  playsInline
                  src={activeVideo.videoUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  Your browser does not support playing this video format.
                </video>
              )}
            </div>

            {/* Video Details */}
            <div className="p-md" style={{ background: 'var(--bg-card)' }}>
              {activeVideo.description && (
                <>
                  <h4 className="font-bold text-sm mb-xs text-secondary">Description & Highlights:</h4>
                  <p className="text-sm text-primary mb-sm leading-relaxed">{activeVideo.description}</p>
                </>
              )}
              
              <div className="flex gap-xs flex-wrap items-center justify-between mt-sm pt-sm border-t">
                <div className="flex gap-xs flex-wrap">
                  {(activeVideo.tags || []).map((t, idx) => (
                    <span key={idx} className="badge badge-accent text-xs">#{t}</span>
                  ))}
                </div>
                
                {isTeacherOrAdmin && (
                  <button
                    onClick={(e) => {
                      handleDelete(e, activeVideo.id, activeVideo.title);
                      setActiveVideo(null);
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    🗑️ Delete Lecture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="card p-xl text-center flex flex-col items-center justify-center">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📹</div>
          <h3 className="font-bold text-lg">No video lectures found</h3>
          <p className="text-sm text-secondary mt-xs mb-md">
            No lectures match your current filters. Be the first to upload one!
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            + Upload First Video Lecture
          </button>
        </div>
      ) : (
        <div className="grid grid-3 gap-md">
          {filteredLectures.map(lec => (
            <div
              key={lec.id}
              className="card flex flex-col justify-between"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setActiveVideo(lec)}
            >
              <div>
                {/* Thumbnail container */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0f172a' }}>
                  <img
                    src={lec.thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80'}
                    alt={lec.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  
                  {/* Duration Badge */}
                  <div style={{
                    position: 'absolute', bottom: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.85)', padding: '3px 8px',
                    borderRadius: '6px', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    ⏱️ {lec.duration || '45 mins'}
                  </div>

                  {/* Play Button Overlay */}
                  <div
                    style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: 'var(--color-primary)', border: '2px solid rgba(255,255,255,0.8)',
                      color: '#fff', fontSize: '1.2rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    ▶
                  </div>
                </div>

                {/* Content */}
                <div className="p-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="badge badge-accent text-xs font-semibold">{lec.subject}</span>
                    <span className="text-xs text-secondary">{lec.date}</span>
                  </div>
                  <h3 className="font-bold text-md mb-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {lec.title}
                  </h3>
                  <p
                    className="text-xs text-secondary mb-sm"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {lec.description || 'No description provided.'}
                  </p>
                  <div className="text-xs text-muted font-semibold">👨‍🏫 {lec.faculty}</div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-md border-t flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.02)' }}>
                <div className="flex gap-xs flex-wrap">
                  {(Array.isArray(lec.tags) ? lec.tags : []).slice(0, 2).map((t, idx) => (
                    <span key={idx} className="badge badge-muted text-xs">#{t}</span>
                  ))}
                </div>
                
                <div className="flex items-center gap-xs">
                  {isTeacherOrAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, lec.id, lec.title)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                      title="Delete video"
                    >
                      🗑️
                    </button>
                  )}
                  <button
                    onClick={() => setActiveVideo(lec)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    ▶ Watch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Video Modal */}
      <UploadLectureModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </ProtectedLayout>
  );
}
