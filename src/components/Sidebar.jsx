import { useState, useEffect } from "react";

const AVATAR_COLORS = ["#4f46e5", "#ec4899", "#06b6d4", "#f59e0b", "#8b5cf6", "#10b981"];

const Ticks = ({ status, isOnline }) => {
  if (status === "read") {
    // Double Green Ticks
    return (
      <span style={{ color: "#22c55e", marginRight: 4, display: "flex", alignItems: "center" }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z"/>
        </svg>
      </span>
    );
  }
  
  return (
    <span style={{ color: "#94a3b8", marginRight: 4, display: "flex", alignItems: "center" }}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        {isOnline ? (
          // Double Grey Ticks (Delivered)
          <path d="M22.31 6.31l-11.53 11.53-5.59-5.59L3.72 13.72l7.06 7.06 13-13zM15.25 6.31l-1.41-1.41-7.06 7.06 1.41 1.41z"/>
        ) : (
          // Single Grey Tick (Sent)
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        )}
      </svg>
    </span>
  );
};

function Avatar({ name = "", size = 44, isOnline = false, bgOverride }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = bgOverride || AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, 
        borderRadius: "32%",
        background: `linear-gradient(135deg, ${bg}dd 0%, ${bg} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, color: "#fff", fontSize: size * 0.35,
        boxShadow: `0 4px 10px ${bg}44`
      }}>{initials}</div>
      {isOnline && (
        <span style={{
          position: "absolute", bottom: -2, right: -2, width: size * 0.3, height: size * 0.3,
          background: "#22c55e", border: "3px solid #0f172a", borderRadius: "50%"
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUnreadCount = (userId) => {
    if (activeUser?._id === userId) return 0;
    return (messages[userId] || []).filter((m) => m.senderId === userId && m.status !== "read").length;
  };

  const getLastMsg = (userId) => {
    const userMsgs = messages[userId] || [];
    return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  if (isMobile && activeUser) return null;

  return (
    <div style={{
      ...s.container,
      width: isMobile ? "100%" : "340px",
      borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={s.logoDot} />
          <h2 style={s.brand}>Messages</h2>
        </div>
      </div>

      <div style={s.searchContainer}>
        <div style={s.searchWrapper}>
          <svg style={s.searchIcon} viewBox="0 0 24 24" width="16" height="16" stroke="#64748b" fill="none" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.search}
          />
        </div>
      </div>

      <div style={s.list}>
        {filtered.map((u) => {
          const unreadCount = getUnreadCount(u._id);
          const last = getLastMsg(u._id);
          // ✅ FIX: Derive online status correctly
          const isOnline = onlineUserIds.includes(u._id);
          const isActive = activeUser?._id === u._id;
          const amILastSender = last?.senderId === currentUser?._id;

          return (
            <div
              key={u._id}
              onClick={() => onOpenProfile(u)}
              onMouseEnter={() => setHoveredId(u._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ 
                ...s.user, 
                background: isActive ? "rgba(99, 102, 241, 0.12)" : (hoveredId === u._id ? "rgba(255,255,255,0.03)" : "transparent"),
              }}
            >
              <Avatar name={u.name} isOnline={isOnline} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rowTop}>
                  <span style={{ 
                    fontWeight: unreadCount > 0 ? 700 : 500,
                    color: isActive ? "#fff" : "#e2e8f0" 
                  }}>{u.name}</span>
                  <span style={{ ...s.time, color: unreadCount > 0 ? "#4f46e5" : "#64748b" }}>
                    {last?.timeLabel || ""}
                  </span>
                </div>

                <div style={s.rowBottom}>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    {/* ✅ FIX: Correctly pass props to Ticks */}
                    {amILastSender && last && <Ticks status={last.status} isOnline={isOnline} />}
                    <span style={{
                      ...s.lastMsg,
                      color: unreadCount > 0 ? "#fff" : "#94a3b8",
                      fontWeight: unreadCount > 0 ? 500 : 400
                    }}>
                      {last ? (amILastSender ? "You: " : "") + last.text : "No messages yet"}
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
        <div style={s.userCard}>
          <Avatar name={currentUser?.name} isOnline={true} size={36} bgOverride="#1e293b" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.currentName}>{currentUser?.name}</div>
            <div style={s.currentStatus}>Online</div>
          </div>
          <button onClick={onLogout} style={s.logout}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { height: "100vh", display: "flex", flexDirection: "column", background: "#020617", color: "#fff" },
  header: { padding: "24px 20px 16px" },
  logoDot: { width: 8, height: 8, borderRadius: "50%", background: "#4f46e5", boxShadow: "0 0 10px #4f46e5" },
  brand: { margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" },
  searchContainer: { padding: "0 16px 16px" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12 },
  search: { width: "100%", padding: "12px 12px 12px 40px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "#0f172a", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
  list: { flex: 1, overflowY: "auto", padding: "0 8px" },
  user: { display: "flex", gap: 14, cursor: "pointer", alignItems: "center", padding: "12px 14px", borderRadius: 16, margin: "2px 0", transition: "all 0.2s" },
  rowTop: { display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 2 },
  rowBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  lastMsg: { fontSize: 13, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  time: { fontSize: 11, fontWeight: 600 },
  badge: { background: "#4f46e5", color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 800 },
  bottom: { padding: "16px", background: "#020617", borderTop: "1px solid rgba(255,255,255,0.05)" },
  userCard: { display: "flex", alignItems: "center", gap: 12, padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" },
  currentName: { fontWeight: 600, fontSize: 14, color: "#f8fafc" },
  currentStatus: { fontSize: 11, color: "#22c55e", fontWeight: 600 },
  logout: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex" }
};