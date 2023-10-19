import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherProvider } from './weather.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscribedUser, SubscribedUserSchema } from 'src/schema/subscribeduser.schema';
import { ApiKey, ApiKeySchema } from 'src/schema/apikey.schema';

@Module({
    imports: [ MongooseModule.forFeature([{ name: SubscribedUser.name, schema: SubscribedUserSchema }]), MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]) ],
    controllers: [WeatherController],
    providers: [WeatherProvider],
    exports: [WeatherProvider]
})
export class WeatherModule {}