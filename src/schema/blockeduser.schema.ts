import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BlockedUser extends Document {

  @Prop()
  user_id: number;

}

export const BlockedUserSchema = SchemaFactory.createForClass(BlockedUser);