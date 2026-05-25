import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";

const updateSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(72).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return jsonOk({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input");

    const { username, currentPassword, newPassword } = parsed.data;

    if (newPassword) {
      if (!currentPassword) {
        return jsonError("Current password required to set new password");
      }
      const full = await prisma.user.findUnique({ where: { id: user.id } });
      if (!full) return unauthorized();
      const valid = await verifyPassword(currentPassword, full.passwordHash);
      if (!valid) return jsonError("Current password is incorrect");
    }

    if (username && username !== user.username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) return jsonError("Username already taken");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username ? { username } : {}),
        ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
      },
      select: { id: true, username: true, email: true, elo: true, createdAt: true },
    });

    return jsonOk({ user: updated });
  } catch {
    return jsonError("Update failed", 500);
  }
}
