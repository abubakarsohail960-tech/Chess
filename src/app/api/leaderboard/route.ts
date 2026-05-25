import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";

export async function GET() {
  const players = await prisma.user.findMany({
    select: { id: true, username: true, elo: true },
    orderBy: { elo: "desc" },
    take: 20,
  });
  return jsonOk({ players });
}
