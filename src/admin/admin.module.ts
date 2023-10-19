import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../schema/admin.schema';
import {
  SubscribedUser,
  SubscribedUserSchema,
} from 'src/schema/subscribeduser.schema';
import { ApiKey, ApiKeySchema } from 'src/schema/apikey.schema';
import { WeatherModule } from 'src/weather/weather.module';
import { BlockedUser, BlockedUserSchema } from 'src/schema/blockeduser.schema';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    TelegramModule,
    WeatherModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([
      { name: SubscribedUser.name, schema: SubscribedUserSchema },
    ]),
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    MongooseModule.forFeature([
      { name: BlockedUser.name, schema: BlockedUserSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminProvider],
})
export class AdminModule {}
