import { Schema, model, models, type Model } from "mongoose";

export interface IUser {
  _id?: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "sales";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "sales"], default: "admin" },
  },
  { timestamps: true, collection: "users" }
);

export const UserModel: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);

export default UserModel;
