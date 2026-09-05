import { Schema, model, models, type Model } from "mongoose";

export interface IDeal {
  _id?: string;
  dealId: string; // e.g. #1589155
  ownerName: string;
  creationDate: string;
  carType: string;
  returnDate: string;
  paymentType: "Cash" | "Card" | "Transfer";
  totalPrice: number;
  status: "Pending" | "Signed" | "Completed" | "Cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    dealId: { type: String, required: true, unique: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    creationDate: { type: String, required: true },
    carType: { type: String, required: true },
    returnDate: { type: String, required: true },
    paymentType: { type: String, enum: ["Cash", "Card", "Transfer"], default: "Cash" },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Signed", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true, collection: "deals" }
);

export const DealModel: Model<IDeal> =
  (models.Deal as Model<IDeal>) || model<IDeal>("Deal", DealSchema);

export default DealModel;
