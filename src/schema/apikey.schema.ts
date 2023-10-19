import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ApiKey extends Document {
  @Prop()
  weather_api: string;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);