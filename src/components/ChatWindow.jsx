import { useState, useEffect, useRef } from "react";
import { 
  FiSend, 
  FiSmile, 
  FiPaperclip, 
  FiMic 
} from "react-icons/fi";

export default function ChatWindow({
  activeUser,
  messages = [],
  currentUser,
  onSendMessage,
  onDeleteMessages,
}) {
  const [input, setInput] = useState("");
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ select message
  const toggleSelect = (id) => {
    setSelectedMsgs((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  // ✅ delete
  const handleDelete = () => {
    onDeleteMessages(selectedMsgs);
    setSelectedMsgs([]);
  };

  // ✅ send
  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(activeUser._id, input);
    setInput("");
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
  <h3>{activeUser.name}</h3>
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
          onChange={(e) => setInput(e.target.value)}
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
  },

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
    maxWidth: window.innerWidth < 768 ? "80%" : "60%",
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
  padding: 10,
  borderTop: "1px solid #222",
  position: "sticky",
  bottom: 0,
  background: "#0D0D0D",
},

  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "none",
    outline: "none",
  },

  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#aaa",
  },

  sendBtn: {
    background: "#E8FF47",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};