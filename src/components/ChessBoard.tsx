"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";

interface ChessBoardProps {
  fen: string;
  orientation: "white" | "black";
  canMove: boolean;
  onMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  lastMove?: { from: string; to: string } | null;
  gameOver?: boolean;
}

export function ChessBoard({
  fen,
  orientation,
  canMove,
  onMove,
  lastMove,
  gameOver,
}: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess(fen));
  const [position, setPosition] = useState(fen);
  const [moveHighlight, setMoveHighlight] = useState<{ from: string; to: string } | null>(
    null
  );
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const c = new Chess(fen);
    setGame(c);
    setPosition(fen);
    setAnimKey((k) => k + 1);
  }, [fen]);

  useEffect(() => {
    if (lastMove) setMoveHighlight(lastMove);
  }, [lastMove]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (moveHighlight) {
      styles[moveHighlight.from] = { background: "rgba(201, 162, 39, 0.45)" };
      styles[moveHighlight.to] = { background: "rgba(201, 162, 39, 0.55)" };
    }
    return styles;
  }, [moveHighlight]);

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (!canMove || gameOver) return false;

      const temp = new Chess(game.fen());
      let promotion: "q" | "r" | "b" | "n" | undefined;
      const piece = temp.get(sourceSquare);
      if (piece?.type === "p") {
        const rank = targetSquare[1];
        if ((piece.color === "w" && rank === "8") || (piece.color === "b" && rank === "1")) {
          promotion = "q";
        }
      }

      const move = temp.move({ from: sourceSquare, to: targetSquare, promotion });
      if (!move) return false;

      const previousFen = game.fen();
      setGame(temp);
      setPosition(temp.fen());
      setMoveHighlight({ from: sourceSquare, to: targetSquare });

      void onMove(sourceSquare, targetSquare, promotion).then((ok) => {
        if (!ok) {
          const reverted = new Chess(previousFen);
          setGame(reverted);
          setPosition(previousFen);
          setMoveHighlight(null);
        }
      });

      return true;
    },
    [canMove, game, gameOver, onMove]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animKey}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="animate-piece-drop w-full max-w-[min(100%,520px)] rounded-lg overflow-hidden shadow-2xl ring-2 ring-[var(--accent)]/30"
      >
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
          arePiecesDraggable={canMove && !gameOver}
          customSquareStyles={customSquareStyles}
          customDarkSquareStyle={{ backgroundColor: "#b58863" }}
          customLightSquareStyle={{ backgroundColor: "#e8d5b5" }}
          animationDuration={200}
        />
      </motion.div>
    </AnimatePresence>
  );
}
