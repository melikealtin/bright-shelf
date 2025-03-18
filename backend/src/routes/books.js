import express from "express";
import Book from "../models/book.js";
import cloudinary from "../lib/cloudinary.js";
import authenticateUser from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;

    if (!title || !caption || !image || !rating)
      return res.status(400).json({ message: "All fields are required" });

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = await Book.create({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authenticateUser, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture");

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page,
      totalBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/user", authenticateUser, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log(deleteError);
      }
    }

    await book.deleteOne();

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
