import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, messagesAPI } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import UserProfile from "./UserProfile";

export default function ChatPage() {
  const { user, token, logout } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUserIds, setOnlineIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [vh, setVh] = useState(window.visualViewport ? window.visualViewport.height : window.innerHeight);

  // Resize logic for mobile height
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setVh(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all users
  useEffect(() => {
    usersAPI.getAll(token).then(setUsers).catch(console.error);
  }, [token]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeUser) return;
    setLoadingMsgs(true);
    messagesAPI.getConversation(activeUser._id, token)
      .then((msgs) => {
        setMessages((prev) => ({
          ...prev,
          [activeUser._id]: msgs.map(addTimeLabel),
        }));
        messagesAPI.markRead(activeUser._id, token).catch(() => {});
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeUser?._id, token]);

  // Handler for incoming messages and confirmations
  const handleMessage = useCallback((msg) => {
    const key = msg.senderId === user._id ? msg.receiverId : msg.senderId;
    setMessages((prev) => {
      const existing = prev[key] || [];
      // Prevent duplicate messages (especially replacing temp IDs with real DB IDs)
      if (existing.some((m) => m._id === msg._id)) return prev;
      
      // Remove any temporary "sending" messages if this is the real confirmation from server
      const filtered = existing.filter(m => !m._id.toString().startsWith("temp-"));
      return { ...prev, [key]: [...filtered, addTimeLabel(msg)] };
    });
  }, [user?._id]);

  const handleRead = useCallback(({ messageId }) => {
    setMessages((prev) => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = next[key].map((m) => m._id === messageId ? { ...m, status: "read" } : m);
      }
      return next;
    });
  }, []);

  // Socket Hook
  const { sendMessage, startTyping, stopTyping } = useSocket(user?._id, {
    onMessage: handleMessage,
    onMessageSent: handleMessage,
    onTypingStart: (id) => setTypingUsers((p) => ({ ...p, [id]: true })),
    onTypingStop: (id) => setTypingUsers((p) => ({ ...p, [id]: false })),
    onOnlineUsers: (ids) => setOnlineIds(ids.filter((id) => id !== user._id)),
    onRead: handleRead,
  });

  // ✅ FINAL REFINED handleSend
  const handleSend = (receiverId, text, imageData = null) => {
    // 1. Handle Image Uploads (imageData will be Base64 from ChatWindow)
    if (imageData) {
      // Instant UI update for the sender
      const tempMsg = {
        _id: "temp-" + Date.now(),
        senderId: user._id,
        receiverId: receiverId,
        text: "",
        imageUrl: imageData,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), addTimeLabel(tempMsg)],
      }));

      // Send to server via socket
      sendMessage(receiverId, "", imageData);
    } 
    // 2. Handle Plain Text
    else if (text.trim()) {
      sendMessage(receiverId, text, null);
    }
  };

  const enrichedUsers = users.map((u) => ({ ...u, isOnline: onlineUserIds.includes(u._id) }));
  const activeMessages = activeUser ? messages[activeUser._id] || [] : [];

  return (
    <div style={{ ...styles.container, flexDirection: isMobile ? "column" : "row", height: `${vh}px` }}>
      {selectedProfile ? (
        <UserProfile user={selectedProfile} onBack={() => setSelectedProfile(null)} onStartChat={(u) => { setSelectedProfile(null); setActiveUser(u); }} />
      ) : (
        <>
          {(!isMobile || !activeUser) && (
            <Sidebar users={enrichedUsers} messages={messages} activeUser={activeUser} onSelect={setActiveUser} onOpenProfile={setSelectedProfile} currentUser={user} onlineUserIds={onlineUserIds} onLogout={logout} />
          )}
          {(!isMobile || activeUser) && (
            <div style={styles.chatArea}>
              {activeUser ? (
                <ChatWindow 
                  activeUser={{ ...activeUser, isOnline: onlineUserIds.includes(activeUser._id) }}
                  messages={activeMessages} 
                  currentUser={user} 
                  isTyping={!!typingUsers[activeUser._id]} 
                  loading={loadingMsgs} 
                  onSendMessage={handleSend} 
                  onStartTyping={startTyping} 
                  onStopTyping={stopTyping} 
                  onBack={isMobile ? () => setActiveUser(null) : null} 
                />
              ) : (
                !isMobile && <div style={styles.emptyState}><h2>Select a conversation</h2><p>Start chatting 🚀</p></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", width: "100vw", overflow: "hidden", position: "fixed", top: 0, left: 0, background: "#000" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", height: "100%", width: "100%" },
  emptyState: { margin: "auto", textAlign: "center", color: "#94a3b8" },
};

function addTimeLabel(msg) {
  return { ...msg, timeLabel: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "" };
}