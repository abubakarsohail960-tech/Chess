"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email, password }
        : { username, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card w-full max-w-md rounded-2xl p-8"
    >
      <h1 className="mb-2 text-2xl font-bold">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        {mode === "login"
          ? "Sign in to play ranked games with friends"
          : "Join Chess and start at 1200 ELO"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm text-[var(--text-muted)]">Username</label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              placeholder="your_name"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--danger)]"
          >
            {error}
          </motion.p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/register" className="text-[var(--accent-glow)] hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Have an account?{" "}
            <Link href="/login" className="text-[var(--accent-glow)] hover:underline">
              Login
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
