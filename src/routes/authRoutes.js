import { Router } from "express";
import { getAuthUrl } from "../services/googleAuth.service";
import { storeEmailToken } from "../controllers/email.controller";

const router = Router();

router.get("/google", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/google/callback", storeEmailToken);
