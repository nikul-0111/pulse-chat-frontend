const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}, token = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// Auth
export const authAPI = {
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

// Users
export const usersAPI = {
  getAll: (token) => request("/api/users", {}, token),
};

// Messages
export const messagesAPI = {
  getConversation: (userId, token) => request(`/api/messages/${userId}`, {}, token),
  markRead: (senderId, token) =>
    request(`/api/messages/read/${senderId}`, { method: "PATCH" }, token),
};
