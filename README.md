# Blog Application

A full-stack blog application developed to practise web development, REST APIs, and database integration.

## Features
- User Registration and Login
- Create and View Blog Posts
- MongoDB Database Integration
- REST API using Node.js and Express.js
- API Testing with Postman

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** bcryptjs
- **API Testing:** Postman

## Project Structure
- `backend/` – Backend server, API routes, and database connection
- `blog_application/` – Frontend HTML pages, CSS, and JavaScript
- `postman/` – API testing resources
- `.gitignore` – Excludes dependencies and environment files

## Prerequisites
- Node.js
- MongoDB
- Visual Studio Code
- Postman (optional)

## How to Run

### 1. Clone the Repository
```bash
git clone https://github.com/jlsmitha052-jpg/blog-application.git
cd blog-application
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start MongoDB
Ensure MongoDB is running and the backend database connection settings are configured correctly.

### 4. Start the Backend
```bash
node server.js
```

The backend development server runs at `http://localhost:5000`.

### 5. Run the Frontend
Open the `blog_application/` folder in Visual Studio Code and launch the frontend HTML pages using the Live Server extension.

## API Testing
Use Postman to test the backend API.

Health check endpoint:
```http
GET http://localhost:5000/api/health
```

## Security Notes
- Never upload passwords, API keys, or database credentials.
- Keep `.env` files out of version control.
- Install dependencies with `npm install` instead of uploading `node_modules`.

## Project Purpose
This project was developed to gain practical experience in full-stack web development, REST API development, MongoDB integration, and frontend-backend communication.
