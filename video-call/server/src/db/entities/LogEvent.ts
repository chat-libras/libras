import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Session } from './Session.ts';

@Entity('log_events')
export class LogEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Session, (s) => s.events, { onDelete: 'CASCADE' })
  session!: Session;

  // roomId denormalizado para queries por sala sem join
  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @Column({ type: 'varchar' })
  peerId!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ type: 'varchar' })
  eventType!: string;

  @Column({ type: 'simple-json' })
  payload!: Record<string, unknown>;

  @CreateDateColumn()
  ts!: Date;
}
