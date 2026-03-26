import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Roulette } from "./Roulette";

@Entity("roulette_items")
export class RouletteItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "float", nullable: true })
  fixedProbability: number | null;

  @Column()
  rouletteId: string;

  @ManyToOne(() => Roulette, (roulette) => roulette.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "rouletteId" })
  roulette: Roulette;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
