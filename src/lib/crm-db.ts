import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import DealModel from "@/lib/models/Deal";
import TrackingModel from "@/lib/models/Tracking";
import BidModel from "@/lib/models/Bid";
import TransactionModel from "@/lib/models/Transaction";
import CalendarEventModel from "@/lib/models/CalendarEvent";
import LeadModel from "@/lib/models/Lead";
import SettingModel from "@/lib/models/Setting";
import type { Car, Lead } from "@/types";
import type { IDeal } from "@/lib/models/Deal";
import type { ITracking } from "@/lib/models/Tracking";
import type { IBid } from "@/lib/models/Bid";
import type { ITransaction } from "@/lib/models/Transaction";
import type { ICalendarEvent } from "@/lib/models/CalendarEvent";

function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export async function getCrmCars(): Promise<Car[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await CarModel.find({}).lean();
    if (docs.length > 0) return plain<Car[]>(docs);
  }
  return [];
}

export async function getCrmCarBySlugOrId(idOrSlug: string): Promise<Car | null> {
  const conn = await connectToDatabase();
  if (conn) {
    const doc = await CarModel.findOne({
      $or: [{ slug: idOrSlug }, { _id: mongooseValidId(idOrSlug) ? idOrSlug : null }],
    }).lean();
    if (doc) return plain<Car>(doc);
  }
  const all = await getCrmCars();
  return all.find((c) => c.slug === idOrSlug || String(c._id) === idOrSlug) || all[0] || null;
}

export async function getCrmDeals(): Promise<IDeal[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await DealModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<IDeal[]>(docs);
  }
  return [];
}

export async function getCrmTrackings(): Promise<ITracking[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await TrackingModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<ITracking[]>(docs);
  }
  return [];
}

export async function getCrmBids(): Promise<IBid[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await BidModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<IBid[]>(docs);
  }
  return [];
}

export async function getCrmTransactions(): Promise<ITransaction[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await TransactionModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<ITransaction[]>(docs);
  }
  return [];
}

export async function getCrmCalendarEvents(): Promise<ICalendarEvent[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await CalendarEventModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<ICalendarEvent[]>(docs);
  }
  return [];
}

export async function getCrmLeads(): Promise<Lead[]> {
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await LeadModel.find({}).sort({ createdAt: -1 }).lean();
    return plain<Lead[]>(docs);
  }
  return [];
}

export async function getCrmSettings() {
  const conn = await connectToDatabase();
  if (conn) {
    const doc = await SettingModel.findOne({}).lean();
    if (doc) return plain(doc);
  }
  return {
    currency: "VND",
    language: "Tiếng Việt",
    address: "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng",
    state: "Đà Nẵng",
    emailNotification: true,
    smsNotification: true,
  };
}

function mongooseValidId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
