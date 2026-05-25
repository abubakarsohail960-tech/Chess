import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, username: true, elo: true } },
      guest: { select: { id: true, username: true, elo: true } },
      winner: { select: { id: true, username: true } },
    },
  });

  if (!room) return jsonError("Room not found", 404);
  if (room.hostId !== user.id && room.guestId !== user.id) {
    return jsonError("Not a member of this room", 403);
  }

  const myColor =
    room.whiteId === user.id ? "w" : room.blackId === user.id ? "b" : null;

  return jsonOk({
    room: {
      ...room,
      myColor,
      isMyTurn:
        myColor === "w"
          ? room.fen.includes(" w ")
          : myColor === "b"
            ? room.fen.includes(" b ")
            : false,
    },
  });
}
