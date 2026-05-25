"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ChessBoard } from "@/components/ChessBoard";

interface RoomData {
  id: string;
  code: string;
  fen: string;
  status: string;
  myColor: "w" | "b" | null;
  isMyTurn: boolean;
  host: { username: string; elo: number };
  guest: { username: string; elo: number } | null;
  winner: { username: string } | null;
}

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; elo: number } | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameMessage, setGameMessage] = useState("");
  const [copyOk, setCopyOk] = useState(false);

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/rooms/${id}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setRoom(data.room);
  }, [id, router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user));
    fetchRoom();
    const interval = setInterval(fetchRoom, 2000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  const handleMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      const res = await fetch(`/api/rooms/${id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, promotion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGameMessage(data.error ?? "Invalid move");
        return false;
      }
      setLastMove({ from, to });
      setRoom(data.room);
      if (data.gameOver) {
        const resultText =
          data.result === "DRAW"
            ? "Draw!"
            : data.result === "WHITE_WIN"
              ? "White wins!"
              : "Black wins!";
        setGameMessage(resultText);
        if (data.eloChanges) {
          setGameMessage(
            `${resultText} ELO updated.`
          );
        }
      } else {
        setGameMessage("");
      }
      return true;
    },
    [id]
  );

  function copyCode() {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    }
  }

  const orientation = room?.myColor === "b" ? "black" : "white";
  const canMove = room?.status === "ACTIVE" && room?.isMyTurn;

  return (
    <>
      <Navbar user={user ?? undefined} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Room{" "}
              <button
                onClick={copyCode}
                className="font-mono text-[var(--accent-glow)] hover:underline"
              >
                {room?.code ?? "..."}
              </button>
              {copyOk && <span className="ml-2 text-xs text-[var(--success)]">Copied!</span>}
            </h1>
            {room && (
              <p className="text-sm text-[var(--text-muted)]">
                {room.host.username} ({room.host.elo}){" "}
                {room.guest
                  ? `vs ${room.guest.username} (${room.guest.elo})`
                  : "— share code to invite"}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              room?.status === "ACTIVE"
                ? "bg-[var(--success)]/20 text-[var(--success)]"
                : room?.status === "FINISHED"
                  ? "bg-white/10"
                  : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {room?.status ?? "Loading"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {room?.myColor ? (
            <ChessBoard
              fen={room.fen}
              orientation={orientation}
              canMove={!!canMove}
              onMove={handleMove}
              lastMove={lastMove}
              gameOver={room.status === "FINISHED"}
            />
          ) : (
            <div className="glass-card flex h-80 w-80 items-center justify-center rounded-xl">
              <p className="text-[var(--text-muted)]">Loading board...</p>
            </div>
          )}

          <aside className="glass-card w-full max-w-xs rounded-xl p-4 lg:mt-0">
            <h2 className="mb-3 font-semibold">Game Info</h2>
            <p className="text-sm text-[var(--text-muted)]">
              You play as:{" "}
              <span className="text-[var(--text)]">
                {room?.myColor === "w" ? "White ♔" : room?.myColor === "b" ? "Black ♚" : "—"}
              </span>
            </p>
            <p className="mt-2 text-sm">
              {room?.status === "WAITING"
                ? "Waiting for opponent to join..."
                : room?.isMyTurn
                  ? "Your turn"
                  : "Opponent's turn"}
            </p>

            <AnimatePresence>
              {gameMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-lg bg-[var(--accent)]/20 p-3 text-sm text-[var(--accent-glow)]"
                >
                  {gameMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {room?.status === "FINISHED" && room.winner && (
              <p className="mt-4 text-[var(--success)]">
                Winner: {room.winner.username}
              </p>
            )}

            <button
              onClick={() => router.push("/rooms")}
              className="btn-secondary mt-6 w-full text-sm"
            >
              Back to Rooms
            </button>
          </aside>
        </div>
      </main>
    </>
  );
}
