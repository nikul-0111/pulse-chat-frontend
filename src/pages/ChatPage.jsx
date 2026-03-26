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

  // ✅ Delete messages
  const handleDeleteMessages = async (ids) => {
    if (!activeUser) return;

    const oldMessages = messages[activeUser._id] || [];

    setMessages((prev) => ({
      ...prev,
      [activeUser._id]: oldMessages.filter((m) => !ids.includes(m._id)),
    }));

    try {
      await messagesAPI.deleteMessages(ids, token);
    } catch (err) {
      console.error("Delete failed:", err.message);
      setMessages((prev) => ({
        ...prev,
        [activeUser._id]: oldMessages,
      }));
    }
  };

  // ✅ Load users
  useEffect(() => {
    usersAPI.getAll(token).then(setUsers).catch(console.error);
  }, [token]);

  // ✅ Load messages
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

        messagesAPI.markRead(activeUser._id, token).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeUser?._id, token]);

  // ✅ Handle incoming message
  const handleMessage = useCallback(
    (msg) => {
      const key = msg.senderId === user._id ? msg.receiverId : msg.senderId;

      setMessages((prev) => {
        const existing = prev[key] || [];
        if (existing.some((m) => m._id === msg._id)) return prev;

        return {
          ...prev,
          [key]: [...existing, addTimeLabel(msg)],
        };
      });
    },
    [user?._id]
  );

  // ✅ Handle read
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

  // ✅ SOCKET
  const { sendMessage, startTyping, stopTyping } = useSocket(user?._id, {
    onMessage: handleMessage,
    onMessageSent: handleMessage,
    onTypingStart: (id) => setTypingUsers((p) => ({ ...p, [id]: true })),
    onTypingStop: (id) => setTypingUsers((p) => ({ ...p, [id]: false })),
    onOnlineUsers: (ids) => setOnlineIds(ids.filter((id) => id !== user._id)),
    onRead: handleRead,
  });

  // ✅ Send message
  const handleSend = (receiverId, text) => {
    sendMessage(receiverId, text);
  };

  const enrichedUsers = users.map((u) => ({
    ...u,
    isOnline: onlineUserIds.includes(u._id),
  }));

  const activeMessages = activeUser ? messages[activeUser._id] || [] : [];
  const isTyping = activeUser ? !!typingUsers[activeUser._id] : false;

  return (
    <div style={styles.container}>
      {selectedProfile ? (
        <UserProfile
          user={selectedProfile}
          onBack={() => setSelectedProfile(null)}
          onStartChat={(u) => {
            setSelectedProfile(null);
            setActiveUser(u);
          }}
        />
      ) : (
        <>
          {/* Sidebar */}
          {(!activeUser || window.innerWidth >= 768) && (
            <Sidebar
              users={enrichedUsers}
              messages={messages}
              activeUser={activeUser}
              onSelect={setActiveUser}
              onOpenProfile={setSelectedProfile}
              currentUser={user}
              onlineUserIds={onlineUserIds}
              onLogout={logout}
            />
          )}

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
                onDeleteMessages={handleDeleteMessages}
              />
            ) : (
              <div style={styles.emptyState}>
                <h2>Select a conversation</h2>
                <p>Start chatting 🚀</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    flexDirection: window.innerWidth < 768 ? "column" : "row",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    color: "#94a3b8",
  },
};

// Add time labels to messages
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