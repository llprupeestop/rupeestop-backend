import { Router } from "express";
import { getAllEmailData } from "../controllers/email.controller.js";

const router = Router();

router.get("/fetch-data", getAllEmailData);

export default router;
