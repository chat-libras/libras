import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CallLink } from '../call-link/call-link.entity.ts';
import { Participant } from '../participant/participant.entity.ts';

/**
 * Room representa uma sala de videochamada.
 * Criada via POST /rooms e persiste até ser explicitamente fechada.
 */
@Entity('rooms')
export class Room {
  @PrimaryColumn('varchar')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @Column({ type: 'datetime', nullable: true })
  closedAt!: Date | null;

  /** Participante que iniciou a sala (primeiro a conectar via WS) */
  @Column({ type: 'varchar', nullable: true })
  startedById!: string | null;

  @ManyToOne(() => Participant, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'startedById' })
  startedBy!: Participant | null;

  @OneToMany(() => CallLink, (l) => l.room, { cascade: false })
  links!: CallLink[];

  @OneToMany(() => Participant, (p) => p.room, { cascade: false })
  participants!: Participant[];
}
