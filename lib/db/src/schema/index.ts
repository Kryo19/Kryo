import { pgTable, text, serial, timestamp, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  company: text("company").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("user"), // "user" or "admin"
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, role: true, approved: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ─── SHIPMENTS ────────────────────────────────────────────────────────────────
export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  unitId: text("unit_id").notNull().unique(),
  cargo: text("cargo").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  route: text("route").notNull(),
  status: text("status").notNull().default("Monitoring"),
  temp: real("temp").notNull().default(2.4),
  humidity: real("humidity").notNull().default(65),
  ethylene: real("ethylene").notNull().default(8),
  co2: real("co2").notNull().default(0.42),
  eta: text("eta").notNull().default("4h"),
  health: real("health").notNull().default(98),
  departure: text("departure").notNull(),
  arrival: text("arrival").notNull(),
  duration: text("duration").notNull(),
  compliance: text("compliance").notNull().default("All readings compliant."),
  shelfLifeTotal: real("shelf_life_total").notNull().default(336),
  shelfLifeRemaining: real("shelf_life_remaining").notNull().default(336),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;

// ─── SENSOR LOGS ─────────────────────────────────────────────────────────────
export const sensorLogsTable = pgTable("sensor_logs", {
  id: serial("id").primaryKey(),
  shipmentId: text("shipment_id").notNull(),
  parameter: text("parameter").notNull(),
  value: text("value").notNull(),
  sensorId: text("sensor_id").notNull(),
  status: text("status").notNull().default("Compliant"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export const insertSensorLogSchema = createInsertSchema(sensorLogsTable).omit({ id: true, recordedAt: true });
export type InsertSensorLog = z.infer<typeof insertSensorLogSchema>;
export type SensorLog = typeof sensorLogsTable.$inferSelect;

// ─── INQUIRIES ────────────────────────────────────────────────────────────────
export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("inquiry"), // "inquiry" or "demo"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
