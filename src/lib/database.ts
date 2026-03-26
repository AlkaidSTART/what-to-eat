import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Roulette } from "@/entities/Roulette";
import { RouletteItem } from "@/entities/RouletteItem";

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Roulette, RouletteItem],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});

declare global {
  var typeormDataSource: DataSource | undefined;
}

export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    globalThis.typeormDataSource = await AppDataSource.initialize();
  }
  return AppDataSource;
}

// Initialize in development
if (process.env.NODE_ENV === "development") {
  initializeDataSource().catch((error) => {
    console.error("Error initializing DataSource:", error);
  });
}

export default AppDataSource;
