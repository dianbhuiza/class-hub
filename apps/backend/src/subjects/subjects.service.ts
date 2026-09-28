import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { titleFromUrl } from '../common/url.util';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateSubjectFileDto } from './dto/create-subject-file.dto';
import { UpdateSubjectFileDto } from './dto/update-subject-file.dto';

const filesInclude = {
  files: {
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      include: filesInclude,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        ...filesInclude,
        classes: {
          include: {
            class: {
              include: {
                subjects: { include: { subject: true } },
                links: { orderBy: { createdAt: 'asc' } },
              },
            },
          },
          orderBy: { class: { date: 'asc' } },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    }

    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Subject "${dto.name}" already exists`);
    }

    const files = dto.files ?? [];

    return this.prisma.subject.create({
      data: {
        name: dto.name,
        img: dto.img || null,
        materialsUrl: dto.materialsUrl || null,
        files: {
          create: files.map((file) => ({
            title: file.title?.trim() || titleFromUrl(file.url),
            url: file.url,
          })),
        },
      },
      include: filesInclude,
    });
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.subject.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Subject "${dto.name}" already exists`);
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.img !== undefined ? { img: dto.img || null } : {}),
        ...(dto.materialsUrl !== undefined
          ? { materialsUrl: dto.materialsUrl || null }
          : {}),
      },
      include: filesInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.subject.delete({
      where: { id },
    });
  }

  async createFile(subjectId: string, dto: CreateSubjectFileDto) {
    await this.findOne(subjectId);

    const url = dto.url.trim();

    return this.prisma.subjectFile.create({
      data: {
        subjectId,
        title: dto.title?.trim() || titleFromUrl(url),
        url,
      },
    });
  }

  async updateFile(
    subjectId: string,
    fileId: string,
    dto: UpdateSubjectFileDto,
  ) {
    const file = await this.findFile(subjectId, fileId);

    return this.prisma.subjectFile.update({
      where: { id: file.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.url !== undefined ? { url: dto.url.trim() } : {}),
      },
    });
  }

  async removeFile(subjectId: string, fileId: string) {
    const file = await this.findFile(subjectId, fileId);

    return this.prisma.subjectFile.delete({
      where: { id: file.id },
    });
  }

  private async findFile(subjectId: string, fileId: string) {
    await this.findOne(subjectId);

    const file = await this.prisma.subjectFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.subjectId !== subjectId) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    return file;
  }
}
