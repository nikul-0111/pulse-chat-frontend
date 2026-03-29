import { useState, useEffect, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiMic } from "react-icons/fi";

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  onSendMessage,
  onDeleteMessages,
  // New props from ChatPage
  isTyping,
  onStartTyping,
  onStopTyping,
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]); // Scroll when typing starts too

  // ✅ Handle Typing Logic
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    // Emit start typing
    if (onStartTyping) onStartTyping(activeUser._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping(activeUser._id);
    }, 2000);
  };

  const toggleSelect = (id) => {
    setSelectedMsgs((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    onDeleteMessages(selectedMsgs);
    setSelectedMsgs([]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(activeUser._id, input);
    setInput("");
    // Immediately stop typing indicator on send
    if (onStopTyping) onStopTyping(activeUser._id);
  };

  return (
    <div style={s.root}>
      {/* ✅ ACTION BAR */}
      {selectedMsgs.length > 0 && (
        <div style={s.actionBar}>
          <span>{selectedMsgs.length} selected</span>
          <button onClick={handleDelete} style={s.deleteBtn}>
            Delete
          </button>
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {window.innerWidth < 768 && (
            <button onClick={() => window.location.reload()} style={s.iconBtn}>
              ←
            </button>
          )}
          <div>
            <h3 style={{ margin: 0 }}>{activeUser.name}</h3>
            {/* Online Status Text */}
            <span style={{ 
              fontSize: 12, 
              color: activeUser.isOnline ? "#22c55e" : "#64748b" 
            }}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={s.messages}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser._id;
          const isSelected = selectedMsgs.includes(msg._id);

          return (
            <div
              key={msg._id}
              onClick={() => toggleSelect(msg._id)}
              style={{
                ...s.msgRow,
                justifyContent: mine ? "flex-end" : "flex-start",
                background: isSelected ? "#1e293b" : "transparent",
              }}
            >
              <div
                style={{
                  ...s.bubble,
                  background: mine ? "#E8FF47" : "#1e1e1e",
                  color: mine ? "#000" : "#fff",
                }}
              >
                {msg.text}
                <div style={s.time}>{msg.timeLabel}</div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Bubble */}
        {isTyping && (
          <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
            <div style={{ ...s.bubble, background: "#1e1e1e", color: "#22c55e", fontStyle: "italic", fontSize: 13 }}>
              {activeUser.name} is typing...
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div style={s.inputBox}>
        <button style={s.iconBtn}>
          <FiSmile size={20} />
        </button>

        <button style={s.iconBtn}>
          <FiPaperclip size={20} />
        </button>

        <input
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message..."
          style={s.input}
        />

        <button style={s.iconBtn}>
          <FiMic size={20} />
        </button>

        <button onClick={handleSend} style={s.sendBtn}>
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}

const s = {
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0D0D0D",
    height: "100%",
    overflow: "hidden", // Prevents layout shifting
  },

  header: {
    padding: "10px 16px",
    borderBottom: "1px solid #222",
    color: "#fff",
    background: "#0D0D0D",
  },

  actionBar: {
    padding: 10,
    background: "#111827",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },

  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 15px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  msgRow: {
    display: "flex",
    width: "100%",
    cursor: "pointer",
    margin: "2px 0",
  },

  bubble: {
    padding: "8px 12px",
    borderRadius: "14px",
    maxWidth: window.innerWidth < 768 ? "85%" : "70%",
    wordWrap: "break-word",
  },

  time: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "right",
  },

  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "12px 10px",
    borderTop: "1px solid #222",
    background: "#0D0D0D",
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "20px",
    border: "none",
    outline: "none",
    background: "#1e1e1e",
    color: "#fff",
    fontSize: 15,
  },

  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
  },

  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
};