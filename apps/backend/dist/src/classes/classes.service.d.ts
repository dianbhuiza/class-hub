import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(subjectId?: string, week?: number): Promise<({
        subjects: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                img: string | null;
            };
        } & {
            classId: string;
            subjectId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        week: number;
        date: Date;
        title: string | null;
    })[]>;
    findOne(id: string): Promise<{
        subjects: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                img: string | null;
            };
        } & {
            classId: string;
            subjectId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        week: number;
        date: Date;
        title: string | null;
    }>;
    create(dto: CreateClassDto): Promise<{
        subjects: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                img: string | null;
            };
        } & {
            classId: string;
            subjectId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        week: number;
        date: Date;
        title: string | null;
    }>;
    update(id: string, dto: UpdateClassDto): Promise<{
        subjects: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                img: string | null;
            };
        } & {
            classId: string;
            subjectId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        week: number;
        date: Date;
        title: string | null;
    }>;
    remove(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        week: number;
        date: Date;
        title: string | null;
    }>;
    private calculateWeek;
    private getMonday;
}
