// api.js

// ✅ Auto detect environment
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://pulse-chat-backend-43ul.onrender.com");

// ✅ Auth header
function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Common request function
async function request(path, options = {}, token = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
      ...options.headers,
    },
    body: options.body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ================= AUTH =================
export const authAPI = {
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ================= USERS =================
export const usersAPI = {
  getAll: (token) => request("/api/users", {}, token),

  getStatus: (userId, token) =>
    request(`/api/users/status/${userId}`, {}, token),

  sendRequest: (userId, token) =>
    request(`/api/users/request/${userId}`, { method: "POST" }, token),

  acceptRequest: (userId, token) =>
    request(`/api/users/accept/${userId}`, { method: "PATCH" }, token),

  rejectRequest: (userId, token) =>
    request(`/api/users/reject/${userId}`, { method: "PATCH" }, token),
};

// ================= MESSAGES =================
export const messagesAPI = {
  getConversation: (userId, token) =>
    request(`/api/messages/${userId}`, {}, token),

  markRead: (senderId, token) =>
    request(`/api/messages/read/${senderId}`, { method: "PATCH" }, token),

  deleteMessages: (ids, token) =>
    request(
      "/api/messages/delete",
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      },
      token
    ),
};