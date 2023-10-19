import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SubscribedUser extends Document {
  @Prop()
  user: string;

  @Prop()
  user_id: number;

  @Prop()
  city: string;

}

export const SubscribedUserSchema = SchemaFactory.createForClass(SubscribedUser);