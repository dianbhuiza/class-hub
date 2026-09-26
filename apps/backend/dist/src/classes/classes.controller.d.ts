import { ClassesService } from './classes.service';
import { DriveService } from './drive.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesController {
    private readonly classesService;
    private readonly driveService;
    constructor(classesService: ClassesService, driveService: DriveService);
    findAll(subjectId?: string, week?: string): Promise<({
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
    fileInfo(id: string): Promise<{
        fileId?: string | undefined;
        filename?: string | null | undefined;
        sizeBytes?: number | null | undefined;
        contentType?: string | null | undefined;
        downloadUrl: string | null;
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
}
