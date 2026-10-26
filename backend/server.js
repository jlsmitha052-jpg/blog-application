
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/blog_application")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) =>
    console.error("MongoDB connection error:", error.message)
  );

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General"
    },
    excerpt: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: String,
      default: "Anonymous"
    }
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blog Application API is running"
  });
});

// Health API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is working!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// REGISTER API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// LOGIN API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CREATE BLOG API
app.post("/api/blogs", async (req, res) => {
  try {
    const { title, category, excerpt, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    const blog = await Blog.create({
      title,
      category,
      excerpt,
      content,
      author
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET ALL BLOGS API
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET SINGLE BLOG API
app.get("/api/blogs/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT EDIT BLOG API
app.put("/api/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, excerpt, content } = req.body;

    // Validate blog ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    // Validate request body
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) updates.content = content;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update"
      });
    }

    if (
      (updates.title !== undefined && !String(updates.title).trim()) ||
      (updates.content !== undefined && !String(updates.content).trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and content cannot be empty"
      });
    }

    if (updates.title !== undefined) {
      updates.title = String(updates.title).trim();
    }

    if (updates.content !== undefined) {
      updates.content = String(updates.content).trim();
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found. Check the blog ID."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog
    });
  } catch (error) {
    console.error("PUT Edit Blog error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog"
    });
  }
});

// DELETE BLOG API
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully!",
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 404 handler - keep this LAST
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
