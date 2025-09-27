# Skill Swap Platform - Backend API

A complete backend API for the Skill Swap Platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Registration, login, profile management, and skill management
- **Skill Swapping**: Create, accept, reject, and complete skill exchange requests
- **Notifications**: Real-time notifications for users
- **Admin Panel**: Complete admin functionality for platform management
- **Search & Discovery**: Advanced user and skill search capabilities
- **Rating System**: User rating and feedback system

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://23ce027:xZl2I1siCBjJFxKv@cluster0.3j72tt9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGIN=http://localhost:8000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (with pagination and filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/skills` - Update user skills
- `GET /api/users/search/:skill` - Search users by skill
- `GET /api/users/recommendations` - Get recommended users
- `PUT /api/users/availability` - Update user availability

### Skills
- `GET /api/skills` - Get all available skills
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/search/:query` - Search skills
- `GET /api/skills/categories` - Get skill categories

### Swaps
- `POST /api/swaps` - Create a new swap request
- `GET /api/swaps` - Get user's swaps
- `GET /api/swaps/:id` - Get swap by ID
- `PUT /api/swaps/:id/accept` - Accept swap request
- `PUT /api/swaps/:id/reject` - Reject swap request
- `PUT /api/swaps/:id/cancel` - Cancel swap request
- `PUT /api/swaps/:id/complete` - Complete swap
- `POST /api/swaps/:id/rate` - Rate completed swap

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

### Admin (Admin only)
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users (admin view)
- `PUT /api/admin/users/:id/ban` - Ban/Unban user
- `GET /api/admin/swaps` - Get all swaps (admin view)
- `PUT /api/admin/swaps/:id/notes` - Add admin notes to swap
- `POST /api/admin/notifications/global` - Create global notification
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/export/:type` - Export data

## 🗄️ Database Models

### User Model
- Basic info: name, email, password, profile image, location, bio
- Skills: offering and seeking skills with levels
- Availability settings
- Rating system
- Admin and ban status

### Swap Model
- Requester and recipient
- Skills being exchanged
- Status tracking (pending, accepted, rejected, completed, cancelled)
- Scheduling and completion dates
- Rating system for both parties

### Notification Model
- Recipient and type
- Related swap or user
- Read status and priority
- Global notifications support

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 📊 Response Format

Successful responses follow this format:

```json
{
  "data": "Response data",
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation and sanitization
- Rate limiting (can be added)
- Admin role verification

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

1. Set environment variables for production
2. Update CORS origin to your frontend domain
3. Use a strong JWT secret
4. Enable MongoDB Atlas security features
5. Deploy to your preferred platform (Heroku, Vercel, AWS, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@skillswap.com or create an issue in the repository. 