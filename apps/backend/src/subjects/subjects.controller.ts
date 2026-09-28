import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateSubjectFileDto } from './dto/create-subject-file.dto';
import { UpdateSubjectFileDto } from './dto/update-subject-file.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/files')
  createFile(@Param('id') id: string, @Body() dto: CreateSubjectFileDto) {
    return this.subjectsService.createFile(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/files/:fileId')
  updateFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Body() dto: UpdateSubjectFileDto,
  ) {
    return this.subjectsService.updateFile(id, fileId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/files/:fileId')
  removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.subjectsService.removeFile(id, fileId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
