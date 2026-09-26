import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { DriveService } from './drive.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, DriveService],
  exports: [ClassesService],
})
export class ClassesModule {}
