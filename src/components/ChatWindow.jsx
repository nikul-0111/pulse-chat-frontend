import { useState, useEffect, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiChevronLeft } from "react-icons/fi";

const Ticks = ({ status, isOnline }) => {
  if (status === "read") {
    return (
      <span style={{ color: "#22c55e", marginLeft: 4, display: "flex", alignItems: "center" }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z" />
        </svg>
      </span>
    );
  }
  return (
    <span style={{ color: "#64748b", marginLeft: 4, display: "flex", alignItems: "center" }}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        {isOnline ? (
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z" />
        ) : (
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        )}
      </svg>
    </span>
  );
};

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  onSendMessage,
  isTyping,
  onStartTyping,
  onStopTyping,
  onBack,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (onStartTyping) onStartTyping(activeUser._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping(activeUser._id);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(activeUser._id, input); // Sends text
    setInput("");
    if (onStopTyping) onStopTyping(activeUser._id);
  };

  const handleGalleryOpen = () => {
    fileInputRef.current.click();
  };

  // ✅ CRITICAL FIX: Convert file to Base64 before emitting
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // This 'reader.result' is the string the backend is looking for
        onSendMessage(activeUser._id, "", reader.result); 
      };
      reader.readAsDataURL(file);
      e.target.value = null; // Reset input
    }
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerContent}>
          {onBack && <button onClick={onBack} style={s.backBtn}><FiChevronLeft size={26} /></button>}
          <div>
            <div style={s.name}>{activeUser.name}</div>
            <div style={{ ...s.status, color: activeUser.isOnline ? "#22c55e" : "#64748b" }}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={s.messages} ref={scrollRef}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser?._id;
          return (
            <div key={msg._id} style={{ ...s.row, justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ ...s.bubble, background: mine ? "#E8FF47" : "#1e1e1e", color: mine ? "#000" : "#fff" }}>
                
                {/* Render Text */}
                {msg.text && <div style={{ wordBreak: "break-word", marginBottom: msg.imageUrl ? 8 : 0 }}>{msg.text}</div>}

                {/* Render Image */}
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="sent-file" 
                    style={s.sentImg} 
                  />
                )}
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 4 }}>
                  <span style={s.time}>{msg.timeLabel}</span>
                  {mine && <Ticks status={msg.status} isOnline={activeUser.isOnline} />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={s.row}>
            <div style={{ ...s.bubble, background: "#1e1e1e", color: "#22c55e", fontSize: 12 }}>
              typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={s.inputBox}>
        <div style={s.inputWrap}>
          <FiSmile style={{ color: "#94a3b8", cursor: "pointer" }} />
          <input 
            value={input} 
            onChange={handleInputChange} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
            placeholder="Type message..." 
            style={s.input} 
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
          />
          <FiPaperclip onClick={handleGalleryOpen} style={{ color: "#94a3b8", cursor: "pointer" }} />
          <button onClick={handleSend} style={s.send}><FiSend /></button>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", flexDirection: "column", height: "100%", background: "#0D0D0D" },
  header: { height: 60, borderBottom: "1px solid #222", display: "flex", alignItems: "center", padding: "0 12px" },
  headerContent: { display: "flex", alignItems: "center", gap: 10 },
  backBtn: { background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  name: { color: "#fff", fontWeight: 600, fontSize: 15 },
  status: { fontSize: 11 },
  messages: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 },
  row: { display: "flex" },
  bubble: { padding: "8px 12px", borderRadius: 14, maxWidth: "85%", position: "relative" },
  sentImg: { maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", marginTop: "5px", display: "block" },
  time: { fontSize: 9, opacity: 0.6, marginLeft: 8 },
  inputBox: { padding: "10px 16px", background: "#0D0D0D" },
  inputWrap: { display: "flex", alignItems: "center", background: "#1e1e1e", borderRadius: 24, padding: "8px 12px", gap: 10 },
  input: { flex: 1, border: "none", background: "none", color: "#fff", outline: "none", fontSize: 14 },
  send: { background: "#E8FF47", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
};