"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      path: "/socket.io",
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

export function useSocketRoom(roomCode: string | null, currentUser: { id: string; name: string; username: string; avatarUrl?: string | null } | null) {
  const [participants, setParticipants] = useState<
    { id: string; name: string; username: string; avatarUrl?: string | null }[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomCode || !currentUser) return;

    const socket = getSocket();
    socketRef.current = socket;

    function onConnect() {
      setIsConnected(true);
      socket.emit("join_room", { roomCode, user: currentUser });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onParticipantsUpdate(data: {
      roomCode: string;
      participants: { id: string; name: string; username: string; avatarUrl?: string | null }[];
    }) {
      if (data.roomCode === roomCode) {
        setParticipants(data.participants);
      }
    }

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("participants_update", onParticipantsUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("participants_update", onParticipantsUpdate);
    };
  }, [roomCode, currentUser]);

  return { socket: socketRef.current, isConnected, participants };
}
