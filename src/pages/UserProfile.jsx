import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import { FiArrowLeft, FiMessageSquare, FiUserPlus, FiClock, FiCheck, FiX } from "react-icons/fi";

export default function UserProfile({ user, onStartChat, onBack }) {
  const { token } = useAuth();
  const [status, setStatus] = useState("none");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await usersAPI.getStatus(user._id, token);
        setStatus(res.status);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?._id) {
      loadStatus();
      const interval = setInterval(loadStatus, 5000); // Increased interval for performance
      return () => clearInterval(interval);
    }
  }, [user?._id, token]);

  const handleAction = async (actionFn, nextStatus) => {
    setIsActionLoading(true);
    try {
      await actionFn();
      if (nextStatus) setStatus(nextStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div style={s.container}>
      {/* BACKGROUND DECOR */}
      <div style={s.glow} />

      {/* HEADER */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn} aria-label="Go back">
          <FiArrowLeft size={20} />
        </button>
        <h3 style={s.title}>User Profile</h3>
        <div style={{ width: 40 }} />
      </div>

      {/* MAIN CARD */}
      <div style={s.card}>
        <div style={s.profileTop}>
          <div style={s.avatarWrapper}>
            <div style={s.avatar}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={s.statusDot(status === "friends")} />
          </div>

          <h2 style={s.name}>{user?.name}</h2>
          <p style={s.email}>{user?.email}</p>

          <div style={s.badge(status)}>
            {status === "friends" && <FiCheck size={12} style={{ marginRight: 4 }} />}
            {status === "requested" && <FiClock size={12} style={{ marginRight: 4 }} />}
            {status}
          </div>
        </div>

        {/* STATS SECTION */}
        <div style={s.stats}>
          <div style={s.statBox}>
            <span style={s.statNumber}>{formatNumber(user?.followers?.length || 0)}</span>
            <span style={s.statLabel}>Followers</span>
          </div>
          <div style={s.divider} />
          <div style={s.statBox}>
            <span style={s.statNumber}>{formatNumber(user?.following?.length || 0)}</span>
            <span style={s.statLabel}>Following</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={s.actions}>
          {status === "none" && (
            <button
              style={s.primary}
              disabled={isActionLoading}
              onClick={() => handleAction(() => usersAPI.sendRequest(user._id, token), "requested")}
            >
              <FiUserPlus style={{ marginRight: 8 }} /> Send Friend Request
            </button>
          )}

          {status === "requested" && (
            <button style={s.disabled}>
              <FiClock style={{ marginRight: 8 }} /> Request Sent
            </button>
          )}

          {status === "pending" && (
            <div style={s.buttonGroup}>
              <button
                style={{ ...s.primary, flex: 2 }}
                onClick={() => handleAction(async () => {
                  await usersAPI.acceptRequest(user._id, token);
                  onStartChat(user);
                }, "friends")}
              >
                Accept
              </button>
              <button
                style={s.danger}
                onClick={() => handleAction(() => usersAPI.rejectRequest(user._id, token), "none")}
              >
                <FiX />
              </button>
            </div>
          )}

          {status === "friends" && (
            <button
              style={s.primary}
              onClick={() => onStartChat(user)}
            >
              <FiMessageSquare style={{ marginRight: 8 }} /> Start Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  container: {
    height: "100vh",
    width: "100%",
    background: "#020617",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: "-10%",
    width: "150%",
    height: "40%",
    background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)",
    zIndex: 0,
  },
  header: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    zIndex: 1,
  },
  backBtn: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: "12px",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  title: { margin: 0, fontSize: 18, fontWeight: 500, color: "#94a3b8" },
  card: {
    marginTop: 20,
    width: "90%",
    maxWidth: 400,
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(12px)",
    borderRadius: "32px",
    padding: "40px 30px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  avatarWrapper: {
    position: "relative",
    width: 110,
    height: 110,
    margin: "0 auto 20px",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "38%", // Squircle style
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    fontWeight: "bold",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
  },
  statusDot: (isOnline) => ({
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: isOnline ? "#22c55e" : "#64748b",
    border: "3px solid #1e293b",
  }),
  name: { margin: "0 0 4px", fontSize: 24, fontWeight: 700 },
  email: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  badge: (status) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    background: status === "friends" ? "rgba(34, 197, 94, 0.1)" : "rgba(148, 163, 184, 0.1)",
    color: status === "friends" ? "#4ade80" : "#94a3b8",
    border: `1px solid ${status === "friends" ? "rgba(34, 197, 94, 0.2)" : "rgba(148, 163, 184, 0.2)"}`,
  }),
  stats: {
    display: "flex",
    justifyContent: "center",
    margin: "30px 0",
    padding: "20px 0",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  statBox: { flex: 1, display: "flex", flexDirection: "column" },
  statNumber: { fontSize: 22, fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  divider: { width: 1, height: 30, background: "rgba(255,255,255,0.1)", alignSelf: "center" },
  actions: { width: "100%" },
  buttonGroup: { display: "flex", gap: 10, width: "100%" },
  primary: {
    background: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    color: "#020617",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
    width: "100%",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "16px",
    borderRadius: "16px",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
  },
  disabled: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "16px",
    borderRadius: "16px",
    color: "#64748b",
    cursor: "not-allowed",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};