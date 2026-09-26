import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        img: string | null;
    }[]>;
    findOne(id: string): Promise<{
        classes: ({
            class: {
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
            };
        } & {
            classId: string;
            subjectId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        img: string | null;
    }>;
    create(dto: CreateSubjectDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        img: string | null;
    }>;
    update(id: string, dto: UpdateSubjectDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        img: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        img: string | null;
    }>;
}
