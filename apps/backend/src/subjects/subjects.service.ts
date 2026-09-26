import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            class: {
              include: { subjects: { include: { subject: true } } },
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

    return this.prisma.subject.create({
      data: { name: dto.name },
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
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
