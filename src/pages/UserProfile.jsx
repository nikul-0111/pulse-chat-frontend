import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";

export default function UserProfile({ user, onStartChat, onBack }) {
  const { token } = useAuth();
  const [status, setStatus] = useState("none");

  // ✅ load relationship status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await usersAPI.getStatus(user._id, token);
        setStatus(res.status);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?._id) loadStatus();
  }, [user?._id, token]);

  return (
    <div style={s.container}>

      {/* HEADER */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>←</button>
        <h3>Profile</h3>
        <div style={{ width: 30 }} />
      </div>

      {/* PROFILE */}
      <div style={s.card}>
        
        {/* AVATAR */}
        <div style={s.avatar}>
          {user?.name?.[0]?.toUpperCase()}
        </div>

        {/* NAME */}
        <h2>{user?.name}</h2>
        <p style={s.email}>{user?.email}</p>

        {/* STATS */}
        <div style={s.stats}>
          <div>
            <b>{user?.followers?.length || 0}</b>
            <p>Followers</p>
          </div>
          <div>
            <b>{user?.following?.length || 0}</b>
            <p>Following</p>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div style={s.actions}>

          {status === "none" && (
            <button
              style={s.primary}
              onClick={async () => {
                await usersAPI.sendRequest(user._id, token);
                setStatus("requested");
              }}
            >
              Message
            </button>
          )}

          
        {status === "requested" && (
  <button style={s.secondary}>
    Requested
  </button>
)}

{status === "pending" && (
 
  <>
    <button
      style={s.primary}
      onClick={async () => {
        try {
          const res = await usersAPI.acceptRequest(user._id, token);
          // ✅ immediately mark as friends and start chat
          setStatus("friends"); 
          onStartChat(user); // directly open chat
        } catch (err) {
          console.error(err);
        }
      }}
    >
      Accept
    </button>

    <button
      style={s.secondary}
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
              Chat Now
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
    background: "#0f172a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    borderBottom: "1px solid #1e293b",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },

  card: {
    marginTop: 30,
    width: "100%",
    maxWidth: 400,
    background: "#1e293b",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: "bold",
    margin: "0 auto 10px",
  },

  email: {
    fontSize: 14,
    color: "#94a3b8",
  },

  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 20,
  },

  actions: {
    marginTop: 20,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  primary: {
    background: "#6366f1",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },

  secondary: {
    background: "transparent",
    border: "1px solid #475569",
    padding: "10px 16px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
};