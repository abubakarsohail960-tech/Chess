import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [games, leaderboard] = await Promise.all([
    prisma.game.findMany({
      where: { OR: [{ whiteId: user.id }, { blackId: user.id }] },
      include: {
        whitePlayer: { select: { username: true } },
        blackPlayer: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      select: { username: true, elo: true },
      orderBy: { elo: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[var(--text-muted)]">
            Welcome back, <span className="text-[var(--accent-glow)]">{user.username}</span>
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-6 animate-pulse-glow">
            <p className="text-sm text-[var(--text-muted)]">Your ELO</p>
            <p className="text-4xl font-bold text-[var(--accent-glow)]">{user.elo}</p>
          </div>
          <Link href="/rooms" className="glass-card rounded-xl p-6 hover:border-[var(--accent)]/30 transition-colors">
            <p className="text-sm text-[var(--text-muted)]">Quick play</p>
            <p className="text-xl font-semibold mt-1">Create or join a room →</p>
          </Link>
          <Link href="/friends" className="glass-card rounded-xl p-6 hover:border-[var(--accent)]/30 transition-colors">
            <p className="text-sm text-[var(--text-muted)]">Friends</p>
            <p className="text-xl font-semibold mt-1">Find opponents →</p>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="glass-card rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Recent Games</h2>
            {games.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No games yet. Start a room!</p>
            ) : (
              <ul className="space-y-3">
                {games.map((g) => (
                  <li key={g.id} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span>
                      {g.whitePlayer.username} vs {g.blackPlayer.username}
                    </span>
                    <span className="text-[var(--text-muted)]">{g.result.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Leaderboard</h2>
            <ol className="space-y-2">
              {leaderboard.map((p, i) => (
                <li
                  key={p.username}
                  className={`flex justify-between text-sm py-1 ${
                    p.username === user.username ? "text-[var(--accent-glow)] font-medium" : ""
                  }`}
                >
                  <span>
                    {i + 1}. {p.username}
                  </span>
                  <span>{p.elo}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
