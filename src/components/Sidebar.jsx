import { useState } from "react";

const AVATAR_COLORS = ["#5C6BC0","#E91E63","#00897B","#F4511E","#8E24AA","#039BE5","#d97706","#0891b2"];

function Avatar({ name = "", size = 40 }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.36,
      fontWeight: 700, color: "#fff", flexShrink: 0,
      letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

export default function Sidebar({
  users = [],
  messages = {},
  activeUser,
  onSelect,
  currentUser,
  onlineUserIds = [],
  onLogout,
}) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const getLastMsg = (userId) => {
    const msgs = messages[userId] || [];
    return msgs[msgs.length - 1] || null;
  };

  const getUnread = (userId) =>
    (messages[userId] || []).filter(
      (m) => m.senderId === userId && m.status !== "read"
    ).length;

  return (
    <aside style={s.root}>

      {/* Top bar */}
      <div style={s.topBar}>
        <div style={s.brand}>
          <span style={{ fontSize: 22 }}>💬</span>
          <span style={s.brandName}>PulseChat</span>
        </div>
        <button onClick={onLogout} style={s.logoutBtn} title="Sign out">
          ⬡
        </button>
      </div>

      {/* Search */}
      <div style={s.searchBox}>
        <span style={{ fontSize: 14, color: "#555" }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={s.searchInput}
        />
      </div>

      {/* Section label */}
      <p style={s.sectionLabel}>Conversations</p>

      {/* List */}
      <div style={s.list}>
        {filtered.length === 0 && (
          <p style={s.empty}>No users found</p>
        )}
        {filtered.map((u) => {
          const last    = getLastMsg(u._id);
          const unread  = getUnread(u._id);
          const active  = activeUser?._id === u._id;
          const online  = onlineUserIds.includes(u._id);

          return (
            <button
              key={u._id}
              onClick={() => onSelect(u)}
              style={{
                ...s.row,
                background: active ? "#1a1a1a" : "transparent",
                borderLeft: active ? "3px solid #E8FF47" : "3px solid transparent",
              }}
            >
              {/* Avatar + status dot */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar name={u.name} size={44} />
                <span style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 11, height: 11, borderRadius: "50%",
                  background: online ? "#4ade80" : "#333",
                  border: "2px solid #111",
                }} />
              </div>

              {/* Info */}
              <div style={s.rowInfo}>
                <div style={s.rowTop}>
                  <span style={s.rowName}>{u.name}</span>
                  <span style={s.rowTime}>{last?.timeLabel || ""}</span>
                </div>
                <div style={s.rowBottom}>
                  <span style={s.rowLast}>
                    {last
                      ? (last.senderId === currentUser?._id ? "You: " : "") + last.text
                      : "No messages yet"}
                  </span>
                  {unread > 0 && <span style={s.badge}>{unread}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* My profile */}
      <div style={s.me}>
        <Avatar name={currentUser?.name || "Me"} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentUser?.name || "You"}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#4ade80" }}>● Online</p>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 16 }}>
          ⎋
        </button>
      </div>
    </aside>
  );
}

const s = {
  root: {
    width: 280,
    background: "#111111",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontFamily: "'Outfit', sans-serif",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 16px 14px",
    borderBottom: "1px solid #1f1f1f",
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  logoutBtn: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#555",
    width: 30,
    height: 30,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    margin: "10px 12px 6px",
    background: "#1a1a1a",
    border: "1px solid #222",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#ccc",
    fontSize: 13,
    width: "100%",
    fontFamily: "'Outfit', sans-serif",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "10px 16px 4px",
  },
  list: { flex: 1, overflowY: "auto" },
  empty: { color: "#444", fontSize: 13, textAlign: "center", marginTop: 32 },
  row: {
    width: "100%",
    border: "none",
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'Outfit', sans-serif",
    transition: "background 0.12s",
  },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  rowName: { fontSize: 14, fontWeight: 600, color: "#e5e5e5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowTime: { fontSize: 10, color: "#444", flexShrink: 0 },
  rowBottom: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 },
  rowLast: { fontSize: 12, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 },
  badge: {
    background: "#E8FF47", color: "#0D0D0D",
    borderRadius: 20, fontSize: 10, fontWeight: 800,
    padding: "1px 6px", flexShrink: 0,
  },
  me: {
    padding: "12px 14px",
    borderTop: "1px solid #1f1f1f",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
};
