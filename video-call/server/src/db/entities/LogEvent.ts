import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Participant } from '../../modules/participant/participant.entity.ts';

@Entity('log_events')
@Index('idx_log_participant_ts', ['participantId', 'ts'])
@Index('idx_log_category', ['category'])
@Index('idx_log_origin', ['origin'])
export class LogEvent {
  @PrimaryColumn('varchar')
  id!: string;

  /** Participante que gerou o evento (null = evento de servidor sem peer) */
  @ManyToOne(() => Participant, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'participantId' })
  participant!: Participant | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  participantId!: string | null;

  /** CLIENT | SERVER */
  @Column({ type: 'varchar', default: 'CLIENT' })
  origin!: string;

  /** MEDIA | SOCKET | DEBUG | LOG | SYSTEM | ... */
  @Column({ type: 'varchar' })
  category!: string;

  /** título/chave do evento, ex: audio_sent, camera:on */
  @Column({ type: 'varchar' })
  info!: string;

  /** conteúdo adicional estruturado */
  @Column({ type: 'simple-json', nullable: true })
  details!: Record<string, unknown> | null;

  @CreateDateColumn()
  @Index()
  ts!: Date;
}
