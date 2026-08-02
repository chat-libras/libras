import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { LogEvent } from './LogEvent.ts';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  // Identificador lógico da sala — não é PK, pode ter múltiplas sessões por sala
  @Column({ type: 'varchar' })
  roomId!: string;

  @Column({ type: 'varchar' })
  peerId!: string;

  @Column({ type: 'varchar', nullable: true })
  role?: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  leftAt?: Date;

  @OneToMany(() => LogEvent, (e) => e.session)
  events!: LogEvent[];
}
