import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ClassesModule } from './classes/classes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SubjectsModule,
    ClassesModule,
  ],
})
export class AppModule {}
