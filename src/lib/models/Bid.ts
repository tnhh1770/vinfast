import { Schema, model, models, type Model } from "mongoose";

export interface IBid {
  _id?: string;
  carName: string;
  location: string;
  style: string;
  kaos: string;
  speed: string;
  startingPrice: number;
  currentBid: number;
  color: string;
  rentalPeriodMonths?: number;
  image?: string;
  status: "Active" | "Closed";
  createdAt?: Date;
  updatedAt?: Date;
}

const BidSchema = new Schema<IBid>(
  {
    carName: { type: String, required: true, trim: true },
    location: { type: String, default: "Đà Nẵng" },
    style: { type: String, default: "VF Electric" },
    kaos: { type: String, default: "850 KAOS" },
    speed: { type: String, default: "180 Speed: 15.6km/h" },
    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, required: true },
    color: { type: String, default: "Light Green" },
    rentalPeriodMonths: { type: Number, default: 12 },
    image: String,
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
  },
  { timestamps: true, collection: "bids" }
);

export const BidModel: Model<IBid> =
  (models.Bid as Model<IBid>) || model<IBid>("Bid", BidSchema);

export default BidModel;
