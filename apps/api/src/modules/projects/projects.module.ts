import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtStrategy } from '../../common/guards/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'protofacil-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtStrategy],
  exports: [ProjectsService],
})
export class ProjectsModule {}