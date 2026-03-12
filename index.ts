import express, { type Request, type Response } from "express";
import multer from "multer";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config(); 

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
const upload = multer({ dest: "uploads/" }); // stores files locally

app.use(express.json());

// Upload an image
app.post("/upload/:userId", upload.single("photo"), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid userId: must be a string" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`; // In production, use cloud storage

    // Create image record
    const image = await prisma.image.create({
      data: { image_url: fileUrl },
    });

    // Link user to image
    await prisma.userImage.create({
      data: {
        user_id: userId,
        image_id: image.uuid,
      },
    });

    res.json(image);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/comments/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid userId: must be a string" });
    }

    if (!text) {
      return res.status(400).json({ error: "Missing comment text" });
    }

    // Create comment record
    const comment = await prisma.comment.create({
      data: { text },
    });

    // Link user to comment
    await prisma.userComment.create({
      data: {
        user_id: userId,
        comment_id: comment.uuid,
      },
    });

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all images with their linked users and comments
app.get("/images", async (_req: Request, res: Response) => {
  try {
    const images = await prisma.image.findMany({
      include: {
        userImages: {
          include: { user: true },
        },
      },
    });
    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments with linked users
app.get("/comments", async (_req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        userComments: {
          include: { user: true },
        },
      },
    });
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
