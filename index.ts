import express, { type Request, type Response } from "express";
import multer from "multer";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config(); 

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { uuid: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { uuid: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

app.get("/images/:imageId/comments", async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;

    if (typeof imageId !== "string") {
      return res.status(400).json({ error: "Invalid imageId: must be a string" });
    }

    // Fetch the image and traverse the relations
    const image = await prisma.image.findUnique({
      where: { uuid: imageId },
      include: {
        imageComments: {
          include: {
            comment: {
              include: {
                // Also include the users who made the comment
                userComments: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Flatten the explicit many-to-many join tables
    const formattedComments = image.imageComments.map((ic) => ({
      uuid: ic.comment.uuid,
      text: ic.comment.text,
      users: ic.comment.userComments.map((uc) => uc.user),
    }));

    // Return the image data along with the flattened comments
    res.json({
      uuid: image.uuid,
      image_url: image.image_url,
      comments: formattedComments,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
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

app.post("/user", async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing user uuid" });
    }
    if (!name) {
      return res.status(400).json({ error: "Missing user name" });
    }

    const user = await prisma.user.create({
      data: { uuid: userId, name },
    });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
