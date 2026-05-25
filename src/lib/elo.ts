export function expectedScore(playerElo: number, opponentElo: number) {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  score: 0 | 0.5 | 1,
  k = 32
) {
  const expected = expectedScore(playerElo, opponentElo);
  const newElo = Math.round(playerElo + k * (score - expected));
  return { newElo, change: newElo - playerElo };
}

export function resultToScores(result: "WHITE_WIN" | "BLACK_WIN" | "DRAW") {
  if (result === "WHITE_WIN") return { white: 1 as const, black: 0 as const };
  if (result === "BLACK_WIN") return { white: 0 as const, black: 1 as const };
  return { white: 0.5 as const, black: 0.5 as const };
}
