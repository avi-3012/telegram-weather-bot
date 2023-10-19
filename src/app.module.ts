import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
require('dotenv').config();


@Module({
  imports: [ AdminModule, TelegramModule, MongooseModule.forRoot(`${process.env.MONGO_URL}`) ],
})
export class AppModule {}
