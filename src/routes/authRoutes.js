import { Router } from "express";
import { getAuthUrl } from "../services/googleAuth.service.js";
import { storeEmailToken } from "../controllers/email.controller.js";

const router = Router();

router.get("/google", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/callback/google", storeEmailToken);

export default router;
