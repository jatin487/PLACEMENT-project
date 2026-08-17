import { createContext, useContext, useState, useEffect } from 'react';
import { lectureAPI } from '../services/api';

const LiveStreamContext = createContext(null);

const DEFAULT_STREAM = {
  isLive: false,
  id: 'stream-dsa-live',
  title: 'Data Structures & Algorithms: Master Graph Algorithms & Dynamic Programming',
  subject: 'DSA & DAA Masterclass',
  hostName: 'Dr. Rajesh Sharma (Head of CSE)',
  hostRole: 'Faculty',
  viewersCount: 42,
  streamType: 'webcam', // 'webcam' or 'youtube'
  youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  chatMessages: [
    { id: 1, sender: 'Priya Verma', role: 'Student', text: 'Good evening sir! Will we cover Dijkstra vs Bellman-Ford today?', time: '20:30' },
    { id: 2, sender: 'Amit Kumar', role: 'Student', text: 'Sir can you explain the space complexity of Floyd-Warshall again?', time: '20:31' },
    { id: 3, sender: 'Dr. Rajesh Sharma', role: 'Faculty', text: 'Yes Priya! We are covering Graph Shortest Paths right now.', time: '20:32' },
  ],
};

export const LiveStreamProvider = ({ children }) => {
  // Active live stream state (loads from localStorage if present)
  const [activeStream, setActiveStream] = useState(() => {
    try {
      const saved = localStorage.getItem('pp_active_stream');
      return saved ? JSON.parse(saved) : DEFAULT_STREAM;
    } catch {
      return DEFAULT_STREAM;
    }
  });

  // Initial uploaded lectures library (synced with MySQL backend)
  const [lectures, setLectures] = useState([
    {
      id: 'lec-1',
      title: 'Complete Guide to Dynamic Programming & Memoization',
      subject: 'DAA',
      faculty: 'Dr. Rajesh Sharma',
      date: '2026-08-05',
      duration: '45 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      description: 'Master 1D and 2D DP patterns including Knapsack, LCS, and Matrix Chain Multiplication.',
      tags: ['DP', 'DAA', 'Algorithms']
    },
    {
      id: 'lec-2',
      title: 'Advanced Graph Theory: Tarjan & Kosaraju Algorithms',
      subject: 'DSA',
      faculty: 'Prof. Ananya Gupta',
      date: '2026-08-04',
      duration: '52 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      description: 'Deep dive into Strongly Connected Components (SCC), Topological Sorting, and Bridges.',
      tags: ['Graphs', 'DSA', 'Algorithms']
    },
    {
      id: 'lec-3',
      title: 'Mastering System Design & Distributed Systems',
      subject: 'System Design',
      faculty: 'Dr. Rajesh Sharma',
      date: '2026-08-02',
      duration: '60 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      description: 'High Availability, Load Balancing, Consistent Hashing, and Microservices Architecture.',
      tags: ['System Design', 'Placement Prep']
    }
  ]);

  // Persist active stream & sync with BroadcastChannel
  useEffect(() => {
    try {
      localStorage.setItem('pp_active_stream', JSON.stringify(activeStream));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [activeStream]);

  // Listen to cross-tab updates via BroadcastChannel or storage event
  useEffect(() => {
    let bc;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('placement_livestream_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'STREAM_UPDATE') {
          setActiveStream(event.data.payload);
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === 'pp_active_stream' && e.newValue) {
        try {
          setActiveStream(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      bc?.close();
    };
  }, []);

  const broadcastStreamUpdate = (updatedStream) => {
    setActiveStream(updatedStream);
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('placement_livestream_channel');
        bc.postMessage({ type: 'STREAM_UPDATE', payload: updatedStream });
        bc.close();
      }
    } catch {}
  };

  // Fetch lectures from MySQL backend on mount
  const refreshLectures = async () => {
    try {
      const res = await lectureAPI.getAll();
      if (res.data?.data && res.data.data.length > 0) {
        setLectures(res.data.data);
      }
    } catch (err) {
      console.info('Backend lectures offline, using current state.');
    }
  };

  useEffect(() => {
    refreshLectures();
  }, []);

  // Start a new live stream
  const startLiveStream = (streamDetails) => {
    const newStream = {
      isLive: true,
      id: `stream-${Date.now()}`,
      title: streamDetails.title || 'Live Interactive Lecture',
      subject: streamDetails.subject || 'Placement Special',
      hostName: streamDetails.hostName || 'Faculty Instructor',
      hostRole: 'Faculty',
      viewersCount: Math.floor(Math.random() * 10) + 1,
      streamType: streamDetails.streamType || 'webcam',
      youtubeUrl: streamDetails.youtubeUrl || '',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chatMessages: [
        { id: 1, sender: streamDetails.hostName || 'Faculty', role: 'Faculty', text: '🎙️ Welcome everyone! Live broadcast is now started.', time: 'Just now' }
      ]
    };
    broadcastStreamUpdate(newStream);
  };

  // End active live stream
  const endLiveStream = () => {
    const closed = { ...activeStream, isLive: false };
    broadcastStreamUpdate(closed);
  };

  // Add message to live chat
  const sendChatMessage = (senderName, role, messageText) => {
    if (!messageText?.trim()) return;
    const msg = {
      id: Date.now(),
      sender: senderName || 'Student',
      role: role || 'Student',
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = {
      ...activeStream,
      chatMessages: [...(activeStream?.chatMessages || []), msg]
    };
    broadcastStreamUpdate(updated);
  };

  // Upload a new video lecture (persists to MySQL + state)
  const uploadLecture = async (newLecture) => {
    const lectureObj = {
      id: `lec-${Date.now()}`,
      title: newLecture.title,
      subject: newLecture.subject || 'General',
      faculty: newLecture.faculty || 'Faculty Member',
      date: newLecture.date || new Date().toISOString().split('T')[0],
      duration: newLecture.duration || '30 mins',
      videoUrl: newLecture.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: newLecture.thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      description: newLecture.description || '',
      tags: newLecture.tags ? (Array.isArray(newLecture.tags) ? newLecture.tags : newLecture.tags.split(',').map(t => t.trim())) : ['Lecture']
    };

    try {
      const res = await lectureAPI.create(lectureObj);
      if (res.data?.data) {
        setLectures(prev => [res.data.data, ...prev.filter(l => l.id !== res.data.data.id)]);
        return res.data.data;
      }
    } catch (err) {
      console.warn('Could not persist lecture to backend, saved in memory:', err?.message);
    }

    setLectures(prev => [lectureObj, ...prev]);
    return lectureObj;
  };

  // Delete lecture
  const deleteLecture = async (id) => {
    try {
      await lectureAPI.delete(id);
    } catch (err) {
      console.warn('Could not delete from backend:', err?.message);
    }
    setLectures(prev => prev.filter(l => l.id !== id));
  };

  return (
    <LiveStreamContext.Provider value={{
      activeStream,
      startLiveStream,
      endLiveStream,
      sendChatMessage,
      lectures,
      uploadLecture,
      deleteLecture,
      refreshLectures
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context) throw new Error('useLiveStream must be used within LiveStreamProvider');
  return context;
};
