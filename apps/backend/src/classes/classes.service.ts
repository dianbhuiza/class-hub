import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassLinkDto } from './dto/create-class-link.dto';
import { UpdateClassLinkDto } from './dto/update-class-link.dto';
import { titleFromUrl } from '../common/url.util';

const classInclude = {
  subjects: {
    include: { subject: true },
  },
  links: {
    orderBy: { createdAt: 'asc' as const },
    include: { subject: true },
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
            title: link.title?.trim() || titleFromUrl(link.url),
            url: link.url,
            subjectId: this.resolveLinkSubjectId(
              dto.subjectIds,
              link.subjectId,
            ),
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

    const saved = await this.prisma.class.update({
      where: { id },
      data: updateData,
      include: classInclude,
    });

    if (dto.subjectIds) {
      await this.syncLinkSubjects(
        saved.id,
        saved.subjects.map((cs) => cs.subject.id),
      );
    }

    return saved;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.class.delete({
      where: { id },
    });
  }

  async createLink(classId: string, dto: CreateClassLinkDto) {
    const classItem = await this.findOne(classId);
    const url = dto.url.trim();

    return this.prisma.classLink.create({
      data: {
        classId,
        title: dto.title?.trim() || titleFromUrl(url),
        url,
        subjectId: this.resolveLinkSubjectId(
          this.subjectIdsOf(classItem),
          dto.subjectId,
        ),
      },
      include: { subject: true },
    });
  }

  async updateLink(classId: string, linkId: string, dto: UpdateClassLinkDto) {
    const link = await this.findLink(classId, linkId);

    let subjectId: string | null | undefined;

    if (dto.subjectId !== undefined) {
      if (dto.subjectId === null) {
        subjectId = null;
      } else {
        const classItem = await this.findOne(classId);
        subjectId = this.resolveLinkSubjectId(
          this.subjectIdsOf(classItem),
          dto.subjectId,
        );
      }
    }

    return this.prisma.classLink.update({
      where: { id: link.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.url !== undefined ? { url: dto.url.trim() } : {}),
        ...(subjectId !== undefined ? { subjectId } : {}),
      },
      include: { subject: true },
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

  private subjectIdsOf(classItem: {
    subjects: { subject: { id: string } }[];
  }): string[] {
    return classItem.subjects.map((cs) => cs.subject.id);
  }

  private resolveLinkSubjectId(
    classSubjectIds: string[],
    requested?: string | null,
  ): string | null {
    if (requested !== undefined && requested !== null) {
      if (!classSubjectIds.includes(requested)) {
        throw new BadRequestException(
          'La asignatura indicada no pertenece a esta clase',
        );
      }
      return requested;
    }

    return classSubjectIds.length === 1 ? (classSubjectIds[0] ?? null) : null;
  }

  private async syncLinkSubjects(classId: string, subjectIds: string[]) {
    const single = subjectIds.length === 1 ? (subjectIds[0] ?? null) : null;
    const links = await this.prisma.classLink.findMany({
      where: { classId },
      select: { id: true, subjectId: true },
    });

    const stale = links.filter((link) => {
      if (single !== null) return link.subjectId !== single;
      if (subjectIds.length === 0) return link.subjectId !== null;
      return link.subjectId !== null && !subjectIds.includes(link.subjectId);
    });

    for (const link of stale) {
      await this.prisma.classLink.update({
        where: { id: link.id },
        data: { subjectId: single },
      });
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
