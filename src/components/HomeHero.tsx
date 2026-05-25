"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HomeHero() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 text-8xl animate-pulse-glow inline-block rounded-3xl"
      >
        ♚
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 text-5xl font-bold tracking-tight md:text-6xl"
      >
        Play Chess with{" "}
        <span className="text-[var(--accent-glow)]">Friends</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10 max-w-xl text-lg text-[var(--text-muted)]"
      >
        Ranked ELO matches, private rooms, friend invites, and smooth piece
        animations — deploy anywhere on Vercel.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link href="/register" className="btn-primary text-lg px-8">
          Get Started
        </Link>
        <Link href="/login" className="btn-secondary text-lg px-8">
          Login
        </Link>
      </motion.div>

      <div className="mt-20 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {[
          { icon: "📈", title: "ELO Ratings", desc: "Standard K=32 rating after each game" },
          { icon: "👥", title: "Friends", desc: "Add players and challenge them" },
          { icon: "🚪", title: "Rooms", desc: "Create or join with a 6-letter code" },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="glass-card rounded-xl p-6 text-left"
          >
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
