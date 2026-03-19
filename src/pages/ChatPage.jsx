import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, messagesAPI } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const { user, token, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUserIds, setOnlineIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Load users
  useEffect(() => {
    usersAPI.getAll(token).then(setUsers).catch(console.error);
  }, [token]);

  // Load messages
  useEffect(() => {
    if (!activeUser) return;
    if (messages[activeUser._id]) return;

    setLoadingMsgs(true);
    messagesAPI
      .getConversation(activeUser._id, token)
      .then((msgs) => {
        setMessages((prev) => ({
          ...prev,
          [activeUser._id]: msgs.map(addTimeLabel),
        }));
        messagesAPI.markRead(activeUser._id, token).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeUser?._id, token]);

  // Socket handlers
  const handleMessage = useCallback(
    (msg) => {
      const key =
        msg.senderId === user._id ? msg.receiverId : msg.senderId;

      setMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), addTimeLabel(msg)],
      }));
    },
    [user?._id]
  );

  const handleRead = useCallback(({ messageId }) => {
    setMessages((prev) => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = next[key].map((m) =>
          m._id === messageId ? { ...m, status: "read" } : m
        );
      }
      return next;
    });
  }, []);

  const { sendMessage, startTyping, stopTyping } = useSocket(user?._id, {
    onMessage: handleMessage,
    onMessageSent: handleMessage,
    onTypingStart: (id) =>
      setTypingUsers((p) => ({ ...p, [id]: true })),
    onTypingStop: (id) =>
      setTypingUsers((p) => ({ ...p, [id]: false })),
    onOnlineUsers: (ids) =>
      setOnlineIds(ids.filter((id) => id !== user._id)),
    onRead: handleRead,
  });

  // Send message
  const handleSend = (receiverId, text) => {
    const optimistic = {
      _id: `opt_${Date.now()}`,
      senderId: user._id,
      receiverId,
      text,
      status: "sent",
      createdAt: new Date().toISOString(),
      timeLabel: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), optimistic],
    }));

    sendMessage(receiverId, text);
  };

  const enrichedUsers = users.map((u) => ({
    ...u,
    isOnline: onlineUserIds.includes(u._id),
  }));

  const activeMessages = activeUser
    ? messages[activeUser._id] || []
    : [];

  const isTyping = activeUser
    ? !!typingUsers[activeUser._id]
    : false;

  return (
    <div style={styles.container}>
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={{ margin: 0 }}>💬 Pulse Chat</h2>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        <Sidebar
          users={enrichedUsers}
          messages={messages}
          activeUser={activeUser}
          onSelect={setActiveUser}
          currentUser={user}
          onlineUserIds={onlineUserIds}
        />
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {activeUser ? (
          <ChatWindow
            activeUser={{
              ...activeUser,
              isOnline: onlineUserIds.includes(activeUser._id),
            }}
            messages={activeMessages}
            currentUser={user}
            isTyping={isTyping}
            loading={loadingMsgs}
            onSendMessage={handleSend}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
          />
        ) : (
          <div style={styles.emptyState}>
            <h2>Select a conversation</h2>
            <p>Start chatting with your friends 🚀</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f4f7fb",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "300px",
    background: "#0f172a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "15px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#e5e7eb",
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    color: "#64748b",
  },
};

// Time formatter
function addTimeLabel(msg) {
  return {
    ...msg,
    timeLabel: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  };
}