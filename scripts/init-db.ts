import "reflect-metadata";
import AppDataSource from "@/lib/database";

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database connection...");
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection initialized");
    }

    console.log("🚀 Running migrations...");
    await AppDataSource.runMigrations();
    console.log("✅ All migrations completed successfully");

    await AppDataSource.destroy();
    console.log("✅ Database initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    process.exit(1);
  }
}

initializeDatabase();
