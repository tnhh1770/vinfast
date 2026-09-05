import { Schema, model, models, type Model } from "mongoose";

export interface ITransaction {
  _id?: string;
  transactionId: string; // e.g. #1589155
  ownerName: string;
  creationDate: string;
  carType: string;
  date: string;
  totalMoney: number;
  paymentMethod: "Cash" | "Card";
  status: "Paid" | "Pending" | "Failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    creationDate: { type: String, required: true },
    carType: { type: String, required: true },
    date: { type: String, required: true },
    totalMoney: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card"], default: "Cash" },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Paid",
      index: true,
    },
  },
  { timestamps: true, collection: "transactions" }
);

export const TransactionModel: Model<ITransaction> =
  (models.Transaction as Model<ITransaction>) || model<ITransaction>("Transaction", TransactionSchema);

export default TransactionModel;
