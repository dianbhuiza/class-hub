import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll(subjectId?: string, week?: number) {
    const where: any = {};

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

  async findOne(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: { subject: true },
        },
      },
    });

    if (!classItem) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    return classItem;
  }

  async create(dto: CreateClassDto) {
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

  async update(id: string, dto: UpdateClassDto) {
    await this.findOne(id);

    const updateData: any = {};

    if (dto.title !== undefined) updateData.title = dto.title || null;
    if (dto.url) updateData.url = dto.url;

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

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.class.delete({
      where: { id },
    });
  }

  private async calculateWeek(classDate: Date): Promise<number> {
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

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
