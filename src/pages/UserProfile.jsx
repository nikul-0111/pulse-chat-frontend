import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";

export default function UserProfile({ user, onStartChat, onBack }) {
  const { token } = useAuth();
  const [status, setStatus] = useState("none");

  // ✅ Format numbers (1K, 1M)
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
      const interval = setInterval(loadStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [user?._id, token]);

  return (
    <div style={s.container}>

      {/* HEADER */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>←</button>
        <h3 style={s.title}>Profile</h3>
        <div style={{ width: 36 }} />
      </div>

      {/* CARD */}
      <div style={s.card}>

        {/* PROFILE */}
        <div style={s.profileTop}>
          <div style={s.avatar}>
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <h2 style={s.name}>{user?.name}</h2>
          <p style={s.email}>{user?.email}</p>

          <div style={s.badge(status)}>
            {status}
          </div>
        </div>

        {/* STATS */}
        <div style={s.stats}>
          <div style={s.statBox}>
            <span style={s.statNumber}>
              {formatNumber(user?.followers?.length || 0)}
            </span>
            <span style={s.statLabel}>Followers</span>
          </div>

          <div style={s.divider} />

          <div style={s.statBox}>
            <span style={s.statNumber}>
              {formatNumber(user?.following?.length || 0)}
            </span>
            <span style={s.statLabel}>Following</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={s.actions}>

          {status === "none" && (
            <button
              style={s.primary}
              onClick={async () => {
                await usersAPI.sendRequest(user._id, token);
                setStatus("requested");
              }}
            >
              Send Request
            </button>
          )}

          {status === "requested" && (
            <button style={s.disabled}>Requested</button>
          )}

          {status === "pending" && (
            <>
              <button
                style={s.primary}
                onClick={async () => {
                  try {
                    await usersAPI.acceptRequest(user._id, token);
                    setStatus("friends");
                    onStartChat(user);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Accept
              </button>

              <button
                style={s.danger}
                onClick={async () => {
                  await usersAPI.rejectRequest(user._id, token);
                  setStatus("none");
                }}
              >
                Reject
              </button>
            </>
          )}

          {status === "friends" && (
            <button
              style={s.primary}
              onClick={() => onStartChat(user)}
            >
              💬 Chat Now
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
    background: "linear-gradient(135deg, #020617, #0f172a)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
  },

  header: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #1e293b",
  },

  title: {
    margin: 0,
    fontWeight: 600,
  },

  backBtn: {
    background: "#1e293b",
    border: "none",
    color: "#fff",
    fontSize: 18,
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: "pointer",
  },

  card: {
    marginTop: 40,
    width: "90%",
    maxWidth: 420,
    background: "#1e293b",
    borderRadius: 20,
    padding: "30px 25px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },

  profileTop: {
    marginBottom: 20,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: "bold",
    margin: "0 auto 12px",
  },

  name: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
  },

  email: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 10,
  },

  badge: (status) => ({
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 12,
    textTransform: "capitalize",
    background:
      status === "friends"
        ? "#16a34a"
        : status === "pending"
        ? "#f59e0b"
        : status === "requested"
        ? "#475569"
        : "#334155",
  }),

  stats: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    padding: "20px 10px",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
    gap: 25,
  },

  divider: {
    width: 1,
    height: 45,
    background: "#475569",
  },

  statBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "1px",
  },

  statLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },

  actions: {
    marginTop: 25,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  primary: {
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    border: "none",
    padding: "14px",
    borderRadius: 12,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    width: "100%",
    boxShadow: "0 10px 25px rgba(99,102,241,0.4)",
  },

  danger: {
    background: "#ef4444",
    border: "none",
    padding: "14px",
    borderRadius: 12,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  disabled: {
    background: "#334155",
    border: "none",
    padding: "14px",
    borderRadius: 12,
    color: "#94a3b8",
    cursor: "not-allowed",
  },
};