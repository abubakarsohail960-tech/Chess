import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonOk, jsonError, unauthorized } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const { action } = await request.json();

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || friendship.receiverId !== user.id) {
    return jsonError("Request not found", 404);
  }

  if (action === "accept") {
    await prisma.friendship.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
    return jsonOk({ success: true });
  }

  if (action === "reject") {
    await prisma.friendship.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return jsonOk({ success: true });
  }

  return jsonError("Invalid action");
}
