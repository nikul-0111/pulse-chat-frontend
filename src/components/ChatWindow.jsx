import { useState, useEffect, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiChevronLeft } from "react-icons/fi";

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  onSendMessage,
  onDeleteMessages,
  isTyping,
  onStartTyping,
  onStopTyping,
  onBack, // This MUST set activeUser to null in your parent component
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
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
      {/* ACTION BAR (FOR DELETING) */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* BACK BUTTON: Only shows on mobile */}
          <button onClick={onBack} style={s.mobileBackBtn}>
            <FiChevronLeft size={28} />
          </button>
          
          <div style={{ lineHeight: 1.2 }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "600" }}>
              {activeUser.name}
            </h3>
            <span style={{ 
              fontSize: "12px", 
              color: activeUser.isOnline ? "#22c55e" : "#64748b" 
            }}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div style={s.messages}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser?._id;
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
                background: isSelected ? "rgba(255, 255, 255, 0.1)" : "transparent",
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
                <div style={{
                  ...s.time, 
                  color: mine ? "rgba(0,0,0,0.5)" : "#64748b"
                }}>
                  {msg.timeLabel}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={s.msgRow}>
            <div style={{ ...s.bubble, background: "#1e1e1e", color: "#22c55e", fontSize: "13px" }}>
              typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BOX */}
      <div style={s.inputBox}>
        <button style={s.iconBtn}><FiSmile size={22} /></button>
        <button style={s.iconBtn}><FiPaperclip size={22} /></button>

        <input
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={s.input}
        />

        <button onClick={handleSend} style={s.sendBtn}>
          <FiSend size={20} />
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
    height: "100dvh", 
    width: "100%",
    position: "relative",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #222",
    background: "#0D0D0D",
    color: "#fff",
    zIndex: 10,
  },
  mobileBackBtn: {
    background: "none",
    border: "none",
    color: "#E8FF47", // Yellowish to match your theme
    padding: "4px",
    marginLeft: "-8px",
    cursor: "pointer",
    // Shows only on screens smaller than 768px
    display: window.innerWidth < 768 ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    padding: "12px 16px",
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
    padding: "8px 16px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  msgRow: {
    display: "flex",
    width: "100%",
    padding: "2px 0",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "80%",
    fontSize: "15px",
    wordBreak: "break-word",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  time: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    background: "#0D0D0D",
    borderTop: "1px solid #222",
    paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "25px",
    border: "none",
    outline: "none",
    background: "#1e1e1e",
    color: "#fff",
    fontSize: "16px", // Critical to prevent auto-zoom on mobile
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    padding: "4px",
  },
  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    color: "#000",
  },
};