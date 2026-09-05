import { Schema, model, models, type Model } from "mongoose";

export interface ITracking {
  _id?: string;
  carName: string;
  customerName: string;
  driverName?: string;
  routeName: string;
  locationAddress?: string;
  timeLeftMin: number;
  routePoints?: string[];
  routePictures?: string[];
  status: "In Transit" | "Delivered" | "Pending";
  carImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TrackingSchema = new Schema<ITracking>(
  {
    carName: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    driverName: { type: String, default: "Đại lý VinFast" },
    routeName: { type: String, required: true },
    locationAddress: String,
    timeLeftMin: { type: Number, default: 48 },
    routePoints: [String],
    routePictures: [String],
    status: {
      type: String,
      enum: ["In Transit", "Delivered", "Pending"],
      default: "In Transit",
    },
    carImage: String,
  },
  { timestamps: true, collection: "trackings" }
);

export const TrackingModel: Model<ITracking> =
  (models.Tracking as Model<ITracking>) || model<ITracking>("Tracking", TrackingSchema);

export default TrackingModel;
