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
  onBack, 
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle mobile detection and window resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Stable Scroll-to-bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
      {/* STABLE HEADER */}
      <div style={s.header}>
        <div style={s.headerContent}>
          {isMobile && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }} 
              style={s.mobileBackBtn}
            >
              <FiChevronLeft size={28} />
            </button>
          )}
          
          <div style={s.userInfo}>
            <h3 style={s.userName}>{activeUser.name}</h3>
            <div style={s.statusWrapper}>
              <div style={{...s.statusDot, background: activeUser.isOnline ? "#22c55e" : "#64748b"}} />
              <span style={s.statusText}>
                {activeUser.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA - Scrollable container */}
      <div style={s.messages} ref={scrollRef}>
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
              }}
            >
              <div style={{
                  ...s.bubble,
                  background: mine ? "#E8FF47" : "#1e1e1e",
                  color: mine ? "#000" : "#fff",
                  borderBottomRightRadius: mine ? "2px" : "14px",
                  borderBottomLeftRadius: mine ? "14px" : "2px",
                  border: isSelected ? "2px solid #E8FF47" : "none"
                }}>
                <div style={s.msgText}>{msg.text}</div>
                <div style={{...s.time, color: mine ? "rgba(0,0,0,0.6)" : "#888"}}>
                  {msg.timeLabel}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={s.msgRow}>
            <div style={{ ...s.bubble, background: "#1e1e1e", color: "#22c55e" }}>
              <span className="typing-loader">typing...</span>
            </div>
          </div>
        )}
      </div>

      {/* STABLE INPUT BOX - Fixed at bottom */}
      <div style={s.inputBox}>
        <div style={s.inputWrapper}>
          <button style={s.iconBtn}><FiSmile size={22} /></button>
          <input
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            style={s.input}
          />
          <button style={s.iconBtn}><FiPaperclip size={22} /></button>
          <button onClick={handleSend} style={s.sendBtn}>
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    background: "#0D0D0D",
    height: "100dvh", // Dynamic Viewport Height for mobile browsers
    width: "100%",
    position: "relative",
    overflow: "hidden", // Prevents whole page from bouncing
  },
  header: {
    padding: "0 16px",
    height: "65px",
    borderBottom: "1px solid #222",
    background: "#0D0D0D",
    display: "flex",
    alignItems: "center",
    zIndex: 100,
  },
  headerContent: {
    display: "flex", 
    alignItems: "center", 
    gap: "10px",
    width: "100%"
  },
  mobileBackBtn: {
    background: "none",
    border: "none",
    color: "#fff", 
    padding: "5px",
    marginRight: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    margin: 0, 
    fontSize: "16px", 
    fontWeight: "600",
    color: "#fff"
  },
  statusWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%"
  },
  statusText: {
    fontSize: "12px",
    color: "#64748b"
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    WebkitOverflowScrolling: "touch", // Smooth scroll for iOS
  },
  msgRow: {
    display: "flex",
    width: "100%",
    marginBottom: "4px"
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "85%", // Better use of space on small screens
    position: "relative",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
  },
  msgText: {
    fontSize: "15px",
    lineHeight: "1.4",
    wordBreak: "break-word"
  },
  time: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
    fontWeight: "500"
  },
  inputBox: {
    padding: "10px 12px",
    background: "#0D0D0D",
    borderTop: "1px solid #222",
    // Handles iPhone bottom home bar area
    paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))", 
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#1e1e1e",
    borderRadius: "25px",
    padding: "5px 10px",
    gap: "5px"
  },
  input: {
    flex: 1,
    padding: "10px 5px",
    border: "none",
    background: "none",
    color: "#fff",
    fontSize: "16px", // Prevents browser zoom on iOS focus
    outline: "none"
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    padding: "8px",
    cursor: "pointer",
    display: "flex"
  },
  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    cursor: "pointer",
    marginLeft: "5px"
  },
};