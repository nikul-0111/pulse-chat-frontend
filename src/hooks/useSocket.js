import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const URL = "http://localhost:5000"; // change if deployed

export const useSocket = (userId, handlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // ✅ prevent multiple connections
    if (!userId || socketRef.current) return;

    const socket = io(URL, {
      query: { userId },
      transports: ["websocket"], // stable connection
    });

    socketRef.current = socket;

    // ✅ CONNECT
    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
    });

    // ✅ MESSAGE RECEIVE
    socket.on("message:receive", (msg) => {
      handlers.onMessage?.(msg);
    });

    // ✅ MESSAGE SENT
    socket.on("message:sent", (msg) => {
      handlers.onMessageSent?.(msg);
    });

    // ✅ TYPING
    socket.on("typing:start", ({ senderId }) => {
      handlers.onTypingStart?.(senderId);
    });

    socket.on("typing:stop", ({ senderId }) => {
      handlers.onTypingStop?.(senderId);
    });

    // ✅ ONLINE USERS
    socket.on("users:online", (ids) => {
      handlers.onOnlineUsers?.(ids);
    });

    // ✅ READ RECEIPT
    socket.on("message:read", (data) => {
      handlers.onRead?.(data);
    });

    // ❗ cleanup only on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // ✅ SEND MESSAGE
  const sendMessage = (receiverId, text) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message:send", { receiverId, text });
  };

  // ✅ TYPING EVENTS
  const startTyping = (receiverId) => {
    socketRef.current?.emit("typing:start", { receiverId });
  };

  const stopTyping = (receiverId) => {
    socketRef.current?.emit("typing:stop", { receiverId });
  };

  return { sendMessage, startTyping, stopTyping };
};