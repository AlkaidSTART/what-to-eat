"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function getRoulettesAction() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const roulettes = await prisma.roulette.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return roulettes;
}

export async function saveRouletteAction(
  id: string, 
  data: { name: string; type: any; isDefault: boolean; items: any[] }
) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Validate probability
  const totalFixed = data.items.reduce((sum, item) => sum + (item.fixedProbability || 0), 0);
  if (totalFixed > 100) {
    throw new Error("概率总和不能大于100%");
  }

  if (id === "new") {
    await prisma.roulette.create({
      data: {
        name: data.name,
        type: data.type,
        isDefault: data.isDefault,
        userId,
        items: {
          create: data.items.map(item => ({
            name: item.name,
            fixedProbability: item.fixedProbability
          }))
        }
      }
    });
  } else {
    // Update existing: Delete all items and recreate for simplicity
    await prisma.rouletteItem.deleteMany({
      where: { rouletteId: id }
    });

    await prisma.roulette.update({
      where: { id, userId },
      data: {
        name: data.name,
        type: data.type,
        isDefault: data.isDefault,
        items: {
          create: data.items.map(item => ({
            name: item.name,
            fixedProbability: item.fixedProbability
          }))
        }
      }
    });
  }

  revalidatePath("/manage");
  revalidatePath("/home");
  return { success: true };
}
