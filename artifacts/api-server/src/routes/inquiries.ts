import { Router } from "express";
import { db } from "../lib/db";
import { inquiriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// Submit inquiry or demo request (public)
router.post("/inquiries", async (req, res) => {
  try {
    const { name, email, company, phone, message, type } = req.body;
    if (!name || !email || !company || !phone || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const [inquiry] = await db.insert(inquiriesTable).values({
      name, email, company, phone, message, type: type || "inquiry",
    }).returning();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit inquiry." });
  }
});

// Get all inquiries (admin only)
router.get("/inquiries", requireAdmin, async (_req, res) => {
  try {
    const inquiries = await db.select().from(inquiriesTable).orderBy(inquiriesTable.createdAt);
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inquiries." });
  }
});

// Delete inquiry (admin only)
router.delete("/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry." });
  }
});

export default router;
