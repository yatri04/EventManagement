# Event Registration Backend API

A Node.js backend API for managing event registrations with limited capacity, waiting lists, and admin functionality.

## Features

- **Event Management**: Create, read, update, and delete events with capacity limits
- **Student Registration**: Students can register for events until capacity is reached
- **Waiting List**: Automatic waiting list management when events are full
- **Admin Panel**: Comprehensive admin dashboard for managing events and participants
- **Email Notifications**: Automatic email confirmations for registrations
- **Authentication**: JWT-based authentication for students and admins
- **MongoDB Integration**: Scalable database with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

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
   Create a `.env` file in the backend directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-registration?retryWrites=true&w=majority
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # Email Configuration (Optional)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **MongoDB Atlas Setup**
   - Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Create a database user with read/write permissions
   - Whitelist your IP address
   - Get your connection string and update `MONGODB_URI` in `.env`

5. **Seed the database** (Optional)
   ```bash
   npm run seed
   ```
   This will create sample events and admin/student accounts.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new student
- `POST /api/auth/login` - Login student
- `GET /api/auth/me` - Get current student profile
- `PUT /api/auth/profile` - Update student profile
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events (with pagination and filtering)
- `GET /api/events/:id` - Get single event by ID
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Registration
- `POST /api/register` - Register for an event
- `DELETE /api/register/:eventId` - Cancel event registration
- `GET /api/register/my-events` - Get student's registered events
- `GET /api/register/event/:eventId/status` - Check registration status

### Admin
- `GET /api/admin/events` - Get all events for admin dashboard
- `GET /api/admin/events/:id/participants` - Get event participants and waiting list
- `GET /api/admin/students` - Get all students
- `GET /api/admin/dashboard` - Get admin dashboard statistics

## Data Models

### Event Schema
```javascript
{
  eventName: String (required),
  description: String,
  date: Date (required),
  capacity: Number (required),
  location: String,
  organizer: String (required),
  organizerEmail: String (required),
  participants: [{
    studentId: ObjectId,
    registeredAt: Date,
    status: String
  }],
  waitingList: [{
    studentId: ObjectId,
    addedAt: Date,
    position: Number
  }],
  isActive: Boolean,
  registrationDeadline: Date,
  tags: [String]
}
```

### Student Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  studentId: String (unique),
  phone: String,
  department: String,
  year: String,
  profileImage: String,
  bio: String,
  registeredEvents: [{
    eventId: ObjectId,
    registeredAt: Date,
    status: String
  }],
  isAdmin: Boolean,
  isActive: Boolean
}
```

## Usage Examples

### Register a Student
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123",
  "studentId": "STU001",
  "phone": "+1234567890",
  "department": "Computer Science",
  "year": "3rd Year",
  "bio": "Passionate about web development"
}
```

### Create an Event (Admin)
```javascript
POST /api/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "eventName": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-03-15T09:00:00Z",
  "capacity": 150,
  "location": "Convention Center",
  "organizer": "Tech Society",
  "organizerEmail": "events@techsociety.org",
  "registrationDeadline": "2024-03-10T23:59:59Z",
  "tags": ["Technology", "Conference", "Networking"]
}
```

### Register for an Event
```javascript
POST /api/register
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "eventId": "event-id-here"
}
```

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Email Configuration

To enable email notifications, configure your email settings in the `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### Database Seeding
```bash
npm run seed
```

## Testing the API

You can test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Sample Test Requests

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register a Student**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@university.edu","password":"password123","studentId":"TEST001"}'
   ```

3. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@university.edu","password":"password123"}'
   ```

## Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong, unique `JWT_SECRET`
- Use a secure MongoDB connection string
- Configure proper email settings

### Recommended Hosting Platforms
- Heroku
- DigitalOcean
- AWS
- Google Cloud Platform
- Vercel (for serverless)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Event management with capacity limits
- Student registration system
- Waiting list functionality
- Admin dashboard
- Email notifications
- JWT authentication