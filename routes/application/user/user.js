import express from "express";
import {
  dashboard,
  id,
  password,
  picture,
  update,
} from "../../../controller/application/user/user.js";
import { uploadImage } from "../../../middleware/application/multer.js";

const router = express.Router();

router.get("/dashboard", dashboard);
router.get("/:id", id);

router.patch("/:id/password", password);

router.patch("/:id/picture", uploadImage.single("image"), picture);

router.patch("/:id", update);

export default router;
