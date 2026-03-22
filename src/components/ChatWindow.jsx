import { useState, useEffect, useRef } from "react";

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  isTyping,
  loading,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onDeleteMessages, 
  // ✅ NEW
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]); // ✅ selection state
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSelect = (id) => {
    setSelectedMsgs((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const handleDelete = () => {
    onDeleteMessages(selectedMsgs); // call parent
    setSelectedMsgs([]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(activeUser._id, input);
    setInput("");
  };

  return (
    <div style={s.root}>

      {/* ✅ TOP ACTION BAR (only when selecting) */}
      {selectedMsgs.length > 0 && (
        <div style={s.actionBar}>
          <span>{selectedMsgs.length} selected</span>
          <button onClick={handleDelete} style={s.deleteBtn}>
            🗑 Delete
          </button>
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <h3 style={{ margin: 0 }}>{activeUser.name}</h3>
      </div>

      {/* MESSAGES */}
      <div style={s.messages}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser._id;
          const isSelected = selectedMsgs.includes(msg._id);

          return (
            <div
              key={msg._id}
              onClick={() => toggleSelect(msg._id)} // ✅ click to select
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

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={s.inputBox}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          style={s.input}
        />
        <button onClick={handleSend} style={s.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

const s = {
  root: { flex: 1, display: "flex", flexDirection: "column", background: "#0D0D0D" },

  header: {
    padding: 12,
    borderBottom: "1px solid #222",
    color: "#fff",
  },

  actionBar: {
    padding: 10,
    background: "#111827",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    padding: 10,
  },

  msgRow: {
    display: "flex",
    padding: "4px 0",
    cursor: "pointer",
  },

  bubble: {
    padding: "8px 12px",
    borderRadius: 10,
    maxWidth: "60%",
  },

  time: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "right",
  },

  inputBox: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #222",
  },

  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "none",
    outline: "none",
  },

  sendBtn: {
    marginLeft: 8,
    padding: "8px 12px",
    background: "#E8FF47",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};