import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    include: {
      sender: { select: { id: true, username: true, elo: true } },
      receiver: { select: { id: true, username: true, elo: true } },
    },
  });

  const friends = friendships.map((f) =>
    f.senderId === user.id ? f.receiver : f.sender
  );

  const pending = await prisma.friendship.findMany({
    where: { receiverId: user.id, status: "PENDING" },
    include: {
      sender: { select: { id: true, username: true, elo: true } },
    },
  });

  return jsonOk({
    friends,
    pendingRequests: pending.map((p) => ({
      id: p.id,
      from: p.sender,
    })),
  });
}

const requestSchema = z.object({
  username: z.string().min(3),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid username");

    const target = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });
    if (!target) return jsonError("User not found", 404);
    if (target.id === user.id) return jsonError("Cannot add yourself");

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: target.id },
          { senderId: target.id, receiverId: user.id },
        ],
      },
    });
    if (existing) {
      if (existing.status === "ACCEPTED") return jsonError("Already friends");
      if (existing.status === "PENDING") return jsonError("Request already pending");
    }

    const friendship = await prisma.friendship.create({
      data: { senderId: user.id, receiverId: target.id },
    });

    return jsonOk({ request: friendship }, 201);
  } catch {
    return jsonError("Failed to send request", 500);
  }
}
