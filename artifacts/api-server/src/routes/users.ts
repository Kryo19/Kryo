import { Router } from "express";
import { db } from "../lib/db";
import { usersTable, shipmentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// Get all users (admin only)
router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      company: usersTable.company,
      phone: usersTable.phone,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(usersTable.createdAt);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Promote user to admin (admin only)
router.patch("/users/:id/promote", requireAdmin, async (req, res) => {
  try {
    const [user] = await db.update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.id, Number(req.params.id)))
      .returning();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to promote user." });
  }
});

// Demote admin to user (admin only)
router.patch("/users/:id/demote", requireAdmin, async (req, res) => {
  try {
    const [user] = await db.update(usersTable)
      .set({ role: "user" })
      .where(eq(usersTable.id, Number(req.params.id)))
      .returning();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to demote user." });
  }
});

// Assign shipment to user (admin only)
router.post("/users/:userId/shipments", requireAdmin, async (req, res) => {
  try {
    const [shipment] = await db.insert(shipmentsTable).values({
      ...req.body,
      userId: Number(req.params.userId),
    }).returning();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign shipment." });
  }
});

// Delete user (admin only)
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
