import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    const { username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return jsonError(
        existing.email === email ? "Email already registered" : "Username taken"
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, elo: true },
    });

    await createSession(user.id);
    return jsonOk({ user }, 201);
  } catch (err) {
    console.error("Register error:", err);
    const msg =
      err instanceof Error && err.message.includes("connect")
        ? "Database not connected. Run: npx prisma db push"
        : "Registration failed";
    return jsonError(msg, 500);
  }
}
