import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid credentials");

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("Invalid email or password", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return jsonError("Invalid email or password", 401);

    await createSession(user.id);
    return jsonOk({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        elo: user.elo,
      },
    });
  } catch {
    return jsonError("Login failed", 500);
  }
}
