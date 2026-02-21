import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", async (_req, res) => {
  res.json({ message: "Use NextAuth email OTP + Google on web app for production auth" });
});
