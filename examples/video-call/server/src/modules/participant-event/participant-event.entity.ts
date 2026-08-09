import {
  Entity, PrimaryColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Participant } from '../participant/participant.entity.ts';

export type ParticipantEventType = 'CONNECTED' | 'RECONNECTED' | 'LEFT' | 'DISCONNECTED';

/**
 * ParticipantEvent registra cada entrada e saída de um participante.
 * Toda vez que um participante entra → connected/reconnected.
 * Toda vez que sai → left (voluntário) ou disconnected (queda).
 */
@Entity('participant_events')
@Index('idx_pevt_participant_ts', ['participantId', 'ts'])
@Index('idx_pevt_room_ts', ['roomId', 'ts'])
export class ParticipantEvent {
  @PrimaryColumn('varchar')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  participantId!: string;

  @ManyToOne(() => Participant, (p) => p.events, { onDelete: 'CASCADE', nullable: false, eager: false })
  @JoinColumn({ name: 'participantId' })
  participant!: Participant;

  /** Denormalizado para facilitar queries por sala sem join */
  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  /** CONNECTED | RECONNECTED | LEFT | DISCONNECTED */
  @Index()
  @Column({ type: 'varchar' })
  type!: ParticipantEventType;

  @CreateDateColumn()
  ts!: Date;
}
