import {
  Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Room } from '../room/room.entity.ts';
import type { ParticipantRole } from '../participant/participant.entity.ts';

/**
 * CallLink representa um link de acesso pré-gerado para uma sala.
 * Um link é criado antes de a chamada começar e contém as informações
 * do participante (nome, role, documento) para quando ele conectar via WS.
 */
@Entity('call_links')
export class CallLink {
  /** Token UUID — é o identificador público do link */
  @PrimaryColumn('varchar')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  roomId!: string;

  @ManyToOne(() => Room, (r) => r.links, { onDelete: 'CASCADE', nullable: false, eager: false })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  /** Nome do participante */
  @Column({ type: 'varchar' })
  name!: string;

  /** Papel na chamada: PATIENT | HEALTH_PROFESSIONAL */
  @Column({ type: 'varchar' })
  role!: ParticipantRole;

  /**
   * Documento de identificação (CPF, RG, etc.).
   * Por ora aceita qualquer texto sem validação.
   */
  @Column({ type: 'varchar', nullable: true })
  document!: string | null;

  /** URL de acesso gerada para este link */
  @Column({ type: 'varchar' })
  accessUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  /** Momento em que o link foi utilizado pela primeira vez */
  @Index()
  @Column({ type: 'datetime', nullable: true })
  usedAt!: Date | null;

  /** Data de expiração opcional */
  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;
}
