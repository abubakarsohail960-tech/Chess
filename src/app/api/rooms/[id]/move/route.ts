import { z } from "zod";
import { Chess } from "chess.js";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateEloChange, resultToScores } from "@/lib/elo";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";
import type { GameResult } from "@prisma/client";

const moveSchema = z.object({
  from: z.string().length(2),
  to: z.string().length(2),
  promotion: z.enum(["q", "r", "b", "n"]).optional(),
});

async function finalizeGame(
  roomId: string,
  whiteId: string,
  blackId: string,
  result: GameResult
) {
  const [white, black] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: whiteId } }),
    prisma.user.findUniqueOrThrow({ where: { id: blackId } }),
  ]);

  const scores = resultToScores(result);
  const whiteCalc = calculateEloChange(white.elo, black.elo, scores.white);
  const blackCalc = calculateEloChange(black.elo, white.elo, scores.black);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: whiteId },
      data: { elo: whiteCalc.newElo },
    }),
    prisma.user.update({
      where: { id: blackId },
      data: { elo: blackCalc.newElo },
    }),
    prisma.game.create({
      data: {
        whiteId,
        blackId,
        whiteEloBefore: white.elo,
        blackEloBefore: black.elo,
        whiteEloAfter: whiteCalc.newElo,
        blackEloAfter: blackCalc.newElo,
        result,
        pgn: "",
      },
    }),
    prisma.room.update({
      where: { id: roomId },
      data: {
        status: "FINISHED",
        winnerId:
          result === "WHITE_WIN"
            ? whiteId
            : result === "BLACK_WIN"
              ? blackId
              : null,
      },
    }),
  ]);

  return { whiteCalc, blackCalc };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid move");

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return jsonError("Room not found", 404);
    if (room.status !== "ACTIVE") return jsonError("Game not active");
    if (!room.guestId || !room.whiteId || !room.blackId) {
      return jsonError("Waiting for opponent");
    }

    const isWhite = room.whiteId === user.id;
    const isBlack = room.blackId === user.id;
    if (!isWhite && !isBlack) return jsonError("Not in this game", 403);

    const chess = new Chess(room.fen);
    const turn = chess.turn();
    if ((isWhite && turn !== "w") || (isBlack && turn !== "b")) {
      return jsonError("Not your turn");
    }

    const move = chess.move({
      from: parsed.data.from,
      to: parsed.data.to,
      promotion: parsed.data.promotion ?? "q",
    });

    if (!move) return jsonError("Illegal move");

    let gameResult: GameResult | null = null;
    if (chess.isCheckmate()) {
      gameResult = chess.turn() === "w" ? "BLACK_WIN" : "WHITE_WIN";
    } else if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
      gameResult = "DRAW";
    }

    const updated = await prisma.room.update({
      where: { id },
      data: {
        fen: chess.fen(),
        pgn: room.pgn ? `${room.pgn} ${move.san}` : move.san,
      },
      include: {
        host: { select: { id: true, username: true, elo: true } },
        guest: { select: { id: true, username: true, elo: true } },
      },
    });

    let eloChanges = null;
    if (gameResult) {
      eloChanges = await finalizeGame(
        room.id,
        room.whiteId,
        room.blackId,
        gameResult
      );
    }

    return jsonOk({
      room: updated,
      move: move.san,
      gameOver: !!gameResult,
      result: gameResult,
      eloChanges,
    });
  } catch {
    return jsonError("Move failed", 500);
  }
}
