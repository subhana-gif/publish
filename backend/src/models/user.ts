// src/models/User.ts
import { Schema, model, Types, InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null }, // Store the path or URL to the profile image
  preferences: { type: [String], default: [] }
}, { timestamps: true });

// Automatically infer the type of the model
export type IUser = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };

const User = model<IUser>('User', userSchema);
export default User;