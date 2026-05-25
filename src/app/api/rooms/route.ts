import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateRoomCode } from "@/lib/room-code";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const rooms = await prisma.room.findMany({
    where: {
      OR: [{ hostId: user.id }, { guestId: user.id }],
      status: { in: ["WAITING", "ACTIVE"] },
    },
    include: {
      host: { select: { id: true, username: true, elo: true } },
      guest: { select: { id: true, username: true, elo: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk({ rooms });
}

const createSchema = z.object({
  name: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);

    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const exists = await prisma.room.findUnique({ where: { code } });
      if (!exists) break;
      code = generateRoomCode();
      attempts++;
    }

    const room = await prisma.room.create({
      data: {
        code,
        name: parsed.success ? parsed.data.name : undefined,
        hostId: user.id,
        whiteId: user.id,
      },
      include: {
        host: { select: { id: true, username: true, elo: true } },
      },
    });

    return jsonOk({ room }, 201);
  } catch {
    return jsonError("Failed to create room", 500);
  }
}

const joinSchema = z.object({
  code: z.string().min(4).max(8),
});

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid room code");

    const room = await prisma.room.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
      include: { host: true, guest: true },
    });

    if (!room) return jsonError("Room not found", 404);
    if (room.status !== "WAITING") return jsonError("Room is not available");
    if (room.hostId === user.id) return jsonError("You are already in this room");
    if (room.guestId) return jsonError("Room is full");

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        guestId: user.id,
        blackId: user.id,
        status: "ACTIVE",
      },
      include: {
        host: { select: { id: true, username: true, elo: true } },
        guest: { select: { id: true, username: true, elo: true } },
      },
    });

    return jsonOk({ room: updated });
  } catch {
    return jsonError("Failed to join room", 500);
  }
}
