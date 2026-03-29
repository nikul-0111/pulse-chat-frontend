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

  // ✅ Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // ✅ Typing handler
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (onStartTyping) onStartTyping(activeUser._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping(activeUser._id);
    }, 1500);
  };

  // ✅ Send message
  const handleSend = () => {
    if (!input.trim()) return;

    onSendMessage(activeUser._id, input);
    setInput("");

    if (onStopTyping) onStopTyping(activeUser._id);
  };

  return (
    <div style={s.root}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerContent}>
          {isMobile && (
            <button onClick={onBack} style={s.backBtn}>
              <FiChevronLeft size={26} />
            </button>
          )}

          <div>
            <div style={s.name}>{activeUser.name}</div>
            {/* ✅ Dot removed, conditional color applied directly to text */}
            <div style={{ 
              ...s.status, 
              color: activeUser.isOnline ? "#22c55e" : "#64748b" 
            }}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={s.messages} ref={scrollRef}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser?._id;
          const selected = selectedMsgs.includes(msg._id);

          return (
            <div
              key={msg._id}
              style={{
                ...s.row,
                justifyContent: mine ? "flex-end" : "flex-start",
              }}
              onClick={() =>
                setSelectedMsgs((prev) =>
                  prev.includes(msg._id)
                    ? prev.filter((id) => id !== msg._id)
                    : [...prev, msg._id]
                )
              }
            >
              <div
                style={{
                  ...s.bubble,
                  background: mine ? "#E8FF47" : "#1e1e1e",
                  color: mine ? "#000" : "#fff",
                  border: selected ? "2px solid #E8FF47" : "none",
                }}
              >
                <div>{msg.text}</div>
                <div style={s.time}>{msg.timeLabel}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={s.row}>
            <div style={{ ...s.bubble, color: "#22c55e" }}>
              typing...
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={s.inputBox}>
        <div style={s.inputWrap}>
          <FiSmile />
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type message..."
            style={s.input}
          />
          <FiPaperclip />
          <button onClick={handleSend} style={s.send}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */
const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    background: "#0D0D0D",
  },
  header: {
    height: 60,
    borderBottom: "1px solid #222",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  name: {
    color: "#fff",
    fontWeight: 600,
  },
  status: {
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: {
    display: "flex",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 12,
    maxWidth: "80%",
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
    opacity: 0.6,
  },
  inputBox: {
    padding: 10,
    borderTop: "1px solid #222",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#1e1e1e",
    borderRadius: 20,
    padding: "6px 10px",
    gap: 8,
  },
  input: {
    flex: 1,
    border: "none",
    background: "none",
    color: "#fff",
    outline: "none",
  },
  send: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};