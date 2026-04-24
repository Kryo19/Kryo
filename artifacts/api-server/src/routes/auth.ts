import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "kryo-secret-2026";

router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    if (!name || !email || !password || !company || !phone) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name, email, password: hashed, company, phone,
    }).returning();
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } });
} catch (err: any) {
    console.error("Signup error:", err.message, err.stack);
    res.status(500).json({ error: "Signup failed.", detail: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } });
} catch (err: any) {
    console.error("Login error:", err.message, err.stack);
    res.status(500).json({ error: "Login failed.", detail: err.message });
  }
});

export default router;
