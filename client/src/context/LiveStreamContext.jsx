import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from './AuthContext';

const LiveStreamContext = createContext(null);

export const LiveStreamProvider = ({ children }) => {
  // Active live stream state
  const [activeStream, setActiveStream] = useState({
    isLive: true,
    id: "stream-dsa-live",
    title:
      "Data Structures & Algorithms: Master Graph Algorithms & Dynamic Programming",
    subject: "DSA & DAA Masterclass",
    hostName: "Dr. Rajesh Sharma (Head of CSE)",
    hostRole: "Faculty",
    viewersCount: 42,
    streamType: "webcam", // 'webcam' or 'youtube'
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    startTime: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    chatMessages: [
      {
        id: 1,
        sender: "Priya Verma",
        role: "Student",
        text: "Good evening sir! Will we cover Dijkstra vs Bellman-Ford today?",
        time: "20:30",
      },
      {
        id: 2,
        sender: "Amit Kumar",
        role: "Student",
        text: "Sir can you explain the space complexity of Floyd-Warshall again?",
        time: "20:31",
      },
      {
        id: 3,
        sender: "Dr. Rajesh Sharma",
        role: "Faculty",
        text: "Yes Priya! We are covering Graph Shortest Paths right now.",
        time: "20:32",
      },
    ],
  });

  // Initial uploaded lectures library
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [lecturesLoading, setLecturesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;  // ← user ready hone ka wait karo
    const fetchLectures = async () => {
      try {
        const res = await API.get('/lectures');
        setLectures(res.data.lectures || []);
      } catch (err) {
        console.warn('Lectures fetch failed:', err?.message);
      } finally {
        setLecturesLoading(false);
      }
    };
    fetchLectures();
  }, [user]);  // ← user change hone pe fetch karo

  // Start a new live stream
  const startLiveStream = (streamDetails) => {
    const newStream = {
      isLive: true,
      id: `stream-${Date.now()}`,
      title: streamDetails.title,
      subject: streamDetails.subject || "Placement Special",
      hostName: streamDetails.hostName || "Faculty",
      hostRole: "Faculty",
      viewersCount: 1,
      streamType: streamDetails.streamType || "webcam",
      youtubeUrl: streamDetails.youtubeUrl || "",
      startTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      chatMessages: [
        {
          id: 1,
          sender: streamDetails.hostName || "Faculty",
          role: "Faculty",
          text: "Welcome everyone! Live class has started.",
          time: "Just now",
        },
      ],
    };
    setActiveStream(newStream);
  };

  // End active live stream
  const endLiveStream = () => {
    if (activeStream) {
      setActiveStream((prev) => ({ ...prev, isLive: false }));
    }
  };

  // Add message to live chat
  const sendChatMessage = (senderName, role, messageText) => {
    if (!activeStream || !activeStream.isLive) return;
    const msg = {
      id: Date.now(),
      sender: senderName,
      role: role,
      text: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setActiveStream((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg],
    }));
  };

  // Upload a new video lecture
  const uploadLecture = (newLecture) => {
    const lectureObj = {
      id: `lec-${Date.now()}`,
      title: newLecture.title,
      subject: newLecture.subject || "General",
      faculty: newLecture.faculty || "Faculty",
      date: new Date().toISOString().split("T")[0],
      duration: newLecture.duration || "30 mins",
      videoUrl:
        newLecture.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail:
        newLecture.thumbnail ||
        "https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80",
      description: newLecture.description || "",
      tags: newLecture.tags
        ? newLecture.tags.split(",").map((t) => t.trim())
        : ["Lecture"],
    };
    setLectures((prev) => [lectureObj, ...prev]);
  };

  return (
    <LiveStreamContext.Provider
      value={{
        activeStream,
        startLiveStream,
        endLiveStream,
        sendChatMessage,
        lectures,
        lecturesLoading,
        uploadLecture,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context)
    throw new Error("useLiveStream must be used within LiveStreamProvider");
  return context;
};
