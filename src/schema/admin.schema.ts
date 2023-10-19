import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Admin extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  picture: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);