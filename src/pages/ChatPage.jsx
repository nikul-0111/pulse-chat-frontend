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

 const handleDeleteMessages = async (ids) => {
  if (!activeUser) return;

  // 🔹 backup old messages (for rollback)
  const oldMessages = messages[activeUser._id] || [];

  // 🔹 optimistic UI update
  setMessages((prev) => {
    const updated = { ...prev };
    updated[activeUser._id] = oldMessages.filter(
      (msg) => !ids.includes(msg._id)
    );
    return updated;
  });

  try {
    console.log("Deleting IDs:", ids);
    console.log("TOKEN:", token);

    // 🔹 call backend
    await messagesAPI.deleteMessages(ids, token);

  } catch (err) {
    console.error("Delete failed:", err.message);

    // ❌ rollback if failed
    setMessages((prev) => ({
      ...prev,
      [activeUser._id]: oldMessages,
    }));
  }
};

  // Load users
  useEffect(() => {
    usersAPI.getAll(token).then(setUsers).catch(console.error);
  }, [token]);

  // Load messages
  useEffect(() => {
    if (!activeUser) return;

    setLoadingMsgs(true);

    messagesAPI
      .getConversation(activeUser._id, token)
      .then((msgs) => {
        setMessages((prev) => ({
          ...prev,
          [activeUser._id]: msgs.map(addTimeLabel),
        }));

        // mark read in backend
        messagesAPI.markRead(activeUser._id, token).catch(() => {});

        // instant UI update
        setMessages((prev) => {
          const updated = { ...prev };
          updated[activeUser._id] = (updated[activeUser._id] || []).map((m) =>
            m.senderId === activeUser._id
              ? { ...m, status: "read" }
              : m
          );
          return updated;
        });
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
      <Sidebar
        users={enrichedUsers}
        messages={messages}
        activeUser={activeUser}
        onSelect={setActiveUser}
        currentUser={user}
        onlineUserIds={onlineUserIds}
        onLogout={logout}
      />

      {/* Chat */}
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
            onDeleteMessages={handleDeleteMessages} // ✅ IMPORTANT
          />
        ) : (
          <div style={styles.emptyState}>
            <h2>Select a conversation</h2>
            <p>Start chatting 🚀</p>
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
    background: "#0b0f19",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    color: "#94a3b8",
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