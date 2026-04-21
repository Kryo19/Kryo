import { Router } from "express";
import { db } from "../lib/db";
import { shipmentsTable, sensorLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// Get shipments for logged in user
router.get("/shipments", requireAuth, async (req: any, res) => {
  try {
    const shipments = await db.select().from(shipmentsTable).where(eq(shipmentsTable.userId, req.user.id));
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipments." });
  }
});

// Get all shipments (admin only)
router.get("/shipments/all", requireAdmin, async (_req, res) => {
  try {
    const shipments = await db.select().from(shipmentsTable);
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipments." });
  }
});

// Get sensor logs for a shipment
router.get("/shipments/:unitId/logs", requireAuth, async (req, res) => {
  try {
    const logs = await db.select().from(sensorLogsTable).where(eq(sensorLogsTable.shipmentId, req.params.unitId));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// Create shipment (admin only)
router.post("/shipments", requireAdmin, async (req, res) => {
  try {
    const [shipment] = await db.insert(shipmentsTable).values(req.body).returning();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create shipment." });
  }
});

export default router;
