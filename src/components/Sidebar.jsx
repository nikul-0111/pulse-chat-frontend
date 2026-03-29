import { useState } from "react";

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#a855f7", "#0ea5e9"];

// --- Updated Avatar with Online Dot ---
function Avatar({ name = "", size = 42, isOnline = false }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || "#6366f1";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Main Circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#fff",
          fontSize: 14,
        }}
      >
        {initials}
      </div>

      {/* Status Indicator */}
      {isOnline && (
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: 10,
            height: 10,
            background: "#22c55e",
            border: "2px solid #0f172a", // Matches container background
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}

// --- Main Sidebar Component ---
export default function Sidebar({
  users = [],
  messages = {},
  activeUser,
  onSelect,
  onOpenProfile,
  currentUser,
  onlineUserIds = [], // Array of IDs currently online
  onLogout,
}) {
  const [search, setSearch] = useState("");

  const getUnread = (userId) =>
    (messages[userId] || []).filter(
      (m) => m.senderId === userId && m.status !== "read"
    ).length;

  const getLastMsg = (id) => {
    const msgs = messages[id] || [];
    return msgs[msgs.length - 1];
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <h2 style={{ margin: 0 }}>Nikul's Desi Chat</h2>
      </div>

      {/* Search */}
      <input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={s.search}
      />

      {/* Users List */}
      <div style={s.list}>
        {filtered.map((u) => {
          const unread = getUnread(u._id);
          const last = getLastMsg(u._id);
          const isOnline = onlineUserIds.includes(u._id);

          return (
            <div
              key={u._id}
              onClick={() => onOpenProfile(u)}
              style={{
                ...s.user,
                background: activeUser?._id === u._id ? "#1e293b" : "transparent",
              }}
            >
              {/* Added isOnline prop */}
              <Avatar name={u.name} isOnline={isOnline} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rowTop}>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                  <span style={s.time}>{last?.timeLabel}</span>
                </div>

                <div style={s.rowBottom}>
                  <span style={s.lastMsg}>
                    {last
                      ? (last.senderId === currentUser?._id ? "You: " : "") + last.text
                      : "No messages"}
                  </span>

                  {unread > 0 && <span style={s.badge}>{unread}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current User (Footer) */}
      <div style={s.bottom}>
        <Avatar name={currentUser?.name} isOnline={true} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{currentUser?.name}</div>
          <div style={{ fontSize: 12, color: "#22c55e" }}>Online</div>
        </div>
        <button onClick={onLogout} style={s.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

// --- Styles ---
const s = {
  container: {
    width: window.innerWidth < 768 ? "100%" : 300,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    color: "#fff",
  },
  header: {
    padding: 16,
    borderBottom: "1px solid #1e293b",
  },
  search: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
    border: "none",
    outline: "none",
    background: "#1e293b",
    color: "#fff",
  },
  list: {
    flex: 1,
    overflowY: "auto",
  },
  user: {
    display: "flex",
    gap: 12,
    padding: "12px 16px",
    cursor: "pointer",
    alignItems: "center",
    transition: "background 0.2s",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
  },
  rowBottom: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    marginTop: 4,
  },
  lastMsg: {
    color: "#94a3b8",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: 150,
  },
  time: {
    fontSize: 10,
    color: "#64748b",
  },
  badge: {
    background: "#22c55e",
    color: "#fff",
    borderRadius: 20,
    padding: "2px 6px",
    fontSize: 10,
    fontWeight: 700,
    minWidth: 16,
    textAlign: "center",
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderTop: "1px solid #1e293b",
    background: "#020617",
  },
  logout: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};