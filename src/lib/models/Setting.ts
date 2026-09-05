import { Schema, model, models, type Model } from "mongoose";

export interface ISetting {
  _id?: string;
  currency: string;
  language: string;
  address: string;
  state: string;
  emailNotification: boolean;
  smsNotification: boolean;
  updatedAt?: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    currency: { type: String, default: "VND" },
    language: { type: String, default: "Vietnamese" },
    address: { type: String, default: "Đà Nẵng, Việt Nam" },
    state: { type: String, default: "Đà Nẵng" },
    emailNotification: { type: Boolean, default: true },
    smsNotification: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "settings" }
);

export const SettingModel: Model<ISetting> =
  (models.Setting as Model<ISetting>) || model<ISetting>("Setting", SettingSchema);

export default SettingModel;
