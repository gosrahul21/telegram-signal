import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, UserModule, ConfigModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
