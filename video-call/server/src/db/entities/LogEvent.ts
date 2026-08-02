import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Participant } from './Participant.ts';

@Entity('log_events')
export class LogEvent {
  @PrimaryColumn('varchar')
  id!: string;

  /** Participante que gerou o evento */
  @ManyToOne(() => Participant, (p) => p.logs, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'participantId' })
  participant!: Participant | null;

  @Column({ type: 'varchar', nullable: true })
  participantId!: string | null;

  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @Column({ type: 'varchar' })
  peerId!: string;

  @Column({ type: 'varchar' })
  role!: string;

  /** client | server */
  @Column({ type: 'varchar', default: 'client' })
  origin!: string;

  /** media | socket | debug | log | system | ... */
  @Column({ type: 'varchar' })
  category!: string;

  /** título/chave do evento, ex: audio_sent, camera:on */
  @Column({ type: 'varchar' })
  info!: string;

  /** conteúdo adicional estruturado */
  @Column({ type: 'simple-json', nullable: true })
  details!: Record<string, unknown> | null;

  @CreateDateColumn()
  ts!: Date;
}
