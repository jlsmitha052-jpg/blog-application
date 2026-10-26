
const API_URL = "http://localhost:5000/api";

// ============================================
// HOME PAGE: LOAD AND DISPLAY BLOGS
// ============================================

const postList = document.getElementById("postList");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const loadingMessage = document.getElementById("loadingMessage");

let homeBlogs = [];

async function loadHomeBlogs() {
    if (!postList) return;

    try {
        if (loadingMessage) {
            loadingMessage.textContent = "Loading blogs...";
            loadingMessage.classList.remove("hidden");
        }

        if (emptyMessage) {
            emptyMessage.classList.add("hidden");
        }

        const response = await fetch(`${API_URL}/blogs`);
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to load blogs");
        }

        homeBlogs = Array.isArray(data.blogs) ? data.blogs : [];

        if (loadingMessage) {
            loadingMessage.classList.add("hidden");
        }

        displayHomeBlogs(homeBlogs);

    } catch (error) {
        console.error("Load blogs error:", error);

        if (loadingMessage) {
            loadingMessage.classList.add("hidden");
        }

        postList.innerHTML = "";

        if (emptyMessage) {
            emptyMessage.textContent =
                "Unable to load blogs. Check your backend server.";
            emptyMessage.classList.remove("hidden");
        }
    }
}

function displayHomeBlogs(blogs) {
    if (!postList) return;

    postList.innerHTML = "";

    if (emptyMessage) {
        emptyMessage.classList.add("hidden");
    }

    if (blogs.length === 0) {
        if (emptyMessage) {
            emptyMessage.textContent = "No posts found.";
            emptyMessage.classList.remove("hidden");
        }
        return;
    }

    blogs.forEach((blog) => {
        const card = document.createElement("article");
        card.className = "post-card";

        const category = document.createElement("p");
        category.className = "eyebrow";
        category.textContent = blog.category || "General";

        const title = document.createElement("h3");
        title.textContent = blog.title || "Untitled";

        const excerpt = document.createElement("p");
        excerpt.className = "muted";
        excerpt.textContent =
            blog.excerpt || blog.content || "No description available.";

        const author = document.createElement("p");
        author.className = "muted";
        author.textContent = `By ${blog.author || "Anonymous"}`;

        const date = document.createElement("p");
        date.className = "muted";

        if (blog.createdAt) {
            const parsedDate = new Date(blog.createdAt);

            if (!Number.isNaN(parsedDate.getTime())) {
                date.textContent = parsedDate.toLocaleDateString();
            }
        }

        card.append(category, title, excerpt, author, date);
        postList.appendChild(card);
    });
}

// HOME PAGE SEARCH
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        const filteredBlogs = homeBlogs.filter((blog) => {
            const text = [
                blog.title,
                blog.category,
                blog.excerpt,
                blog.content,
                blog.author
            ]
                .map(value => String(value || ""))
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });

        displayHomeBlogs(filteredBlogs);
    });
}


// ============================================
// CREATE BLOG: SAVE TO MONGODB THROUGH API
// ============================================

const blogForm = document.getElementById("blogForm");

if (blogForm) {
    blogForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title =
            document.getElementById("blogTitle").value.trim();

        const category =
            document.getElementById("blogCategory").value;

        const excerpt =
            document.getElementById("blogExcerpt").value.trim();

        const content =
            document.getElementById("blogContent").value.trim();

        const message =
            document.getElementById("blogMessage");

        const button =
            document.getElementById("publishButton");

        if (!title || !category || !content) {
            if (message) {
                message.textContent =
                    "Please enter the title, category and content.";
            }
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Publishing...";
        }

        if (message) {
            message.textContent = "Saving blog...";
        }

        try {
            const response = await fetch(`${API_URL}/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    category,
                    excerpt,
                    content,
                    author: "Anonymous"
                })
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Failed to publish blog"
                );
            }

            if (message) {
                message.textContent = "Blog published successfully!";
            }

            blogForm.reset();

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            console.error("Create blog error:", error);

            if (message) {
                message.textContent = "Error: " + error.message;
            }

        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Publish Blog";
            }
        }
    });
}


// ============================================
// REGISTER: CREATE USER ACCOUNT
// ============================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");
        const message = document.getElementById("registerMessage");

        const name = nameElement ? nameElement.value.trim() : "";
        const email = emailElement ? emailElement.value.trim() : "";
        const password = passwordElement ? passwordElement.value : "";

        try {
            if (!name || !email || !password) {
                throw new Error("Please fill in all required fields.");
            }

            if (message) message.textContent = "Creating account...";

            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Registration failed");
            }

            if (message) {
                message.textContent =
                    "Registration successful! Please log in.";
            }

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);

            if (message) {
                message.textContent = error.message;
            }
        }
    });
}


// ============================================
// LOGIN: AUTHENTICATE USER
// ============================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");
        const message = document.getElementById("loginMessage");

        const email = emailElement ? emailElement.value.trim() : "";
        const password = passwordElement ? passwordElement.value : "";

        try {
            if (!email || !password) {
                throw new Error("Please enter email and password.");
            }

            if (message) message.textContent = "Logging in...";

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Login failed");
            }

            if (result.token) {
                localStorage.setItem("token", result.token);
            }

            if (result.user) {
                localStorage.setItem("user", JSON.stringify(result.user));
            }

            if (message) {
                message.textContent = "Login successful!";
            }

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);

        } catch (error) {
            console.error("Login error:", error);

            if (message) {
                message.textContent = error.message;
            }
        }
    });
}


// ============================================
// LOGOUT
// ============================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}


// ============================================
// START HOME PAGE
// ============================================

loadHomeBlogs();
