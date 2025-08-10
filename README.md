# StoryShare - Modern Story Sharing Platform

A full-stack story sharing platform built with Node.js, Express, PostgreSQL, and Next.js. Share your stories with the world and discover amazing tales from writers around the globe.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **User Authentication**: Secure registration and login system
- **Story Management**: Create, edit, publish, and manage your stories
- **Social Features**: Like, comment, and follow other writers
- **Rich Content**: Support for cover images, tags, and categories
- **Search & Discovery**: Find stories by keyword, category, or tags
- **Real-time Stats**: Track views, likes, and engagement
- **PostgreSQL Database**: Reliable and scalable data storage

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** with **Sequelize ORM**
- **JWT Authentication**
- **bcryptjs** for password hashing
- **CORS**, **Helmet**, and **Rate Limiting** for security

### Frontend
- **Next.js 14** with **App Router**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** with **Zod** validation
- **Axios** for API calls
- **Lucide React** for icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or later)
- **PostgreSQL** (v12 or later)
- **npm** or **yarn**

## 🏃‍♂️ Quick Start

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd story-sharing-platform
\`\`\`

### 2. Set up the database

1. Install PostgreSQL on your system
2. Create a new database:

\`\`\`sql
CREATE DATABASE story_sharing;
\`\`\`

3. Create a user (optional):

\`\`\`sql
CREATE USER story_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE story_sharing TO story_user;
\`\`\`

### 3. Set up the backend

\`\`\`bash
cd backend
npm install
\`\`\`

Update the \`.env\` file with your database credentials:

\`\`\`env
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/story_sharing
DB_HOST=localhost
DB_PORT=5432
DB_NAME=story_sharing
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
\`\`\`

Start the backend server:

\`\`\`bash
npm run dev
\`\`\`

The API will be available at \`http://localhost:5000\`

### 4. Set up the frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

Start the frontend development server:

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:3000\`

## 📁 Project Structure

\`\`\`
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Express middleware (auth, etc.)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── server.js        # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # React contexts (auth, etc.)
│   │   └── lib/         # Utilities and API client
│   ├── tailwind.config.ts
│   └── package.json
└── README.md
\`\`\`

## 🔗 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register a new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/me\` - Get current user profile
- \`PUT /api/auth/profile\` - Update user profile
- \`POST /api/auth/follow/:userId\` - Follow/unfollow user

### Stories
- \`GET /api/stories\` - Get all published stories (with pagination)
- \`GET /api/stories/:slug\` - Get story by slug
- \`POST /api/stories\` - Create new story (auth required)
- \`PUT /api/stories/:id\` - Update story (auth required)
- \`DELETE /api/stories/:id\` - Delete story (auth required)
- \`POST /api/stories/:id/like\` - Like/unlike story (auth required)
- \`POST /api/stories/:id/comments\` - Add comment (auth required)
- \`GET /api/stories/user/my-stories\` - Get user's own stories (auth required)

## 🎨 Features Overview

### User Authentication
- Secure registration and login
- JWT-based authentication
- Password hashing with bcryptjs
- User profile management

### Story Management
- Rich text story creation
- Draft and publish functionality
- Cover image support
- Tags and categories
- Auto-generated excerpts and reading time
- SEO-friendly slugs

### Social Features
- Like and comment on stories
- Follow other writers
- User profiles with story lists
- Real-time engagement metrics

### Search & Discovery
- Full-text search across stories
- Filter by category and tags
- Sort by latest, popular, or oldest
- Pagination for large result sets

## 🔒 Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **Input validation** with Zod
- **SQL injection protection** with Sequelize
- **Password hashing** with bcryptjs
- **JWT token expiration**

## 🚀 Deployment

### Backend Deployment

1. Set up a PostgreSQL database on your hosting provider
2. Update environment variables for production
3. Run migrations: \`npm run migrate\`
4. Start the server: \`npm start\`

### Frontend Deployment

1. Update \`NEXT_PUBLIC_API_URL\` to your production API URL
2. Build the application: \`npm run build\`
3. Deploy to Vercel, Netlify, or your preferred hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please create an issue in the repository or contact the development team.

---

**Happy storytelling! 📚✨**
