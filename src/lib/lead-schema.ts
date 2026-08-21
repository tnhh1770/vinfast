import { z } from "zod";

const PHONE_RE = /^(0|\+84)(\s|\.)?((3[2-9])|(5[25689])|(7[06-9])|(8[1-9])|(9[0-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên")
    .max(120, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .refine((v) => PHONE_RE.test(v), "Số điện thoại không hợp lệ"),
  carInterest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  source: z.string().trim().max(60).default("website"),
  path: z.string().trim().max(240).optional().or(z.literal("")),
  // honeypot
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
