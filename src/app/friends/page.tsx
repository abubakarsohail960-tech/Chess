"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

interface Friend {
  id: string;
  username: string;
  elo: number;
}

interface PendingRequest {
  id: string;
  from: Friend;
}

export default function FriendsPage() {
  const [user, setUser] = useState<{ username: string; elo: number } | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [meRes, friendsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/friends"),
    ]);
    if (meRes.ok) {
      const { user: u } = await meRes.json();
      setUser(u);
    }
    if (friendsRes.ok) {
      const data = await friendsRes.json();
      setFriends(data.friends);
      setPending(data.pendingRequests);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Request sent!" : data.error);
    if (res.ok) setUsername("");
    setLoading(false);
    load();
  }

  async function respond(id: string, action: "accept" | "reject") {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <>
      <Navbar user={user ?? undefined} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Friends</h1>

        <form onSubmit={sendRequest} className="glass-card mb-8 rounded-xl p-6">
          <label className="mb-2 block text-sm text-[var(--text-muted)]">
            Add friend by username
          </label>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              Add
            </button>
          </div>
          {message && <p className="mt-2 text-sm text-[var(--accent-glow)]">{message}</p>}
        </form>

        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-semibold">Pending Requests</h2>
            <div className="space-y-2">
              {pending.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card flex items-center justify-between rounded-lg p-4"
                >
                  <span>{req.from.username}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(req.id, "accept")}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(req.id, "reject")}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-semibold">Your Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-[var(--text-muted)]">No friends yet.</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f, i) => (
                <motion.li
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card flex items-center justify-between rounded-lg p-4"
                >
                  <span className="font-medium">{f.username}</span>
                  <span className="text-sm text-[var(--accent-glow)]">{f.elo} ELO</span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
