"use server";

import AppDataSource, { initializeDataSource } from "@/lib/database";
import { Roulette } from "@/entities/Roulette";
import { RouletteItem } from "@/entities/RouletteItem";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function getRoulettesAction() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    await initializeDataSource();
    const rouletteRepository = AppDataSource.getRepository(Roulette);
    
    const roulettes = await rouletteRepository.find({
      where: { userId },
      relations: ["items"],
      order: { createdAt: "DESC" }
    });

    return roulettes;
  } catch (error) {
    console.error("Get roulettes error:", error);
    throw error;
  }
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

  try {
    await initializeDataSource();
    const rouletteRepository = AppDataSource.getRepository(Roulette);
    const itemRepository = AppDataSource.getRepository(RouletteItem);

    if (id === "new") {
      const roulette = rouletteRepository.create({
        name: data.name,
        type: data.type,
        isDefault: data.isDefault,
        userId,
        items: data.items.map(item => {
          const routeItem = itemRepository.create({
            name: item.name,
            fixedProbability: item.fixedProbability
          });
          return routeItem;
        })
      });
      
      await rouletteRepository.save(roulette);
    } else {
      // Update existing: Delete all items and recreate for simplicity
      await itemRepository.delete({ rouletteId: id });

      const roulette = await rouletteRepository.findOne({ where: { id } });
      if (!roulette) {
        throw new Error("Roulette not found");
      }

      roulette.name = data.name;
      roulette.type = data.type;
      roulette.isDefault = data.isDefault;

      const items = data.items.map(item => {
        const routeItem = itemRepository.create({
          name: item.name,
          fixedProbability: item.fixedProbability,
          rouletteId: id
        });
        return routeItem;
      });

      await rouletteRepository.save(roulette);
      await itemRepository.save(items);
    }

    revalidatePath("/manage");
    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Save roulette error:", error);
    throw error;
  }
}
