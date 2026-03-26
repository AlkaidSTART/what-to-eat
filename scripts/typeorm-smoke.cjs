require("dotenv").config();
const { DataSource, EntitySchema } = require("typeorm");

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;

const SmokeEntity = new EntitySchema({
  name: "TypeormSmoke",
  tableName: "typeorm_smoke",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: String },
    createdAt: { type: "timestamp", createDate: true },
  },
});

async function run() {
  const ds = new DataSource({
    type: "postgres",
    url,
    synchronize: true,
    logging: false,
    entities: [SmokeEntity],
  });

  try {
    await ds.initialize();
    const repo = ds.getRepository("TypeormSmoke");
    const created = await repo.save({ name: "smoke-test" });
    const rows = await repo.find({ order: { createdAt: "DESC" }, take: 1 });
    await repo.delete({ id: created.id });
    await ds.destroy();

    console.log("TYPEORM_SMOKE_OK");
    console.log(JSON.stringify({ insertedId: created.id, fetchedCount: rows.length }, null, 2));
  } catch (error) {
    console.error("TYPEORM_SMOKE_FAIL");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

run();
