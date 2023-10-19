import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramProvider } from './telegram.provider';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscribedUser,
  SubscribedUserSchema,
} from 'src/schema/subscribeduser.schema';
import { ApiKey, ApiKeySchema } from 'src/schema/apikey.schema';
import { BlockedUser, BlockedUserSchema } from 'src/schema/blockeduser.schema';
import { WeatherModule } from 'src/weather/weather.module';

@Module({
  imports: [
    WeatherModule,
    MongooseModule.forFeature([
      { name: SubscribedUser.name, schema: SubscribedUserSchema },
    ]),
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    MongooseModule.forFeature([
      { name: BlockedUser.name, schema: BlockedUserSchema },
    ]),
  ],
  controllers: [TelegramController],
  providers: [TelegramProvider],
  exports: [TelegramProvider],
})
export class TelegramModule {} 
