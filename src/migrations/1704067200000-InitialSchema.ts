import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialSchema1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            primaryKeyConstraintName: "PK_users_id",
            isGenerated: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "username",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create roulettes table
    await queryRunner.createTable(
      new Table({
        name: "roulettes",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            primaryKeyConstraintName: "PK_roulettes_id",
            isGenerated: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
            default: "'NONE'",
          },
          {
            name: "isDefault",
            type: "boolean",
            default: false,
          },
          {
            name: "userId",
            type: "uuid",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_roulettes_userId",
            columnNames: ["userId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    // Create roulette_items table
    await queryRunner.createTable(
      new Table({
        name: "roulette_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            primaryKeyConstraintName: "PK_roulette_items_id",
            isGenerated: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "fixedProbability",
            type: "float",
            isNullable: true,
          },
          {
            name: "rouletteId",
            type: "uuid",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_roulette_items_rouletteId",
            columnNames: ["rouletteId"],
            referencedTableName: "roulettes",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_roulettes_userId" ON "roulettes" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roulette_items_rouletteId" ON "roulette_items" ("rouletteId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_roulette_items_rouletteId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_roulettes_userId"`);

    // Drop tables in reverse order
    await queryRunner.dropTable("roulette_items", true);
    await queryRunner.dropTable("roulettes", true);
    await queryRunner.dropTable("users", true);
  }
}

export default InitialSchema1704067200000;

