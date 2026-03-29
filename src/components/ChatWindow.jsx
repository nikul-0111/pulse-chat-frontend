import { useState, useEffect, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiMic, FiChevronLeft } from "react-icons/fi";

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  onSendMessage,
  onDeleteMessages,
  isTyping,
  onStartTyping,
  onStopTyping,
  onBack, // Add this prop to handle going back to list on mobile
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (onStartTyping) onStartTyping(activeUser._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping(activeUser._id);
    }, 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(activeUser._id, input);
    setInput("");
    if (onStopTyping) onStopTyping(activeUser._id);
  };

  return (
    <div style={s.root}>
      {/* ACTION BAR */}
      {selectedMsgs.length > 0 && (
        <div style={s.actionBar}>
          <span>{selectedMsgs.length} selected</span>
          <button onClick={() => {
            onDeleteMessages(selectedMsgs);
            setSelectedMsgs([]);
          }} style={s.deleteBtn}>Delete</button>
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Use onBack prop instead of reload to keep app state */}
          <button onClick={onBack} style={s.mobileBackBtn}>
            <FiChevronLeft size={24} />
          </button>
          
          <div style={{ lineHeight: 1.2 }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{activeUser.name}</h3>
            <span style={{ 
              fontSize: "11px", 
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
              onClick={() => setSelectedMsgs(prev => 
                prev.includes(msg._id) ? prev.filter(id => id !== msg._id) : [...prev, msg._id]
              )}
              style={{
                ...s.msgRow,
                justifyContent: mine ? "flex-end" : "flex-start",
                background: isSelected ? "rgba(30, 41, 59, 0.5)" : "transparent",
              }}
            >
              <div style={{
                  ...s.bubble,
                  background: mine ? "#E8FF47" : "#1e1e1e",
                  color: mine ? "#000" : "#fff",
                  borderBottomRightRadius: mine ? "2px" : "14px",
                  borderBottomLeftRadius: mine ? "14px" : "2px",
                }}>
                {msg.text}
                <div style={{...s.time, color: mine ? "rgba(0,0,0,0.5)" : "#64748b"}}>{msg.timeLabel}</div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={s.msgRow}>
            <div style={{ ...s.bubble, background: "#1e1e1e", color: "#22c55e", fontSize: "12px" }}>
              typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div style={s.inputBox}>
        {/* Hide extra icons on very small screens to give input more room */}
        <div style={s.inputActions}>
           <button style={s.iconBtn}><FiSmile size={20} /></button>
           <button style={s.iconBtn}><FiPaperclip size={20} /></button>
        </div>

        <input
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message..."
          style={s.input}
        />

        <button onClick={handleSend} style={s.sendBtn}>
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    background: "#0D0D0D",
    // Use dvh (dynamic viewport height) for better mobile browser support
    height: "100dvh", 
    width: "100%",
    position: "relative",
  },
  header: {
    padding: "10px 12px",
    borderBottom: "1px solid #222",
    color: "#fff",
    background: "#0D0D0D",
    zIndex: 10,
  },
  mobileBackBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    padding: "4px",
    marginRight: "4px",
    cursor: "pointer",
    display: window.innerWidth < 768 ? "flex" : "none",
    alignItems: "center",
  },
  actionBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    padding: "12px",
    background: "#111827",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "600",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    // Hide scrollbar but keep functionality
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },
  msgRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "85%", // Increased for mobile readability
    fontSize: "15px",
    wordBreak: "break-word",
  },
  time: {
    fontSize: "9px",
    marginTop: "4px",
    textAlign: "right",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    borderTop: "1px solid #222",
    background: "#0D0D0D",
    paddingBottom: "env(safe-area-inset-bottom, 10px)", // Support for iPhone notches
  },
  inputActions: {
    display: window.innerWidth < 400 ? "none" : "flex",
    gap: "4px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "24px",
    border: "none",
    outline: "none",
    background: "#1e1e1e",
    color: "#fff",
    fontSize: "16px", // Prevents iOS auto-zoom on focus
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    padding: "8px",
    display: "flex",
  },
  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#000",
  },
};