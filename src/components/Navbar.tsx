"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface NavbarProps {
  user?: { username: string; elo: number } | null;
}

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rooms", label: "Rooms" },
  { href: "/friends", label: "Friends" },
  { href: "/account", label: "Account" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          >
            ♔
          </motion.span>
          <span className="text-lg font-bold tracking-tight text-[var(--accent-glow)]">
            Chess
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden text-sm sm:block">
              <span className="text-[var(--text-muted)]">{user.username}</span>
              <span className="ml-2 rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--accent-glow)]">
                {user.elo} ELO
              </span>
            </div>
            <div className="flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    pathname === link.href
                      ? "bg-[var(--accent)]/20 text-[var(--accent-glow)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button onClick={logout} className="btn-secondary text-sm py-1.5 px-3">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="btn-secondary text-sm py-1.5 px-3">
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-3">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
