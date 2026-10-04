import multer from "multer";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const uploadDir = fileURLToPath(new URL("../../public/images/", import.meta.url));
mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = allowedTypes[file.mimetype];
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const uploadImg= multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
      return callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
    }
    callback(null, true);
  },
});
