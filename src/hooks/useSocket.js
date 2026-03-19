import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export function useSocket(userId, callbacks = {}) {
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    if (!userId) return;

    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
    });

    socket.on("message:receive",  (msg) => cbRef.current.onMessage?.(msg));
    socket.on("message:sent",     (msg) => cbRef.current.onMessageSent?.(msg));
    socket.on("typing:start", ({ senderId }) => cbRef.current.onTypingStart?.(senderId));
    socket.on("typing:stop",  ({ senderId }) => cbRef.current.onTypingStop?.(senderId));
    socket.on("users:online",    (ids)  => cbRef.current.onOnlineUsers?.(ids));
    socket.on("message:read", ({ messageId }) => cbRef.current.onRead?.(messageId));

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [userId]);

  const sendMessage = useCallback((receiverId, text) => {
    socket?.emit("message:send", { receiverId, text });
  }, []);

  const startTyping = useCallback((receiverId) => {
    socket?.emit("typing:start", { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId) => {
    socket?.emit("typing:stop", { receiverId });
  }, []);

  const markRead = useCallback((messageId, senderId) => {
    socket?.emit("message:read", { messageId, senderId });
  }, []);

  return { sendMessage, startTyping, stopTyping, markRead };
}
