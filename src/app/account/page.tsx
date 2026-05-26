"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

export default function AccountPage() {
  const [user, setUser] = useState<{
    username: string;
    email: string;
    elo: number;
    createdAt: string;
  } | null>(null);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/account", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setUsername(d.user.username);
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const body: Record<string, string> = {};
    if (username !== user?.username) body.username = username;
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    const res = await fetch("/api/account", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setUser(data.user);
    setMessage("Account updated successfully");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <>
      <Navbar user={user ? { username: user.username, elo: user.elo } : undefined} />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Account</h1>

        {user && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="glass-card space-y-4 rounded-xl p-6"
          >
            <div>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">Email</label>
              <input className="input-field opacity-60" value={user.email} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">Username</label>
              <input
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                pattern="[a-zA-Z0-9_]+"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">ELO Rating</label>
              <input
                className="input-field opacity-60"
                value={user.elo}
                disabled
              />
            </div>
            <hr className="border-white/10" />
            <p className="text-sm font-medium">Change Password</p>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">New Password</label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>

            {message && <p className="text-sm text-[var(--success)]">{message}</p>}
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              Save Changes
            </button>
          </motion.form>
        )}
      </main>
    </>
  );
}
