import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { ClubModule } from './club/club.module';
import { ClubSocioModule } from './club-socio/club-socio.module';

@Module({
  imports: [MemberModule, ClubModule, ClubSocioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
