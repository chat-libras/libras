import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Participant } from './Participant.ts';

/**
 * Uma Session representa uma instância de sala ativa.
 * Múltiplos Participants se conectam a uma Session (pela roomId).
 * A PK é UUID gerado no momento da criação.
 */
@Entity('sessions')
export class Session {
  @PrimaryColumn('varchar')
  id!: string;

  /** Identificador lógico da sala — vários peers compartilham a mesma sessão */
  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @Column({ type: 'datetime', nullable: true })
  closedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Participant, (p) => p.session, { cascade: false })
  participants!: Participant[];
}
