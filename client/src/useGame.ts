import { useEffect, useRef, useState } from "react";
import { socket, emit } from "./socket";
import type { RoomState } from "./types";

const LS_KEY = "undercover_session";

interface Session {
  code: string;
  playerId: string;
  pseudo: string;
  avatar: string;
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(s: Session | null) {
  if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
  else localStorage.removeItem(LS_KEY);
}

export function useGame() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(loadSession());

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      // Attempt reconnection to a previous room.
      const s = sessionRef.current;
      if (s) {
        emit<{ ok: boolean; error?: string }>("room:rejoin", {
          code: s.code,
          playerId: s.playerId,
        }).then((res) => {
          if (!res.ok) {
            sessionRef.current = null;
            saveSession(null);
          }
        });
      }
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onState(state: RoomState) {
      setRoom(state);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:state", onState);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:state", onState);
    };
  }, []);

  function flash(msg: string) {
    setError(msg);
    setTimeout(() => setError((cur) => (cur === msg ? null : cur)), 3500);
  }

  async function createRoom(pseudo: string, avatar: string) {
    const res = await emit<{ ok: boolean; code: string; playerId: string }>(
      "room:create",
      { pseudo, avatar }
    );
    if (res.ok) {
      const s = { code: res.code, playerId: res.playerId, pseudo, avatar };
      sessionRef.current = s;
      saveSession(s);
    }
    return res;
  }

  async function joinRoom(code: string, pseudo: string, avatar: string) {
    const res = await emit<{ ok: boolean; code?: string; playerId?: string; error?: string }>(
      "room:join",
      { code, pseudo, avatar }
    );
    if (res.ok && res.code && res.playerId) {
      const s = { code: res.code, playerId: res.playerId, pseudo, avatar };
      sessionRef.current = s;
      saveSession(s);
    } else if (res.error) {
      flash(res.error);
    }
    return res;
  }

  function leaveRoom() {
    socket.emit("room:leave");
    sessionRef.current = null;
    saveSession(null);
    setRoom(null);
  }

  // Generic action helper that surfaces server errors as a flash message.
  async function action(event: string, payload?: any) {
    const res = await emit<{ ok: boolean; error?: string }>(event, payload);
    if (res && res.ok === false && res.error) flash(res.error);
    return res;
  }

  return {
    room,
    connected,
    error,
    flash,
    createRoom,
    joinRoom,
    leaveRoom,
    action,
    myId: sessionRef.current?.playerId ?? room?.you?.id ?? null,
  };
}
