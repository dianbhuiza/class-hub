import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassLinkDto } from './dto/create-class-link.dto';
import { UpdateClassLinkDto } from './dto/update-class-link.dto';

const classInclude = {
  subjects: {
    include: { subject: true },
  },
  links: {
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

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
      include: classInclude,
      orderBy: [{ week: 'asc' }, { date: 'asc' }],
    });
  }

  async findOne(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: classInclude,
    });

    if (!classItem) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    return classItem;
  }

  async create(dto: CreateClassDto) {
    const week = await this.calculateWeek(new Date(dto.date));
    const links = dto.links ?? [];

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
        links: {
          create: links.map((link) => ({
            title: link.title?.trim() || this.titleFromUrl(link.url),
            url: link.url,
          })),
        },
      },
      include: classInclude,
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
      include: classInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.class.delete({
      where: { id },
    });
  }

  async createLink(classId: string, dto: CreateClassLinkDto) {
    await this.findOne(classId);

    const url = dto.url.trim();

    return this.prisma.classLink.create({
      data: {
        classId,
        title: dto.title?.trim() || this.titleFromUrl(url),
        url,
      },
    });
  }

  async updateLink(classId: string, linkId: string, dto: UpdateClassLinkDto) {
    const link = await this.findLink(classId, linkId);

    return this.prisma.classLink.update({
      where: { id: link.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.url !== undefined ? { url: dto.url.trim() } : {}),
      },
    });
  }

  async removeLink(classId: string, linkId: string) {
    const link = await this.findLink(classId, linkId);

    return this.prisma.classLink.delete({
      where: { id: link.id },
    });
  }

  private async findLink(classId: string, linkId: string) {
    await this.findOne(classId);

    const link = await this.prisma.classLink.findUnique({
      where: { id: linkId },
    });

    if (!link || link.classId !== classId) {
      throw new NotFoundException(`Link with ID "${linkId}" not found`);
    }

    return link;
  }

  private titleFromUrl(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
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
