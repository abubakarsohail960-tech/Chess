"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

interface Room {
  id: string;
  code: string;
  name: string | null;
  status: string;
  host: { username: string; elo: number };
  guest: { username: string; elo: number } | null;
}

export default function RoomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; elo: number } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [meRes, roomsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/rooms"),
    ]);
    if (meRes.ok) {
      const { user: u } = await meRes.json();
      setUser(u);
    }
    if (roomsRes.ok) {
      const data = await roomsRes.json();
      setRooms(data.rooms);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createRoom() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push(`/play/${data.room.id}`);
  }

  async function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push(`/play/${data.room.id}`);
  }

  return (
    <>
      <Navbar user={user ?? undefined} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Game Rooms</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="mb-3 font-semibold">Create Room</h2>
            <input
              className="input-field mb-3"
              placeholder="Room name (optional)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button onClick={createRoom} className="btn-primary w-full" disabled={loading}>
              Create & Play
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="mb-3 font-semibold">Join Room</h2>
            <form onSubmit={joinRoom}>
              <input
                className="input-field mb-3 uppercase"
                placeholder="ROOM CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                Join
              </button>
            </form>
          </motion.div>
        </div>

        {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}

        <section>
          <h2 className="mb-3 font-semibold">Your Active Rooms</h2>
          {rooms.length === 0 ? (
            <p className="text-[var(--text-muted)]">No active rooms.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="glass-card flex cursor-pointer items-center justify-between rounded-lg p-4 transition-colors hover:bg-white/5"
                  onClick={() => router.push(`/play/${room.id}`)}
                >
                  <div>
                    <span className="font-mono font-bold text-[var(--accent-glow)]">
                      {room.code}
                    </span>
                    {room.name && (
                      <span className="ml-2 text-sm text-[var(--text-muted)]">{room.name}</span>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {room.host.username}
                      {room.guest ? ` vs ${room.guest.username}` : " — waiting..."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      room.status === "ACTIVE"
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {room.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
