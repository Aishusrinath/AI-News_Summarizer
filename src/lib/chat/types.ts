import { z } from "zod";

export const chatModeSchema = z.enum(["news", "general"]);

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  articleSlug: z.string().min(1).optional(),
  modeOverride: chatModeSchema.optional(),
  sessionId: z.string().min(1).max(100).optional(),
});

export const chatSourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  label: z.string().min(1),
});

export const chatResponseSchema = z.object({
  mode: chatModeSchema,
  groundingStatus: z.enum(["grounded", "general", "insufficient"]),
  routingReason: z.string().min(1),
  answer: z.string().min(1),
  sources: z.array(chatSourceSchema),
});

export type ChatMode = z.infer<typeof chatModeSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatSource = z.infer<typeof chatSourceSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
