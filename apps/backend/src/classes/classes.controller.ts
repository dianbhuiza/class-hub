import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { DriveService } from './drive.service';
import { buildDriveDirectUrl } from './drive.util';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly driveService: DriveService,
  ) {}

  @Get()
  findAll(
    @Query('subjectId') subjectId?: string,
    @Query('week') week?: string,
  ) {
    const weekNum = week ? parseInt(week, 10) : undefined;
    return this.classesService.findAll(subjectId, weekNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/file-info')
  async fileInfo(@Param('id') id: string) {
    const classItem = await this.classesService.findOne(id);
    const info = await this.driveService.getFileInfo(classItem.url);
    return { downloadUrl: info ? buildDriveDirectUrl(info.fileId) : null, ...info };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
