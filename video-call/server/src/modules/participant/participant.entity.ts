import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany, Index,
} from 'typeorm';
import { Room } from '../room/room.entity.ts';
import { ParticipantEvent } from '../participant-event/participant-event.entity.ts';

export type ParticipantRole = 'PATIENT' | 'HEALTH_PROFESSIONAL';

export type ParticipantStatus =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'RECONNECTED'
  | 'LEFT'
  | 'DISCONNECTED';

/**
 * Participant representa um peer conectado (ou que se conectou) via WS.
 * É criado pelo signaling no momento do join, a partir de um CallLink.
 */
@Entity('participants')
export class Participant {
  /** UUID do peer — gerado pelo cliente ou pelo CallLink */
  @PrimaryColumn('varchar')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @ManyToOne(() => Room, (r) => r.participants, { onDelete: 'CASCADE', nullable: false, eager: false })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  /** Nome do participante (vindo do CallLink) */
  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  /** Papel na chamada */
  @Index()
  @Column({ type: 'varchar' })
  role!: ParticipantRole;

  /** Documento (CPF etc.), copiado do CallLink */
  @Column({ type: 'varchar', nullable: true })
  document!: string | null;

  @Index()
  @Column({ type: 'varchar', default: 'NOT_STARTED' satisfies ParticipantStatus })
  status!: ParticipantStatus;

  @Column({ type: 'datetime', nullable: true })
  joinedAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastActiveAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  leftAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  reconnectCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => ParticipantEvent, (e) => e.participant, { cascade: false })
  events!: ParticipantEvent[];
}
