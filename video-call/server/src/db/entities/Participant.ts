import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Session } from './Session.ts';
import { LogEvent } from './LogEvent.ts';

export type ParticipantStatus =
  | 'not_started'   // link gerado mas ainda não entrou
  | 'active'        // conectado e na chamada
  | 'inactive'      // perdeu conexão temporariamente
  | 'reconnected'   // reconectou após inativo
  | 'left'          // saiu voluntariamente
  | 'disconnected'; // queda de conexão definitiva

@Entity('participants')
export class Participant {
  /** UUID do peer — gerado pelo cliente ou pela API REST */
  @PrimaryColumn('varchar')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @Column({ type: 'varchar', default: 'not_started' satisfies ParticipantStatus })
  status!: ParticipantStatus;

  /** URL de acesso à videochamada para este participante */
  @Column({ type: 'varchar', nullable: true })
  accessUrl!: string | null;

  /** Sessão de sala à qual este participante está vinculado */
  @ManyToOne(() => Session, (s) => s.participants, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'sessionId' })
  session!: Session | null;

  @Column({ type: 'varchar', nullable: true })
  sessionId!: string | null;

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

  @OneToMany(() => LogEvent, (e) => e.participant, { cascade: false })
  logs!: LogEvent[];
}
