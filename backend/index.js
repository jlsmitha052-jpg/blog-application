const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Temporary storage
const users = [];
const blogs = [];

let nextUserId = 1;
let nextBlogId = 1;

// Home API
app.get("/", (req, res) => {
  res.send("Blog Application Backend is running!");
});

// Register API
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  const existingUser = users.find(
    (user) => user.email === email
  );

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered"
    });
  }

  const user = {
    id: nextUserId++,
    name,
    email,
    password
  };

  users.push(user);

  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (item) =>
      item.email === email &&
      item.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// Create Blog API
app.post("/api/blogs", (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({
      message: "Title, content and author are required"
    });
  }

  const blog = {
    id: nextBlogId++,
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };

  blogs.push(blog);

  res.status(201).json({
    message: "Blog created successfully",
    blog
  });
});

// Get all blogs API
app.get("/api/blogs", (req, res) => {
  res.json(blogs);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});