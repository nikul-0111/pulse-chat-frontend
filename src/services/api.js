// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
const BASE_URL =  "https://pulse-chat-backend-43ul.onrender.com"git 
function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request(path, options = {}, token = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET", // ✅ ensure method works
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
      ...options.headers,
    },
    body: options.body, // ✅ allow body
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
  getStatus: (userId, token) => request(`/api/users/status/${userId}`, {}, token),
  sendRequest: (userId, token) => request(`/api/users/request/${userId}`, { method: "POST" }, token),
  acceptRequest: (userId, token) => request(`/api/users/accept/${userId}`, { method: "PATCH" }, token),
  rejectRequest: (userId, token) => request(`/api/users/reject/${userId}`, { method: "PATCH" }, token),
};
// Messages
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
    token // ✅ THIS sends token
  ),
};

