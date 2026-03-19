import { useState, useEffect, useRef, useCallback } from "react";

const AVATAR_COLORS = ["#5C6BC0","#E91E63","#00897B","#F4511E","#8E24AA","#039BE5","#d97706","#0891b2"];

function Avatar({ name = "", size = 32 }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.36,
      fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Ticks({ status }) {
  if (status === "read")      return <span style={{ color: "#E8FF47", fontSize: 11 }}>✓✓</span>;
  if (status === "delivered") return <span style={{ color: "#555", fontSize: 11 }}>✓✓</span>;
  return <span style={{ color: "#555", fontSize: 11 }}>✓</span>;
}

function TypingBubble({ name }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "4px 20px" }}>
      <Avatar name={name} size={28} />
      <div style={{
        background: "#1e1e1e", borderRadius: "14px 14px 14px 4px",
        padding: "10px 14px", display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#E8FF47",
            display: "inline-block",
            animation: `typingDot 1.1s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes typingDot {
          0%,60%,100%{transform:translateY(0);opacity:0.5}
          30%{transform:translateY(-6px);opacity:1}
        }
      `}</style>
    </div>
  );
}

const EMOJIS = ["👍","❤️","😂","🙏","🎉","🔥","😮","✅"];

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  isTyping,
  loading,
  onSendMessage,
  onStartTyping,
  onStopTyping,
}) {
  const [input, setInput]         = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (activeUser) {
      setInput("");
      setShowEmoji(false);
      inputRef.current?.focus();
    }
  }, [activeUser?._id]);

  const handleInput = (e) => {
    setInput(e.target.value);
    onStartTyping?.(activeUser?._id);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onStopTyping?.(activeUser?._id), 1500);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !activeUser) return;
    onSendMessage(activeUser._id, text);
    setInput("");
    clearTimeout(typingTimer.current);
    onStopTyping?.(activeUser?._id);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty state
  if (!activeUser) {
    return (
      <div style={s.empty}>
        <div>
          <div style={{ fontSize: 52, textAlign: "center", marginBottom: 16 }}>💬</div>
          <h2 style={s.emptyTitle}>Select a conversation</h2>
          <p style={s.emptyText}>Pick someone from the left to start chatting</p>
        </div>
      </div>
    );
  }

  // Group messages with date separators
  const rows = [];
  let lastDate = null;
  messages.forEach((msg, i) => {
    const dateStr = msg.createdAt
      ? new Date(msg.createdAt).toDateString()
      : "Today";
    if (dateStr !== lastDate) {
      rows.push({ type: "date", label: dateStr === new Date().toDateString() ? "Today" : dateStr });
      lastDate = dateStr;
    }
    const prev = messages[i - 1];
    const showAvatar =
      msg.senderId !== currentUser?._id &&
      (!prev || prev.senderId !== msg.senderId);
    rows.push({ type: "msg", msg, showAvatar });
  });

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <div style={{ position: "relative" }}>
          <Avatar name={activeUser.name} size={38} />
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: "50%",
            background: activeUser.isOnline ? "#4ade80" : "#333",
            border: "2px solid #111",
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={s.headerName}>{activeUser.name}</p>
          <p style={s.headerStatus}>
            {isTyping
              ? <span style={{ color: "#E8FF47" }}>typing…</span>
              : activeUser.isOnline
              ? <span style={{ color: "#4ade80" }}>Online</span>
              : <span style={{ color: "#555" }}>Offline</span>
            }
          </p>
        </div>
        {/* Call / video buttons (UI only) */}
        {["📞","📹"].map((icon) => (
          <button key={icon} style={s.headerBtn}>{icon}</button>
        ))}
      </div>

      {/* Messages area */}
      <div style={s.messages}>

        {loading && (
          <p style={{ color: "#444", textAlign: "center", fontSize: 13, marginTop: 40 }}>
            Loading messages…
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p style={{ color: "#444", textAlign: "center", fontSize: 13, marginTop: 40 }}>
            No messages yet — say hello! 👋
          </p>
        )}

        {rows.map((row, i) => {
          // Date divider
          if (row.type === "date") {
            return (
              <div key={`d${i}`} style={s.dateDivider}>
                <div style={s.dateLine} />
                <span style={s.dateLabel}>{row.label}</span>
                <div style={s.dateLine} />
              </div>
            );
          }

          const { msg, showAvatar } = row;
          const mine = msg.senderId === currentUser?._id;

          return (
            <div
              key={msg._id || i}
              style={{
                display: "flex",
                flexDirection: mine ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
                padding: "2px 18px",
                marginTop: showAvatar ? 10 : 0,
              }}
            >
              {/* Other person's avatar */}
              <div style={{ width: 28, flexShrink: 0 }}>
                {!mine && showAvatar && <Avatar name={activeUser.name} size={28} />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "65%",
                background: mine ? "#E8FF47" : "#1e1e1e",
                color: mine ? "#0D0D0D" : "#ddd",
                padding: "9px 13px",
                borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                fontSize: 14,
                lineHeight: 1.55,
                wordBreak: "break-word",
                fontFamily: "'Outfit', sans-serif",
              }}>
                {msg.text}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: mine ? "rgba(0,0,0,0.4)" : "#444" }}>
                    {msg.timeLabel || ""}
                  </span>
                  {mine && <Ticks status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && <TypingBubble name={activeUser.name} />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={s.inputBar}>
        {/* Emoji picker */}
        {showEmoji && (
          <div style={s.emojiPicker}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { setInput((v) => v + e); setShowEmoji(false); inputRef.current?.focus(); }}
                style={s.emojiBtn}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <div style={s.inputRow}>
          {/* Emoji toggle */}
          <button onClick={() => setShowEmoji((v) => !v)} style={s.iconBtn} title="Emoji">
            😊
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={`Message ${activeUser.name}…`}
            rows={1}
            style={s.textarea}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              ...s.sendBtn,
              opacity: input.trim() ? 1 : 0.3,
              cursor: input.trim() ? "pointer" : "default",
            }}
          >
            ➤
          </button>
        </div>
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
    minWidth: 0,
    fontFamily: "'Outfit', sans-serif",
  },
  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0D",
  },
  emptyTitle: {
    color: "#2a2a2a",
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    margin: "0 0 8px",
  },
  emptyText: { color: "#2a2a2a", fontSize: 14, textAlign: "center" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 20px",
    borderBottom: "1px solid #1a1a1a",
    background: "#111",
  },
  headerName: { margin: 0, fontWeight: 700, color: "#eee", fontSize: 15 },
  headerStatus: { margin: 0, fontSize: 12 },
  headerBtn: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 9,
    width: 34,
    height: 34,
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 0 6px",
    display: "flex",
    flexDirection: "column",
  },
  dateDivider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px 4px",
  },
  dateLine: { flex: 1, height: 1, background: "#1f1f1f" },
  dateLabel: {
    fontSize: 11,
    color: "#444",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  },
  inputBar: {
    borderTop: "1px solid #1a1a1a",
    background: "#111",
    padding: "10px 14px",
    position: "relative",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "100%",
    left: 14,
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    display: "flex",
    padding: 8,
    gap: 2,
    marginBottom: 4,
    zIndex: 10,
  },
  emojiBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: 6,
    lineHeight: 1,
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    background: "#1a1a1a",
    border: "1px solid #272727",
    borderRadius: 14,
    padding: "8px 10px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: "2px 4px",
    flexShrink: 0,
    lineHeight: 1,
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#ddd",
    fontSize: 14,
    resize: "none",
    lineHeight: 1.6,
    fontFamily: "'Outfit', sans-serif",
    maxHeight: 120,
    padding: "1px 0",
    scrollbarWidth: "none",
  },
  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: 10,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    color: "#0D0D0D",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },
};
