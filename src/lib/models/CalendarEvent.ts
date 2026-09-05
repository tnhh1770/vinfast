import { Schema, model, models, type Model } from "mongoose";

export interface ICalendarEvent {
  _id?: string;
  title: string;
  carName: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 10:00 AM - 12:00 PM
  type: "TestDrive" | "Delivery" | "Maintenance" | "Meeting";
  createdAt?: Date;
  updatedAt?: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    carName: { type: String, required: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    type: {
      type: String,
      enum: ["TestDrive", "Delivery", "Maintenance", "Meeting"],
      default: "TestDrive",
    },
  },
  { timestamps: true, collection: "calendar_events" }
);

export const CalendarEventModel: Model<ICalendarEvent> =
  (models.CalendarEvent as Model<ICalendarEvent>) || model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);

export default CalendarEventModel;
