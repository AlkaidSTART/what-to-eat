import { DataSourceOptions } from "typeorm";
import { User } from "./src/entities/User";
import { Roulette } from "./src/entities/Roulette";
import { RouletteItem } from "./src/entities/RouletteItem";

const config: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Roulette, RouletteItem],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
};

export default config;
