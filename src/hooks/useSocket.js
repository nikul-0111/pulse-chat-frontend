import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// // const URL = "https://pulse-chat-backend-43ul.onrender.com";
// const URL = "http://localhost:5000";


const URL = import.meta.env.VITE_SOCKET_URL || "https://pulse-chat-backend-43ul.onrender.com";

export const useSocket = (userId, handlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || socketRef.current) return;

    const socket = io(URL, {
      query: { userId },
      transports: ["websocket"], 
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("🟢 Connected:", socket.id));

    socket.on("message:receive", (msg) => {
      handlers.onMessage?.(msg);
    });

    socket.on("message:sent", (msg) => {
      handlers.onMessageSent?.(msg);
    });

    socket.on("typing:start", ({ senderId }) => {
      handlers.onTypingStart?.(senderId);
    });

    socket.on("typing:stop", ({ senderId }) => {
      handlers.onTypingStop?.(senderId);
    });

    socket.on("users:online", (ids) => {
      handlers.onOnlineUsers?.(ids);
    });

    socket.on("message:read", (data) => {
      handlers.onRead?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // ✅ EXTRA CODE ADDED: Added imageUrl parameter
  const sendMessage = (receiverId, text, imageUrl = null) => {
    if (!socketRef.current) return;
    // Sending both text and imageUrl (one will be empty)
    socketRef.current.emit("message:send", { receiverId, text, imageUrl });
  };

  const startTyping = (receiverId) => {
    socketRef.current?.emit("typing:start", { receiverId });
  };

  const stopTyping = (receiverId) => {
    socketRef.current?.emit("typing:stop", { receiverId });
  };

  return { sendMessage, startTyping, stopTyping };
};