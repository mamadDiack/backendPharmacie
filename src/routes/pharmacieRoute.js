import express from "express";
import {
  searchPharmacie,
  searchMultiplePharmacies,
} from "../controllers/pharmacieController.js";

const router = express.Router();

router.get("/search", searchPharmacie);
router.post("/search/multiple", searchMultiplePharmacies);

export default router;
