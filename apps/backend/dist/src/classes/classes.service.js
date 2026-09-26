"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(subjectId, week) {
        const where = {};
        if (subjectId) {
            where.subjects = {
                some: { subjectId },
            };
        }
        if (week) {
            where.week = week;
        }
        return this.prisma.class.findMany({
            where,
            include: {
                subjects: {
                    include: { subject: true },
                },
            },
            orderBy: [{ week: 'asc' }, { date: 'asc' }],
        });
    }
    async findOne(id) {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: {
                subjects: {
                    include: { subject: true },
                },
            },
        });
        if (!classItem) {
            throw new common_1.NotFoundException(`Class with ID "${id}" not found`);
        }
        return classItem;
    }
    async create(dto) {
        const week = await this.calculateWeek(new Date(dto.date));
        return this.prisma.class.create({
            data: {
                title: dto.title,
                url: dto.url,
                date: new Date(dto.date),
                week,
                subjects: {
                    create: dto.subjectIds.map((subjectId) => ({
                        subject: { connect: { id: subjectId } },
                    })),
                },
            },
            include: {
                subjects: {
                    include: { subject: true },
                },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const updateData = {};
        if (dto.title)
            updateData.title = dto.title;
        if (dto.url)
            updateData.url = dto.url;
        if (dto.date) {
            updateData.date = new Date(dto.date);
            updateData.week = await this.calculateWeek(new Date(dto.date));
        }
        if (dto.subjectIds) {
            await this.prisma.classSubject.deleteMany({
                where: { classId: id },
            });
            updateData.subjects = {
                create: dto.subjectIds.map((subjectId) => ({
                    subject: { connect: { id: subjectId } },
                })),
            };
        }
        return this.prisma.class.update({
            where: { id },
            data: updateData,
            include: {
                subjects: {
                    include: { subject: true },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.class.delete({
            where: { id },
        });
    }
    async calculateWeek(classDate) {
        const allClasses = await this.prisma.class.findMany({
            select: { date: true },
            orderBy: { date: 'asc' },
        });
        if (allClasses.length === 0) {
            return 1;
        }
        const oldestDate = allClasses[0].date;
        const oldestMonday = this.getMonday(oldestDate);
        const classMonday = this.getMonday(classDate);
        const diffTime = classMonday.getTime() - oldestMonday.getTime();
        const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
        return diffWeeks + 1;
    }
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map