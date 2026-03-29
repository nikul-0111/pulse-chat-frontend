import { useState } from "react";

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#a855f7", "#0ea5e9"];

// ✅ Updated Ticks Component with Desi Green for Read status
const Ticks = ({ status, isOnline }) => {
  if (status === "read") {
    return (
      <span style={{ color: "#22c55e", marginLeft: 4, display: "flex", alignItems: "center" }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z"/>
        </svg>
      </span>
    );
  }
  if (isOnline) {
    return (
      <span style={{ color: "#94a3b8", marginLeft: 4, display: "flex", alignItems: "center" }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z"/>
        </svg>
      </span>
    );
  }
  return (
    <span style={{ color: "#94a3b8", marginLeft: 4, display: "flex", alignItems: "center" }}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </span>
  );
};

function Avatar({ name = "", size = 42, isOnline = false }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || "#6366f1";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, color: "#fff", fontSize: 14,
      }}>{initials}</div>
      {isOnline && (
        <span style={{
          position: "absolute", bottom: 0, right: 0, width: 12, height: 12,
          background: "#22c55e", border: "2px solid #0f172a", borderRadius: "50%"
        }} />
      )}
    </div>
  );
}

export default function Sidebar({
  users = [],
  messages = {},
  activeUser,
  onOpenProfile,
  currentUser,
  onlineUserIds = [],
  onLogout,
}) {
  const [search, setSearch] = useState("");

  const getUnreadCount = (userId) => {
    if (activeUser?._id === userId) return 0;
    const userMsgs = messages[userId] || [];
    return userMsgs.filter((m) => m.senderId === userId && m.status !== "read").length;
  };

  const getLastMsg = (userId) => {
    const userMsgs = messages[userId] || [];
    return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={{ margin: 0 }}>Nikul's Desi Chat</h2>
      </div>

      <input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={s.search}
      />

      <div style={s.list}>
        {filtered.map((u) => {
          const unreadCount = getUnreadCount(u._id);
          const last = getLastMsg(u._id);
          const isOnline = onlineUserIds.includes(u._id);
          const isActive = activeUser?._id === u._id;
          const amILastSender = last?.senderId === currentUser?._id;

          return (
            <div
              key={u._id}
              onClick={() => onOpenProfile(u)}
              style={{ ...s.user, background: isActive ? "#1e293b" : "transparent" }}
            >
              <Avatar name={u.name} isOnline={isOnline} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rowTop}>
                  <span style={{ fontWeight: unreadCount > 0 ? 800 : 600 }}>{u.name}</span>
                  <span style={{ ...s.time, color: unreadCount > 0 ? "#22c55e" : "#64748b" }}>
                    {last?.timeLabel || ""}
                  </span>
                </div>

                <div style={s.rowBottom}>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    {/* ✅ Green Ticks for SENT messages */}
                    {amILastSender && last && (
                      <Ticks status={last.status} isOnline={isOnline} />
                    )}
                    
                    <span style={{
                      ...s.lastMsg,
                      marginLeft: amILastSender ? 4 : 0,
                      color: unreadCount > 0 ? "#fff" : "#94a3b8",
                      fontWeight: unreadCount > 0 ? 500 : 400
                    }}>
                      {last ? (amILastSender ? "You: " : "") + last.text : "No messages"}
                    </span>
                  </div>

                  {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.bottom}>
        <Avatar name={currentUser?.name} isOnline={true} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{currentUser?.name}</div>
          <div style={{ fontSize: 12, color: "#22c55e" }}>Online</div>
        </div>
        <button onClick={onLogout} style={s.logout}>Logout</button>
      </div>
    </div>
  );
}

const s = {
  container: { width: 300, height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a", color: "#fff" },
  header: { padding: 16, borderBottom: "1px solid #1e293b" },
  search: { margin: 12, padding: 10, borderRadius: 8, border: "none", background: "#1e293b", color: "#fff", outline: "none" },
  list: { flex: 1, overflowY: "auto" },
  user: { display: "flex", gap: 12, padding: "12px 16px", cursor: "pointer", alignItems: "center", transition: "0.2s" },
  rowTop: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 2 },
  rowBottom: { display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4, alignItems: "center" },
  lastMsg: { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: 140 },
  time: { fontSize: 10 },
  badge: { background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 10, fontWeight: 900 },
  bottom: { display: "flex", alignItems: "center", gap: 10, padding: 12, background: "#020617" },
  logout: { background: "#ef4444", border: "none", padding: "6px 10px", color: "#fff", borderRadius: 6, cursor: "pointer" }
};