import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { QuestStatus } from '../enums/quest-status.enum';

@Entity('quests')
export class Quest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    title: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 18, scale: 7 })
    reward: number;

    @Column({
        type: 'enum',
        enum: QuestStatus,
        default: QuestStatus.DRAFT,
    })
    @Index()
    status: QuestStatus;

    @Column()
    @Index()
    creatorAddress: string;

    @Column({ nullable: true })
    maxCompletions: number;

    @Column({ default: 0 })
    currentCompletions: number;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
